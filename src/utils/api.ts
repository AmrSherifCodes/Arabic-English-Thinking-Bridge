import { Capacitor } from '@capacitor/core';

/**
 * Base URL for API requests.
 * On native mobile platforms (Android/iOS via Capacitor), relative paths like /api/gemini
 * fail because the app runs locally from capacitor://localhost or http://localhost.
 * In native environments, this points to the hosted Vercel backend.
 * In web browsers, it stays empty ('') so existing relative proxying/routing continues working.
 */
export const API_BASE_URL: string = Capacitor.isNativePlatform()
  ? 'https://thinkingbridge.vercel.app'
  : '';

