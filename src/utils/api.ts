import { Capacitor } from '@capacitor/core';

export const REMOTE_API_BASE_URL = 'https://arabicenglishthinkingbridge.vercel.app';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return REMOTE_API_BASE_URL;
  if (Capacitor.isNativePlatform()) return REMOTE_API_BASE_URL;

  // If running directly on any production Vercel domain or localhost, use relative paths
  if (typeof window.location !== 'undefined') {
    const host = window.location.hostname || '';
    if (host.endsWith('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }

  // In local development (localhost), Android Capacitor, PWA, or other hostings:
  return REMOTE_API_BASE_URL;
}

export const API_BASE_URL: string = getApiBaseUrl();
