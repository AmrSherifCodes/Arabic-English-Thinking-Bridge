import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = process.env.VITE_BASE ?? '/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: BASE,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          id: BASE,
          name: 'Thinking Bridge',
          short_name: 'Thinking Bridge',
          description: 'Learn English through the structure of Arabic.',
          lang: 'en',
          dir: 'ltr',
          start_url: BASE,
          scope: BASE,
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          categories: ['education'],
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: `${BASE}index.html`,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            { urlPattern: ({ url }) => url.hostname === 'generativelanguage.googleapis.com', handler: 'NetworkOnly' },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? env.VITE_GEMINI_API_KEY ?? ''),
    },
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
