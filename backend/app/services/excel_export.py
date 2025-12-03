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
            "Amount": [receipt.amount_total],
            "VAT": [receipt.vat_amount],
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
            
            # Add Items Sheet if items exist
            if receipt.items:
                items_data = []
                for item in receipt.items:
                    items_data.append({
                        "Description": item.description,
                        "Amount": item.amount,
                        "VAT": item.vat
                    })
                
                df_items = pd.DataFrame(items_data)
                df_items.to_excel(writer, index=False, sheet_name='Line Items')
                
                # Adjust widths for items sheet
                worksheet_items = writer.sheets['Line Items']
                for column_cells in worksheet_items.columns:
                    length = max(len(str(cell.value)) for cell in column_cells)
                    worksheet_items.column_dimensions[column_cells[0].column_letter].width = length + 2
                
        return output.getvalue()

excel_export_service = ExcelExportService()
