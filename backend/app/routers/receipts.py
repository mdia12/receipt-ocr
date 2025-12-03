from fastapi import APIRouter, HTTPException
from app.services.jobs import jobs_service
# In a real app, we would have a separate ReceiptsService to fetch from 'receipts' table
# For now, we can reuse job info or mock it if the 'receipts' table isn't fully populated yet

router = APIRouter()

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
