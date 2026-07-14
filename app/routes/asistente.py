from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_agent import chat_con_agente

router = APIRouter(prefix="/asistente", tags=["asistente"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply = chat_con_agente(request.message)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el asistente virtual: {str(e)}")
