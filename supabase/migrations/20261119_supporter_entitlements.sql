-- Migration: Supporter Entitlements for @sciamrsherif Channel Gate
-- Created: 2026-11-19

CREATE TABLE IF NOT EXISTS public.user_supporter_entitlements (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    method TEXT CHECK (method IN ('youtube_channel_visit', 'community_passcode', 'youtube_oauth_verified')),
    channel_handle TEXT DEFAULT '@sciamrsherif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_supporter_entitlements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own supporter entitlement status
CREATE POLICY "Users can view their own supporter entitlement"
    ON public.user_supporter_entitlements
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert or update their own supporter entitlement
CREATE POLICY "Users can insert or update their own supporter entitlement"
    ON public.user_supporter_entitlements
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_supporter_entitlements_user_id
    ON public.user_supporter_entitlements(user_id);
