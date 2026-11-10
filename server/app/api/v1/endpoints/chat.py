from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chat import process_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        return await process_chat(request.message)

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to process your request right now."
        )