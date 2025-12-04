from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import vision
import os
import base64

# --- Relative Imports ---
from .config import settings
from .routers import upload, status, receipts
from app.services.ocr import ocr_service
from app.services.llm_parser import llm_parser_service
# ------------------------

# --- Google Cloud Credentials Setup for Render ---
# Decode the Base64 encoded key from environment variable and write to a temp file
encoded_key = settings.GOOGLE_APPLICATION_CREDENTIALS_BASE64
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

app = FastAPI(
    title="NovaReceipt API",
    root_path="/api/py" if os.environ.get("VERCEL") else os.getenv("FASTAPI_ROOT_PATH", "")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(status.router, tags=["Status"])
app.include_router(receipts.router, tags=["Receipts"])

@app.get("/")
def root():
    return {"status": "backend running"}

@app.post("/anonymous/scan")
async def anonymous_scan(file: UploadFile = File(...)):
    """
    Anonymous OCR scan endpoint.
    - Receives file
    - Performs OCR (Google Vision)
    - Parses with LLM (OpenAI)
    - Returns structured JSON
    - NO DB Storage
    """
    try:
        content = await file.read()
        
        # 1. OCR
        text = ocr_service.extract_text_from_image(content)
        if not text:
             return {"error": "No text detected in image"}
        
        # 2. LLM Parsing
        receipt_data = llm_parser_service.parse_receipt_with_llm(text)
        
        # 3. Return Data (No DB save)
        return receipt_data
    except Exception as e:
        print(f"Anonymous Scan Error: {e}")
        return {"error": str(e)}

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
