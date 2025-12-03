import pandas as pd
from app.models.receipt import ReceiptData
import io
import os

class ExcelExportService:
    def generate_excel(self, receipt: ReceiptData) -> bytes:
        """
        Generates an Excel file from ReceiptData and returns the bytes.
        """
        # Prepare data for DataFrame
        data = {
            "Date": [receipt.date],
            "Merchant": [receipt.merchant],
            "Amount": [receipt.amount],
            "VAT": [receipt.vat],
            "Category": [receipt.category],
            "Currency": [receipt.currency]
        }
        
        df = pd.DataFrame(data)
        
        # Create Excel in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Receipt Data')
            
            # Auto-adjust column widths (basic)
            worksheet = writer.sheets['Receipt Data']
            for column_cells in worksheet.columns:
                length = max(len(str(cell.value)) for cell in column_cells)
                worksheet.column_dimensions[column_cells[0].column_letter].width = length + 2
                
        return output.getvalue()

excel_export_service = ExcelExportService()
