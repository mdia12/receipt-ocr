import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
import json

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
print(json.dumps(receipt, indent=2))

if receipt["status"] != "processing":
    print(f"Receipt status is {receipt['status']}, not processing.")
    # exit(0) # Continue anyway to force re-process

# Trigger backend
backend_url = "http://127.0.0.1:8000/process"
payload = {
    "receipt_id": receipt["id"],
    "file_path": receipt["file_path"],
    "file_type": receipt["file_type"],
    "user_id": receipt["user_id"],
    "email": "test@example.com" # Dummy email
}

print(f"\nTriggering backend at {backend_url}...")
try:
    res = requests.post(backend_url, json=payload)
    print(f"Response: {res.status_code}")
    print(res.json())
except Exception as e:
    print(f"Failed to trigger backend: {e}")
