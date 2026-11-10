from fastapi import APIRouter
from app.api.v1.endpoints import health, voice, chat


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