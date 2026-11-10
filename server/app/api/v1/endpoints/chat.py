
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chat import process_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


@router.post("/chat")
async def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        return await process_chat(
            message=request.message,
            conversation_id=request.conversation_id,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to process your request right now."
        )
