import io
import base64
from datetime import datetime, timezone
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from supabase import create_client, Client
from app.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def get_auth_flow(state: str = None):
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=[settings.google_api_scopes],
        redirect_uri=settings.google_redirect_uri,
        state=state
    )
    return flow

class GoogleDriveService:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.creds = self._get_creds()
        if self.creds:
            self.service = build('drive', 'v3', credentials=self.creds)
        else:
            self.service = None

    def _get_creds(self):
        # Fetch tokens from Supabase
        try:
            response = supabase.table("google_drive_tokens").select("*").eq("user_id", self.user_id).single().execute()
            if not response.data:
                return None

            token_data = response.data
            
            creds = Credentials(
                token=token_data["access_token"],
                refresh_token=token_data["refresh_token"],
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.google_client_id,
                client_secret=settings.google_client_secret,
                scopes=[settings.google_api_scopes]
            )

            # Refresh if expired
            if creds.expired:
                creds.refresh(Request())
                # Update Supabase
                supabase.table("google_drive_tokens").update({
                    "access_token": creds.token,
                    # creds.expiry might be None if not returned by refresh, but usually is.
                    # If None, we don't update expires_at or calculate it.
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }).eq("user_id", self.user_id).execute()

            return creds
        except Exception as e:
            print(f"Error getting Google Creds: {e}")
            return None

    def initialize_storage(self):
        """Creates the NovaReceipt folder if it doesn't exist."""
        return self._get_or_create_folder()

    def _get_or_create_folder(self, folder_name="NovaReceipt"):
        if not self.service:
            return None
            
        # Check if folder exists
        query = f"mimeType='application/vnd.google-apps.folder' and name='{folder_name}' and trashed=false"
        results = self.service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = results.get('files', [])

        if files:
            return files[0]['id']
        
        # Create folder
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        file = self.service.files().create(body=file_metadata, fields='id').execute()
        return file.get('id')

    def upload_file(self, filename: str, file_bytes: bytes, mime_type: str = "application/pdf"):
        if not self.service:
            raise Exception("Google Drive not connected")

        folder_id = self._get_or_create_folder()
        
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=mime_type, resumable=True)
        
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        return {
            "file_id": file.get('id'),
            "drive_url": file.get('webViewLink')
        }
