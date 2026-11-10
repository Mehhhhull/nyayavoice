
from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NyayaVoice Backend"
    }


@router.get("/health/protected")
async def protected_health_check(
    current_user: dict = Depends(get_current_user)
):
    return {
        "status": "authenticated",
        "user_id": current_user["user_id"],
        "session_id": current_user["session_id"]
    }
