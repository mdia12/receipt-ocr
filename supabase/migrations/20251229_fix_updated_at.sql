-- FIX: Add missing updated_at column and fix trigger
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure updated_at column exists on receipts
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Ensure updated_at column exists on jobs_processing
ALTER TABLE public.jobs_processing 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Create standard update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Re-create triggers to ensure they are correct
DROP TRIGGER IF EXISTS on_receipts_updated ON public.receipts;
CREATE TRIGGER on_receipts_updated
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_jobs_processing_updated ON public.jobs_processing;
CREATE TRIGGER on_jobs_processing_updated
  BEFORE UPDATE ON public.jobs_processing
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
