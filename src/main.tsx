/// <reference types="vite-plugin-pwa/client" />
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import './i18n';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

window.addEventListener('error', e => console.error('[TB_ERR]', e.message, e.filename, e.lineno));
window.addEventListener('unhandledrejection', e => console.error('[TB_PROMISE]', e.reason));

// Configure native Android/iOS StatusBar immediately on boot
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#06101c' }).catch(() => {});
}

// PWA Service Worker logic for web vs native
if (!Capacitor.isNativePlatform()) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

// Render React application immediately without blocking render on heavy dictionary preloads
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
document.documentElement.dataset.appReady = 'true';
const staticLanding = document.getElementById('static-landing-content');
if (staticLanding) {
  staticLanding.remove();
}
const staticIosModal = document.getElementById('ios-modal');
if (staticIosModal) {
  staticIosModal.remove();
}
