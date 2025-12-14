from supabase import create_client, Client
from ..config import settings
import time

class StorageService:
    def __init__(self):
        self.supabase: Client = None
        self._connect()

    def _connect(self):
        try:
            self.supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY,
            )
        except Exception as e:
            print(f"Supabase connection failed: {e}")
            self.supabase = None

    def get_client(self) -> Client:
        if not self.supabase:
            self._connect()
        if not self.supabase:
             raise Exception("Supabase client is not initialized")
        return self.supabase

    def upload_file(self, bucket: str, path: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
        client = self.get_client()
        try:
            client.storage.from_(bucket).upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            return client.storage.from_(bucket).get_public_url(path)
        except Exception as e:
            print(f"Storage upload error: {e}")
            raise e

    def delete_file(self, bucket: str, path: str):
        client = self.get_client()
        try:
            client.storage.from_(bucket).remove([path])
        except Exception as e:
            print(f"Storage delete error: {e}")
            raise e

    def get_public_url(self, bucket: str, path: str) -> str:
        client = self.get_client()
        try:
            return client.storage.from_(bucket).get_public_url(path)
        except Exception as e:
            print(f"Storage get_url error: {e}")
            raise e

    def download_file(self, bucket: str, path: str) -> bytes:
        client = self.get_client()
        try:
            return client.storage.from_(bucket).download(path)
        except Exception as e:
            print(f"Storage download error: {e}")
            raise e

_storage_service = None

def get_storage_service():
    global _storage_service
    if not _storage_service:
        _storage_service = StorageService()
    return _storage_service
