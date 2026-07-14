import uuid
from supabase import create_client, Client
from app.config import settings
from app.models import User, Vehicle, Client as ClientModel, Operation, Appointment
from typing import List, Optional

# Inicializar cliente de Supabase
supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# ============================================================================
# USERS CRUD
# ============================================================================
def get_users() -> List[User]:
    res = supabase_client.table("fp_users").select("*").execute()
    return [User(id=u["id"], username=u["username"], name=u["name"]) for u in res.data]

def get_user_by_username(username: str) -> Optional[dict]:
    res = supabase_client.table("fp_users").select("*").eq("username", username).execute()
    if res.data:
        return res.data[0]
    return None

def create_user(username: str, password_hash: str, name: str) -> User:
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "username": username,
        "password": password_hash,
        "name": name
    }
    res = supabase_client.table("fp_users").insert(new_user).execute()
    created = res.data[0]
    return User(id=created["id"], username=created["username"], name=created["name"])

# ============================================================================
# STOCK CRUD
# ============================================================================
def get_stock() -> List[Vehicle]:
    res = supabase_client.table("fp_stock").select("*").execute()
    return [Vehicle(**v) for v in res.data]

def get_vehicle_by_id(vehicle_id: str) -> Optional[Vehicle]:
    res = supabase_client.table("fp_stock").select("*").eq("id", vehicle_id).execute()
    if res.data:
        return Vehicle(**res.data[0])
    return None

def update_vehicle_status(vehicle_id: str, status: str) -> Optional[Vehicle]:
    res = supabase_client.table("fp_stock").update({"status": status}).eq("id", vehicle_id).execute()
    if res.data:
        return Vehicle(**res.data[0])
    return None

# ============================================================================
# CLIENTS CRUD
# ============================================================================
def get_clients() -> List[ClientModel]:
    res = supabase_client.table("fp_clients").select("*").execute()
    clients = []
    for c in res.data:
        clients.append(ClientModel(
            id=c.get("id"),
            name=c.get("name"),
            phone=c.get("phone"),
            email=c.get("email"),
            brandInterest=c.get("brandInterest") or c.get("brand_interest") or "",
            modelInterest=c.get("modelInterest") or c.get("model_interest") or "",
            origin=c.get("origin") or "Web",
            stage=c.get("stage") or "contacto",
            birthday=c.get("birthday"),
            history=c.get("history") or []
        ))
    return clients

def get_client_by_id(client_id: str) -> Optional[ClientModel]:
    res = supabase_client.table("fp_clients").select("*").eq("id", client_id).execute()
    if res.data:
        c = res.data[0]
        return ClientModel(
            id=c.get("id"),
            name=c.get("name"),
            phone=c.get("phone"),
            email=c.get("email"),
            brandInterest=c.get("brandInterest") or c.get("brand_interest") or "",
            modelInterest=c.get("modelInterest") or c.get("model_interest") or "",
            origin=c.get("origin") or "Web",
            stage=c.get("stage") or "contacto",
            birthday=c.get("birthday"),
            history=c.get("history") or []
        )
    return None

def create_client(client_data: dict) -> ClientModel:
    client_id = f"cli-{uuid.uuid4().hex[:8]}"
    db_client = {
        "id": client_id,
        "name": client_data["name"],
        "phone": client_data["phone"],
        "email": client_data.get("email"),
        "brandInterest": client_data["brandInterest"],
        "modelInterest": client_data["modelInterest"],
        "origin": client_data.get("origin", "Asistente"),
        "stage": client_data.get("stage", "contacto"),
        "birthday": client_data.get("birthday"),
        "history": client_data.get("history", [])
    }
    res = supabase_client.table("fp_clients").insert(db_client).execute()
    c = res.data[0]
    return ClientModel(
        id=c.get("id"),
        name=c.get("name"),
        phone=c.get("phone"),
        email=c.get("email"),
        brandInterest=c.get("brandInterest"),
        modelInterest=c.get("modelInterest"),
        origin=c.get("origin"),
        stage=c.get("stage"),
        birthday=c.get("birthday"),
        history=c.get("history") or []
    )

