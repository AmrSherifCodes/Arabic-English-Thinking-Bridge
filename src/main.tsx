/// <reference types="vite-plugin-pwa/client" />
import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './i18n';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

window.addEventListener('error', e => console.error('[TB_ERR]', e.message, e.filename, e.lineno));
window.addEventListener('unhandledrejection', e => console.error('[TB_PROMISE]', e.reason));

// PWA Service Worker logic for web vs native
if (!Capacitor.isNativePlatform()) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

document.documentElement.dataset.appReady = 'true';
