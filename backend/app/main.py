import sys
import os

# --- Debugging & Path Setup ---
# Print debug info to logs to help diagnose Render issues
print(f"DEBUG: Current Working Directory: {os.getcwd()}")
print(f"DEBUG: Initial Sys Path: {sys.path}")

# Ensure the 'backend' directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
    print(f"DEBUG: Added {backend_dir} to sys.path")

try:
    # Verify config.py exists
    app_dir = os.path.join(backend_dir, "app")
    print(f"DEBUG: Contents of {app_dir}: {os.listdir(app_dir)}")
except Exception as e:
    print(f"DEBUG: Error listing app dir: {e}")
# -----------------------------

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import vision

# Use absolute imports now that path is fixed
from app.config import settings
from app.routers import upload, status, receipts
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

# Initialize Google Vision Client (Global for simple endpoint)
try:
    # This must happen AFTER the credential setup above
    vision_client = vision.ImageAnnotatorClient()
except Exception as e:
    print(f"Warning: Could not initialize global Vision client: {e}")
    vision_client = None

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

@app.post("/ocr")
async def ocr_receipt(file: UploadFile = File(...)):
    """
    Simple direct OCR endpoint for testing/debugging.
    """
    if not vision_client:
        return {"error": "Google Vision Client not initialized. Check server logs."}

    content = await file.read()

    image = vision.Image(content=content)
    # Using document_text_detection as requested
    response = vision_client.document_text_detection(image=image)
    
    if response.error.message:
        return {"error": f"Google Vision API Error: {response.error.message}"}

    if not response.full_text_annotation:
        return {"text": ""}

    text = response.full_text_annotation.text

    return {"text": text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
