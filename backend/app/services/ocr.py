from google.cloud import vision
from google.oauth2 import service_account
from app.config import settings
import os
import pypdfium2 as pdfium
import io

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

    def extract_text(self, file_bytes: bytes, mime_type: str = None) -> str:
        """
        Extract text from file (Image or PDF).
        """
        # Simple detection if mime_type is not provided
        if (mime_type == "application/pdf") or (file_bytes.startswith(b"%PDF")):
            return self._extract_text_from_pdf(file_bytes)
        else:
            return self._extract_text_from_image(file_bytes)

    def _extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            pdf = pdfium.PdfDocument(pdf_bytes)
            full_text = []
            print(f"Processing PDF with {len(pdf)} pages...")
            
            for i in range(len(pdf)):
                page = pdf[i]
                
                # Try direct text extraction first (much faster and accurate for digital PDFs)
                try:
                    text_page = page.get_textpage()
                    text = text_page.get_text_range()
                    text_page.close()
                    
                    if text and len(text.strip()) > 20: # Heuristic: if we got some text, use it
                        print(f"Page {i+1}: Successfully extracted text directly.")
                        full_text.append(f"--- Page {i+1} (Direct) ---\n{text}")
                        continue
                except Exception as e:
                    print(f"Page {i+1}: Direct extraction failed ({e}), falling back to OCR.")

                print(f"Page {i+1}: Falling back to OCR (Image Rendering).")
                # Render page to image (scale=2 for better quality)
                bitmap = page.render(scale=2)
                pil_image = bitmap.to_pil()
                
                # Convert to bytes for Google Vision
                img_byte_arr = io.BytesIO()
                pil_image.save(img_byte_arr, format='PNG')
                img_bytes = img_byte_arr.getvalue()
                
                # OCR the image
                text = self._extract_text_from_image(img_bytes)
                full_text.append(f"--- Page {i+1} (OCR) ---\n{text}")
                
            return "\n".join(full_text)
        except Exception as e:
            print(f"PDF Processing Error: {e}")
            raise Exception(f"Failed to process PDF: {str(e)}")

    def _extract_text_from_image(self, image_bytes: bytes) -> str:
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
