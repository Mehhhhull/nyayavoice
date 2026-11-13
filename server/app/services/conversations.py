
from uuid import UUID, uuid4

from app.core.supabase import supabase


def create_conversation(user_id: str) -> str:
    """Create a conversation associated with an authenticated user."""

    conversation_id = str(uuid4())

    supabase.table("conversations").insert({
        "id": conversation_id,
        "user_id": user_id
    }).execute()

    return conversation_id


def get_conversation(
    conversation_id: str,
    user_id: str
) -> dict | None:
    """Retrieve a conversation only if it belongs to the user."""

    try:
        UUID(conversation_id)
    except (ValueError, TypeError):
        return None

    response = (
        supabase.table("conversations")
        .select("id, user_id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def save_message(
    conversation_id: str,
    role: str,
    content: str,
    user_id: str
) -> None:
    """Save a message only if the conversation belongs to the user."""

    if role not in ("user", "assistant"):
        raise ValueError("Invalid message role")

    conversation = get_conversation(conversation_id, user_id)

    if not conversation:
        raise ValueError("Invalid conversation ID")

    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content
    }).execute()

    # Update conversation activity timestamp
    supabase.table("conversations").update({
        "updated_at": "now()"
    }).eq("id", conversation_id).eq("user_id", user_id).execute()


def get_conversation_history(
    conversation_id: str,
    user_id: str,
    limit: int = 20
) -> list[dict]:
    """Fetch conversation history only for its authenticated owner."""

    conversation = get_conversation(conversation_id, user_id)

    if not conversation:
        raise ValueError("Invalid conversation ID")

    response = (
        supabase.table("messages")
        .select("role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return list(reversed(response.data))


def get_user_conversations(user_id: str) -> list[dict]:
    """Fetch all conversations belonging to an authenticated user."""

    response = (
        supabase.table("conversations")
        .select("id, created_at, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )

    return response.data or []


def get_conversation_messages(
    conversation_id: str,
    user_id: str,
    limit: int = 100
) -> list[dict]:
    """Fetch messages only from a conversation owned by the user."""

    conversation = get_conversation(conversation_id, user_id)

    if not conversation:
        raise ValueError("Invalid conversation ID")

    response = (
        supabase.table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .limit(limit)
        .execute()
    )

    return response.data or []