def update_client_stage(client_id: str, stage: str, history_entry: Optional[dict] = None) -> Optional[ClientModel]:
    current = get_client_by_id(client_id)
    if not current:
        return None
    
    updated_history = list(current.history)
    if history_entry:
        updated_history.append(history_entry)
        
    db_update = {
        "stage": stage,
        "history": [h.dict() if hasattr(h, 'dict') else h for h in updated_history]
    }
    
    res = supabase_client.table("fp_clients").update(db_update).eq("id", client_id).execute()
    if res.data:
        c = res.data[0]
        return ClientModel(
            id=c.get("id"),
            name=c.get("name"),
            phone=c.get("phone"),
            email=c.get("email"),
            brandInterest=c.get("brandInterest"),
            modelInterest=c.get("modelInterest"),
            origin=c.get("origin"),
            stage=c.get("stage"),
            birthday=c.get("birthday"),
            history=c.get("history") or []
        )
    return None

def update_client_history(client_id: str, history: list) -> Optional[ClientModel]:
    res = supabase_client.table("fp_clients").update({"history": history}).eq("id", client_id).execute()
    if res.data:
        c = res.data[0]
        return ClientModel(
            id=c.get("id"),
            name=c.get("name"),
            phone=c.get("phone"),
            email=c.get("email"),
            brandInterest=c.get("brandInterest"),
            modelInterest=c.get("modelInterest"),
            origin=c.get("origin"),
            stage=c.get("stage"),
            birthday=c.get("birthday"),
            history=c.get("history") or []
        )
    return None

# ============================================================================
# OPERATIONS CRUD
# ============================================================================
def get_operations() -> List[Operation]:
    res = supabase_client.table("fp_operations").select("*").execute()
    ops = []
    for o in res.data:
        ops.append(Operation(
            id=o["id"],
            clientId=o["client_id"],
            vehiculoId=o["vehiculo_id"],
            price=float(o["price"]),
            paymentMethod=o["payment_method"],
            docStatus=o["doc_status"],
            deliveryStatus=o["delivery_status"]
        ))
    return ops

def get_operation_by_client_id(client_id: str) -> Optional[Operation]:
    res = supabase_client.table("fp_operations").select("*").eq("client_id", client_id).execute()
    if res.data:
        o = res.data[0]
        return Operation(
            id=o["id"],
            clientId=o["client_id"],
            vehiculoId=o["vehiculo_id"],
            price=float(o["price"]),
            paymentMethod=o["payment_method"],
            docStatus=o["doc_status"],
            deliveryStatus=o["delivery_status"]
        )
    return None

def create_operation(op_data: dict) -> Operation:
    op_id = f"op-{uuid.uuid4().hex[:8]}"
    db_op = {
        "id": op_id,
        "client_id": op_data["clientId"],
        "vehiculo_id": op_data["vehiculoId"],
        "price": op_data["price"],
        "payment_method": op_data["paymentMethod"],
        "doc_status": op_data.get("docStatus", "En Gestoría"),
        "delivery_status": op_data.get("deliveryStatus", "Pendiente")
    }
    res = supabase_client.table("fp_operations").insert(db_op).execute()
    o = res.data[0]
    return Operation(
        id=o["id"],
        clientId=o["client_id"],
        vehiculoId=o["vehiculo_id"],
        price=float(o["price"]),
        paymentMethod=o["payment_method"],
        docStatus=o["doc_status"],
        deliveryStatus=o["delivery_status"]
    )

def update_operation_doc_status(op_id: str, doc_status: str) -> Optional[Operation]:
    res = supabase_client.table("fp_operations").update({"doc_status": doc_status}).eq("id", op_id).execute()
    if res.data:
        o = res.data[0]
        return Operation(
            id=o["id"],
            clientId=o["client_id"],
            vehiculoId=o["vehiculo_id"],
            price=float(o["price"]),
            paymentMethod=o["payment_method"],
            docStatus=o["doc_status"],
            deliveryStatus=o["delivery_status"]
        )
    return None

