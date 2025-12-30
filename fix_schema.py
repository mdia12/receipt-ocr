import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found in backend/.env")
    exit(1)

print(f"Connecting to DB...")
try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    commands = [
        "ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS excel_url text;",
        "ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS pdf_url text;",
        "ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();",
        "ALTER TABLE public.jobs_processing ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();",
        "NOTIFY pgrst, 'reload config';"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        cur.execute(cmd)
        
    print("Schema updated successfully.")
    conn.close()
except Exception as e:
    print(f"Error updating schema: {e}")
    exit(1)
