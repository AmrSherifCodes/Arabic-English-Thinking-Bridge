export const ERROR_LOG_STORAGE_KEY = 'tb.errorLog.v1';
export const ERROR_PROMPT_DISMISSED_KEY = 'tb.errorLog.dismissedId.v1';
export const ERROR_LOG_UPDATED_EVENT = 'tb:error-log-updated';
export const MAX_ERROR_LOG_ENTRIES = 15;
export const APP_VERSION = '8.0.0';

export type ErrorSource = 'react' | 'window.onerror' | 'unhandledrejection' | 'manual';

export interface SanitizedErrorEntry {
  id: string;
  timestamp: string;
  source: ErrorSource;
  message: string;
  stack: string;
  appVersion: string;
  route: string;
  viewportWidth: number;
  theme: string;
  perfMode: string;
}

export interface DiagnosticReportPayload {
  appVersion: string;
  generatedAt: string;
  platform: string;
  viewportWidth: number;
  route: string;
  theme: string;
  perfMode: string;
  errors: SanitizedErrorEntry[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RecordErrorInput {
  message: string;
  stack?: string;
  source?: ErrorSource;
  route?: string;
  viewportWidth?: number;
  theme?: string;
  perfMode?: string;
}

const MAX_MESSAGE_LENGTH = 300;
const MAX_STACK_LENGTH = 900;
const MAX_ROUTE_LENGTH = 120;

export function sanitizeDiagnosticText(input: unknown, maxLength = MAX_MESSAGE_LENGTH): string {
  const raw = typeof input === 'string' ? input : input == null ? '' : String(input);
  let scrubbed = raw
    // Emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    // Discord webhook URLs
    .replace(/https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[^\s"'`]+/gi, '[REDACTED_WEBHOOK]')
    // JWTs
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{5,}/g, '[REDACTED_JWT]')
    // Bearer tokens
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    // Google API keys / common token prefixes
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_KEY]')
    .replace(/\b(?:sk|pk|rk|ghp|gho|xox[baprs])_[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_TOKEN]')
    // Sensitive query parameters
    .replace(/([?&](?:token|key|api_key|apikey|secret|password|pin|auth|code|email)=)[^&\s"'`]+/gi, '$1[REDACTED]')
    // Key-value secrets / PINs / recovery codes
    .replace(
      /(\b(?:pin|password|passwd|secret|token|apikey|api_key|authorization|recoveryCode|recovery_code|voucher)\b\s*[:=]\s*["']?)[^\s"',;}\]]+/gi,
      '$1[REDACTED]'
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (scrubbed.length > maxLength) {
    scrubbed = `${scrubbed.slice(0, Math.max(0, maxLength - 1))}…`;
  }
  return scrubbed;
}

export function sanitizeStackTrace(input: unknown, maxLength = MAX_STACK_LENGTH): string {
  const raw = typeof input === 'string' ? input : '';
  if (!raw.trim()) return '';
  const lines = raw
    .split(/\r?\n/)
    .slice(0, 8)
    .map((line) =>
      sanitizeDiagnosticText(
        line.replace(/\?[^\s):]+/g, ''),
        180
      )
    )
    .filter(Boolean);
  const joined = lines.join('\n');
  if (joined.length > maxLength) {
    return `${joined.slice(0, Math.max(0, maxLength - 1))}…`;
  }
  return joined;
}

export function sanitizeRoute(pathname?: string): string {
  let raw = pathname;
  if (raw === undefined && typeof window !== 'undefined' && window.location) {
    raw = window.location.pathname || '/';
  }
  const withoutQuery = (raw || '/').split(/[?#]/)[0] || '/';
  return sanitizeDiagnosticText(withoutQuery, MAX_ROUTE_LENGTH) || '/';
}

function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Ignore restricted storage environments
  }
  return null;
}

function detectEnvironmentSnapshot() {
  let viewportWidth = 0;
  let theme = 'default';
  let perfMode = 'unknown';
  let platform = 'web';

  try {
    if (typeof window !== 'undefined') {
      viewportWidth = Number.isFinite(window.innerWidth) ? Math.round(window.innerWidth) : 0;
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      const el = document.documentElement;
      theme = sanitizeDiagnosticText(
        el.getAttribute('data-theme') || el.dataset?.theme || (el.classList.contains('light') ? 'light' : 'dark'),
        40
      ) || 'default';
      perfMode = sanitizeDiagnosticText(el.getAttribute('data-perf') || el.dataset?.perf || 'rich', 20) || 'rich';
    }
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/android/i.test(ua)) platform = 'android-web';
      else if (/iphone|ipad|ipod/i.test(ua)) platform = 'ios-web';
      else if (/windows/i.test(ua)) platform = 'windows-web';
      else if (/mac/i.test(ua)) platform = 'mac-web';
    }
  } catch {
    // Ignore DOM access errors in headless/test environments
  }

  return { viewportWidth, theme, perfMode, platform };
}

function emitErrorLogUpdated(): void {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(ERROR_LOG_UPDATED_EVENT));
    }
  } catch {
    // Ignore event dispatch errors
  }
}

export function loadErrorLog(storage: StorageLike | null = getDefaultStorage()): SanitizedErrorEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(ERROR_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is SanitizedErrorEntry => typeof item === 'object' && item !== null && typeof (item as SanitizedErrorEntry).message === 'string')
      .slice(-MAX_ERROR_LOG_ENTRIES);
  } catch {
    return [];
  }
}

