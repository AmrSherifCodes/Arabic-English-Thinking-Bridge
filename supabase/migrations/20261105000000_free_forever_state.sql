-- Free Forever Single-Row User State Architecture & Size Cap

-- 1. Single Compact User State Table (Replaces per-card and per-lesson tables)
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Users can read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.user_state for update
  using (auth.uid() = user_id);

-- 2. Enforce 64 KB (65,536 bytes) Size Cap on user_state to guarantee database staying under free tier forever
create or replace function public.check_user_state_size()
returns trigger as $$
begin
  if octet_length(new.state::text) > 65536 then
    raise exception 'User state size exceeds maximum free tier limit of 64 KB (65,536 bytes)';
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger enforce_user_state_size
  before insert or update on public.user_state
  for each row execute function public.check_user_state_size();

-- 3. Persistent AI Quotas Table (Per-User & Per-IP Daily Limits)
create table if not exists public.ai_quotas (
  id text primary key, -- user_id, ip_address, or 'global_cap'
  request_count integer not null default 0,
  window_date date not null default current_date,
  updated_at timestamptz not null default now()
);

alter table public.ai_quotas enable row level security;

-- 4. Clean up legacy per-card tables to free database space
drop table if exists public.srs_items cascade;
drop table if exists public.course_progress cascade;
drop table if exists public.skill_levels cascade;
