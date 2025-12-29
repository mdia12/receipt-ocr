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
            try:
                self.supabase.table("jobs_processing").update({"status": status, "updated_at": datetime.utcnow().isoformat()}).eq("receipt_id", job_id).execute()
            except Exception as e:
                # Fallback if updated_at missing
                if "updated_at" in str(e) or "PGRST204" in str(e) or "42703" in str(e):
                     self.supabase.table("jobs_processing").update({"status": status}).eq("receipt_id", job_id).execute()
                else:
                    print(f"Error updating jobs_processing: {e}")
        except Exception as e:
            print(f"Error updating job status: {e}")

    def mark_job_ready(self, job_id: str, excel_url: str, pdf_url: str, receipt_data: dict = None, ocr_text: str = None):
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
            # Save raw_json with OCR text for debugging
            raw_json = receipt_data.copy()
            if ocr_text:
                raw_json["ocr_text_raw"] = ocr_text
            
            data["raw_json"] = raw_json
            data["merchant"] = receipt_data.get("merchant") or "Unknown Merchant"
            
            # Ensure amount is a float
            amount_val = receipt_data.get("amount")
            if amount_val is not None:
                try:
                    data["amount"] = float(amount_val)
                except (ValueError, TypeError):
                    print(f"[{job_id}] Error converting amount {amount_val} to float. Setting to 0.0")
                    data["amount"] = 0.0
            else:
                data["amount"] = 0.0

            data["currency"] = receipt_data.get("currency") or "EUR"
            data["date"] = receipt_data.get("date")
            data["category"] = receipt_data.get("category")
            
            print(f"[{job_id}] Updating receipts table with: amount={data.get('amount')}, merchant={data.get('merchant')}")

        try:
            # Update public.receipts
            response = self.supabase.table(self.table).update(data).eq("id", job_id).execute()
            print(f"[{job_id}] Receipts table updated. Rows affected: {len(response.data) if response.data else 0}")
            
            # Update public.jobs_processing
            try:
                self.supabase.table("jobs_processing").update({
                    "status": "completed", 
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("receipt_id", job_id).execute()
                print(f"[{job_id}] Jobs processing table updated to completed.")
            except Exception as e:
                if "updated_at" in str(e) or "PGRST204" in str(e) or "42703" in str(e):
                    self.supabase.table("jobs_processing").update({"status": "completed"}).eq("receipt_id", job_id).execute()
                else:
                    print(f"[{job_id}] Error updating jobs_processing: {e}")
            
        except Exception as e:
            print(f"[{job_id}] Error marking job ready: {e}")
            # Fallback: remove columns that might be missing
            if "excel_url" in str(e) or "pdf_url" in str(e) or "updated_at" in str(e) or "PGRST204" in str(e) or "42703" in str(e):
                print(f"[{job_id}] Retrying update without optional columns...")
                data.pop("excel_url", None)
                data.pop("pdf_url", None)
                data.pop("updated_at", None)
                try:
                    self.supabase.table(self.table).update(data).eq("id", job_id).execute()
                    print(f"[{job_id}] Retry successful.")
                except Exception as e2:
                    print(f"[{job_id}] Retry failed: {e2}")
                    self.mark_job_error(job_id, f"Failed to save results: {str(e2)}")
            else:
                self.mark_job_error(job_id, f"Failed to save results: {str(e)}")

    def mark_job_error(self, job_id: str, error_message: str):
        print(f"[{job_id}] Marking job error: {error_message}")
        data = {
            "status": "failed",
            "raw_json": {"error": error_message},
            "updated_at": datetime.utcnow().isoformat()
        }
        try:
            try:
                self.supabase.table(self.table).update(data).eq("id", job_id).execute()
            except Exception as e:
                if "updated_at" in str(e) or "PGRST204" in str(e) or "42703" in str(e):
                    data.pop("updated_at", None)
                    self.supabase.table(self.table).update(data).eq("id", job_id).execute()
                else:
                    raise e
            
            # Update jobs_processing
            try:
                self.supabase.table("jobs_processing").update({
                    "status": "failed", 
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("receipt_id", job_id).execute()
            except Exception as e:
                 if "updated_at" in str(e) or "PGRST204" in str(e) or "42703" in str(e):
                    self.supabase.table("jobs_processing").update({"status": "failed"}).eq("receipt_id", job_id).execute()
                 else:
                    print(f"[{job_id}] Error updating jobs_processing error status: {e}")

        except Exception as e:
            print(f"[{job_id}] Error marking job error: {e}") 
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
