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
    
    # Google OAuth
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None

    @property
    def google_api_scopes(self) -> list[str]:
        return [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "openid"
        ]

    # Storage Buckets
    BUCKET_RAW: str = "receipts_raw"
    BUCKET_PDF: str = "receipts_pdf"
    BUCKET_EXCEL: str = "receipts_excel"

    # App
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_URL: str = "https://novareceipt.com"

    # OpenAI
    OPENAI_API_KEY: str | None = None

    def validate_env(self):
        """
        Validates that all required environment variables are present.
        Raises RuntimeError if any critical configuration is missing.
        """
        missing = []
        
        # Database
        if not self.SUPABASE_URL:
            missing.append("SUPABASE_URL: Database connection will fail.")
        if not self.SUPABASE_SERVICE_KEY:
            missing.append("SUPABASE_SERVICE_KEY: Database operations will fail.")
            
        # OCR (Google Cloud)
        # Check if either the Base64 content is provided OR the file path is set in env
        has_google_creds = self.GOOGLE_APPLICATION_CREDENTIALS_BASE64 or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not has_google_creds:
            missing.append("GOOGLE_APPLICATION_CREDENTIALS_BASE64 or GOOGLE_APPLICATION_CREDENTIALS: OCR will not work.")
            
        # LLM (OpenAI)
        if not self.OPENAI_API_KEY:
            missing.append("OPENAI_API_KEY: Receipt parsing will not work.")
            
        # Storage
        if not self.BUCKET_RAW:
            missing.append("BUCKET_RAW: File upload will fail.")
            
        # App
        if not self.FRONTEND_URL:
            missing.append("FRONTEND_URL: CORS configuration will be incorrect.")

        if missing:
            print("\n" + "="*50)
            print("CRITICAL CONFIGURATION ERROR")
            print("="*50)
            for m in missing:
                print(f"❌ {m}")
            print("="*50 + "\n")
            raise RuntimeError("Application startup aborted due to missing configuration.")

        # Log success summary
        print("\n" + "="*50)
        print("✅ CONFIGURATION VALIDATED")
        print("="*50)
        print(f"Database:   Ready ({self.SUPABASE_URL})")
        print("OCR:        Enabled (Google Cloud Vision)")
        print("Parsing:    Enabled (OpenAI)")
        print("Storage:    Ready")
        print("="*50 + "\n")

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
