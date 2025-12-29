-- Add root_folder_id to google_drive_tokens
ALTER TABLE public.google_drive_tokens 
ADD COLUMN IF NOT EXISTS root_folder_id text;

-- Add Drive fields to receipts
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS drive_file_id text,
ADD COLUMN IF NOT EXISTS drive_web_view_link text,
ADD COLUMN IF NOT EXISTS uploaded_to_drive_at timestamp with time zone;
