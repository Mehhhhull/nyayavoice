import httpx
from app.core.config import settings

GNANI_TTS_URL = "https://api.vachana.ai/api/v1/tts/inference"


async def synthesize_speech(
    text: str,
    voice: str = "Shivani",
    language: str = "hi-IN"
) -> bytes:

    headers = {
        "X-API-Key-ID": settings.GNANI_API_KEY_ID,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "voice": voice,
        "model": "timbre-v3.0",
        "language": language,
        "speed": 1.0,
        "audio_config": {
            "sample_rate": 48000,
            "num_channels": 1,
            "sample_width": 2,
            "encoding": "linear_pcm",
            "container": "wav"
        }
    }

    async with httpx.AsyncClient(timeout=60.0) as client:

        response = await client.post(
            GNANI_TTS_URL,
            headers=headers,
            json=payload
        )

        response.raise_for_status()

        return response.content