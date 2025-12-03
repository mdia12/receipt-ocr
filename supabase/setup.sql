-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values ('receipts_raw', 'receipts_raw', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts_pdf', 'receipts_pdf', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts_excel', 'receipts_excel', true)
on conflict (id) do nothing;

-- 2. Create Policies (RLS)
-- Allow public read access to all buckets
create policy "Public Access Raw" on storage.objects for select
using ( bucket_id = 'receipts_raw' );

create policy "Public Access PDF" on storage.objects for select
using ( bucket_id = 'receipts_pdf' );

create policy "Public Access Excel" on storage.objects for select
using ( bucket_id = 'receipts_excel' );

-- Allow uploads (optional if using Service Role, but good for testing)
create policy "Allow Uploads Raw" on storage.objects for insert
with check ( bucket_id = 'receipts_raw' );

-- 3. Create Jobs Table (if not exists)
create table if not exists public.jobs_processing (
    job_id uuid primary key,
    user_id uuid references auth.users(id),
    status text not null default 'pending',
    file_url text,
    excel_url text,
    pdf_url text,
    error text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on jobs table
alter table public.jobs_processing enable row level security;

-- Allow public read/write for now (MVP mode) - Secure this later!
create policy "Enable read access for all users" on public.jobs_processing for select using (true);
create policy "Enable insert access for all users" on public.jobs_processing for insert with check (true);
create policy "Enable update access for all users" on public.jobs_processing for update using (true);
