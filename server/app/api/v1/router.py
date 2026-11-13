from fastapi import APIRouter
from app.api.v1.endpoints import health, voice, chat, conversations


api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"]
)

api_router.include_router(
    voice.router,
    prefix="/voice",
    tags=["Voice"]
)

api_router.include_router(
    chat.router,
    tags=["Chat"]
)

api_router.include_router(
    conversations.router,
    prefix="/conversations",
    tags=["Conversations"]
)