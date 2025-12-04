from fastapi import APIRouter, HTTPException
from app.services.jobs import jobs_service

router = APIRouter()

@router.get("/status/{job_id}")
async def check_status(job_id: str):
    job = jobs_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    receipt_data = job.get("receipt_data") or {}
    
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "file_url": job.get("file_url"),
        "excel_url": job.get("excel_url"),
        "pdf_url": job.get("pdf_url"),
        "error": job.get("error"),
        "created_at": job.get("created_at"),
        "receipt_data": receipt_data
    }
