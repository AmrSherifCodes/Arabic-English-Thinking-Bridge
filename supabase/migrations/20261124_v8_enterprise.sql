-- Thinking Bridge v8.0.0 Enterprise — Part A
-- Multi-organization Founder Console, Lost-Phone Cloud Recovery, & Verifiable Certificates.
-- Enforces strict PostgreSQL RLS: direct table access is denied to public/anon/authenticated.
-- All admin, backup, and certificate operations run atomically through SECURITY DEFINER RPCs
-- called exclusively by same-origin Vercel API routes (/api/*) using service_role.

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Organizations (multi-tenant academies & universities)
-- ============================================================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(trim(slug)) and slug ~ '^[a-z0-9][a-z0-9-]{1,47}$'),
  name text not null check (char_length(trim(name)) between 2 and 120),
  max_seats integer not null default 100 check (max_seats >= 1 and max_seats <= 100000),
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
revoke all on table public.organizations from public, anon, authenticated;

-- Idempotent seed for flagship partner organizations
insert into public.organizations (slug, name, max_seats)
values
  ('al-aqsa', 'Al-Aqsa Academy', 500),
  ('alexandria-uni', 'Alexandria University', 1000)
on conflict (slug) do nothing;

-- Extend v7 voucher_codes idempotently with org_slug & revoked_at
alter table public.voucher_codes
  add column if not exists org_slug text references public.organizations(slug) on delete set null,
  add column if not exists revoked_at timestamptz null;

create index if not exists idx_voucher_codes_org_slug
  on public.voucher_codes (org_slug)
  where org_slug is not null;

-- ============================================================================
-- 2. Lost-Phone Cloud Backups (Pro/Academy entitlement + coins + progress)
-- ============================================================================
create table if not exists public.cloud_backups (
  id uuid primary key default gen_random_uuid(),
  recovery_code text not null unique check (
    recovery_code = upper(trim(recovery_code))
    and recovery_code ~ '^[A-Z0-9]{6,16}$'
  ),
  pin_hash text not null check (char_length(pin_hash) between 32 and 512),
  device_id text not null check (char_length(trim(device_id)) between 8 and 128),
  payload_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_cloud_backups_device_id
  on public.cloud_backups (device_id);

alter table public.cloud_backups enable row level security;
alter table public.cloud_backups force row level security;
revoke all on table public.cloud_backups from public, anon, authenticated;

-- ============================================================================
-- 3. Verifiable Certificates (TB-CERT-XXXX)
-- ============================================================================
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  cert_code text not null unique check (
    cert_code = upper(trim(cert_code))
    and cert_code ~ '^TB-CERT-[A-Z0-9]{4,20}$'
  ),
  student_name text not null check (char_length(trim(student_name)) between 2 and 120),
  track_title text not null check (char_length(trim(track_title)) between 2 and 160),
  org_slug text null references public.organizations(slug) on delete set null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz null
);

create index if not exists idx_certificates_org_slug
  on public.certificates (org_slug)
  where org_slug is not null;

alter table public.certificates enable row level security;
alter table public.certificates force row level security;
revoke all on table public.certificates from public, anon, authenticated;

-- ============================================================================
-- 4. Atomic Admin RPC: Bulk Voucher Generator (up to 50 codes in 1 call)
-- ============================================================================
create or replace function public.admin_generate_vouchers(
  p_plan text,
  p_count integer default 1,
  p_org_slug text default null,
  p_cohort_code text default null,
  p_label text default null,
  p_valid_until timestamptz default null,
  p_max_redemptions integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text := lower(trim(coalesce(p_plan, '')));
  v_count integer := greatest(1, least(50, coalesce(p_count, 1)));
  v_max_redemptions integer := greatest(1, least(1000, coalesce(p_max_redemptions, 1)));
  v_org_slug text := nullif(lower(trim(coalesce(p_org_slug, ''))), '');
  v_cohort_code text := nullif(upper(trim(coalesce(p_cohort_code, ''))), '');
  v_tier text;
  v_prefix text;
  v_duration_days integer;
  v_valid_until timestamptz := p_valid_until;
  v_label text;
  v_code text;
  v_codes jsonb := '[]'::jsonb;
  v_i integer;
  v_attempts integer;
begin
  if v_org_slug is not null then
    if not exists (select 1 from public.organizations where slug = v_org_slug) then
      return jsonb_build_object('ok', false, 'error', 'UNKNOWN_ORGANIZATION');
    end if;
  end if;

  if v_plan = 'monthly' then
    v_tier := 'pro';
    v_prefix := 'TB-MO-';
    v_duration_days := 30;
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Pro Monthly (50 EGP)');
  elsif v_plan in ('3month', 'quarterly') then
    v_tier := 'pro';
    v_prefix := 'TB-3M-';
    v_duration_days := 90;
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Pro 3-Month (120 EGP)');
  elsif v_plan = 'lifetime' then
    v_tier := 'pro';
    v_prefix := 'TB-LIFE-';
    v_duration_days := null;
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Pro Lifetime (299 EGP)');
  elsif v_plan = 'trial' then
    v_tier := 'pro';
    v_prefix := 'TB-TRIAL-';
    v_duration_days := null;
    v_valid_until := coalesce(p_valid_until, now() + interval '7 days');
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Pro Trial');
  elsif v_plan = 'academy_student' then
    v_tier := 'academy_student';
    v_prefix := 'TB-STD-';
    v_duration_days := case when v_valid_until is null then 180 else null end;
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Academy Student');
  elsif v_plan = 'academy_teacher' then
    v_tier := 'academy_teacher';
    v_prefix := 'TB-TCH-';
    v_duration_days := case when v_valid_until is null then 365 else null end;
    v_label := coalesce(nullif(trim(coalesce(p_label, '')), ''), 'Academy Teacher');
  else
    return jsonb_build_object('ok', false, 'error', 'INVALID_PLAN');
  end if;

  for v_i in 1..v_count loop
    v_attempts := 0;
    loop
      v_attempts := v_attempts + 1;
      v_code := v_prefix || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      begin
        insert into public.voucher_codes (
          code,
          tier,
          cohort_code,
          org_slug,
          label,
          max_redemptions,
          valid_until,
          duration_days
        )
        values (
          v_code,
          v_tier,
          v_cohort_code,
          v_org_slug,
          v_label,
          v_max_redemptions,
          v_valid_until,
          v_duration_days
        );
        exit;
      exception when unique_violation then
        if v_attempts >= 10 then
          raise;
        end if;
      end;
    end loop;

    v_codes := v_codes || jsonb_build_array(
      jsonb_build_object(
        'code', v_code,
        'tier', v_tier,
        'org_slug', v_org_slug,
        'cohort_code', v_cohort_code,
        'label', v_label,
        'max_redemptions', v_max_redemptions,
        'valid_until', v_valid_until,
        'duration_days', v_duration_days
      )
    );
  end loop;

  return jsonb_build_object('ok', true, 'count', v_count, 'codes', v_codes);
end;
$$;

revoke all on function public.admin_generate_vouchers(text, integer, text, text, text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.admin_generate_vouchers(text, integer, text, text, text, timestamptz, integer) to service_role;

-- ============================================================================
-- 5. Atomic Admin RPC: Revoke Leaked Voucher & Expire Linked Entitlements
-- ============================================================================
create or replace function public.admin_revoke_voucher(
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_voucher_id uuid;
  v_now timestamptz := now();
begin
  if char_length(v_code) < 4 or char_length(v_code) > 32 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_FORMAT');
  end if;

  update public.voucher_codes
  set revoked_at = coalesce(revoked_at, v_now),
      valid_until = least(coalesce(valid_until, v_now), v_now)
  where code = v_code
  returning id into v_voucher_id;

  if v_voucher_id is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  update public.entitlements
  set expires_at = least(coalesce(expires_at, v_now), v_now),
      updated_at = v_now
  where voucher_code_id = v_voucher_id;

  return jsonb_build_object(
    'ok', true,
    'code', v_code,
    'revoked_at', v_now
  );
end;
$$;

revoke all on function public.admin_revoke_voucher(text) from public, anon, authenticated;
grant execute on function public.admin_revoke_voucher(text) to service_role;

-- ============================================================================
-- 6. Atomic Admin RPC: List Organizations, Vouchers, Active Seats & Cohort Progress
-- ============================================================================
create or replace function public.admin_list_seats(
  p_org_slug text default null,
  p_limit integer default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_slug text := nullif(lower(trim(coalesce(p_org_slug, ''))), '');
  v_limit integer := greatest(1, least(500, coalesce(p_limit, 200)));
  v_orgs jsonb;
  v_vouchers jsonb;
  v_seats jsonb;
  v_cohort jsonb;
  v_now timestamptz := now();
begin
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'slug', o.slug,
        'name', o.name,
        'max_seats', o.max_seats,
        'created_at', o.created_at
      )
      order by o.created_at asc
    ),
    '[]'::jsonb
  )
  into v_orgs
  from public.organizations o;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'code', v.code,
        'tier', v.tier,
        'org_slug', v.org_slug,
        'cohort_code', v.cohort_code,
        'label', v.label,
        'max_redemptions', v.max_redemptions,
        'redemption_count', v.redemption_count,
        'valid_until', v.valid_until,
        'duration_days', v.duration_days,
        'revoked_at', v.revoked_at,
        'created_at', v.created_at
      )
      order by v.created_at desc
    ),
    '[]'::jsonb
  )
  into v_vouchers
  from (
    select *
    from public.voucher_codes
    where v_org_slug is null or org_slug = v_org_slug
    order by created_at desc
    limit v_limit
  ) v;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'device_id', e.device_id,
        'tier', e.tier,
        'cohort_code', e.cohort_code,
        'label', e.label,
        'display_name', e.display_name,
        'activated_at', e.activated_at,
        'expires_at', e.expires_at,
        'org_slug', vc.org_slug
      )
      order by e.activated_at desc
    ),
    '[]'::jsonb
  )
  into v_seats
  from (
    select e.*
    from public.entitlements e
    left join public.voucher_codes vc on vc.id = e.voucher_code_id
    where e.tier <> 'free'
      and (e.expires_at is null or e.expires_at > v_now)
      and (v_org_slug is null or vc.org_slug = v_org_slug)
    order by e.activated_at desc
    limit v_limit
  ) e
  left join public.voucher_codes vc on vc.id = e.voucher_code_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'device_id', cp.device_id,
        'cohort_code', cp.cohort_code,
        'display_name', cp.display_name,
        'weekly_xp', cp.weekly_xp,
        'total_xp', cp.total_xp,
        'streak_days', cp.streak_days,
        'completed_lessons', cp.completed_lessons,
        'updated_at', cp.updated_at
      )
      order by cp.weekly_xp desc, cp.updated_at desc
    ),
    '[]'::jsonb
  )
  into v_cohort
  from (
    select cp.*
    from public.cohort_progress cp
    left join public.entitlements e on e.device_id = cp.device_id
    left join public.voucher_codes vc on vc.id = e.voucher_code_id
    where v_org_slug is null or vc.org_slug = v_org_slug
    order by cp.weekly_xp desc, cp.updated_at desc
    limit 500
  ) cp;

  return jsonb_build_object(
    'ok', true,
    'organizations', v_orgs,
    'vouchers', v_vouchers,
    'active_seats', v_seats,
    'cohort_progress', v_cohort,
    'fetched_at', v_now
  );
end;
$$;

revoke all on function public.admin_list_seats(text, integer) from public, anon, authenticated;
grant execute on function public.admin_list_seats(text, integer) to service_role;

-- ============================================================================
-- 7. Lost-Phone Cloud Backup RPCs (Sync, Lookup, Entitlement Transfer)
-- ============================================================================
create or replace function public.upsert_cloud_backup(
  p_recovery_code text,
  p_pin_hash text,
  p_device_id text,
  p_payload_json jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_recovery_code, '')));
  v_device_id text := trim(coalesce(p_device_id, ''));
  v_entitlement record;
  v_existing_device text;
  v_now timestamptz := now();
begin
  if v_code !~ '^[A-Z0-9]{6,16}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_RECOVERY_CODE');
  end if;

  if char_length(v_device_id) < 8 or char_length(v_device_id) > 128 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  if p_pin_hash is null or char_length(p_pin_hash) < 32 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_PIN_HASH');
  end if;

  -- Only active paid or academy devices can create cloud backups
  select tier, expires_at
  into v_entitlement
  from public.entitlements
  where device_id = v_device_id;

  if not found
     or v_entitlement.tier not in ('pro', 'academy_student', 'academy_teacher')
     or (v_entitlement.expires_at is not null and v_entitlement.expires_at <= v_now) then
    return jsonb_build_object('ok', false, 'error', 'PRO_REQUIRED');
  end if;

  -- Prevent hijacking an existing recovery_code owned by another device
  select device_id
  into v_existing_device
  from public.cloud_backups
  where recovery_code = v_code
  for update;

  if found and v_existing_device <> v_device_id then
    return jsonb_build_object('ok', false, 'error', 'CODE_COLLISION');
  end if;

  insert into public.cloud_backups (
    recovery_code,
    pin_hash,
    device_id,
    payload_json,
    updated_at
  )
  values (
    v_code,
    p_pin_hash,
    v_device_id,
    coalesce(p_payload_json, '{}'::jsonb),
    v_now
  )
  on conflict (recovery_code) do update
  set pin_hash = excluded.pin_hash,
      payload_json = excluded.payload_json,
      updated_at = v_now;

  return jsonb_build_object(
    'ok', true,
    'recovery_code', v_code,
    'updated_at', v_now
  );
end;
$$;

revoke all on function public.upsert_cloud_backup(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.upsert_cloud_backup(text, text, text, jsonb) to service_role;

create or replace function public.get_cloud_backup(
  p_recovery_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_recovery_code, '')));
  v_row record;
begin
  if v_code !~ '^[A-Z0-9]{6,16}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_RECOVERY_CODE');
  end if;

  select recovery_code, pin_hash, device_id, payload_json, updated_at
  into v_row
  from public.cloud_backups
  where recovery_code = v_code;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  return jsonb_build_object(
    'ok', true,
    'recovery_code', v_row.recovery_code,
    'pin_hash', v_row.pin_hash,
    'device_id', v_row.device_id,
    'payload_json', v_row.payload_json,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.get_cloud_backup(text) from public, anon, authenticated;
grant execute on function public.get_cloud_backup(text) to service_role;

create or replace function public.restore_entitlement_to_device(
  p_old_device_id text,
  p_new_device_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_id text := trim(coalesce(p_old_device_id, ''));
  v_new_id text := trim(coalesce(p_new_device_id, ''));
  v_old record;
  v_now timestamptz := now();
begin
  if char_length(v_old_id) < 8 or char_length(v_new_id) < 8 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DEVICE');
  end if;

  select tier, cohort_code, label, display_name, voucher_code_id, activated_at, expires_at
  into v_old
  from public.entitlements
  where device_id = v_old_id;

  if not found or (v_old.expires_at is not null and v_old.expires_at <= v_now) then
    return jsonb_build_object(
      'ok', true,
      'tier', 'free',
      'cohort_code', null,
      'label', null,
      'activated_at', null,
      'expires_at', null
    );
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
    v_new_id,
    v_old.tier,
    v_old.cohort_code,
    v_old.label,
    v_old.display_name,
    v_old.voucher_code_id,
    coalesce(v_old.activated_at, v_now),
    v_old.expires_at,
    v_now
  )
  on conflict (device_id) do update
  set tier = excluded.tier,
      cohort_code = excluded.cohort_code,
      label = excluded.label,
      display_name = coalesce(excluded.display_name, public.entitlements.display_name),
      voucher_code_id = excluded.voucher_code_id,
      activated_at = excluded.activated_at,
      expires_at = excluded.expires_at,
      updated_at = v_now;

  return jsonb_build_object(
    'ok', true,
    'tier', v_old.tier,
    'cohort_code', v_old.cohort_code,
    'label', v_old.label,
    'activated_at', coalesce(v_old.activated_at, v_now),
    'expires_at', v_old.expires_at
  );
end;
$$;

revoke all on function public.restore_entitlement_to_device(text, text) from public, anon, authenticated;
grant execute on function public.restore_entitlement_to_device(text, text) to service_role;

-- ============================================================================
-- 8. Verifiable Certificates RPCs (Issue & Public Read-Only Verify)
-- ============================================================================
create or replace function public.issue_certificate(
  p_student_name text,
  p_track_title text,
  p_org_slug text default null,
  p_cert_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text := trim(coalesce(p_student_name, ''));
  v_track_title text := trim(coalesce(p_track_title, ''));
  v_org_slug text := nullif(lower(trim(coalesce(p_org_slug, ''))), '');
  v_cert_code text := nullif(upper(trim(coalesce(p_cert_code, ''))), '');
  v_org_name text;
  v_now timestamptz := now();
  v_attempts integer := 0;
begin
  if char_length(v_student_name) < 2 or char_length(v_student_name) > 120 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STUDENT_NAME');
  end if;

  if char_length(v_track_title) < 2 or char_length(v_track_title) > 160 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_TRACK_TITLE');
  end if;

  if v_org_slug is not null then
    select name into v_org_name from public.organizations where slug = v_org_slug;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'UNKNOWN_ORGANIZATION');
    end if;
  end if;

  loop
    v_attempts := v_attempts + 1;
    if v_cert_code is null or v_attempts > 1 then
      v_cert_code := 'TB-CERT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    end if;
    begin
      insert into public.certificates (
        cert_code,
        student_name,
        track_title,
        org_slug,
        issued_at
      )
      values (
        v_cert_code,
        v_student_name,
        v_track_title,
        v_org_slug,
        v_now
      );
      exit;
    exception when unique_violation then
      if v_attempts >= 10 then
        raise;
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'certificate', jsonb_build_object(
      'cert_code', v_cert_code,
      'student_name', v_student_name,
      'track_title', v_track_title,
      'org_slug', v_org_slug,
      'org_name', v_org_name,
      'issued_at', v_now,
      'revoked_at', null
    )
  );
end;
$$;

revoke all on function public.issue_certificate(text, text, text, text) from public, anon, authenticated;
grant execute on function public.issue_certificate(text, text, text, text) to service_role;

create or replace function public.verify_certificate(
  p_cert_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_cert_code, '')));
  v_row record;
begin
  if v_code !~ '^TB-CERT-[A-Z0-9]{4,20}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_FORMAT');
  end if;

  select
    c.cert_code,
    c.student_name,
    c.track_title,
    c.org_slug,
    o.name as org_name,
    c.issued_at,
    c.revoked_at
  into v_row
  from public.certificates c
  left join public.organizations o on o.slug = c.org_slug
  where c.cert_code = v_code;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  return jsonb_build_object(
    'ok', true,
    'valid', v_row.revoked_at is null,
    'certificate', jsonb_build_object(
      'cert_code', v_row.cert_code,
      'student_name', v_row.student_name,
      'track_title', v_row.track_title,
      'org_slug', v_row.org_slug,
      'org_name', v_row.org_name,
      'issued_at', v_row.issued_at,
      'revoked_at', v_row.revoked_at
    )
  );
end;
$$;

revoke all on function public.verify_certificate(text) from public, anon, authenticated;
grant execute on function public.verify_certificate(text) to service_role;
