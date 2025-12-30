from app.services.jobs import jobs_service
import sys

job_id = "6c018365-c62c-4929-bb3c-90dde0468c43"
if len(sys.argv) > 1:
    job_id = sys.argv[1]

print(f"Checking job {job_id}...")
job = jobs_service.get_job(job_id)

if job:
    print("Job found!")
    print(job)
else:
    print("Job NOT found in Supabase.")
