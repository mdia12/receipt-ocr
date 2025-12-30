import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
import json
import uuid
import time

load_dotenv("backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

receipt_id = "47cec7ac-93cd-444f-9f2c-19af3e0f91ab"

print(f"Fetching receipt {receipt_id}...")
response = supabase.table("receipts").select("*").eq("id", receipt_id).execute()

if not response.data:
    print("Receipt not found!")
    exit(1)

receipt = response.data[0]
print("Receipt found:")
# print(json.dumps(receipt, indent=2))

# Trigger backend
backend_url = "http://127.0.0.1:8001/process" # Corrected URL
trace_id = str(uuid.uuid4())
payload = {
    "receipt_id": receipt["id"],
    "file_path": receipt["file_path"],
    "file_type": receipt["file_type"],
    "user_id": receipt["user_id"],
    "email": "test@example.com",
    "trace_id": trace_id
}

print(f"\nTriggering backend at {backend_url} with trace_id={trace_id}...")
try:
    res = requests.post(backend_url, json=payload)
    print(f"Response: {res.status_code}")
    print(res.json())
except Exception as e:
    print(f"Failed to trigger backend: {e}")
    exit(1)

print("\nWaiting for processing...")
time.sleep(5)

# Check debug endpoint
debug_url = f"http://127.0.0.1:8001/debug/receipt/{receipt_id}"
print(f"\nChecking debug endpoint {debug_url}...")
try:
    res = requests.get(debug_url)
    if res.status_code == 200:
        job = res.json()
        print("Job Status:", job.get("status"))
        if job.get("raw_json") and job["raw_json"].get("_debug"):
            print("\n--- DEBUG LOGS ---")
            for log in job["raw_json"]["_debug"]["logs"]:
                print(f"[{log['timestamp']}] [{log['stage']}] {json.dumps(log['data'])}")
        else:
            print("No debug logs found in raw_json.")
            print(json.dumps(job, indent=2))
    else:
        print(f"Debug endpoint failed: {res.status_code}")
except Exception as e:
    print(f"Failed to check debug endpoint: {e}")
