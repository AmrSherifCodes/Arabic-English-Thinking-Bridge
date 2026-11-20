import { TargetLanguage, SourceLanguage } from '../types';
import { COMMUNITY_PASSCODE_HASHES, YOUTUBE_CHANNEL_HANDLE } from '../config/supporterConfig';

export type LanguageCode = TargetLanguage | SourceLanguage;

export type AccessStatus =
  | 'free_forever'
  | 'free_preview'
  | 'unlocked_supporter'
  | 'locked_supporter_required';

export type UnlockMethod =
  | 'youtube_channel_visit'
  | 'community_passcode'
  | 'youtube_oauth_verified';

export interface SupporterEntitlement {
  isUnlocked: boolean;
  unlockedAt: string | null; // ISO timestamp
  method: UnlockMethod | null;
  channelHandle: '@sciamrsherif';
  version: 1;
}

const STORAGE_KEY = 'tb_supporter_entitlement_v1';

export const DEFAULT_ENTITLEMENT: SupporterEntitlement = {
  isUnlocked: false,
  unlockedAt: null,
  method: null,
  channelHandle: YOUTUBE_CHANNEL_HANDLE,
  version: 1,
};

/**
 * Arabic <-> English is 100% free, ungated, and offline forever.
 */
export function isCoreFreePair(source: string, target: string): boolean {
  const isArabicSource = source === 'ar' || source.startsWith('ar');
  const isArabicTarget = target === 'ar' || target.startsWith('ar');
  const isEnglishSource = source === 'en';
  const isEnglishTarget = target === 'en';

  return (isArabicSource && isEnglishTarget) || (isEnglishSource && isArabicTarget);
}

/**
 * Determines access status for a given level in a language pair.
 */
export function getLanguageLevelAccess(
  source: string,
  target: string,
  levelNumber: number,
  entitlement: SupporterEntitlement
): AccessStatus {
  if (isCoreFreePair(source, target)) {
    return 'free_forever';
  }

  if (entitlement.isUnlocked) {
    return 'unlocked_supporter';
  }

  if (target === 'de' && levelNumber === 1) {
    return 'free_preview';
  }

  return 'locked_supporter_required';
}

let memoryEntitlementStore: SupporterEntitlement | null = null;

/**
 * Gets the persisted supporter entitlement from localStorage safely, with memory fallback.
 */
export function getSupporterEntitlement(): SupporterEntitlement {
  if (typeof localStorage === 'undefined') {
    return memoryEntitlementStore || DEFAULT_ENTITLEMENT;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryEntitlementStore || DEFAULT_ENTITLEMENT;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.isUnlocked === 'boolean') {
      return {
        ...DEFAULT_ENTITLEMENT,
        ...parsed,
      };
    }
  } catch {
    // Ignore storage errors in private browsing / sandboxes
  }

  return memoryEntitlementStore || DEFAULT_ENTITLEMENT;
}

/**
 * Saves supporter entitlement to localStorage safely, with memory fallback and non-blocking Supabase sync.
 */
export function saveSupporterEntitlement(entitlement: SupporterEntitlement): void {
  memoryEntitlementStore = entitlement;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entitlement));
    } catch {
      // Ignore storage errors
    }
  }

  // Non-blocking sync with Supabase if online/authenticated
  syncEntitlementToSupabase(entitlement).catch(() => {
    // Fail silently
  });
}

/**
 * Helper to compute SHA-256 hash using Web Crypto or Node crypto fallback.
 */
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node fallback if Web Crypto is unavailable (e.g., in node test environment)
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(data).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Verifies a user-entered community passcode.
 */
export async function verifyCommunityPasscode(input: string): Promise<boolean> {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return false;

  const hash = await sha256Hex(normalized);
  if (!hash) return false;

  const match = COMMUNITY_PASSCODE_HASHES.includes(hash);
  if (match) {
    const entitlement: SupporterEntitlement = {
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
      method: 'community_passcode',
      channelHandle: YOUTUBE_CHANNEL_HANDLE,
      version: 1,
    };
    saveSupporterEntitlement(entitlement);
    return true;
  }

  return false;
}

/**
 * Unlocks entitlement after visiting the YouTube channel.
 */
export function recordChannelVisitUnlock(): SupporterEntitlement {
  const entitlement: SupporterEntitlement = {
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    method: 'youtube_channel_visit',
    channelHandle: YOUTUBE_CHANNEL_HANDLE,
    version: 1,
  };
  saveSupporterEntitlement(entitlement);
  return entitlement;
}

/**
 * Non-blocking Supabase sync for authenticated users.
 */
async function syncEntitlementToSupabase(entitlement: SupporterEntitlement): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const supabaseClient = (window as any).__SUPABASE_CLIENT__;
    if (supabaseClient && entitlement.isUnlocked) {
      const { data: userData } = await supabaseClient.auth.getUser();
      if (userData?.user?.id) {
        await supabaseClient.from('user_supporter_entitlements').upsert({
          user_id: userData.user.id,
          is_unlocked: entitlement.isUnlocked,
          unlocked_at: entitlement.unlockedAt,
          method: entitlement.method,
          channel_handle: entitlement.channelHandle,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch {
    // Non-blocking catch
  }
}
