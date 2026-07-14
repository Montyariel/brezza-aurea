from pydantic import BaseModel, Field
from typing import List, Optional, Any

# ============================================================================
# USER MODELS
# ============================================================================
class User(BaseModel):
    id: str
    username: str
    name: str

class UserCreate(BaseModel):
    username: str
    password: str
    name: str

class UserLogin(BaseModel):
    username: str
    password: str

# ============================================================================
# VEHICLE (STOCK) MODELS
# ============================================================================
class Vehicle(BaseModel):
    id: str
    brand: str
    model: str
    version: str
    vin: str
    engine: str
    color: str
    origin: str
    location: str
    status: str  # "Disponible", "Reservado", "Vendido"

# ============================================================================
# CLIENT (LEAD) MODELS
# ============================================================================
class ClientHistoryItem(BaseModel):
    date: str
    text: str

class Client(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    brandInterest: str
    modelInterest: str
    origin: str
    stage: str  # "contacto", "presupuesto", "entrevista", "cierre", "entrega"
    birthday: Optional[str] = None
    history: List[ClientHistoryItem] = []

class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    brandInterest: str
    modelInterest: str
    origin: str = "Asistente"
    stage: str = "contacto"
    birthday: Optional[str] = None

# ============================================================================
# OPERATION (VENTAS / GESTORÍA) MODELS
# ============================================================================
class Operation(BaseModel):
    id: str
    clientId: str
    vehiculoId: str
    price: float
    paymentMethod: str
    docStatus: str  # "En Gestoría", "Patentado", "PDI Listo"
    deliveryStatus: str  # "Pendiente", "Entregado"

class OperationCreate(BaseModel):
    clientId: str
    vehiculoId: str
    price: float
    paymentMethod: str
    docStatus: str = "En Gestoría"
    deliveryStatus: str = "Pendiente"

# ============================================================================
# APPOINTMENT (AGENDA) MODELS
# ============================================================================
class Appointment(BaseModel):
    id: str
    clientId: str
    brand: str
    model: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    type: str  # "Cita en Salón", "Test Drive", "Entrega de 0km", "Llamado de Seguimiento"
    status: str  # "Pendiente", "Realizada", "Cancelada"
    notes: Optional[str] = None
    vehiculoId: Optional[str] = None

class AppointmentCreate(BaseModel):
    clientId: str
    brand: str
    model: str
    date: str
    time: str
    type: str
    notes: Optional[str] = None
    vehiculoId: Optional[str] = None
