-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: public.receipts
create table if not exists public.receipts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null,
    file_path text not null,
    status text default 'pending', -- pending, processing, success, failed
    merchant text,
    amount_total numeric,
    currency text,
    date text,
    category text,
    raw_json jsonb,
    excel_url text,
    pdf_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Table: public.jobs_processing
create table if not exists public.jobs_processing (
    id uuid primary key default uuid_generate_v4(),
    receipt_id uuid references public.receipts(id) on delete cascade,
    status text default 'queued', -- queued, processing, completed, failed
    attempts int default 0,
    last_error text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- RLS for receipts
alter table public.receipts enable row level security;

create policy "Users can view their own receipts"
    on public.receipts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own receipts"
    on public.receipts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own receipts"
    on public.receipts for update
    using (auth.uid() = user_id);

-- RLS for jobs_processing
alter table public.jobs_processing enable row level security;

-- Only service role should really touch this, but if frontend inserts:
create policy "Users can insert jobs for their receipts"
    on public.jobs_processing for insert
    with check (
        exists (
            select 1 from public.receipts
            where id = receipt_id
            and user_id = auth.uid()
        )
    );

create policy "Users can view status of their jobs"
    on public.jobs_processing for select
    using (
        exists (
            select 1 from public.receipts
            where id = receipt_id
            and user_id = auth.uid()
        )
    );
