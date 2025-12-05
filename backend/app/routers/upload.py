from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
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

router = APIRouter()

async def process_receipt_job(job_id: str, file_bytes: bytes, file_ext: str, email: Optional[str] = None):
    storage_service = get_storage_service()
    try:
        # Calculate checksum for debug
        file_hash = hashlib.md5(file_bytes).hexdigest()
        print(f"[{job_id}] Processing file. Size: {len(file_bytes)}, MD5: {file_hash}")

        jobs_service.update_job_status(job_id, "processing")

        # 1. OCR
        # If PDF, we might need to convert to image first or use PDF OCR
        # For simplicity, assuming image for now or that Google Vision handles PDF bytes directly (it does for some formats but usually requires GCS URI)
        # If it's a PDF, we might need a different handling. 
        # For this MVP, let's assume images. If PDF, we'd need pdf2image.
        
        text = ocr_service.extract_text_from_image(file_bytes)
        print(f"[{job_id}] OCR Text (first 100 chars): {text[:100] if text else 'None'}")
        
        # 2. Parse with LLM
        receipt_data = llm_parser_service.parse_receipt_with_llm(text)
        print(f"[{job_id}] LLM Parsed Data: {receipt_data}")
        
        # 3. Generate Excel
        excel_bytes = excel_export_service.generate_excel(receipt_data)
        excel_path = f"{job_id}/receipt.xlsx"
        excel_url = storage_service.upload_file(
            settings.BUCKET_EXCEL, 
            excel_path, 
            excel_bytes, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # 4. Generate PDF
        pdf_bytes = pdf_export_service.generate_pdf(receipt_data)
        pdf_path = f"{job_id}/receipt.pdf"
        pdf_url = storage_service.upload_file(
            settings.BUCKET_PDF, 
            pdf_path, 
            pdf_bytes, 
            "application/pdf"
        )
        
        # 5. Update Job
        jobs_service.mark_job_ready(job_id, excel_url, pdf_url, receipt_data.model_dump())
        
        # Send email notification
        if email:
            try:
                print(f"[{job_id}] Sending completion email to {email}")
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{settings.FRONTEND_URL}/api/email/scan-completed",
                        json={
                            "email": email,
                            "jobId": job_id,
                            "merchant": receipt_data.merchant,
                            "amount": receipt_data.amount_total,
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
        
        # TODO: Save structured receipt data to 'receipts' table if needed
        
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        traceback.print_exc()
        jobs_service.mark_job_error(job_id, str(e))

from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form

# ... imports ...

@router.post("/upload")
async def upload_receipt(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    email: Optional[str] = Form(None)
):
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
        background_tasks.add_task(process_receipt_job, job_id, file_bytes, file_ext, email)
        
        return {"job_id": job_id, "status": "processing", "message": "Upload successful, processing started"}
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
