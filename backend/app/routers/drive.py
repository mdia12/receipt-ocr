from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import base64
from app.services.google_drive import GoogleDriveService, get_auth_flow
from app.config import settings
from supabase import create_client, Client

router = APIRouter(prefix="/drive", tags=["drive"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

class UploadRequest(BaseModel):
    user_id: str
    filename: str
    file_bytes: str # Base64 encoded

class ExchangeRequest(BaseModel):
    code: str
    user_id: str

@router.get("/auth/init")
def auth_init(state: str = "/dashboard"):
    flow = get_auth_flow(state=state)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    return RedirectResponse(auth_url)

@router.post("/auth/exchange")
async def auth_exchange(request: ExchangeRequest):
    try:
        flow = get_auth_flow()
        # The redirect_uri in flow must match the one used in auth_init
        flow.fetch_token(code=request.code)
        creds = flow.credentials

        # Save to Supabase
        supabase.table("google_drive_tokens").upsert({
            "user_id": request.user_id,
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "expires_at": creds.expiry.isoformat() if creds.expiry else None,
            "updated_at": "now()"
        }).execute()

        # Initialize folder immediately
        try:
            drive_service = GoogleDriveService(request.user_id)
            drive_service.initialize_storage()
        except Exception as e:
            print(f"Failed to initialize folder: {e}")
            # Don't fail the auth if folder creation fails, it can happen later on upload

        return {"status": "success"}
    except Exception as e:
        print(f"Auth Exchange Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_to_drive(request: UploadRequest):
    # In a real app, we would verify the user's plan here.
    # For example:
    # user = supabase.table("profiles").select("plan").eq("id", request.user_id).single().execute()
    # if user.data['plan'] != 'PRO':
    #     raise HTTPException(status_code=403, detail="Feature restricted to PRO users")
    
    try:
        # Decode base64
        try:
            file_content = base64.b64decode(request.file_bytes)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 string")
        
        drive_service = GoogleDriveService(request.user_id)
        if not drive_service.service:
             raise HTTPException(status_code=400, detail="Google Drive not connected for this user")
             
        result = drive_service.upload_file(request.filename, file_content)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Drive Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
