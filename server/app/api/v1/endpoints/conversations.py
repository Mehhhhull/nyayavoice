from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool

from app.core.security import get_current_user
from app.services.conversations import (
    get_user_conversations,
    get_conversation_messages,
)

router = APIRouter()


@router.get("/")
async def list_conversations(
    current_user: dict = Depends(get_current_user),
):
    conversations = await run_in_threadpool(
        get_user_conversations,
        current_user["user_id"],
    )

    return {"conversations": conversations}


@router.get("/{conversation_id}/messages")
async def list_conversation_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        messages = await run_in_threadpool(
            get_conversation_messages,
            conversation_id,
            current_user["user_id"],
        )

        return {
            "conversation_id": conversation_id,
            "messages": messages,
        }

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )