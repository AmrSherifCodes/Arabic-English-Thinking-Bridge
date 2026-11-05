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
    const { default: reviewHandler } = await import('./api/review.js');
    devPlugins.push(
      basicSsl(),
      {
        name: 'local-gemini-api',
        configureServer(server: any) {
          server.middlewares.use('/api/gemini', geminiHandler);
          server.middlewares.use('/api/tts', ttsHandler);
          server.middlewares.use('/api/agent', agentHandler);
          server.middlewares.use('/api/feedback', feedbackHandler);
          server.middlewares.use('/api/review', reviewHandler);
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
          name: 'Thinking Bridge · فكّر إنجليزي',
          short_name: 'فكّر إنجليزي',
          description: 'Learn English through the structure of Arabic. Offline-first cognitive language bridge.',
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
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 35 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
          globIgnores: ['assets/dict-*.js', 'assets/curriculum-core-*.js', 'assets/app-data-*.js'],
          navigateFallback: `${BASE}index.html`,
          navigateFallbackDenylist: [/^\/apk/, /^\/download/, /^\/api/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.includes('assets/dict-') || url.pathname.includes('assets/curriculum-data-') || url.pathname.includes('assets/app-data-'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'dictionary-runtime-cache',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
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
      chunkSizeWarningLimit: 8000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            const normId = id.replace(/\\/g, '/');
            if (
              normId.includes('node_modules/react/') ||
              normId.includes('node_modules/react-dom/') ||
              normId.includes('node_modules/scheduler/') ||
              normId.includes('node_modules/framer-motion')
            ) {
              return 'react-vendor';
            }
            if (normId.includes('node_modules/@google/genai')) {
              return 'gemini-sdk';
            }
            if (normId.includes('node_modules/@capacitor')) {
              return 'capacitor-vendor';
            }
            if (normId.includes('node_modules/lucide-react')) {
              return 'icons-vendor';
            }
            if (normId.includes('src/data/dictionaries/')) {
              if (
                normId.includes('arabicDictionary') ||
                normId.includes('egyptian') ||
                normId.includes('levantine') ||
                normId.includes('gulf') ||
                normId.includes('moroccan')
              ) {
                return 'dict-arabic-dialects';
              }
              if (normId.includes('germanDictionary')) return 'dict-german';
              if (normId.includes('japaneseDictionary')) return 'dict-japanese';
              if (normId.includes('spanishDictionary')) return 'dict-spanish';
              if (normId.includes('frenchDictionary')) return 'dict-french';
              if (normId.includes('chineseDictionary')) return 'dict-chinese';
              if (normId.includes('hindiDictionary')) return 'dict-hindi';
              if (normId.includes('greekDictionary')) return 'dict-greek';
              if (normId.includes('russianDictionary')) return 'dict-russian';
              if (normId.includes('italianDictionary')) return 'dict-italian';
              if (normId.includes('portugueseDictionary')) return 'dict-portuguese';
              return 'dict-other';
            }
            if (normId.includes('src/data/lessons') || normId.includes('src/data/curriculum')) {
              return 'curriculum-core';
            }
            if (normId.includes('src/data/') || normId.includes('src/utils/arabicWordLexicon')) {
              return 'app-data';
            }
          },
        },
      },
    },
    resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
    server: { port: 3000, strictPort: true },
  };
});
