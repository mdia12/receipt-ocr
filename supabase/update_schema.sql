alter table public.jobs_processing add column if not exists file_url text;
alter table public.jobs_processing add column if not exists excel_url text;
alter table public.jobs_processing add column if not exists pdf_url text;
alter table public.jobs_processing add column if not exists error text;

-- Force schema cache reload (sometimes needed)
NOTIFY pgrst, 'reload config';
