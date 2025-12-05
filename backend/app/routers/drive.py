from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import base64
from app.services.google_drive import GoogleDriveService

router = APIRouter(prefix="/drive", tags=["drive"])

class UploadRequest(BaseModel):
    user_id: str
    filename: str
    file_bytes: str # Base64 encoded

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
