from fastapi import APIRouter, UploadFile, File, HTTPException
import httpx
import base64
from pydantic import BaseModel
from fastapi.responses import Response
from app.services.chat import process_chat


from app.services.chat import process_chat


from app.services.gnani.stt import transcribe_audio
from app.services.gnani.tts import synthesize_speech

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice: str = "Shivani"
    language: str = "hi-IN"

@router.post("/stt")
async def speech_to_text(
    audio: UploadFile = File(...)
):
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an audio file"
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Audio file is empty"
        )

    try:
        result = await transcribe_audio(
            audio_bytes,
            audio.filename or "recording.wav",
            audio.content_type
        )

        return result

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gnani API error: {exc.response.text}"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Gnani"
        )


@router.post("/ask")
async def voice_ask(audio: UploadFile = File(...)):

    # 1. Validate uploaded audio
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an audio file"
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Audio file is empty"
        )

    try:
        # 2. Convert speech into text using Gnani STT
        stt_result = await transcribe_audio(
            audio_bytes,
            audio.filename or "recording.wav",
            audio.content_type
        )

        transcript = stt_result.get("transcript", "").strip()

        if not stt_result.get("success") or not transcript:
            raise HTTPException(
                status_code=502,
                detail="Could not transcribe the audio"
            )

        # 3. Send transcript through our existing RAG + Gemini pipeline
        chat_result = await process_chat(transcript)

        # 4. Return everything to the frontend
        return {
            "transcript": transcript,
            "detected_language_code": stt_result.get(
                "detected_language_code"
            ),
            "response": chat_result["response"],
            "sources": chat_result["sources"]
        }

    except HTTPException:
        raise

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gnani API error: {exc.response.text[:500]}"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Gnani"
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to process your voice request"
        )




@router.post("/conversation")
async def voice_conversation(audio: UploadFile = File(...)):

    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Please upload an audio file")

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    try:
        # 1. STT
        stt_result = await transcribe_audio(
            audio_bytes,
            audio.filename or "recording.wav",
            audio.content_type
        )

        transcript = stt_result.get("transcript", "").strip()

        if not stt_result.get("success") or not transcript:
            raise HTTPException(status_code=502, detail="Could not transcribe audio")

        # 2. RAG + Gemini
        chat_result = await process_chat(transcript)
        answer = chat_result["response"]
        speech_text = chat_result["speech_response"]

        audio_output = await synthesize_speech(
            text=speech_text,
            voice="Shivani",
            language="hi-IN"
        )

        if not audio_output:
            raise HTTPException(status_code=502, detail="TTS returned empty audio")

        # 4. Encode audio
        audio_base64 = base64.b64encode(audio_output).decode("utf-8")

        return {
            "transcript": transcript,
            "detected_language_code": stt_result.get("detected_language_code"),
            "response": answer,
            "sources": chat_result["sources"],
            "audio_format": "wav",
            "audio_base64": audio_base64
        }

    except HTTPException:
        raise

    except httpx.HTTPStatusError as exc:
        print("GNANI HTTP ERROR:", exc.response.status_code)
        print("GNANI RESPONSE:", exc.response.text[:2000])
        raise HTTPException(
            status_code=502,
            detail=f"External API error: {exc.response.text[:1000]}"
        )

    except httpx.RequestError as exc:
        print("NETWORK ERROR:", repr(exc))
        raise HTTPException(status_code=502, detail="Could not connect to Gnani")

    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Voice conversation failed: {str(exc)}"
        )

    

@router.post("/tts")
async def text_to_speech(request: TTSRequest):

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty"
        )

    try:
        audio_bytes = await synthesize_speech(
            text=request.text,
            voice=request.voice,
            language=request.language
        )

        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": 'attachment; filename="speech.wav"'
            }
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gnani TTS error: {exc.response.text[:500]}"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Gnani TTS service"
        )