-- Add Drive status fields to receipts
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS drive_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS drive_error text;

-- Create index for retry job
CREATE INDEX IF NOT EXISTS idx_receipts_drive_status ON public.receipts(drive_status);
