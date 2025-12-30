-- Create table for storing Google Drive OAuth tokens
create table if not exists public.google_drive_tokens (
  user_id uuid references auth.users(id) on delete cascade primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.google_drive_tokens enable row level security;

-- Policies
-- Users can only read their own tokens (if needed by frontend, though mostly backend uses this)
create policy "Users can view own google tokens"
  on public.google_drive_tokens for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (or users if we allow client-side flow, but we are doing server-side flow via Next.js API)
-- Since Next.js API uses service role or authenticated user context, we can allow users to insert their own.
create policy "Users can insert own google tokens"
  on public.google_drive_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update own google tokens"
  on public.google_drive_tokens for update
  using (auth.uid() = user_id);
