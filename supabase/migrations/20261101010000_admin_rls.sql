-- Migration: 20261101010000_admin_rls.sql
-- Description: Establishes cryptographic JWT role checking and RLS for Admin Inbox.
-- NOTE: Do NOT run this SQL automatically. Apply manually via Supabase Dashboard SQL Editor.
-- IMPORTANT SECURITY SETTING: Disable public sign-ups in Supabase Auth Dashboard
-- (Authentication -> Providers -> Email -> toggle "Enable Signups" OFF) to prevent
-- external users from creating uninvited accounts in this project.

-- 1. Helper function: checks if request JWT has admin role in app_metadata ONLY.
-- (user_metadata is client/user-editable and must NEVER be trusted for authorization).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- 2. Ensure public.messages table exists and has RLS enabled
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  sender_email text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anonymous visitors and authenticated users can insert feedback messages
DROP POLICY IF EXISTS "Allow anon and auth to insert messages" ON public.messages;
CREATE POLICY "Allow anon and auth to insert messages"
  ON public.messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) <= 2000
  );

-- Policy 2: ONLY verified admin can read messages
DROP POLICY IF EXISTS "Allow only admins to view messages" ON public.messages;
CREATE POLICY "Allow only admins to view messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: ONLY verified admin can delete messages
DROP POLICY IF EXISTS "Allow only admins to delete messages" ON public.messages;
CREATE POLICY "Allow only admins to delete messages"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. Chronological index for inbox queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

