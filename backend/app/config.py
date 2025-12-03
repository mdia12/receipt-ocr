import os
import base64
import json
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

    # Supabase
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_KEY: str | None = None
    
    # Google Cloud Vision
    GOOGLE_APPLICATION_CREDENTIALS_BASE64: str | None = None
    
    # Storage Buckets
    BUCKET_RAW: str = "receipts_raw"
    BUCKET_PDF: str = "receipts_pdf"
    BUCKET_EXCEL: str = "receipts_excel"

    # App
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    def get_google_credentials_dict(self):
        if not self.GOOGLE_APPLICATION_CREDENTIALS_BASE64:
            return None
        try:
            decoded = base64.b64decode(self.GOOGLE_APPLICATION_CREDENTIALS_BASE64).decode("utf-8")
            return json.loads(decoded)
        except Exception as e:
            print(f"Error decoding GCP credentials: {e}")
            return None

settings = Settings()
