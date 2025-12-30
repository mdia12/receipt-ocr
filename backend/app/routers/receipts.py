from fastapi import APIRouter, HTTPException, Query
from app.services.jobs import jobs_service
from typing import List, Optional

router = APIRouter()

@router.get("/receipts")
async def list_receipts(limit: int = 50, user_id: Optional[str] = None):
    """
    List all processed receipts.
    """
    jobs = jobs_service.get_all_jobs(limit=limit, user_id=user_id)
    
    results = []
    for job in jobs:
        # The jobs service returns rows from 'receipts' table
        results.append({
            "id": job.get("id"),
            "created_at": job.get("created_at"),
            "merchant": job.get("merchant") or "Unknown",
            "date": job.get("date"),
            "amount": job.get("amount"),
            "currency": job.get("currency"),
            "category": job.get("category"),
            "excel_url": job.get("excel_url"),
            "pdf_url": job.get("pdf_url"),
            "file_url": job.get("file_path") # or file_url if generated
        })
        
    return results

@router.get("/receipts/{receipt_id}")
async def get_receipt(receipt_id: str):
    # TODO: Implement fetching from 'receipts' table
    # For now, let's try to find a job with this ID (assuming job_id == receipt_id for simplicity in MVP)
    job = jobs_service.get_job(receipt_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Receipt not found")
        
    # Return a simplified structure or whatever is stored
    return {
        "receipt_id": receipt_id,
        "status": job["status"],
        "data": "Structured data would be here if saved to DB"
    }

@router.get("/receipts/{receipt_id}/download")
async def get_download_link(receipt_id: str, format: str = "pdf"):
    job = jobs_service.get_job(receipt_id)
    if not job:
        raise HTTPException(status_code=404, detail="Receipt not found")
        
    if format == "excel":
        url = job.get("excel_url")
    else:
        url = job.get("pdf_url")
        
    if not url:
        raise HTTPException(status_code=404, detail=f"No {format} file available for this receipt")
        
    return {"url": url}
