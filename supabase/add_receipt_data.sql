alter table public.jobs_processing add column if not exists receipt_data jsonb;
NOTIFY pgrst, 'reload config';
