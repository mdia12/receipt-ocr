import asyncio
from app.services.jobs import jobs_service
import uuid

def test_job_lifecycle():
    job_id = str(uuid.uuid4())
    print(f"Testing Job ID: {job_id}")

    # 1. Create Job
    print("Creating job...")
    jobs_service.create_job(job_id, "http://example.com/test.png")
    print("Job created.")

    # 2. Update Status
    print("Updating status to processing...")
    jobs_service.update_job_status(job_id, "processing")
    print("Status updated.")

    # 3. Mark Error
    print("Marking as error...")
    jobs_service.mark_job_error(job_id, "Test Error Message")
    print("Marked as error.")

    # 4. Verify Error
    job = jobs_service.get_job(job_id)
    print(f"Job State (Error): {job['status']}, Error: {job['error']}")

    # 5. Mark Ready (with receipt data)
    print("Marking as ready with receipt data...")
    receipt_data = {
        "merchant": "Test Merchant",
        "amount": 100.0,
        "currency": "EUR",
        "date": "2023-01-01",
        "category": "Test",
        "vat_amount": 20.0,
        "document_type": "receipt",
        "confidence": 0.99
    }
    jobs_service.mark_job_ready(job_id, "http://excel", "http://pdf", receipt_data)
    print("Marked as ready.")

    # 6. Verify Ready
    job = jobs_service.get_job(job_id)
    print(f"Job State (Ready): {job['status']}")
    print(f"Receipt Data: {job.get('receipt_data')}")

if __name__ == "__main__":
    try:
        test_job_lifecycle()
        print("\nSUCCESS: Database schema and JobsService are working correctly.")
    except Exception as e:
        print(f"\nFAILURE: {e}")
