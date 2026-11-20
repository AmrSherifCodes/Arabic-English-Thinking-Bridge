/**
 * Phase 2 YouTube Data API v3 OAuth Verification Gateway (Feature-Flagged)
 */
import { isYouTubeOAuthEnabled } from '../config/supporterConfig';
import { saveSupporterEntitlement, SupporterEntitlement } from './supporterGate';

export interface OAuthVerificationResult {
  verified: boolean;
  subscribed: boolean;
  error?: string;
}

/**
 * Calls the serverless verification endpoint with a Google OAuth access token.
 */
export async function verifyYouTubeSubscriptionOAuth(accessToken: string): Promise<OAuthVerificationResult> {
  if (!isYouTubeOAuthEnabled()) {
    return {
      verified: false,
      subscribed: false,
      error: 'YouTube OAuth Gate is currently disabled.',
    };
  }

  try {
    const res = await fetch('/api/verify-youtube-sub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        verified: false,
        subscribed: false,
        error: errJson.error || 'Failed to verify subscription with YouTube API.',
      };
    }

    const data = await res.json();
    if (data.subscribed) {
      const entitlement: SupporterEntitlement = {
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
        method: 'youtube_oauth_verified',
        channelHandle: '@sciamrsherif',
        version: 1,
      };
      saveSupporterEntitlement(entitlement);
      return { verified: true, subscribed: true };
    }

    return { verified: true, subscribed: false };
  } catch (err: any) {
    return {
      verified: false,
      subscribed: false,
      error: err?.message || 'Network error during verification.',
    };
  }
}
