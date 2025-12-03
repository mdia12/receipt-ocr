from supabase import create_client, Client
from ..config import settings   # ✅ import relatif
import uuid


class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,   # ✅ bon nom de variable
        )

    def upload_file(self, bucket: str, path: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
        try:
            self.supabase.storage.from_(bucket).upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            return self.supabase.storage.from_(bucket).get_public_url(path)
        except Exception as e:
            print(f"Storage upload error: {e}")
            raise e

    def generate_signed_url(self, bucket: str, path: str, expiry_seconds: int = 3600) -> str:
        try:
            response = self.supabase.storage.from_(bucket).create_signed_url(path, expiry_seconds)
            return response["signedURL"]
        except Exception as e:
            print(f"Signed URL generation error: {e}")
            raise e


storage_service = StorageService()
