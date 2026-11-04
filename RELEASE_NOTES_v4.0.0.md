# فكّر إنجليزي · Thinking Bridge
# v4.0.0 — الجسر (Al-Jisr)

**Release date:** 2026-11-05
**Web App:** https://tb-eg.vercel.app
**Repository:** https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge
**Constitution:** https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/blob/main/CONSTITUTION.md

## What "Al-Jisr" means

الجسر is Arabic for *the bridge* — the thing this app has always been. Not a translation tool. A cognitive bridge between the way you already think (Arabic) and the way you want to think (English, German, Japanese, and 12 more languages).

Pre-modern Arab scholars were the world's bridge-builders: they carried Greek, Persian, and Indian thought into Arabic, refined it, and passed it to Europe through Cordoba and Toledo. This release is named for that tradition, because the goal was never "learn English." The goal was to think in English natively, the way Ibn Rushd thought in Arabic while reading Aristotle in Greek.

## What's in v4.0.0

### Fixed
- All 15 language dictionaries now correctly ship in the production bundle (confirmed live at tb-eg.vercel.app — code-split dictionary chunks)
- Boot sequence gates React DOM rendering on dictionary resolution, avoiding empty lesson states on cold start
- Canonical URLs, Open Graph tags, and JSON-LD schema corrected to `https://tb-eg.vercel.app`
- `og-image.jpg`, `sitemap.xml`, and `manifest.webmanifest` return 200 with optimized content
- Theme initialization honors OS dark/light preference when no user choice is saved
- API endpoints use allowlist CORS instead of wildcard-with-credentials
- `/api/feedback` and `/api/review` report `webhookFailed` status honestly instead of masking Discord errors

### Added
- Live audit test suite (test #8 health, test #9 webhook)
- Production build artifact assertion in CI
- Boot-time dictionary preloading with graceful fallback
- SRS card resolution now resolves to real terms from dictionaries
- `preloadDictionaries` helper for pre-fetching target languages

### Attribution
Built on the *Thinking Method* of **Mihalis Eleftheriou** and **[Language Transfer](https://www.languagetransfer.org/)** — the pedagogical foundation this project would not exist without.

Open source, CC0 1.0. No accounts. No analytics. No tracking. All progress saved locally in your browser.

صُنع في الإسكندرية، مصر
Made in Alexandria, Egypt
— Amr Sherif Abdelaal
