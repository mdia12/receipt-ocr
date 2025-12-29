from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from app.services.storage import get_storage_service
from app.services.jobs import jobs_service
from app.services.ocr import ocr_service
from app.services.llm_parser import llm_parser_service
from app.services.excel_export import excel_export_service
from app.services.pdf_export import pdf_export_service
from app.utils.parsing import parse_amount
from app.config import settings
import uuid
import traceback
import hashlib
import httpx
import json
import re
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel

router = APIRouter()

def normalize_date(value: Any) -> Optional[str]:
    """
    Normalizes date to YYYY-MM-DD.
    Handles DD/MM/YYYY, DD-MM-YYYY.
    """
    if not value or not isinstance(value, str):
        return None
    
    value = value.strip()
    
    # Already YYYY-MM-DD
    if re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        return value
        
    # DD/MM/YYYY or DD-MM-YYYY
    match = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", value)
    if match:
        day, month, year = match.groups()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        
    return None

class ProcessRequest(BaseModel):
    receipt_id: str
    file_path: str
    file_type: str
    user_id: str
    email: Optional[str] = None
    trace_id: Optional[str] = None

async def process_receipt_job_v2(request: ProcessRequest):
    storage_service = get_storage_service()
    job_id = request.receipt_id
    trace_id = request.trace_id or str(uuid.uuid4())
    
    # Structured Log Accumulator
    debug_info = {
        "trace_id": trace_id,
        "receipt_id": job_id,
        "logs": []
    }
    
    def log_event(stage: str, data: dict):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "stage": stage,
            "data": data
        }
        debug_info["logs"].append(entry)
        print(f"[{trace_id}] [{stage}] {json.dumps(data, default=str)}")

    try:
        log_event("START", {"file_path": request.file_path, "file_type": request.file_type})
        
        # Update receipts table status
        jobs_service.update_job_status(job_id, "processing")

        # Download file
        file_bytes = storage_service.download_file(settings.BUCKET_RAW, request.file_path)
        
        # Calculate checksum
        file_hash = hashlib.md5(file_bytes).hexdigest()
        log_event("DOWNLOAD", {"size": len(file_bytes), "md5": file_hash})

        # 1. OCR
        text = ocr_service.extract_text(file_bytes, mime_type=request.file_type)
        text_len = len(text) if text else 0
        log_event("OCR", {"length": text_len, "preview": text[:200] if text else ""})
        
        # Guardrail: Empty OCR
        if text_len < 10:
            raise ValueError("OCR_EMPTY: Text too short or empty")
        
        # 2. Parse with LLM
        receipt_data = llm_parser_service.parse_receipt_with_llm(text)
        log_event("LLM_PARSE", receipt_data.model_dump())
        
        # 3. Normalization & Validation
        # Amount
        original_amount = receipt_data.amount
        receipt_data.amount = parse_amount(receipt_data.amount)
        
        # Date
        original_date = receipt_data.date
        receipt_data.date = normalize_date(receipt_data.date)
        
        log_event("NORMALIZATION", {
            "amount_raw": original_amount,
            "amount_parsed": receipt_data.amount,
            "date_raw": original_date,
            "date_parsed": receipt_data.date
        })

        # Guardrail: Amount
        if receipt_data.amount is None:
             # We treat this as an error as requested
             raise ValueError("AMOUNT_PARSE_FAIL: Could not extract valid amount")

        # 4. Update DB
        receipt_dict = receipt_data.model_dump()
        
        # Inject debug info into raw_json
        if not receipt_dict.get("raw_json"):
            receipt_dict["raw_json"] = {}
        elif not isinstance(receipt_dict["raw_json"], dict):
             receipt_dict["raw_json"] = {"original": receipt_dict["raw_json"]}
             
        receipt_dict["raw_json"]["_debug"] = debug_info
        receipt_dict["raw_json"]["ocr_text"] = text

        jobs_service.mark_job_ready(job_id, excel_url=None, pdf_url=None, receipt_data=receipt_dict, ocr_text=text)
        log_event("SUCCESS", {"msg": "Job completed successfully"})

    except Exception as e:
        error_msg = str(e)
        tb = traceback.format_exc()
        log_event("ERROR", {"error": error_msg, "traceback": tb})
        
        # Update DB with error
        jobs_service.mark_job_error(job_id, error_msg)
@router.get("/debug/receipt/{receipt_id}")
async def debug_receipt(receipt_id: str):
    """
    Returns the raw Supabase row for a receipt to verify its state.
    """
    job = jobs_service.get_job(receipt_id)
    if not job:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return job

@router.post("/anonymous/scan")
async def scan_anonymous(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    print(f"[{job_id}] Starting anonymous scan")
    
    try:
        file_bytes = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        file_ext = file.filename.split('.')[-1].lower() if file.filename and '.' in file.filename else "jpg"
        
        # 0. Upload & Create Job in DB
        # We upload to have a record and URL
        file_path = f"anonymous/{job_id}/raw.{file_ext}"
        storage_service = get_storage_service()
        raw_url = storage_service.upload_file(
            settings.BUCKET_RAW, 
            file_path, 
            file_bytes, 
            mime_type
        )
        
        # Create initial DB entry with status 'processing'
        jobs_service.create_job(job_id, raw_url, user_id=None)
        
        # 1. OCR
        text = ocr_service.extract_text(file_bytes, mime_type=mime_type)
        
        # 2. Parse
        receipt_data = llm_parser_service.parse_receipt_with_llm(text)
        
        # Ensure amount is float
        if receipt_data.amount is not None:
             receipt_data.amount = parse_amount(receipt_data.amount)
             
        # 3. Update DB
        receipt_dict = receipt_data.model_dump()
        
        # For anonymous scan, we might not generate exports yet, or we can if needed.
        # Passing None for exports.
        jobs_service.mark_job_ready(job_id, excel_url=None, pdf_url=None, receipt_data=receipt_dict, ocr_text=text)
        
        # Return result including receipt_id
        result = receipt_dict.copy()
        result["receipt_id"] = job_id
        result["status"] = "success"
        return result

    except Exception as e:
        print(f"[{job_id}] Anonymous scan failed: {e}")
        traceback.print_exc()
        # Update DB to error
        try:
            jobs_service.mark_job_error(job_id, str(e))
        except Exception as db_err:
            print(f"[{job_id}] Failed to update error status: {db_err}")
            
        raise HTTPException(status_code=500, detail=str(e))

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
