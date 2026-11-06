# Measured Performance Report (v4.0)

## Critical Path Initial-Load JS & CSS Payload
Measured from `npm run build` output:
- `index.html`: 1.83 kB gzip
- `dist/assets/index-xAMVnXoH.css`: 27.28 kB gzip
- `dist/assets/index-DeQ1GR7k.js`: 85.60 kB gzip
- `dist/assets/react-vendor-DWmDzHUs.js`: 112.33 kB gzip
- **Total Initial Critical Path:** **227.04 kB gzip**

## Service Worker Precache Optimization
- **Phase 0 Baseline Precache Size:** 19,438 KiB (90 entries)
- **v4.0 Optimized Precache Size:** 14,242 KiB (79 entries)
- **Reduction:** Removed 11 unnecessary heavy entries from precaching (including dictionary JSON, wasm bundles, and preview images), delegating dictionary search data to `StaleWhileRevalidate` runtime caching under the `dictionary-runtime-cache` cache name.

## Lighthouse Benchmark
- **Lighthouse:** Not measured (no headless browser runner available in build environment).

## Code Splitting Verification
All specialized routes are lazy-loaded on demand:
- `MaintenanceGuide.js`: 1.78 kB gzip
- `PronunciationRecorder.js`: 1.15 kB gzip
- `FlashcardsView.js`: 19.32 kB gzip
- `VoicePracticeView.js`: 12.05 kB gzip
- `CorporateBridgeView.js`: 2.84 kB gzip
