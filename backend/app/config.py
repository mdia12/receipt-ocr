import os
import base64
import json
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Google Cloud Vision
    # We expect the JSON key content to be base64 encoded in this env var
    GCP_SERVICE_ACCOUNT_JSON_BASE64: str = os.getenv("GCP_SERVICE_ACCOUNT_JSON_BASE64", "")
    
    # Storage Buckets
    BUCKET_RAW: str = os.getenv("BUCKET_RAW", "receipts_raw")
    BUCKET_PDF: str = os.getenv("BUCKET_PDF", "receipts_pdf")
    BUCKET_EXCEL: str = os.getenv("BUCKET_EXCEL", "receipts_excel")

    # App
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    def get_google_credentials_dict(self):
        if not self.GCP_SERVICE_ACCOUNT_JSON_BASE64:
            return None
        try:
            decoded = base64.b64decode(self.GCP_SERVICE_ACCOUNT_JSON_BASE64).decode("utf-8")
            return json.loads(decoded)
        except Exception as e:
            print(f"Error decoding GCP credentials: {e}")
            return None

settings = Settings()
