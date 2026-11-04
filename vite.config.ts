import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = process.env.CAPACITOR_BUILD === 'true' ? './' : (process.env.VITE_BASE ?? '/');

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = command === 'serve';

  if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  if (!process.env.GEMINI_MODEL && env.GEMINI_MODEL) {
    process.env.GEMINI_MODEL = env.GEMINI_MODEL;
  }

  const devPlugins = [];
  if (isDev) {
    const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl');
    const { default: geminiHandler } = await import('./api/gemini.js');
    const { default: ttsHandler } = await import('./api/tts.js');
    const { default: agentHandler } = await import('./api/agent.js');
    const { default: feedbackHandler } = await import('./api/feedback.js');
    devPlugins.push(
      basicSsl(),
      {
        name: 'local-gemini-api',
        configureServer(server: any) {
          server.middlewares.use('/api/gemini', geminiHandler);
          server.middlewares.use('/api/tts', ttsHandler);
          server.middlewares.use('/api/agent', agentHandler);
          server.middlewares.use('/api/feedback', feedbackHandler);
        },
      }
    );
  }

  return {
    base: BASE,
    plugins: [
      react(),
      ...devPlugins,
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          id: BASE,
          name: 'Thinking Bridge',
          short_name: 'Thinking Bridge',
          description: 'Learn English through the structure of Arabic.',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#0A0E13',
          background_color: '#0A0E13',
          categories: ['education'],
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
          navigateFallback: `${BASE}index.html`,
          navigateFallbackDenylist: [/^\/apk/, /^\/download/, /^\/api/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            { urlPattern: ({ url }) => url.hostname === 'generativelanguage.googleapis.com', handler: 'NetworkOnly' },
            {
              urlPattern: ({ url }) =>
                url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/framer-motion')
            ) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/@google/genai')) {
              return 'gemini-sdk';
            }
            if (id.includes('node_modules/@capacitor')) {
              return 'capacitor-vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('src/data/') || id.includes('src/utils/arabicWordLexicon')) {
              return 'curriculum-data';
            }
          },
        },
      },
    },
    resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
    server: { port: 3000, strictPort: true },
  };
});
