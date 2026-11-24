export type EntitlementTier = 'free' | 'pro' | 'academy_student' | 'academy_teacher';

export interface EntitlementState {
  tier: EntitlementTier;
  cohortCode: string | null;
  label?: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  lastSyncedAt: string | null;
  source: 'default' | 'cache' | 'server';
}

export type RedeemVoucherErrorCode =
  | 'INVALID_FORMAT'
  | 'INVALID_OR_USED_CODE'
  | 'RATE_LIMITED'
  | 'NETWORK_OFFLINE'
  | 'SERVER_UNCONFIGURED'
  | 'SERVER_ERROR';

export interface RedeemVoucherResult {
  ok: boolean;
  entitlement?: EntitlementState;
  errorCode?: RedeemVoucherErrorCode;
  messageAr?: string;
  messageEn?: string;
  retryAfterSeconds?: number;
}

export interface CohortStudentSummary {
  deviceId: string;
  displayName: string;
  cohortCode: string;
  weeklyXp: number;
  totalXp: number;
  streakDays: number;
  completedLessons: number;
  topL1Mistakes: string[];
  updatedAt: string;
}

export const ENTITLEMENT_STORAGE_KEY = 'tb.entitlement.v1';
export const DEVICE_ID_STORAGE_KEY = 'tb.deviceId.v1';
export const INSTAPAY_HANDLE = 'amrsherifabdelaal1@instapay';
export const ENTITLEMENT_UPDATED_EVENT = 'tb:entitlement-updated';

export const PRESERVED_STORAGE_KEYS: ReadonlySet<string> = new Set([
  ENTITLEMENT_STORAGE_KEY,
  DEVICE_ID_STORAGE_KEY,
]);

export const DEFAULT_FREE_ENTITLEMENT: EntitlementState = {
  tier: 'free',
  cohortCode: null,
  label: null,
  activatedAt: null,
  expiresAt: null,
  lastSyncedAt: null,
  source: 'default',
};
