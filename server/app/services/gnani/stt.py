import httpx

from app.core.config import settings


GNANI_STT_URL = "https://api.vachana.ai/stt/v3"


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
    content_type: str
):
    headers = {
        "X-API-Key-ID": settings.GNANI_API_KEY_ID
    }

    files = {
        "audio_file": (
            filename,
            audio_bytes,
            content_type
        )
    }

    data = {
    "language_code": "indic-auto",
    "model": "prisma-v3.0",
    "format": "transcribe"
}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GNANI_STT_URL,
            headers=headers,
            files=files,
            data=data
        )

        response.raise_for_status()

        return response.json()