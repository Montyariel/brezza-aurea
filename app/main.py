from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import asistente

app = FastAPI(
    title="Brezza Aurea API",
    description="Backend en Python (FastAPI) para gestionar reglas de negocio y conectar con Gemini AI",
    version="2.0"
)

# Configurar CORS para permitir peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(asistente.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Brezza Aurea Backend",
        "version": "2.0",
        "system": "FastAPI + Gemini AI Agent"
    }
