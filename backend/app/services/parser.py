import re
from typing import Dict, Any, List
from app.models.receipt import ReceiptData, ReceiptItem

class ParserService:
    def parse_receipt(self, text: str) -> ReceiptData:
        """
        Parses raw OCR text into structured ReceiptData.
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        merchant = self._extract_merchant(lines)
        date = self._extract_date(text)
        amount = self._extract_total_amount(text)
        vat = self._extract_vat(text)
        category = self._categorize_expense(text, merchant)
        
        # Basic item extraction (simplified)
        # In a real app, this would be much more complex or use an LLM
        items = []
        if amount > 0:
            items.append(ReceiptItem(description="Total Expense", amount=amount, vat=vat))

        return ReceiptData(
            merchant=merchant,
            date=date,
            amount=amount,
            vat=vat,
            category=category,
            items=items
        )

    def _extract_merchant(self, lines: List[str]) -> str:
        # Heuristic: The first non-empty line that looks like a name is often the merchant
        # We skip lines that look like dates, numbers, or generic headers
        skip_keywords = ["facture", "invoice", "receipt", "ticket", "cb", "visa", "mastercard", "total", "montant", "siret", "tva", "merci", "thank you", "welcome", "bienvenue"]
        
        for line in lines[:10]: # Check first 10 lines
            clean_line = line.strip()
            lower_line = clean_line.lower()
            
            # Skip empty or very short lines
            if len(clean_line) < 3:
                continue
                
            # Skip lines that look like phone numbers, dates, or prices (mostly digits/symbols)
            if re.match(r'^[\d\s\.\-\/\+\:\,€$]+$', clean_line):
                continue
                
            # Skip lines that are just generic headers
            if lower_line in skip_keywords:
                continue
                
            # Skip lines starting with common metadata labels
            if any(lower_line.startswith(k) for k in ["date", "total", "tel", "fax", "http", "www", "siret", "tva"]):
                continue

            # If we passed all checks, this is likely the merchant name
            return clean_line
            
        return "Unknown Merchant"

    def _extract_date(self, text: str) -> str:
        # Regex for dd/mm/yyyy, yyyy-mm-dd, dd-mm-yyyy
        date_patterns = [
            r'(\d{2}[/-]\d{2}[/-]\d{4})',
            r'(\d{4}[/-]\d{2}[/-]\d{2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        return None

    def _extract_total_amount(self, text: str) -> float:
        # Look for "Total" followed by numbers
        # Or just look for the largest number with a currency symbol
        
        # Normalize text: replace commas with dots for float parsing
        normalized_text = text.replace(',', '.')
        
        # Regex to find amounts like 12.50, 1,200.00
        # We look for lines containing "Total" or "Montant" first
        total_lines = re.findall(r'(?i)(total|montant|somme|payé).{0,20}(\d+\.\d{2})', normalized_text)
        if total_lines:
            # Return the last one found (often the grand total)
            try:
                return float(total_lines[-1][1])
            except:
                pass
        
        # Fallback: Find all currency-like numbers and take the max
        amounts = re.findall(r'(\d+\.\d{2})', normalized_text)
        valid_amounts = []
        for amt in amounts:
            try:
                val = float(amt)
                if val < 10000: # Sanity check
                    valid_amounts.append(val)
            except:
                continue
        
        if valid_amounts:
            return max(valid_amounts)
            
        return 0.0

    def _extract_vat(self, text: str) -> float:
        # Regex for TVA, VAT
        normalized_text = text.replace(',', '.')
        vat_matches = re.findall(r'(?i)(tva|vat|tax).{0,10}(\d+\.\d{2})', normalized_text)
        
        if vat_matches:
            # Sum up all found VATs or take the largest? 
            # Usually there are multiple rates, let's take the largest found value that is smaller than total
            try:
                vats = [float(m[1]) for m in vat_matches]
                return max(vats)
            except:
                pass
        return 0.0

    def _categorize_expense(self, text: str, merchant: str) -> str:
        text_lower = text.lower()
        merchant_lower = merchant.lower()
        
        if any(x in text_lower or x in merchant_lower for x in ['restaurant', 'food', 'burger', 'pizza', 'cafe', 'coffee', 'starbucks', 'mcdo']):
            return "Restaurant"
        if any(x in text_lower or x in merchant_lower for x in ['uber', 'taxi', 'train', 'sncf', 'transport', 'flight', 'parking']):
            return "Transport"
        if any(x in text_lower or x in merchant_lower for x in ['hotel', 'airbnb', 'logement']):
            return "Logement"
        if any(x in text_lower or x in merchant_lower for x in ['essence', 'fuel', 'total', 'shell', 'bp']):
            return "Carburant"
            
        return "Autre"

parser_service = ParserService()
