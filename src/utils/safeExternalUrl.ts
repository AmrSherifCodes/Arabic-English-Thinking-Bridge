// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.
/**
 * Explicit HTTPS external URL allowlist for safe navigation and window.open calls.
 */
export const ALLOWED_EXTERNAL_HOSTS = [
  'ipn.eg',
  'instapay.eg',
  'paypal.com',
  'github.com',
  'youtube.com',
] as const;

/**
 * Checks whether a hostname matches an exact allowed domain or a direct subdomain of one.
 */
export function isAllowedExternalHost(hostname: string): boolean {
  const host = (hostname ?? '').trim().toLowerCase().replace(/\.+$/, '');
  if (!host) return false;
  return ALLOWED_EXTERNAL_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/**
 * Validates that a URL is HTTPS, has no embedded credentials or custom port,
 * and points to an explicitly allowlisted host. Returns normalized URL string or null.
 */
export function getSafeExternalUrl(rawUrl: string): string | null {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password || url.port) return null;
    if (!isAllowedExternalHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Safely opens an allowlisted HTTPS external URL in a new tab with noopener,noreferrer.
 */
export function openSafeExternalUrl(rawUrl: string): boolean {
  const safeUrl = getSafeExternalUrl(rawUrl);
  if (!safeUrl || typeof window === 'undefined') return false;
  const opened = window.open(safeUrl, '_blank', 'noopener,noreferrer');
  try {
    if (opened) {
      opened.opener = null;
    }
  } catch {
    // Ignore cross-origin opener restriction
  }
  return true;
}
