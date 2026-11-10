from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(
    title="NyayaVoice Backend",
    description="Version 1",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to NyayaVoice Backend",
        "status": "running"
    }