-- Add extracted_vat column to receipts table
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS extracted_vat numeric;

-- Update RLS policies if necessary (usually not needed for adding columns if policies are on table level)
