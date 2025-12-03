from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
from app.models.receipt import ReceiptData

class PDFExportService:
    def generate_pdf(self, receipt: ReceiptData) -> bytes:
        """
        Generates a PDF summary from ReceiptData and returns the bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph("Receipt OCR – Parsed Data", styles['Title']))
        elements.append(Spacer(1, 20))

        # Summary Info
        info_data = [
            ["Merchant:", receipt.merchant],
            ["Date:", receipt.date or "N/A"],
            ["Category:", receipt.category],
            ["Total Amount:", f"{receipt.amount:.2f} {receipt.currency}"],
            ["VAT:", f"{receipt.vat:.2f} {receipt.currency}"]
        ]
        
        t_info = Table(info_data, colWidths=[100, 300])
        t_info.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_info)
        elements.append(Spacer(1, 20))

        # Items Table
        if receipt.items:
            elements.append(Paragraph("Line Items", styles['Heading2']))
            elements.append(Spacer(1, 10))
            
            items_data = [["Description", "Amount", "VAT"]]
            for item in receipt.items:
                items_data.append([
                    item.description, 
                    f"{item.amount:.2f}", 
                    f"{item.vat:.2f}" if item.vat else "0.00"
                ])
            
            t_items = Table(items_data, colWidths=[300, 80, 80])
            t_items.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(t_items)

        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("Generated automatically by Receipt OCR SaaS", styles['Italic']))

        doc.build(elements)
        return buffer.getvalue()

pdf_export_service = PDFExportService()
