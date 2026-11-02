import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './i18n';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// In Capacitor native WebView or during local development, unregister lingering Service Workers
// so they never trap the WebView in stale cache during development or live-reload.
if (Capacitor.isNativePlatform() || import.meta.env.DEV) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      }).catch(() => {});
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
