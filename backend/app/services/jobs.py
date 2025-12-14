from supabase import create_client, Client
from app.config import settings
from datetime import datetime
from typing import Optional

class JobsService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self.table = "receipts"

    def create_job(self, job_id: str, file_url: str, user_id: Optional[str] = None):
        # This might not be used anymore if Next.js creates the row
        data = {
            "id": job_id,
            "file_path": file_url,
            "status": "processing",
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat()
        }
        try:
            self.supabase.table(self.table).insert(data).execute()
        except Exception as e:
            print(f"Error creating job: {e}")
            raise e

    def update_job_status(self, job_id: str, status: str):
        try:
            self.supabase.table(self.table).update({"status": status}).eq("id", job_id).execute()
            # Also update jobs_processing if it exists
            self.supabase.table("jobs_processing").update({"status": status, "updated_at": datetime.utcnow().isoformat()}).eq("receipt_id", job_id).execute()
        except Exception as e:
            print(f"Error updating job status: {e}")

    def mark_job_ready(self, job_id: str, excel_url: str, pdf_url: str, receipt_data: dict = None):
        print(f"[{job_id}] Marking job ready. Data: {receipt_data}")
        
        # Prepare update data for public.receipts
        data = {
            "status": "success",
            "excel_url": excel_url,
            "pdf_url": pdf_url,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if receipt_data:
            # Ensure we are using the correct keys matching the DB columns
            data["raw_json"] = receipt_data
            data["merchant"] = receipt_data.get("merchant")
            data["amount"] = receipt_data.get("amount")
            data["currency"] = receipt_data.get("currency")
            data["date"] = receipt_data.get("date")
            data["category"] = receipt_data.get("category")
            
            print(f"[{job_id}] Updating receipts table with: amount={data.get('amount')}, merchant={data.get('merchant')}")

        try:
            # Update public.receipts
            response = self.supabase.table(self.table).update(data).eq("id", job_id).execute()
            print(f"[{job_id}] Receipts table updated. Response: {response}")
            
            # Update public.jobs_processing
            self.supabase.table("jobs_processing").update({
                "status": "completed", 
                "updated_at": datetime.utcnow().isoformat()
            }).eq("receipt_id", job_id).execute()
            print(f"[{job_id}] Jobs processing table updated to completed.")
            
        except Exception as e:
            print(f"[{job_id}] Error marking job ready: {e}")
            # Try to log the error to the job
            self.mark_job_error(job_id, f"Failed to save results: {str(e)}")

    def mark_job_error(self, job_id: str, error_message: str):
        print(f"[{job_id}] Marking job error: {error_message}")
        data = {
            "status": "failed",
            "raw_json": {"error": error_message},
            "updated_at": datetime.utcnow().isoformat()
        }
        try:
            self.supabase.table(self.table).update(data).eq("id", job_id).execute()
            # Update jobs_processing
            self.supabase.table("jobs_processing").update({
                "status": "failed", 
                "last_error": error_message, 
                "updated_at": datetime.utcnow().isoformat()
            }).eq("receipt_id", job_id).execute()
        except Exception as e:
            print(f"[{job_id}] Error marking job error: {e}")

    def get_all_jobs(self, limit: int = 50, user_id: Optional[str] = None):
        query = self.supabase.table(self.table).select("*").order("created_at", desc=True).limit(limit)
        if user_id:
            query = query.eq("user_id", user_id)
        try:
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error fetching all jobs: {e}")
            return []

    def get_job(self, job_id: str):
        try:
            response = self.supabase.table(self.table).select("*").eq("id", job_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching job: {e}")
            return None

jobs_service = JobsService()
