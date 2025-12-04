from supabase import create_client, Client
from app.config import settings
from datetime import datetime
from typing import Optional

class JobsService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self.table = "jobs_processing"

    def create_job(self, job_id: str, file_url: str, user_id: Optional[str] = None):
        data = {
            "job_id": job_id,
            "file_url": file_url,
            "status": "pending",
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
            self.supabase.table(self.table).update({"status": status}).eq("job_id", job_id).execute()
        except Exception as e:
            print(f"Error updating job status: {e}")

    def mark_job_ready(self, job_id: str, excel_url: str, pdf_url: str, receipt_data: dict = None):
        data = {
            "status": "ready",
            "excel_url": excel_url,
            "pdf_url": pdf_url
        }
        if receipt_data:
            data["receipt_data"] = receipt_data
            
        try:
            self.supabase.table(self.table).update(data).eq("job_id", job_id).execute()
        except Exception as e:
            print(f"Error marking job ready: {e}")

    def mark_job_error(self, job_id: str, error_message: str):
        data = {
            "status": "error",
            "error": error_message
        }
        try:
            self.supabase.table(self.table).update(data).eq("job_id", job_id).execute()
        except Exception as e:
            print(f"Error marking job error: {e}")

    def get_job(self, job_id: str):
        try:
            response = self.supabase.table(self.table).select("*").eq("job_id", job_id).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching job: {e}")
            return None

    def get_all_jobs(self, limit: int = 50, user_id: Optional[str] = None):
        try:
            # Fetch jobs ordered by creation date (newest first)
            query = self.supabase.table(self.table)\
                .select("*")\
                .eq("status", "ready")\
                .order("created_at", desc=True)\
                .limit(limit)
            
            if user_id:
                query = query.eq("user_id", user_id)
                
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error fetching all jobs: {e}")
            return []

jobs_service = JobsService()