def update_operation_delivery_status(op_id: str, delivery_status: str) -> Optional[Operation]:
    res = supabase_client.table("fp_operations").update({"delivery_status": delivery_status}).eq("id", op_id).execute()
    if res.data:
        o = res.data[0]
        return Operation(
            id=o["id"],
            clientId=o["client_id"],
            vehiculoId=o["vehiculo_id"],
            price=float(o["price"]),
            paymentMethod=o["payment_method"],
            docStatus=o["doc_status"],
            deliveryStatus=o["delivery_status"]
        )
    return None

def delete_operation(op_id: str):
    supabase_client.table("fp_operations").delete().eq("id", op_id).execute()

# ============================================================================
# APPOINTMENTS CRUD
# ============================================================================
def get_appointments() -> List[Appointment]:
    res = supabase_client.table("fp_appointments").select("*").execute()
    appts = []
    for a in res.data:
        appts.append(Appointment(
            id=a["id"],
            clientId=a["client_id"],
            brand=a["brand"],
            model=a["model"],
            date=a["date"],
            time=a["time"],
            type=a["type"],
            status=a["status"],
            notes=a.get("notes"),
            vehiculoId=a.get("vehiculo_id")
        ))
    return appts

def get_appointment_by_id(appt_id: str) -> Optional[Appointment]:
    res = supabase_client.table("fp_appointments").select("*").eq("id", appt_id).execute()
    if res.data:
        a = res.data[0]
        return Appointment(
            id=a["id"],
            clientId=a["client_id"],
            brand=a["brand"],
            model=a["model"],
            date=a["date"],
            time=a["time"],
            type=a["type"],
            status=a["status"],
            notes=a.get("notes"),
            vehiculoId=a.get("vehiculo_id")
        )
    return None

def create_appointment(appt_data: dict) -> Appointment:
    appt_id = f"appt-{uuid.uuid4().hex[:8]}"
    db_appt = {
        "id": appt_id,
        "client_id": appt_data["clientId"],
        "brand": appt_data["brand"],
        "model": appt_data["model"],
        "date": appt_data["date"],
        "time": appt_data["time"],
        "type": appt_data["type"],
        "status": appt_data.get("status", "Pendiente"),
        "notes": appt_data.get("notes"),
        "vehiculo_id": appt_data.get("vehiculoId")
    }
    res = supabase_client.table("fp_appointments").insert(db_appt).execute()
    a = res.data[0]
    return Appointment(
        id=a["id"],
        clientId=a["client_id"],
        brand=a["brand"],
        model=a["model"],
        date=a["date"],
        time=a["time"],
        type=a["type"],
        status=a["status"],
        notes=a.get("notes"),
        vehiculoId=a.get("vehiculo_id")
    )

def update_appointment_time(appt_id: str, date: str, time: str) -> Optional[Appointment]:
    res = supabase_client.table("fp_appointments").update({"date": date, "time": time}).eq("id", appt_id).execute()
    if res.data:
        a = res.data[0]
        return Appointment(
            id=a["id"],
            clientId=a["client_id"],
            brand=a["brand"],
            model=a["model"],
            date=a["date"],
            time=a["time"],
            type=a["type"],
            status=a["status"],
            notes=a.get("notes"),
            vehiculoId=a.get("vehiculo_id")
        )
    return None

def update_appointment_status(appt_id: str, status: str) -> Optional[Appointment]:
    res = supabase_client.table("fp_appointments").update({"status": status}).eq("id", appt_id).execute()
    if res.data:
        a = res.data[0]
        return Appointment(
            id=a["id"],
            clientId=a["client_id"],
            brand=a["brand"],
            model=a["model"],
            date=a["date"],
            time=a["time"],
            type=a["type"],
            status=a["status"],
            notes=a.get("notes"),
            vehiculoId=a.get("vehiculo_id")
        )
    return None
