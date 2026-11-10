from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GNANI_API_KEY_ID: str
    GEMINI_API_KEY: str

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()