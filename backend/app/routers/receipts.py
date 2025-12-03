from fastapi import APIRouter, HTTPException, Query
from app.services.jobs import jobs_service
from typing import List, Optional

router = APIRouter()

@router.get("/receipts")
async def list_receipts(limit: int = 50):
    """
    List all processed receipts.
    """
    jobs = jobs_service.get_all_jobs(limit=limit)
    
    results = []
    for job in jobs:
        receipt_data = job.get("receipt_data") or {}
        results.append({
            "id": job["job_id"],
            "created_at": job["created_at"],
            "merchant": receipt_data.get("merchant", "Unknown"),
            "date": receipt_data.get("date"),
            "amount_total": receipt_data.get("amount_total"),
            "currency": receipt_data.get("currency"),
            "category": receipt_data.get("category"),
            "excel_url": job.get("excel_url"),
            "pdf_url": job.get("pdf_url")
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
