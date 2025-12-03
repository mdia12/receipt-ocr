from google.cloud import vision
from google.oauth2 import service_account
from app.config import settings
import os

class OCRService:
    def __init__(self):
        self.client = None
        self.init_google_vision()

    def init_google_vision(self):
        creds_dict = settings.get_google_credentials_dict()
        if creds_dict:
            credentials = service_account.Credentials.from_service_account_info(creds_dict)
            self.client = vision.ImageAnnotatorClient(credentials=credentials)
        elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            # Fallback to environment variable (file path) set in main.py
            try:
                self.client = vision.ImageAnnotatorClient()
                print("Initialized Google Vision client using GOOGLE_APPLICATION_CREDENTIALS file.")
            except Exception as e:
                print(f"Failed to initialize Google Vision client from file: {e}")
        else:
            print("Warning: Google Cloud Vision credentials not found. OCR will fail.")

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        if not self.client:
            raise Exception("Google Cloud Vision client not initialized")

        image = vision.Image(content=image_bytes)
        
        # Perform text detection
        response = self.client.text_detection(image=image)
        
        if response.error.message:
            raise Exception(f"Google Vision API Error: {response.error.message}")

        if not response.text_annotations:
            return ""

        # The first annotation contains the full text
        return response.text_annotations[0].description

ocr_service = OCRService()
