-- Secure Storage Buckets
-- Make receipts_raw private (only accessible via signed URLs or Service Role)
update storage.buckets
set public = false
where id = 'receipts_raw';

-- Ensure the bucket exists if it doesn't (idempotent)
insert into storage.buckets (id, name, public)
values ('receipts_raw', 'receipts_raw', false)
on conflict (id) do update
set public = false;

-- Policies for receipts_raw
-- Allow Service Role (full access by default, but explicit doesn't hurt)
-- Note: Service Role bypasses RLS, so we don't strictly need policies for it.

-- Allow users to upload their own files? 
-- No, we are uploading via the API (Service Role), so users don't need direct insert access.
-- This is more secure.

-- Allow users to read their own files?
-- We are using signed URLs, so we don't need public read access.
-- Signed URLs work even if the bucket is private and no RLS policy allows select.

-- Remove public access policies if they exist
drop policy if exists "Public Access Raw" on storage.objects;
drop policy if exists "Allow Uploads Raw" on storage.objects;

-- Optional: Allow authenticated users to read their own files (if not using signed URLs)
-- create policy "Users can read own files" on storage.objects
-- for select
-- using ( bucket_id = 'receipts_raw' and auth.uid()::text = (storage.foldername(name))[1] );
