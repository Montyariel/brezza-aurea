import google.generativeai as genai
from app.config import settings
from app.database import (
    get_stock, get_appointments, get_clients, create_appointment, 
    update_appointment_time, update_appointment_status, get_client_by_id,
    create_client
)
from app.services.rules import validar_test_drive, validar_documentacion_pdi
import datetime
from typing import Optional

# Configurar el SDK de Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY no configurada. El asistente correrá en modo simulado.")

# ============================================================================
# HERRAMIENTAS (TOOLS) PARA EL AGENTE DE IA
# ============================================================================

def listar_stock(marca: Optional[str] = None) -> str:
    """
    Busca los vehículos disponibles o reservados en el inventario.
    El argumento 'marca' puede ser 'Fiat', 'Peugeot' o None para ver todos.
    """
    try:
        vehicles = get_stock()
        if marca:
            vehicles = [v for v in vehicles if v.brand.lower() == marca.lower()]
        
        if not vehicles:
            return f"No hay vehículos en stock para la marca {marca}."
            
        res = "Stock actual en Brezza Aurea:\n"
        for v in vehicles:
            res += f"- {v.brand} {v.model} ({v.version}, {v.color}) - Ubicación: {v.location} - Estado: {v.status} (VIN: ...{v.vin[-6:]})\n"
        return res
    except Exception as e:
        return f"Error al buscar stock: {str(e)}"

def ver_agenda(fecha: Optional[str] = None) -> str:
    """
    Muestra la agenda de actividades y entregas para una fecha dada (formato YYYY-MM-DD).
    Si no se indica la fecha, se asume la fecha de hoy.
    """
    try:
        if not fecha:
            fecha = datetime.date.today().isoformat()
            
        appointments = get_appointments()
        day_appts = [a for a in appointments if a.date == fecha and a.status != "Cancelada"]
        
        if not day_appts:
            return f"No hay actividades agendadas para el día {fecha}."
            
        clients = get_clients()
        client_map = {c.id: c.name for c in clients}
        
        res = f"Agenda de Brezza Aurea para el {fecha}:\n"
        for a in day_appts:
            c_name = client_map.get(a.clientId, "Cliente desconocido")
            res += f"- {a.time} hs: {a.type} con {c_name} ({a.brand} {a.model}) [{a.status}]\n"
        return res
    except Exception as e:
        return f"Error al consultar la agenda: {str(e)}"

def agendar_cita(tipo: str, cliente_nombre: str, fecha: str, hora: str, notas: Optional[str] = None) -> str:
    """
    Crea una nueva cita o evento en la agenda.
    - tipo: Puede ser 'Cita en Salón', 'Test Drive', 'Entrega de 0km', o 'Llamado de Seguimiento'.
    - cliente_nombre: Primer nombre o nombre completo del cliente existente.
    - fecha: Fecha en formato YYYY-MM-DD.
    - hora: Hora en formato HH:MM.
    - notas: Detalles adicionales de la cita.
    """
    try:
        # 1. Buscar cliente por nombre
        clients = get_clients()
        target_client = None
        for c in clients:
            if cliente_nombre.lower() in c.name.lower():
                target_client = c
                break
                
        if not target_client:
            return f"No encontré ningún cliente llamado '{cliente_nombre}'. Por favor, primero registralo en el CRM o pasame su nombre completo y teléfono para crearlo."

        # 2. Obtener vehículo de demo si es Test Drive
        vehiculo_id = None
        if tipo == "Test Drive":
            stock = get_stock()
            match_veh = [v for v in stock if v.brand.lower() == target_client.brandInterest.lower() and v.model.lower() == target_client.modelInterest.lower()]
            if match_veh:
                vehiculo_id = match_veh[0].id
                
                # Validar la regla de los 45 minutos para Test Drives
                ok, reason = validar_test_drive(vehiculo_id, fecha, hora)
                if not ok:
                    return f"No se pudo agendar el Test Drive: {reason}"
            else:
                return f"No tenemos vehículos de demostración disponibles en stock para el modelo {target_client.brandInterest} {target_client.modelInterest}."
        
        # 3. Validar documentación si es Entrega de 0km
        if tipo == "Entrega de 0km":
            check = validar_documentacion_pdi(target_client.id)
            if not check.get("ok", True):
                return f"Bloqueo comercial: {check['reason']}"
            elif check.get("warning"):
                notas = f"[ADVERTENCIA: {check['reason']}] {notas or ''}".strip()

        # 4. Crear la cita
        appt_data = {
            "clientId": target_client.id,
            "brand": target_client.brandInterest,
            "model": target_client.modelInterest,
            "date": fecha,
            "time": hora,
            "type": tipo,
            "status": "Pendiente",
            "notes": notes or "Agendado por Agente IA",
            "vehiculoId": vehiculo_id
        }
        
        new_appt = create_appointment(appt_data)
        
        success_msg = f"¡Cita agendada con éxito, crack! Registré la cita tipo '{tipo}' para '{target_client.name}' el día {fecha} a las {hora} hs."
        if tipo == "Entrega de 0km" and 'check' in locals() and check.get("warning"):
            success_msg += f"\n⚠️ Ojo: la unidad está patentada pero recordá que falta el PDI listo."
        return success_msg
        
    except Exception as e:
        return f"Error al intentar agendar la cita: {str(e)}"

