-- Thinking Bridge v10.0.0 — Opt-In Global Top 50 Leaderboard
-- Strict anti-cheat & RLS: zero direct client writes to xp.
-- All reads/writes go through same-origin /api/leaderboard using service_role RPCs.

create table if not exists public.leaderboard (
  user_id text primary key check (char_length(trim(user_id)) between 8 and 128),
  display_name text not null check (char_length(trim(display_name)) between 2 and 32),
  country text not null default 'EG' check (country ~ '^[A-Z]{2}$'),
  xp integer not null default 0 check (xp >= 0 and xp <= 5000000),
  daily_xp integer not null default 0 check (daily_xp >= 0 and daily_xp <= 2000),
  daily_xp_date date not null default current_date,
  streak integer not null default 0 check (streak >= 0 and streak <= 3650),
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Covering partial index for fast Top 50 public reads
create index if not exists idx_leaderboard_xp_desc
  on public.leaderboard (xp desc, updated_at desc)
  where hidden = false;

-- Strict Row Level Security: zero open read/write policies for anon or authenticated
alter table public.leaderboard enable row level security;
alter table public.leaderboard force row level security;
revoke all on table public.leaderboard from public, anon, authenticated;

-- Anti-Cheat RPC: enforces per-call delta cap (+150 XP) and daily cap (1500 XP/day)
create or replace function public.submit_leaderboard_xp(
  p_user_id text,
  p_display_name text,
  p_country text default 'EG',
  p_xp_delta integer default 0,
  p_streak integer default 0,
  p_hidden boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text := trim(coalesce(p_user_id, ''));
  v_name text := left(trim(regexp_replace(coalesce(p_display_name, ''), '[<>''"`\\]', '', 'g')), 32);
  v_country text := upper(left(trim(coalesce(p_country, 'EG')), 2));
  v_delta integer := greatest(0, least(150, coalesce(p_xp_delta, 0)));
  v_streak integer := greatest(0, least(3650, coalesce(p_streak, 0)));
  v_today date := current_date;
  v_daily_cap constant integer := 1500;
  v_existing record;
  v_next_daily integer;
  v_applied_delta integer;
  v_next_xp integer;
begin
  if char_length(v_user_id) < 8 or char_length(v_user_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_USER_ID');
  end if;

  if char_length(v_name) < 2 then
    v_name := 'Learner';
  end if;

  if v_country !~ '^[A-Z]{2}$' then
    v_country := 'EG';
  end if;

  select xp, daily_xp, daily_xp_date
  into v_existing
  from public.leaderboard
  where user_id = v_user_id
  for update;

  if not found then
    v_applied_delta := least(v_delta, v_daily_cap);
    v_next_daily := v_applied_delta;
    v_next_xp := v_applied_delta;
    insert into public.leaderboard (
      user_id, display_name, country, xp, daily_xp, daily_xp_date, streak, hidden, updated_at
    )
    values (
      v_user_id, v_name, v_country, v_next_xp, v_next_daily, v_today, v_streak, coalesce(p_hidden, false), now()
    );
  else
    if v_existing.daily_xp_date = v_today then
      v_applied_delta := greatest(0, least(v_delta, v_daily_cap - v_existing.daily_xp));
      v_next_daily := v_existing.daily_xp + v_applied_delta;
    else
      v_applied_delta := least(v_delta, v_daily_cap);
      v_next_daily := v_applied_delta;
    end if;

    v_next_xp := v_existing.xp + v_applied_delta;

    update public.leaderboard
    set display_name = v_name,
        country = v_country,
        xp = v_next_xp,
        daily_xp = v_next_daily,
        daily_xp_date = v_today,
        streak = v_streak,
        hidden = coalesce(p_hidden, false),
        updated_at = now()
    where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'xp', v_next_xp,
    'applied_delta', v_applied_delta,
    'daily_xp', v_next_daily,
    'daily_cap', v_daily_cap
  );
end;
$$;

revoke all on function public.submit_leaderboard_xp(text, text, text, integer, integer, boolean) from public, anon, authenticated;
grant execute on function public.submit_leaderboard_xp(text, text, text, integer, integer, boolean) to service_role;

-- Public Read RPC: returns Top 50 non-hidden learners
create or replace function public.get_top_leaderboard(p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(50, coalesce(p_limit, 50)));
  v_rows jsonb;
begin
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'display_name', t.display_name,
        'country', t.country,
        'xp', t.xp,
        'streak', t.streak,
        'updated_at', t.updated_at
      )
      order by t.xp desc, t.updated_at desc
    ),
    '[]'::jsonb
  )
  into v_rows
  from (
    select display_name, country, xp, streak, updated_at
    from public.leaderboard
    where hidden = false
    order by xp desc, updated_at desc
    limit v_limit
  ) t;

  return jsonb_build_object('ok', true, 'entries', v_rows);
end;
$$;

revoke all on function public.get_top_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.get_top_leaderboard(integer) to service_role;