export function recordLocalError(
  input: RecordErrorInput,
  storage: StorageLike | null = getDefaultStorage()
): SanitizedErrorEntry {
  const env = detectEnvironmentSnapshot();
  const entry: SanitizedErrorEntry = {
    id: `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    source: input.source || 'window.onerror',
    message: sanitizeDiagnosticText(input.message || 'Unknown error', MAX_MESSAGE_LENGTH) || 'Unknown error',
    stack: sanitizeStackTrace(input.stack, MAX_STACK_LENGTH),
    appVersion: APP_VERSION,
    route: sanitizeRoute(input.route),
    viewportWidth: typeof input.viewportWidth === 'number' && Number.isFinite(input.viewportWidth)
      ? Math.max(0, Math.round(input.viewportWidth))
      : env.viewportWidth,
    theme: sanitizeDiagnosticText(input.theme || env.theme, 40) || 'default',
    perfMode: sanitizeDiagnosticText(input.perfMode || env.perfMode, 20) || 'rich',
  };

  if (storage) {
    try {
      const existing = loadErrorLog(storage);
      const next = [...existing, entry].slice(-MAX_ERROR_LOG_ENTRIES);
      storage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  emitErrorLogUpdated();
  return entry;
}

export function clearErrorLog(storage: StorageLike | null = getDefaultStorage()): void {
  if (storage) {
    try {
      storage.removeItem(ERROR_LOG_STORAGE_KEY);
      storage.removeItem(ERROR_PROMPT_DISMISSED_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  emitErrorLogUpdated();
}

export function dismissErrorPrompt(latestEntryId: string, storage: StorageLike | null = getDefaultStorage()): void {
  if (storage && latestEntryId) {
    try {
      storage.setItem(ERROR_PROMPT_DISMISSED_KEY, latestEntryId);
    } catch {
      // Ignore storage errors
    }
  }
  emitErrorLogUpdated();
}

export function hasUndismissedErrors(storage: StorageLike | null = getDefaultStorage()): boolean {
  const entries = loadErrorLog(storage);
  if (entries.length === 0) return false;
  const latest = entries[entries.length - 1];
  if (!storage) return true;
  try {
    return storage.getItem(ERROR_PROMPT_DISMISSED_KEY) !== latest.id;
  } catch {
    return true;
  }
}

export function buildDiagnosticPayload(entries?: SanitizedErrorEntry[]): DiagnosticReportPayload {
  const env = detectEnvironmentSnapshot();
  const sourceEntries = (entries && entries.length > 0 ? entries : loadErrorLog()).slice(-MAX_ERROR_LOG_ENTRIES);
  const errors: SanitizedErrorEntry[] =
    sourceEntries.length > 0
      ? sourceEntries
      : [
          {
            id: `diag_${Date.now().toString(36)}`,
            timestamp: new Date().toISOString(),
            source: 'manual',
            message: 'Manual diagnostic log submitted by user (0 recorded errors).',
            stack: '',
            appVersion: APP_VERSION,
            route: sanitizeRoute(),
            viewportWidth: env.viewportWidth,
            theme: env.theme,
            perfMode: env.perfMode,
          },
        ];

  const latest = errors[errors.length - 1];
  return {
    appVersion: APP_VERSION,
    generatedAt: new Date().toISOString(),
    platform: env.platform,
    viewportWidth: latest.viewportWidth || env.viewportWidth,
    route: latest.route || sanitizeRoute(),
    theme: latest.theme || env.theme,
    perfMode: latest.perfMode || env.perfMode,
    errors,
  };
}

export async function sendApprovedErrorReport(
  options?: {
    entries?: SanitizedErrorEntry[];
    storage?: StorageLike | null;
    fetchImpl?: typeof fetch;
  }
): Promise<{ ok: boolean; status: number; error?: string }> {
  const storage = options?.storage === undefined ? getDefaultStorage() : options.storage;
  const fetchFn = options?.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    return { ok: false, status: 0, error: 'FETCH_UNAVAILABLE' };
  }

  const entries = options?.entries ?? loadErrorLog(storage);
  const payload = buildDiagnosticPayload(entries);

  try {
    const res = await fetchFn('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      clearErrorLog(storage);
      return { ok: true, status: res.status };
    }

    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, status: res.status, error: body?.error || 'REPORT_FAILED' };
  } catch {
    return { ok: false, status: 0, error: 'NETWORK_ERROR' };
  }
}

export function installGlobalErrorHandlers(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleWindowError = (event: ErrorEvent) => {
    const message = event.error instanceof Error ? event.error.message : event.message || 'Uncaught window error';
    const stack =
      event.error instanceof Error && event.error.stack
        ? event.error.stack
        : event.filename
          ? `${event.filename}:${event.lineno || 0}:${event.colno || 0}`
          : '';
    recordLocalError({
      source: 'window.onerror',
      message,
      stack,
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : 'Unhandled promise rejection';
    const stack = reason instanceof Error ? reason.stack : '';
    recordLocalError({
      source: 'unhandledrejection',
      message,
      stack,
    });
  };

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
}
