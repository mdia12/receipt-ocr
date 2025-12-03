from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReceiptItem(BaseModel):
    description: str
    amount: float
    vat: Optional[float] = 0.0

class ReceiptData(BaseModel):
    merchant: Optional[str] = "Unknown"
    date: Optional[str] = None
    amount: float = 0.0
    vat: float = 0.0
    category: str = "Uncategorized"
    items: List[ReceiptItem] = []
    currency: str = "EUR"

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
