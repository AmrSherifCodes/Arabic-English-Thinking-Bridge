import {
  DEFAULT_FREE_ENTITLEMENT,
  DEVICE_ID_STORAGE_KEY,
  ENTITLEMENT_STORAGE_KEY,
  ENTITLEMENT_UPDATED_EVENT,
  EntitlementState,
  EntitlementTier,
  PRESERVED_STORAGE_KEYS,
  RedeemVoucherErrorCode,
  RedeemVoucherResult,
} from '../types/entitlement';

const VOUCHER_CODE_REGEX = /^[A-Z0-9][A-Z0-9-]{3,31}$/;
const VALID_TIERS: ReadonlySet<string> = new Set<EntitlementTier>([
  'free',
  'pro',
  'academy_student',
  'academy_teacher',
]);

function getStorage(storageOverride?: Storage | null): Storage | null {
  if (storageOverride !== undefined) return storageOverride;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function normalizeVoucherCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function isValidVoucherCodeFormat(code: string): boolean {
  return VOUCHER_CODE_REGEX.test(normalizeVoucherCode(code));
}

export function isEntitlementExpired(entitlement: EntitlementState, nowMs = Date.now()): boolean {
  if (!entitlement.expiresAt) return false;
  const parsed = Date.parse(entitlement.expiresAt);
  if (Number.isNaN(parsed)) return false;
  return parsed <= nowMs;
}

export function getRemainingEntitlementDays(
  entitlement: EntitlementState,
  nowMs = Date.now()
): number | null {
  if (entitlement.tier === 'free' || !entitlement.expiresAt) return null;
  const parsed = Date.parse(entitlement.expiresAt);
  if (Number.isNaN(parsed)) return null;
  const diffMs = parsed - nowMs;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 86_400_000);
}

export function hasProAccess(entitlement: EntitlementState, nowMs = Date.now()): boolean {
  if (isEntitlementExpired(entitlement, nowMs)) return false;
  return (
    entitlement.tier === 'pro' ||
    entitlement.tier === 'academy_student' ||
    entitlement.tier === 'academy_teacher'
  );
}

export function hasAcademyTeacherAccess(entitlement: EntitlementState, nowMs = Date.now()): boolean {
  if (isEntitlementExpired(entitlement, nowMs)) return false;
  return entitlement.tier === 'academy_teacher';
}

function generateDeviceId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `tb-${crypto.randomUUID()}`;
    }
  } catch {
    // Fallback below
  }
  const rand = Math.random().toString(36).slice(2, 12);
  return `tb-${Date.now().toString(36)}-${rand}`;
}

export function getOrCreateDeviceId(storageOverride?: Storage | null): string {
  const storage = getStorage(storageOverride);
  if (!storage) return generateDeviceId();
  try {
    const existing = storage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing && existing.trim().length >= 8) {
      return existing.trim();
    }
    const created = generateDeviceId();
    storage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return generateDeviceId();
  }
}

export function loadCachedEntitlement(
  storageOverride?: Storage | null,
  nowMs = Date.now()
): EntitlementState {
  const storage = getStorage(storageOverride);
  if (!storage) return { ...DEFAULT_FREE_ENTITLEMENT };
  try {
    const raw = storage.getItem(ENTITLEMENT_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FREE_ENTITLEMENT };
    const parsed = JSON.parse(raw) as Partial<EntitlementState>;
    if (!parsed || typeof parsed !== 'object' || !parsed.tier || !VALID_TIERS.has(parsed.tier)) {
      return { ...DEFAULT_FREE_ENTITLEMENT };
    }
    const candidate: EntitlementState = {
      tier: parsed.tier as EntitlementTier,
      cohortCode: typeof parsed.cohortCode === 'string' && parsed.cohortCode.trim() ? parsed.cohortCode.trim() : null,
      label: typeof parsed.label === 'string' && parsed.label.trim() ? parsed.label.trim() : null,
      activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : null,
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : null,
      lastSyncedAt: typeof parsed.lastSyncedAt === 'string' ? parsed.lastSyncedAt : null,
      source: 'cache',
    };
    if (isEntitlementExpired(candidate, nowMs)) {
      return { ...DEFAULT_FREE_ENTITLEMENT };
    }
    return candidate;
  } catch {
    return { ...DEFAULT_FREE_ENTITLEMENT };
  }
}

export function saveCachedEntitlement(
  entitlement: EntitlementState,
  storageOverride?: Storage | null
): void {
  const storage = getStorage(storageOverride);
  if (storage) {
    try {
      storage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(entitlement));
    } catch {
      // Ignore storage quota errors
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(ENTITLEMENT_UPDATED_EVENT, { detail: entitlement }));
    } catch {
      // Ignore environments without CustomEvent
    }
  }
}

/**
 * Clears local learning progress while strictly preserving the user's
 * redeemed entitlement (`tb.entitlement.v1`) and `device_id` (`tb.deviceId.v1`).
 */
export function clearLocalLearningDataPreservingEntitlement(storageOverride?: Storage | null): void {
  const storage = getStorage(storageOverride);
  if (!storage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && !PRESERVED_STORAGE_KEYS.has(key)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      storage.removeItem(key);
    }
  } catch {
    // Never throw during cleanup
  }
}

