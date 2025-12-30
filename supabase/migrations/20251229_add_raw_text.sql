-- Add raw_text column to receipts table for OCR results
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS raw_text TEXT;
