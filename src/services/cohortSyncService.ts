import { CohortStudentSummary } from '../types/entitlement';
import {
  getOrCreateDeviceId,
  hasAcademyTeacherAccess,
  loadCachedEntitlement,
} from './entitlementService';

export interface CohortSyncPayload {
  displayName: string;
  weeklyXp: number;
  totalXp?: number;
  streakDays: number;
  completedLessons?: number;
  topL1Mistakes: string[];
}

export interface CohortSyncResult {
  ok: boolean;
  skipped?: boolean;
  cohortCode?: string | null;
  updatedAt?: string;
  errorCode?: string;
}

export interface CohortRosterResult {
  ok: boolean;
  skipped?: boolean;
  cohortCode?: string | null;
  label?: string | null;
  students: CohortStudentSummary[];
  fetchedAt?: string;
  errorCode?: string;
}

export const L1_MISTAKE_LABELS: Record<string, { ar: string; en: string }> = {
  'copula-drop': {
    ar: 'حذف فعل الكينونة (is / are)',
    en: 'Dropped "be" verb (is / are)',
  },
  'article-the': {
    ar: 'استخدام زائد لأداة التعريف (the)',
    en: 'Extra definite article ("the")',
  },
  'preposition-in-on': {
    ar: 'الخلط بين حروف الجر (in / on / at)',
    en: 'Preposition swap (in / on / at)',
  },
  'word-order': {
    ar: 'ترتيب الصفة والاسم (Adjective Order)',
    en: 'Noun-Adjective word order',
  },
  'present-perfect': {
    ar: 'الماضي البسيط بدل المضارع التام',
    en: 'Past Simple vs. Present Perfect',
  },
  'resumptive-pronoun': {
    ar: 'الضمير العائد الزائد (that I saw it)',
    en: 'Resumptive pronoun ("that I saw it")',
  },
};

export function formatL1MistakeTag(tag: string): { ar: string; en: string } {
  const known = L1_MISTAKE_LABELS[tag];
  if (known) return known;
  const readable = tag.replace(/[-_]+/g, ' ').trim() || 'General Structure';
  return { ar: readable, en: readable };
}

export const DEMO_COHORT_CODE = 'ALAQSA-G1';

export const DEMO_COHORT_STUDENTS: CohortStudentSummary[] = [
  {
    deviceId: 'demo-student-01',
    displayName: 'يوسف أحمد · Youssef Ahmed',
    cohortCode: DEMO_COHORT_CODE,
    weeklyXp: 640,
    totalXp: 2840,
    streakDays: 12,
    completedLessons: 14,
    topL1Mistakes: ['article-the', 'present-perfect'],
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  {
    deviceId: 'demo-student-02',
    displayName: 'مريم خالد · Mariam Khaled',
    cohortCode: DEMO_COHORT_CODE,
    weeklyXp: 580,
    totalXp: 2410,
    streakDays: 9,
    completedLessons: 12,
    topL1Mistakes: ['copula-drop', 'preposition-in-on'],
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  {
    deviceId: 'demo-student-03',
    displayName: 'عمر محمود · Omar Mahmoud',
    cohortCode: DEMO_COHORT_CODE,
    weeklyXp: 420,
    totalXp: 1690,
    streakDays: 6,
    completedLessons: 9,
    topL1Mistakes: ['copula-drop', 'word-order', 'article-the'],
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  {
    deviceId: 'demo-student-04',
    displayName: 'سلمى طارق · Salma Tarek',
    cohortCode: DEMO_COHORT_CODE,
    weeklyXp: 350,
    totalXp: 1320,
    streakDays: 5,
    completedLessons: 8,
    topL1Mistakes: ['preposition-in-on', 'resumptive-pronoun'],
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  {
    deviceId: 'demo-student-05',
    displayName: 'آدم كريم · Adam Karim',
    cohortCode: DEMO_COHORT_CODE,
    weeklyXp: 210,
    totalXp: 790,
    streakDays: 2,
    completedLessons: 5,
    topL1Mistakes: ['copula-drop', 'word-order'],
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
];

/**
 * Pushes opt-in weekly progress for verified `academy_student` devices.
 * Makes ZERO network calls for `free`, `pro`, or `academy_teacher` users.
 */
export async function pushStudentCohortProgress(
  payload: CohortSyncPayload,
  options?: {
    fetchImpl?: typeof fetch;
    storage?: Storage | null;
  }
): Promise<CohortSyncResult> {
  const entitlement = loadCachedEntitlement(options?.storage);
  if (entitlement.tier !== 'academy_student') {
    return { ok: false, skipped: true, errorCode: 'NOT_ACADEMY_STUDENT' };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, errorCode: 'NETWORK_OFFLINE' };
  }

  const fetchFn = options?.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    return { ok: false, errorCode: 'NETWORK_OFFLINE' };
  }

  try {
    const deviceId = getOrCreateDeviceId(options?.storage);
    const response = await fetchFn('/api/entitlements/cohort-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        displayName: payload.displayName.trim().slice(0, 64),
        weeklyXp: Math.max(0, Math.floor(payload.weeklyXp)),
        totalXp: Math.max(0, Math.floor(payload.totalXp ?? payload.weeklyXp)),
        streakDays: Math.max(0, Math.floor(payload.streakDays)),
        completedLessons: Math.max(0, Math.floor(payload.completedLessons ?? 0)),
        topL1Mistakes: payload.topL1Mistakes.slice(0, 6),
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      cohortCode?: string | null;
      updatedAt?: string;
      errorCode?: string;
    } | null;

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        errorCode: data?.errorCode || 'SERVER_ERROR',
      };
    }

    return {
      ok: true,
      cohortCode: data.cohortCode ?? entitlement.cohortCode,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return { ok: false, errorCode: 'NETWORK_OFFLINE' };
  }
}

/**
 * Fetches the cohort student roster for verified `academy_teacher` devices.
 * Makes ZERO network calls for `free`, `pro`, or `academy_student` users.
 */
export async function fetchTeacherCohortRoster(options?: {
  fetchImpl?: typeof fetch;
  storage?: Storage | null;
}): Promise<CohortRosterResult> {
  const entitlement = loadCachedEntitlement(options?.storage);
  if (!hasAcademyTeacherAccess(entitlement)) {
    return { ok: false, skipped: true, students: [], errorCode: 'NOT_ACADEMY_TEACHER' };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, students: [], errorCode: 'NETWORK_OFFLINE' };
  }

  const fetchFn = options?.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    return { ok: false, students: [], errorCode: 'NETWORK_OFFLINE' };
  }

  try {
    const deviceId = getOrCreateDeviceId(options?.storage);
    const response = await fetchFn(
      `/api/entitlements/cohort-roster?deviceId=${encodeURIComponent(deviceId)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      cohortCode?: string | null;
      label?: string | null;
      students?: CohortStudentSummary[];
      fetchedAt?: string;
      errorCode?: string;
    } | null;

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        students: [],
        errorCode: data?.errorCode || 'SERVER_ERROR',
      };
    }

    return {
      ok: true,
      cohortCode: data.cohortCode ?? entitlement.cohortCode,
      label: data.label ?? entitlement.label ?? null,
      students: Array.isArray(data.students) ? data.students : [],
      fetchedAt: data.fetchedAt ?? new Date().toISOString(),
    };
  } catch {
    return { ok: false, students: [], errorCode: 'NETWORK_OFFLINE' };
  }
}
