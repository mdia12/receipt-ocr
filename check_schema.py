import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

load_dotenv("backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

print("Checking jobs_processing table...")

# Try to insert a row with invalid data to trigger an error that might reveal schema, 
# or just select one row to see keys.
try:
    response = supabase.table("jobs_processing").select("*").limit(1).execute()
    if response.data:
        print("Found a row. Keys:")
        print(response.data[0].keys())
    else:
        print("No rows found. Cannot infer schema from data.")
        
        # Try to insert with a known column 'receipt_id' and see if it complains about 'job_id'
        # We need a valid receipt_id first.
        receipt_id = "47cec7ac-93cd-444f-9f2c-19af3e0f91ab" 
        print(f"Attempting insert with receipt_id={receipt_id}")
        
        try:
            res = supabase.table("jobs_processing").insert({
                "receipt_id": receipt_id,
                "status": "test_schema"
            }).execute()
            print("Insert successful (unexpected if job_id is required).")
            print(res.data)
        except Exception as e:
            print(f"Insert failed: {e}")

except Exception as e:
    print(f"Error: {e}")
