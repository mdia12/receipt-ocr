from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import json
import os
from openai import OpenAI
from app.config import settings
from app.models.receipt import ReceiptData

class LLMParserService:
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            print("Warning: OPENAI_API_KEY not set. LLM Parser will fail.")

    def parse_receipt_with_llm(self, ocr_text: str) -> ReceiptData:
        if not self.client:
            raise Exception("OpenAI Client not initialized. Check OPENAI_API_KEY.")

        prompt = f"""
        You are an expert data extraction assistant. 
        Your task is to extract structured data from the following OCR text of a receipt or invoice.
        
        OCR TEXT:
        \"\"\"
        {ocr_text}
        \"\"\"
        
        INSTRUCTIONS:
        1. Identify the **Merchant Name**. Ignore generic headers like "FACTURE", "TICKET", "RECEIPT". Look for the business logo text or header.
        2. Identify the **Total Amount**. Look for "TOTAL", "MONTANT", "PAYÉ".
        3. Identify the **Date**. Return it in YYYY-MM-DD format.
        4. Identify the **VAT Amount** (TVA). If multiple rates, sum them up.
        5. Determine the **Currency** (EUR, USD, etc.).
        6. Determine the **Category** from the following list (UPPERCASE):
           - RESTAURANT  (bars, cafés, fast-food, restaurants)
           - COURSES      (supermarché, épicerie, alimentation générale)
           - TAXI         (taxis, VTC, Uber, Bolt, Cabify, etc.)
           - HOTEL        (hôtels, auberges, hébergements courte durée)
           - DOMICILE     (électricité, gaz, eau, internet, charges de logement)
           - ESSENCE      (stations-service, carburant, péage)
           - LOISIR       (cinéma, musée, parc, sport, divertissement)
           - ABONNEMENT   (services récurrents : Netflix, Spotify, SaaS, logiciel, téléphone)
           - TRANSPORT    (billets d’avion, train, bus, métro hors taxi)
           - AUTRE        (si aucune catégorie ne convient clairement)
        7. Extract **Line Items**: Identify individual products or services, their price, and VAT if available.
        8. Classify the document type: "invoice", "receipt", or "other".
        9. Provide a **confidence score** (0.0 to 1.0) based on how clear the data is.
        10. Provide a **category_confidence** score (0.0 to 1.0) indicating how sure you are about the category.
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object matching this structure:
        {{
            "merchant": "string",
            "date": "YYYY-MM-DD" or null,
            "amount_total": float,
            "currency": "string",
            "vat_amount": float or null,
            "category": "RESTAURANT | COURSES | TAXI | HOTEL | DOMICILE | ESSENCE | LOISIR | ABONNEMENT | TRANSPORT | AUTRE",
            "category_confidence": float,
            "items": [
                {{
                    "description": "string",
                    "amount": float,
                    "vat": float or null
                }}
            ],
            "document_type": "invoice" | "receipt" | "other",
            "confidence": float
        }}
        """

        try:
            # To switch to Gemini or another provider, you would replace this call 
            # with the respective SDK call (e.g., google.generativeai)
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Or "gpt-4o" for better results
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts data from receipts and returns JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            data = json.loads(content)
            
            return ReceiptData(**data)

        except Exception as e:
            print(f"LLM Parsing Error: {e}")
            # Fallback or re-raise
            raise e

llm_parser_service = LLMParserService()
