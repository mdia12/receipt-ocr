from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum

class ExpenseCategory(str, Enum):
    RESTAURANT = "RESTAURANT"
    COURSES = "COURSES"
    TAXI = "TAXI"
    HOTEL = "HOTEL"
    DOMICILE = "DOMICILE"
    ESSENCE = "ESSENCE"
    LOISIR = "LOISIR"
    ABONNEMENT = "ABONNEMENT"
    TRANSPORT = "TRANSPORT"
    AUTRE = "AUTRE"

class ReceiptItem(BaseModel):
    description: str
    amount: float
    vat: Optional[float] = 0.0

class ReceiptData(BaseModel):
    merchant: str = Field(..., description="The name of the merchant or business.")
    date: Optional[str] = Field(None, description="The date of the transaction in ISO format YYYY-MM-DD.")
    amount_total: float = Field(..., description="The total amount paid.")
    currency: str = Field("EUR", description="The currency of the transaction (e.g., EUR, USD, GBP).")
    vat_amount: Optional[float] = Field(None, description="The total VAT amount if present.")
    category: ExpenseCategory = Field(ExpenseCategory.AUTRE, description="Expense category.")
    category_confidence: float = Field(0.0, description="Confidence score for the category.")
    items: List[ReceiptItem] = []
    document_type: Literal["invoice", "receipt", "other"] = Field("receipt", description="The type of document.")
    confidence: float = Field(0.0, description="A confidence score between 0.0 and 1.0.")

class JobStatus(BaseModel):
    job_id: str
    status: str  # pending, processing, ready, error
    excel_url: Optional[str] = None
    pdf_url: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None

class ReceiptDB(ReceiptData):
    receipt_id: str
    user_id: Optional[str] = None
    raw_text: Optional[str] = None
    created_at: Optional[datetime] = None
