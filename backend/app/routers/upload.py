from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from app.services.storage import get_storage_service
from app.services.jobs import jobs_service
from app.services.ocr import ocr_service
from app.services.llm_parser import llm_parser_service
from app.services.excel_export import excel_export_service
from app.services.pdf_export import pdf_export_service
from app.config import settings
import uuid
import traceback
import hashlib
import httpx
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class ProcessRequest(BaseModel):
    receipt_id: str
    file_path: str
    file_type: str
    user_id: str
    email: Optional[str] = None

async def process_receipt_job_v2(request: ProcessRequest):
    storage_service = get_storage_service()
    job_id = request.receipt_id
    try:
        print(f"[{job_id}] Starting processing for {request.file_path}")
        # Update receipts table status
        jobs_service.update_job_status(job_id, "processing")

        # Download file
        # Assuming bucket is BUCKET_RAW
        file_bytes = storage_service.download_file(settings.BUCKET_RAW, request.file_path)
        
        # Calculate checksum for debug
        file_hash = hashlib.md5(file_bytes).hexdigest()
        print(f"[{job_id}] File downloaded. Size: {len(file_bytes)}, MD5: {file_hash}, Type: {request.file_type}")

        # 1. OCR
        text = ocr_service.extract_text(file_bytes, mime_type=request.file_type)
        print(f"[{job_id}] OCR Text (first 100 chars): {text[:100] if text else 'None'}")
        
        # 2. Parse with LLM
        receipt_data = llm_parser_service.parse_receipt_with_llm(text)
        print(f"[{job_id}] LLM Parsed Data: {receipt_data}")
        
        # 3. Generate Excel
        excel_bytes = excel_export_service.generate_excel(receipt_data)
        excel_path = f"{request.user_id}/{job_id}/receipt.xlsx"
        excel_url = storage_service.upload_file(
            settings.BUCKET_EXCEL, 
            excel_path, 
            excel_bytes, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # 4. Generate PDF
        pdf_bytes = pdf_export_service.generate_pdf(receipt_data)
        pdf_path = f"{request.user_id}/{job_id}/receipt.pdf"
        pdf_url = storage_service.upload_file(
            settings.BUCKET_PDF, 
            pdf_path, 
            pdf_bytes, 
            "application/pdf"
        )
        
        # 5. Update Job (Receipt) - This updates public.receipts with status='processed' (or 'success') and fields
        receipt_dict = receipt_data.model_dump()
        print(f"[{job_id}] Final Receipt Data to Save: {receipt_dict}")
        jobs_service.mark_job_ready(job_id, excel_url, pdf_url, receipt_dict)
        
        # Send email notification
        if request.email:
            try:
                print(f"[{job_id}] Sending completion email to {request.email}")
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{settings.FRONTEND_URL}/api/email/scan-completed",
                        json={
                            "email": request.email,
                            "jobId": job_id,
                            "merchant": receipt_data.merchant,
                            "amount": receipt_data.amount,
                            "currency": receipt_data.currency,
                            "date": receipt_data.date,
                            "category": receipt_data.category,
                            "excelUrl": excel_url,
                            "pdfUrl": pdf_url
                        },
                        timeout=10.0
                    )
                    print(f"[{job_id}] Email API response: {response.status_code} {response.text}")
            except Exception as e:
                print(f"[{job_id}] Failed to send email: {e}")
        
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        traceback.print_exc()
        jobs_service.mark_job_error(job_id, str(e))

@router.post("/process")
async def process_receipt(
    request: ProcessRequest,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(process_receipt_job_v2, request)
    return {"status": "processing_started", "receipt_id": request.receipt_id}

async def process_receipt_job(job_id: str, file_bytes: bytes, file_ext: str, mime_type: str, email: Optional[str] = None):
    # Legacy function kept for compatibility if needed, but logic moved to v2
    pass

@router.post("/upload")
async def upload_receipt(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    email: Optional[str] = Form(None)
):
    # Legacy endpoint
    storage_service = get_storage_service()
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        file_bytes = await file.read()
        file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else "jpg"
        
        job_id = str(uuid.uuid4())
        file_path = f"{job_id}/raw.{file_ext}"
        
        # 1. Upload raw file
        raw_url = storage_service.upload_file(
            settings.BUCKET_RAW, 
            file_path, 
            file_bytes, 
            file.content_type or "application/octet-stream"
        )
        
        # 2. Create Job
        jobs_service.create_job(job_id, raw_url, user_id=user_id)
        
        # 3. Trigger Processing in Background
        # We can adapt this to use v2 logic if we want, but for now let's leave it as legacy
        # or better, redirect to v2 logic
        
        request = ProcessRequest(
            receipt_id=job_id,
            file_path=file_path,
            file_type=file.content_type or "application/octet-stream",
            user_id=user_id or "anonymous",
            email=email
        )
        background_tasks.add_task(process_receipt_job_v2, request)
        
        return {"job_id": job_id, "status": "processing", "message": "Upload successful, processing started"}
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
