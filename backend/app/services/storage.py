from supabase import create_client, Client
from app.config import settings
import uuid

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

    def upload_file(self, bucket: str, path: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
        """
        Uploads a file to Supabase Storage and returns the public URL.
        """
        try:
            self.supabase.storage.from_(bucket).upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(bucket).get_public_url(path)
            return public_url
        except Exception as e:
            print(f"Storage upload error: {e}")
            raise e

    def generate_signed_url(self, bucket: str, path: str, expiry_seconds: int = 3600) -> str:
        """
        Generates a signed URL for a private file.
        """
        try:
            response = self.supabase.storage.from_(bucket).create_signed_url(path, expiry_seconds)
            return response["signedURL"]
        except Exception as e:
            print(f"Signed URL generation error: {e}")
            raise e

storage_service = StorageService()
