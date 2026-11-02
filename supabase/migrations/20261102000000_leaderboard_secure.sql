create table if not exists public.contributors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique
    check (char_length(display_name) between 3 and 20 and display_name ~ '^[[:alnum:]_ -]+$'),
  points int not null default 0 check (points >= 0),
  leave_token uuid not null default gen_random_uuid(),
  hidden boolean not null default false,
  consented_at timestamptz not null default now()
);
alter table public.contributors enable row level security;  -- no policies = no direct access

create or replace view public.leaderboard as
  select display_name, points from public.contributors
  where not hidden order by points desc, consented_at limit 100;
grant select on public.leaderboard to anon, authenticated;

create or replace function public.join_leaderboard(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  insert into contributors(display_name) values (trim(p_name)) returning leave_token into t;
  return t;
end $$;

create or replace function public.leave_leaderboard(t uuid) returns void
language sql security definer set search_path = public as $$
  delete from contributors where leave_token = t $$;

grant execute on function public.join_leaderboard(text), public.leave_leaderboard(uuid) to anon, authenticated;