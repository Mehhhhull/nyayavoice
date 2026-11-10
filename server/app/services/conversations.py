
from uuid import UUID, uuid4

from app.core.supabase import supabase


def create_conversation() -> str:
    """Create a new conversation and return its ID."""

    conversation_id = str(uuid4())

    supabase.table("conversations").insert({
        "id": conversation_id
    }).execute()

    return conversation_id


def get_conversation(conversation_id: str) -> dict | None:
    """Check whether a conversation exists."""

    try:
        UUID(conversation_id)
    except ValueError:
        return None

    response = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def save_message(
    conversation_id: str,
    role: str,
    content: str
) -> None:
    """Save a message to a conversation."""

    if role not in ("user", "assistant"):
        raise ValueError("Invalid message role")

    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content
    }).execute()


def get_conversation_history(
    conversation_id: str,
    limit: int = 20
) -> list[dict]:
    """Fetch the latest messages in chronological order."""

    response = (
        supabase.table("messages")
        .select("role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return list(reversed(response.data))
