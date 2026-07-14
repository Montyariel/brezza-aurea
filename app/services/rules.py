from app.database import get_appointments, get_operation_by_client_id
from typing import Tuple, Dict, Any, Optional

def parse_time_to_minutes(time_str: str) -> int:
    try:
        parts = time_str.split(":")
        h = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 else 0
        return h * 60 + m
    except Exception:
        return 0

def validar_test_drive(vehiculo_id: str, date_str: str, time_str: str, appt_id_exclude: Optional[str] = None) -> Tuple[bool, str]:
    if not vehiculo_id:
        return True, ""

    all_appointments = get_appointments()
    
    test_drives = [
        a for a in all_appointments
        if a.id != appt_id_exclude
        and a.vehiculoId == vehiculo_id
        and a.date == date_str
        and a.type == "Test Drive"
        and a.status != "Cancelada"
    ]

    nuevo_tiempo = parse_time_to_minutes(time_str)
    DURACION_MINUTOS = 45

    for td in test_drives:
        td_tiempo = parse_time_to_minutes(td.time)
        if abs(nuevo_tiempo - td_tiempo) < DURACION_MINUTOS:
            inicio_solapado = td.time
            h_fin = (td_tiempo + DURACION_MINUTOS) // 60
            m_fin = (td_tiempo + DURACION_MINUTOS) % 60
            # Formatear la hora de fin con padding
            fin_solapado = f"{str(h_fin).zfill(2)}:{str(m_fin).zfill(2)}"
            
            return False, f"Conflicto de agenda: El coche demostrador ya está reservado para Test Drive en el rango de {inicio_solapado} a {fin_solapado} hs por otro cliente."
            
    return True, ""

def validar_documentacion_pdi(client_id: str, vehiculo_id: Optional[str] = None) -> Dict[str, Any]:
    op = get_operation_by_client_id(client_id)
    if not op:
        return {
            "ok": False,
            "reason": "No se encontró ninguna operación de venta para este cliente en el sistema de Gestoría."
        }
    
    if vehiculo_id and op.vehiculoId != vehiculo_id:
        return {
            "ok": False,
            "reason": "El vehículo seleccionado para la entrega no coincide con el chasis asignado a la venta."
        }

    if op.docStatus == "En Gestoría":
        return {
            "ok": False,
            "reason": "La documentación de la unidad figura 'En Gestoría' (Falta patentamiento para poder entregar)."
        }

    if op.docStatus == "Patentado":
        return {
            "ok": False,
            "warning": True,
            "reason": "La unidad está 'Patentada', pero falta verificar el estado 'PDI Listo' (Inspección Pre-Entrega técnica y estética)."
        }

    return {"ok": True}
