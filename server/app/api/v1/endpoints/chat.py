
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.chat import process_chat
from app.core.security import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        return await process_chat(
            message=request.message,
            conversation_id=request.conversation_id,
            user_id=current_user["user_id"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to process your request right now."
        )
