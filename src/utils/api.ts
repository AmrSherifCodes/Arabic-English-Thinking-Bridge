import { Capacitor } from '@capacitor/core';

export const REMOTE_API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || 'https://amrsherif.localhost.cc';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return REMOTE_API_BASE_URL;
  if (Capacitor.isNativePlatform()) return REMOTE_API_BASE_URL;

  return window.location.origin;
}

export const API_BASE_URL: string = Capacitor.isNativePlatform()
  ? REMOTE_API_BASE_URL
  : getApiBaseUrl();
