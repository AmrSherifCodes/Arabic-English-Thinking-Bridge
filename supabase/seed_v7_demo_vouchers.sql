-- Thinking Bridge v7.1.0 — Ready-to-Run Demo, Classroom Trial & Egypt Pricing Voucher Seed Script
-- Paste into Supabase SQL Editor after running supabase/migrations/20261124_v7_entitlements.sql.
-- Safe to re-run: idempotent via ON CONFLICT (code) DO NOTHING.

insert into public.voucher_codes (
  code,
  tier,
  cohort_code,
  label,
  max_redemptions,
  valid_until,
  duration_days,
  expires_at
)
values
  -- Free First-Session Classroom Trial (50 students, hard calendar expiry — clearing cache cannot reset)
  ('ALAQSA-FREE', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Free First-Session Student Trial', 50, '2026-12-31T23:59:59+02:00', null, '2026-12-31T23:59:59+02:00'),

  -- Egypt Pricing Ladder Sample Vouchers
  -- 50 EGP Monthly (30 days)
  ('TB-MO-0001', 'pro', null, 'Thinking Bridge Pro — Monthly (50 EGP / 30 Days)', 1, null, 30, null),
  -- 120 EGP Season (90 days / 3 months)
  ('TB-3M-0001', 'pro', null, 'Thinking Bridge Pro — 3-Month Season (120 EGP / 90 Days)', 1, null, 90, null),
  -- 299 EGP Founding Lifetime (NULL duration = never expires)
  ('TB-LIFE-0001', 'pro', null, 'Thinking Bridge Pro — Founding Lifetime (299 EGP)', 1, null, null, null),

  -- 1 Academy Teacher voucher (Al-Aqsa Academy — Cohort G1)
  ('ALAQSA-TEACH-01', 'academy_teacher', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1 Teacher', 1, null, null, null),

  -- 10 Academy Student vouchers (Al-Aqsa Academy — Cohort G1)
  ('ALAQSA-STU-01', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-02', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-03', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-04', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-05', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-06', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-07', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-08', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-09', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),
  ('ALAQSA-STU-10', 'academy_student', 'ALAQSA-G1', 'Al-Aqsa Academy — Cohort G1', 1, null, 90, null),

  -- 5 Individual Pro Launch Batch vouchers (Lifetime)
  ('TB-PRO-0001', 'pro', null, 'Thinking Bridge Pro — Launch Batch', 1, null, null, null),
  ('TB-PRO-0002', 'pro', null, 'Thinking Bridge Pro — Launch Batch', 1, null, null, null),
  ('TB-PRO-0003', 'pro', null, 'Thinking Bridge Pro — Launch Batch', 1, null, null, null),
  ('TB-PRO-0004', 'pro', null, 'Thinking Bridge Pro — Launch Batch', 1, null, null, null),
  ('TB-PRO-0005', 'pro', null, 'Thinking Bridge Pro — Launch Batch', 1, null, null, null)
on conflict (code) do nothing;