function mapErrorMessages(
  errorCode: RedeemVoucherErrorCode,
  retryAfterSeconds?: number
): { messageAr: string; messageEn: string } {
  switch (errorCode) {
    case 'INVALID_FORMAT':
      return {
        messageAr: 'صيغة الكود غير صحيحة. مثال: TB-PRO-XXXX أو ALAQSA-XXXX.',
        messageEn: 'Invalid code format. Example: TB-PRO-XXXX or ALAQSA-XXXX.',
      };
    case 'INVALID_OR_USED_CODE':
      return {
        messageAr: 'الكود غير صحيح أو تم استخدامه بالفعل على جهاز آخر.',
        messageEn: 'This code is invalid or has already been redeemed on another device.',
      };
    case 'RATE_LIMITED': {
      const mins = Math.max(1, Math.ceil((retryAfterSeconds || 60) / 60));
      return {
        messageAr: `محاولات كثيرة جداً. من فضلك انتظر ${mins} دقيقة وحاول مرة أخرى.`,
        messageEn: `Too many attempts. Please wait ${mins} minute(s) and try again.`,
      };
    }
    case 'NETWORK_OFFLINE':
      return {
        messageAr: 'تفعيل الكود لأول مرة يحتاج اتصال إنترنت. بعد التفعيل يعمل التطبيق بدون إنترنت ١٠٠٪.',
        messageEn: 'First-time activation requires internet. Once unlocked, Pro works 100% offline.',
      };
    case 'SERVER_UNCONFIGURED':
      return {
        messageAr: 'خدمة التفعيل قيد التجهيز حالياً. حاول مرة أخرى بعد قليل أو تواصل معنا.',
        messageEn: 'Activation service is being configured. Please try again shortly.',
      };
    default:
      return {
        messageAr: 'حدث خطأ مؤقت أثناء التفعيل. حاول مرة أخرى.',
        messageEn: 'Temporary activation error. Please try again.',
      };
  }
}

export async function redeemVoucherCode(
  rawCode: string,
  options?: {
    displayName?: string;
    fetchImpl?: typeof fetch;
    storage?: Storage | null;
  }
): Promise<RedeemVoucherResult> {
  const code = normalizeVoucherCode(rawCode);
  if (!isValidVoucherCodeFormat(code)) {
    return {
      ok: false,
      errorCode: 'INVALID_FORMAT',
      ...mapErrorMessages('INVALID_FORMAT'),
    };
  }

  const deviceId = getOrCreateDeviceId(options?.storage);
  const fetchFn = options?.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      ...mapErrorMessages('NETWORK_OFFLINE'),
    };
  }

  try {
    const response = await fetchFn('/api/entitlements/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        deviceId,
        displayName: options?.displayName?.trim() || undefined,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      entitlement?: Partial<EntitlementState>;
      errorCode?: RedeemVoucherErrorCode;
      retryAfterSeconds?: number;
    } | null;

    if (!response.ok || !data?.ok || !data.entitlement?.tier) {
      const errorCode: RedeemVoucherErrorCode =
        data?.errorCode ||
        (response.status === 429
          ? 'RATE_LIMITED'
          : response.status === 503
          ? 'SERVER_UNCONFIGURED'
          : response.status === 400
          ? 'INVALID_OR_USED_CODE'
          : 'SERVER_ERROR');
      return {
        ok: false,
        errorCode,
        retryAfterSeconds: data?.retryAfterSeconds,
        ...mapErrorMessages(errorCode, data?.retryAfterSeconds),
      };
    }

    const tier = VALID_TIERS.has(data.entitlement.tier)
      ? (data.entitlement.tier as EntitlementTier)
      : 'free';

    const unlocked: EntitlementState = {
      tier,
      cohortCode: data.entitlement.cohortCode ?? null,
      label: data.entitlement.label ?? null,
      activatedAt: data.entitlement.activatedAt ?? new Date().toISOString(),
      expiresAt: data.entitlement.expiresAt ?? null,
      lastSyncedAt: new Date().toISOString(),
      source: 'server',
    };

    saveCachedEntitlement(unlocked, options?.storage);
    return { ok: true, entitlement: unlocked };
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_OFFLINE',
      ...mapErrorMessages('NETWORK_OFFLINE'),
    };
  }
}

/**
 * Silent online revalidation for already-activated devices.
 * Free/guest users make ZERO network calls (strictly offline-first).
 */
export async function refreshEntitlementFromServer(options?: {
  fetchImpl?: typeof fetch;
  storage?: Storage | null;
}): Promise<EntitlementState> {
  const cached = loadCachedEntitlement(options?.storage);
  if (cached.tier === 'free') {
    return cached;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return cached;
  }

  const fetchFn = options?.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    return cached;
  }

  try {
    const deviceId = getOrCreateDeviceId(options?.storage);
    const response = await fetchFn(
      `/api/entitlements/status?deviceId=${encodeURIComponent(deviceId)}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      return cached;
    }
    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      entitlement?: Partial<EntitlementState>;
    } | null;

    if (!data?.ok || !data.entitlement?.tier || !VALID_TIERS.has(data.entitlement.tier)) {
      return cached;
    }

    const synced: EntitlementState = {
      tier: data.entitlement.tier as EntitlementTier,
      cohortCode: data.entitlement.cohortCode ?? null,
      label: data.entitlement.label ?? null,
      activatedAt: data.entitlement.activatedAt ?? cached.activatedAt,
      expiresAt: data.entitlement.expiresAt ?? null,
      lastSyncedAt: new Date().toISOString(),
      source: 'server',
    };

    saveCachedEntitlement(synced, options?.storage);
    return synced;
  } catch {
    return cached;
  }
}