def reprogramar_cita(cliente_nombre: str, fecha: str, hora: str) -> str:
    """
    Reprograma un evento activo del día de hoy para un cliente específico.
    - cliente_nombre: Nombre del cliente.
    - fecha: Nueva fecha YYYY-MM-DD.
    - hora: Nueva hora HH:MM.
    """
    try:
        clients = get_clients()
        target_client = None
        for c in clients:
            if cliente_nombre.lower() in c.name.lower():
                target_client = c
                break
                
        if not target_client:
            return f"No encontré ningún cliente llamado '{cliente_nombre}'."

        today = datetime.date.today().isoformat()
        appts = get_appointments()
        active_appts = [a for a in appts if a.clientId == target_client.id and a.date == today and a.status != "Cancelada"]
        
        if not active_appts:
            return f"No encontré turnos activos para hoy a nombre de '{target_client.name}'."
            
        appt = active_appts[0]
        
        if appt.type == "Test Drive" and appt.vehiculoId:
            ok, reason = validar_test_drive(appt.vehiculoId, fecha, hora, appt_id_exclude=appt.id)
            if not ok:
                return f"No se pudo reprogramar: {reason}"
                
        update_appointment_time(appt.id, fecha, hora)
        return f"¡Listo crack! Reprogramé la cita ({appt.type}) de '{target_client.name}' para el {fecha} a las {hora} hs."
        
    except Exception as e:
        return f"Error al reprogramar la cita: {str(e)}"

def cancelar_cita(cliente_nombre: str) -> str:
    """
    Cancela un turno o cita activo para hoy de un cliente.
    - cliente_nombre: Nombre del cliente.
    """
    try:
        clients = get_clients()
        target_client = None
        for c in clients:
            if cliente_nombre.lower() in c.name.lower():
                target_client = c
                break
                
        if not target_client:
            return f"No encontré ningún cliente llamado '{cliente_nombre}'."

        today = datetime.date.today().isoformat()
        appts = get_appointments()
        active_appts = [a for a in appts if a.clientId == target_client.id and a.date == today and a.status != "Cancelada"]
        
        if not active_appts:
            return f"No encontré citas activas para hoy para '{target_client.name}'."
            
        appt = active_appts[0]
        update_appointment_status(appt.id, "Cancelada")
        return f"¡Hecho crack! Cancelé la cita de las {appt.time} hs para '{target_client.name}' y liberé el espacio."
    except Exception as e:
        return f"Error al cancelar la cita: {str(e)}"

def obtener_descuento(cliente_nombre: str) -> str:
    """
    Genera una oferta con el 10% de descuento en gestoría autorizado por Nico para incentivar una seña inmediata.
    """
    return (
        f"Mirá crack, te hago una atención de la casa para {cliente_nombre}: "
        f"si me dejas la seña de la unidad hoy mismo, te bonificamos un 10% de descuento en todos los gastos de gestoría. "
        f"¡Aprovechalo que vuela! ⚽🔥"
    )

# ============================================================================
# LÓGICA DE EJECUCIÓN DEL AGENTE
# ============================================================================

SYSTEM_PROMPT = """
Eres Nico, el encargado comercial estrella de la concesionaria de autos Stellantis (Fiat & Peugeot) Brezza Aurea.
Tu tono es sumamente canchero, proactivo, amable. Hablás como un vendedor de autos argentino: usás palabras como 'crack', 'joya', 'dale', 'metéle', 'coche', 'nave', 'atención de la casa'.
Tu objetivo es ayudar a los vendedores a gestionar el CRM, la agenda y el stock de manera súper ágil.

Cuando te saluden o te hagan consultas, respondé con tu personalidad futbolera y de vendedor estrella (⚽, 🔥, 🏟️, 🚗, 🚙).
Tienes acceso a varias herramientas para interactuar con la base de datos real del sistema en Supabase:
- `listar_stock`: Para saber qué autos Fiat o Peugeot hay disponibles o reservados.
- `ver_agenda`: Para revisar qué citas hay hoy o en cualquier fecha.
- `agendar_cita`: Para agendar citas en salón, test drives, entregas o llamados.
- `reprogramar_cita`: Para cambiar el horario de un turno de hoy.
- `cancelar_cita`: Para dar de baja un turno activo de hoy.
- `obtener_descuento`: Para cuando el cliente dude de comprar o quieras motivarlo con el 10% de descuento de cortesía.

IMPORTANTE:
- Si te piden reprogramar, cancelar o agendar algo, usá siempre la herramienta correspondiente.
- Si ves alertas en la agenda de entregas de 0km (por ejemplo, autos sin patentar o sin PDI), advertíselo al vendedor con un tono de '¡Ojo con esto crack!'.
- Cuando generes un cierre de venta, recordale que vuela a reservar la unidad.
- Responde siempre de forma clara, corta y amigable.
"""

def chat_con_agente(mensaje_usuario: str, historial_chat: list = None) -> str:
    if not settings.GEMINI_API_KEY:
        return f"¡Qué hacés crack! (Modo Simulado)\nLeí tu mensaje: '{mensaje_usuario}'. Configura la GEMINI_API_KEY en tu .env para usar la IA."

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT,
            tools=[
                listar_stock,
                ver_agenda,
                agendar_cita,
                reprogramar_cita,
                cancelar_cita,
                obtener_descuento
            ]
        )
        
        chat = model.start_chat(enable_automatic_function_calling=True)
        response = chat.send_message(mensaje_usuario)
        return response.text
    except Exception as e:
        return f"¡Ojo crack! Saltó un error en mi motor de IA: {str(e)}"
