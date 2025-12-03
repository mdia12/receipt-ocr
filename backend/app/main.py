from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import upload, status, receipts
import os
import base64

# --- Google Cloud Credentials Setup for Render ---
# Decode the Base64 encoded key from environment variable and write to a temp file
encoded_key = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_BASE64")
if encoded_key:
    try:
        decoded_key = base64.b64decode(encoded_key).decode("utf-8")
        # Write to a temporary file
        with open("/tmp/gcp_key.json", "w") as f:
            f.write(decoded_key)
        # Set the environment variable that Google Client libraries look for
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/tmp/gcp_key.json"
        print("Successfully decoded and set GOOGLE_APPLICATION_CREDENTIALS")
    except Exception as e:
        print(f"Failed to decode GOOGLE_APPLICATION_CREDENTIALS_BASE64: {e}")
# -------------------------------------------------

app = FastAPI(title="Receipt OCR API")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://receipt-ocr-frontend.vercel.app", # Example Vercel URL
    "*" # Allow all for development/MVP, restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(status.router, tags=["Status"])
app.include_router(receipts.router, tags=["Receipts"])

@app.get("/")
def read_root():
    return {"message": "Receipt OCR API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
