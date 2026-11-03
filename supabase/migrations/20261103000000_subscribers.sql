-- Subscribers table for email subscription & Easter Egg unlock
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Insert-only policy for anonymous & authenticated users
create policy "Allow insert for subscribers"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- No public select/update/delete policy to ensure privacy
