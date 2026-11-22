// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.
/** Voluntary InstaPay & PayPal support config — single source of truth. Never gates any feature. */
export const INSTAPAY_IPA = 'amrsherifabdelaal1@instapay';
export const INSTAPAY_LINK = '';
export const PAYPAL_URL = 'https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ';
export const PAYPAL_QR_PATH = '/paypal-qr.png';
export const GITHUB_REPO_URL = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge';

const ALLOWED_INSTAPAY_HOSTS = ['ipn.eg', 'instapay.eg'];
const ALLOWED_PAYPAL_HOSTS = ['www.paypal.com', 'paypal.com'];
const PAYPAL_NCP_PATH_RE = /^\/ncp\/payment\/[A-Za-z0-9_-]+\/?$/;

/** Returns the link only if it is a well-formed https URL on an official InstaPay host; otherwise null. */
export function getSafeInstapayLink(link: string): string | null {
  const trimmed = (link ?? '').trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    const ok = ALLOWED_INSTAPAY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Returns the link only if it is a well-formed https PayPal NCP payment URL
 * (`https://www.paypal.com/ncp/payment/...` or `https://paypal.com/ncp/payment/...`);
 * otherwise returns null. Defaults to validating `PAYPAL_URL`.
 */
export function getSafePaypalLink(link: string = PAYPAL_URL): string | null {
  const trimmed = (link ?? '').trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password || url.port) return null;
    if (url.search || url.hash) return null;
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_PAYPAL_HOSTS.includes(host)) return null;
    if (!PAYPAL_NCP_PATH_RE.test(url.pathname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
