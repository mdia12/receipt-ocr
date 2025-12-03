from fastapi import APIRouter, HTTPException
from ..services.jobs import jobs_service

router = APIRouter()

@router.get("/status/{job_id}")
async def check_status(job_id: str):
    job = jobs_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "excel_url": job.get("excel_url"),
        "pdf_url": job.get("pdf_url"),
        "error": job.get("error"),
        "created_at": job.get("created_at")
    }
