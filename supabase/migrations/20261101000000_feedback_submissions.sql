-- Migration: 20261101000000_feedback_submissions.sql
-- Table: feedback_submissions
-- Description: Stores user feedback and feature suggestions with strict spam protection and RLS.

CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  feature_idea text,
  user_name text,
  profile_goal text,
  focus_area text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Constraint: Limit message and feature_idea length to 1000 characters to prevent database spam
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_feedback_message_length'
  ) THEN
    ALTER TABLE public.feedback_submissions
      ADD CONSTRAINT check_feedback_message_length
      CHECK (char_length(message) <= 1000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_feedback_feature_idea_length'
  ) THEN
    ALTER TABLE public.feedback_submissions
      ADD CONSTRAINT check_feedback_feature_idea_length
      CHECK (feature_idea IS NULL OR char_length(feature_idea) <= 1000);
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (anonymous or authenticated) can submit feedback with validated message length
DROP POLICY IF EXISTS "Allow anonymous and authenticated inserts to feedback" ON public.feedback_submissions;
CREATE POLICY "Allow anonymous and authenticated inserts to feedback"
  ON public.feedback_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) <= 1000
    AND (feature_idea IS NULL OR char_length(feature_idea) <= 1000)
  );

-- Policy 2: Only service_role can view submitted feedback
DROP POLICY IF EXISTS "Allow service_role to read feedback" ON public.feedback_submissions;
CREATE POLICY "Allow service_role to read feedback"
  ON public.feedback_submissions
  FOR SELECT
  TO service_role
  USING (true);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at
  ON public.feedback_submissions (created_at DESC);
