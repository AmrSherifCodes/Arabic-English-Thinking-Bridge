-- Thinking Bridge v7.1.0 — Egypt-First Premium, Hard-Window Trials & Academy Entitlements
-- Enforces strict PostgreSQL RLS: direct table access is denied to anon/authenticated.
-- All voucher redemptions run atomically through SECURITY DEFINER RPCs called by the
-- same-origin Vercel API proxy (/api/entitlements/*) using the service_role key.

create extension if not exists pgcrypto;

-- 1. Voucher codes (single-use TB-MO-XXXX / TB-3M-XXXX / TB-LIFE-XXXX or multi-seat ALAQSA-FREE)
create table if not exists public.voucher_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(trim(code)) and char_length(code) between 4 and 32),
  tier text not null check (tier in ('free', 'pro', 'academy_student', 'academy_teacher')),
  cohort_code text check (cohort_code is null or (cohort_code = upper(trim(cohort_code)) and char_length(cohort_code) between 2 and 32)),
  label text,
  max_redemptions integer not null default 1 check (max_redemptions >= 1),
  redemption_count integer not null default 0 check (redemption_count >= 0 and redemption_count <= max_redemptions),
  valid_until timestamptz null,
  duration_days integer null check (duration_days is null or duration_days > 0),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_device_id text,
  created_at timestamptz not null default now()
);

-- Idempotent column upgrades for existing v7.0 databases
alter table public.voucher_codes
  add column if not exists max_redemptions integer not null default 1,
  add column if not exists redemption_count integer not null default 0,
  add column if not exists valid_until timestamptz null,
  add column if not exists duration_days integer null;

create index if not exists idx_voucher_codes_cohort
  on public.voucher_codes (cohort_code)
  where cohort_code is not null;

create index if not exists idx_voucher_codes_unredeemed
  on public.voucher_codes (code)
  where redemption_count < max_redemptions;

alter table public.voucher_codes enable row level security;
alter table public.voucher_codes force row level security;
revoke all on table public.voucher_codes from public, anon, authenticated;

-- 1b. Per-device voucher redemption log (supports multi-seat classroom codes & idempotent re-activation)
create table if not exists public.voucher_redemptions (
  voucher_code_id uuid not null references public.voucher_codes(id) on delete cascade,
  device_id text not null check (char_length(trim(device_id)) between 8 and 128),
  redeemed_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (voucher_code_id, device_id)
);

alter table public.voucher_redemptions enable row level security;
alter table public.voucher_redemptions force row level security;
revoke all on table public.voucher_redemptions from public, anon, authenticated;

-- 2. Device entitlements (offline-first local cache synced with server truth)
create table if not exists public.entitlements (
  device_id text primary key check (char_length(trim(device_id)) between 8 and 128),
  tier text not null default 'free' check (tier in ('free', 'pro', 'academy_student', 'academy_teacher')),
  cohort_code text check (cohort_code is null or (cohort_code = upper(trim(cohort_code)) and char_length(cohort_code) between 2 and 32)),
  label text,
  display_name text,
  voucher_code_id uuid references public.voucher_codes(id) on delete set null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz null,
  updated_at timestamptz not null default now()
);

alter table public.entitlements
  add column if not exists expires_at timestamptz null;

create index if not exists idx_entitlements_cohort
  on public.entitlements (cohort_code)
  where cohort_code is not null;

alter table public.entitlements enable row level security;
alter table public.entitlements force row level security;
revoke all on table public.entitlements from public, anon, authenticated;

-- 3. Opt-in Academy cohort progress (populated in Phase 3 for academy_student / read by academy_teacher)
create table if not exists public.cohort_progress (
  device_id text primary key references public.entitlements(device_id) on delete cascade,
  cohort_code text not null check (cohort_code = upper(trim(cohort_code)) and char_length(cohort_code) between 2 and 32),
  display_name text not null,
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  completed_lessons integer not null default 0 check (completed_lessons >= 0),
  top_l1_mistakes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_cohort_progress_cohort_weekly_xp
  on public.cohort_progress (cohort_code, weekly_xp desc);

alter table public.cohort_progress enable row level security;
alter table public.cohort_progress force row level security;
revoke all on table public.cohort_progress from public, anon, authenticated;

-- 4. Atomic voucher redemption RPC (supports single-use, multi-seat classroom trials, hard valid_until & duration_days)
create or replace function public.redeem_voucher_code(
  p_code text,
  p_device_id text,
  p_display_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_device_id text := trim(coalesce(p_device_id, ''));
  v_display_name text := nullif(left(trim(coalesce(p_display_name, '')), 64), '');
  v_voucher record;
  v_existing_redemption record;
  v_now timestamptz := now();
  v_hard_until timestamptz;
  v_duration_until timestamptz;
  v_effective_expires_at timestamptz;
begin
  if char_length(v_code) < 4 or char_length(v_code) > 32 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_FORMAT');
  end if;

  if char_length(v_device_id) < 8 or char_length(v_device_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  -- Row-level lock prevents race-condition double redemptions across concurrent requests
  select
    id,
    code,
    tier,
    cohort_code,
    label,
    max_redemptions,
    redemption_count,
    valid_until,
    duration_days,
    expires_at,
    redeemed_at,
    redeemed_by_device_id
  into v_voucher
  from public.voucher_codes
  where code = v_code
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'INVALID_OR_USED_CODE');
  end if;

  -- Hard calendar expiry check (valid_until or legacy expires_at): clearing browser cache cannot reset it
  if v_voucher.valid_until is not null and v_voucher.expires_at is not null then
    v_hard_until := least(v_voucher.valid_until, v_voucher.expires_at);
  else
    v_hard_until := coalesce(v_voucher.valid_until, v_voucher.expires_at);
  end if;

  if v_hard_until is not null and v_hard_until <= v_now then
    return jsonb_build_object('ok', false, 'error', 'INVALID_OR_USED_CODE');
  end if;

  -- Check if this device already redeemed this voucher (idempotent re-activation without consuming a new seat)
  select redeemed_at, expires_at
  into v_existing_redemption
  from public.voucher_redemptions
  where voucher_code_id = v_voucher.id
    and device_id = v_device_id;

  if found then
    v_effective_expires_at := v_existing_redemption.expires_at;
    if v_effective_expires_at is not null and v_effective_expires_at <= v_now then
      return jsonb_build_object('ok', false, 'error', 'INVALID_OR_USED_CODE');
    end if;
  elsif v_voucher.redeemed_by_device_id = v_device_id and v_voucher.redeemed_at is not null then
    -- Legacy v7.0 idempotent re-activation on the same device
    v_effective_expires_at := v_hard_until;
  else
    -- New redemption: enforce remaining seats atomically
    if v_voucher.redemption_count >= v_voucher.max_redemptions then
      return jsonb_build_object('ok', false, 'error', 'INVALID_OR_USED_CODE');
    end if;

    -- Compute entitlement expiry: duration_days (30 / 90) capped by hard valid_until; NULL = Lifetime
    if v_voucher.duration_days is not null then
      v_duration_until := v_now + make_interval(days => v_voucher.duration_days);
    else
      v_duration_until := null;
    end if;

    if v_duration_until is not null and v_hard_until is not null then
      v_effective_expires_at := least(v_duration_until, v_hard_until);
    else
      v_effective_expires_at := coalesce(v_duration_until, v_hard_until);
    end if;

    update public.voucher_codes
    set redemption_count = redemption_count + 1,
        redeemed_at = coalesce(redeemed_at, v_now),
        redeemed_by_device_id = coalesce(redeemed_by_device_id, v_device_id)
    where id = v_voucher.id;

    insert into public.voucher_redemptions (
      voucher_code_id,
      device_id,
      redeemed_at,
      expires_at
    )
    values (
      v_voucher.id,
      v_device_id,
      v_now,
      v_effective_expires_at
    )
    on conflict (voucher_code_id, device_id) do nothing;
  end if;

  insert into public.entitlements (
    device_id,
    tier,
    cohort_code,
    label,
    display_name,
    voucher_code_id,
    activated_at,
    expires_at,
    updated_at
  )
  values (
    v_device_id,
    v_voucher.tier,
    v_voucher.cohort_code,
    v_voucher.label,
    v_display_name,
    v_voucher.id,
    v_now,
    v_effective_expires_at,
    v_now
  )
  on conflict (device_id) do update
  set tier = excluded.tier,
      cohort_code = excluded.cohort_code,
      label = excluded.label,
      display_name = coalesce(excluded.display_name, public.entitlements.display_name),
      voucher_code_id = excluded.voucher_code_id,
      activated_at = v_now,
      expires_at = excluded.expires_at,
      updated_at = v_now;

  return jsonb_build_object(
    'ok', true,
    'tier', v_voucher.tier,
    'cohort_code', v_voucher.cohort_code,
    'label', v_voucher.label,
    'activated_at', v_now,
    'expires_at', v_effective_expires_at
  );
end;
$$;

revoke all on function public.redeem_voucher_code(text, text, text) from public, anon, authenticated;
grant execute on function public.redeem_voucher_code(text, text, text) to service_role;

-- 5. Device entitlement status lookup RPC (for silent online revalidation)
create or replace function public.get_device_entitlement(
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := trim(coalesce(p_device_id, ''));
  v_row record;
  v_now timestamptz := now();
begin
  if char_length(v_device_id) < 8 or char_length(v_device_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  select tier, cohort_code, label, activated_at, expires_at
  into v_row
  from public.entitlements
  where device_id = v_device_id;

  if not found or (v_row.expires_at is not null and v_row.expires_at <= v_now) then
    return jsonb_build_object(
      'ok', true,
      'tier', 'free',
      'cohort_code', null,
      'label', null,
      'activated_at', null,
      'expires_at', null
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'tier', v_row.tier,
    'cohort_code', v_row.cohort_code,
    'label', v_row.label,
    'activated_at', v_row.activated_at,
    'expires_at', v_row.expires_at
  );
end;
$$;

revoke all on function public.get_device_entitlement(text) from public, anon, authenticated;
grant execute on function public.get_device_entitlement(text) to service_role;

-- 6. Opt-in Academy student progress push RPC (Phase 3)
create or replace function public.upsert_cohort_progress(
  p_device_id text,
  p_display_name text,
  p_weekly_xp integer,
  p_total_xp integer default 0,
  p_streak_days integer default 0,
  p_completed_lessons integer default 0,
  p_top_l1_mistakes jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := trim(coalesce(p_device_id, ''));
  v_entitlement record;
  v_display_name text;
  v_mistakes jsonb;
  v_now timestamptz := now();
begin
  if char_length(v_device_id) < 8 or char_length(v_device_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  select tier, cohort_code, display_name, expires_at
  into v_entitlement
  from public.entitlements
  where device_id = v_device_id;

  if not found
     or v_entitlement.tier <> 'academy_student'
     or v_entitlement.cohort_code is null
     or (v_entitlement.expires_at is not null and v_entitlement.expires_at <= v_now) then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_TIER');
  end if;

  v_display_name := coalesce(
    nullif(left(trim(coalesce(p_display_name, '')), 64), ''),
    nullif(trim(coalesce(v_entitlement.display_name, '')), ''),
    'Student'
  );

  v_mistakes := case
    when p_top_l1_mistakes is not null and jsonb_typeof(p_top_l1_mistakes) = 'array' then p_top_l1_mistakes
    else '[]'::jsonb
  end;

  insert into public.cohort_progress (
    device_id,
    cohort_code,
    display_name,
    weekly_xp,
    total_xp,
    streak_days,
    completed_lessons,
    top_l1_mistakes,
    updated_at
  )
  values (
    v_device_id,
    v_entitlement.cohort_code,
    v_display_name,
    greatest(0, least(1000000, coalesce(p_weekly_xp, 0))),
    greatest(0, least(10000000, coalesce(p_total_xp, 0))),
    greatest(0, least(3650, coalesce(p_streak_days, 0))),
    greatest(0, least(10000, coalesce(p_completed_lessons, 0))),
    v_mistakes,
    v_now
  )
  on conflict (device_id) do update
  set cohort_code = excluded.cohort_code,
      display_name = excluded.display_name,
      weekly_xp = excluded.weekly_xp,
      total_xp = excluded.total_xp,
      streak_days = excluded.streak_days,
      completed_lessons = excluded.completed_lessons,
      top_l1_mistakes = excluded.top_l1_mistakes,
      updated_at = v_now;

  update public.entitlements
  set display_name = v_display_name,
      updated_at = v_now
  where device_id = v_device_id;

  return jsonb_build_object(
    'ok', true,
    'cohort_code', v_entitlement.cohort_code,
    'updated_at', v_now
  );
end;
$$;

revoke all on function public.upsert_cohort_progress(text, text, integer, integer, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.upsert_cohort_progress(text, text, integer, integer, integer, integer, jsonb) to service_role;

-- 7. Academy teacher cohort roster lookup RPC (Phase 3)
create or replace function public.get_cohort_roster(
  p_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text := trim(coalesce(p_device_id, ''));
  v_entitlement record;
  v_students jsonb;
  v_now timestamptz := now();
begin
  if char_length(v_device_id) < 8 or char_length(v_device_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  select tier, cohort_code, label, expires_at
  into v_entitlement
  from public.entitlements
  where device_id = v_device_id;

  if not found
     or v_entitlement.tier <> 'academy_teacher'
     or v_entitlement.cohort_code is null
     or (v_entitlement.expires_at is not null and v_entitlement.expires_at <= v_now) then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_TIER');
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'device_id', s.device_id,
        'display_name', s.display_name,
        'cohort_code', s.cohort_code,
        'weekly_xp', s.weekly_xp,
        'total_xp', s.total_xp,
        'streak_days', s.streak_days,
        'completed_lessons', s.completed_lessons,
        'top_l1_mistakes', s.top_l1_mistakes,
        'updated_at', s.updated_at
      )
      order by s.weekly_xp desc, s.updated_at desc
    ),
    '[]'::jsonb
  )
  into v_students
  from (
    select
      device_id,
      display_name,
      cohort_code,
      weekly_xp,
      total_xp,
      streak_days,
      completed_lessons,
      top_l1_mistakes,
      updated_at
    from public.cohort_progress
    where cohort_code = v_entitlement.cohort_code
    order by weekly_xp desc, updated_at desc
    limit 200
  ) s;

  return jsonb_build_object(
    'ok', true,
    'cohort_code', v_entitlement.cohort_code,
    'label', v_entitlement.label,
    'students', v_students,
    'fetched_at', v_now
  );
end;
$$;

revoke all on function public.get_cohort_roster(text) from public, anon, authenticated;
grant execute on function public.get_cohort_roster(text) to service_role;
