from app.config import settings
import os

print(f"Current Working Directory: {os.getcwd()}")
print(f"SUPABASE_URL from settings: '{settings.SUPABASE_URL}'")
print(f"SUPABASE_SERVICE_KEY from settings: '{settings.SUPABASE_SERVICE_KEY[:10]}...' (truncated)")

try:
    settings.validate_env()
except RuntimeError as e:
    print(f"Validation failed: {e}")
    exit(1)

