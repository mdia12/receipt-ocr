import re
from typing import Optional

def parse_amount(value: Optional[str | float | int]) -> Optional[float]:
    """
    Parses a value into a float.
    Handles strings with currency symbols, spaces, and various decimal separators.
    "12,34" -> 12.34
    "1 234,56 €" -> 1234.56
    Returns None if parsing fails or if value is 0/None.
    """
    if value is None:
        return None
        
    if isinstance(value, (float, int)):
        return float(value) if value > 0 else None

    if isinstance(value, str):
        # 1. Remove spaces and currency symbols (keep digits, dots, commas, minus)
        # We also remove letters just in case
        clean = value.replace(" ", "").replace("€", "").replace("EUR", "").replace("$", "")
        clean = re.sub(r"[^\d.,-]", "", clean)

        if not clean:
            return None

        # 2. Handle comma vs dot
        # If we have both, assume the last one is the decimal separator
        # e.g. 1.234,56 -> comma is decimal
        # e.g. 1,234.56 -> dot is decimal
        
        last_comma_index = clean.rfind(',')
        last_dot_index = clean.rfind('.')

        if last_comma_index > -1 and last_dot_index > -1:
            if last_comma_index > last_dot_index:
                # Comma is decimal (1.234,56)
                # Remove dots, replace comma with dot
                clean = clean.replace('.', '').replace(',', '.')
            else:
                # Dot is decimal (1,234.56)
                # Remove commas
                clean = clean.replace(',', '')
        elif last_comma_index > -1:
            # Only comma -> replace with dot
            clean = clean.replace(',', '.')
        # If only dot, it's already fine

        try:
            val = float(clean)
            return val if val > 0 else None
        except ValueError:
            return None
            
    return None

def extract_amount_from_text(text: str) -> Optional[float]:
    """
    Fallback regex extraction for amount from OCR text.
    Prioritizes lines with 'Total', 'Montant', etc.
    """
    # Normalize text: replace commas with dots for float parsing
    normalized_text = text.replace(',', '.')
    
    # Regex to find amounts like 12.50, 1,200.00
    # We look for lines containing "Total" or "Montant" first
    # Case insensitive
    total_patterns = [
        r'(?i)(total|montant|somme|payé|net à payer|ttc).{0,20}(\d+\.\d{2})',
        r'(?i)(total|montant|somme|payé|net à payer|ttc).{0,20}(\d+)'
    ]
    
    for pattern in total_patterns:
        matches = re.findall(pattern, normalized_text)
        if matches:
            # Return the last one found (often the grand total)
            try:
                val = float(matches[-1][-1])
                if val > 0:
                    return val
            except:
                pass
    
    # Fallback: Find all currency-like numbers and take the max
    # This is risky but better than 0 for a fallback if we are desperate
    amounts = re.findall(r'(\d+\.\d{2})', normalized_text)
    valid_amounts = []
    for amt in amounts:
        try:
            val = float(amt)
            if 0 < val < 10000: # Sanity check
                valid_amounts.append(val)
        except:
            continue
    
    if valid_amounts:
        return max(valid_amounts)
        
    return None
