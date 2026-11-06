# Changelog

## [4.0.2] - 2026-11-06

### Claim Truth & Release Alignment Pass
- **Landing Page Alignment:** Corrected language list to match supported targets (removed Turkish/Korean, added Portuguese/Hindi), updated CEFR claim to A0-A2, and reconciled Gemini Flash model references.
- **Onboarding Placement Streamlining:** Simplified onboarding placement modal to 3 transparent steps (native dialect, target language, and goal preference) with explicit curriculum disclosure.
- **Zero Telemetry Verification:** Confirmed full removal of `@vercel/analytics` and validated strict offline/local-first data policies.
- **Android Asset Sync:** Built and synced Capacitor Android assets with verified CSP meta headers and relative asset paths.

## [4.0.1] - 2026-11-06

### Android & Release Readiness Hotfix
- Removed `@vercel/analytics` dependency (honoured "zero telemetry" claim on Android + web).
- Corrected German / Japanese prebuilt deck attribution to handcrafted CC0 1.0.
- Restored meta CSP in `index.html` (Capacitor WebView previously had no CSP).
- Documented Vercel CDN ACAO-* as accepted risk.
- Added deployment policy + branch protection guide.

## [4.0.0] - 2026-11-05

### Major Release & Edge Refinements
- **RTL & Typography Fixes:** Implemented correct line-height globally (`1.8`) for Arabic UI to prevent diacritic clipping, and enforced consistent RTL mirroring via `i18next` integration across standard components.
- **Safe Area Insets:** Refined iOS and Android physical notch avoidance using `env(safe-area-inset)` utilities directly mapped to structural wrappers.
- **Hardcoded Strings Purge:** Relocated remaining hardcoded interface text (e.g., `ErrorBoundary`, `PwaInstallBanner`) into structured JSON translation scopes.
- **Android CI/CD Automation:** Bumped internal version mapping to `versionCode 401` and synchronized `versionName` to `4.0.0`. Hardened `.github/workflows/ci-release.yml` to fail tag builds when Android signing secrets are absent.

## [3.2.1] - 2026-11-04

### Security & Infrastructure
- **Serverless Discord Feedback Loop**: Reinforced `/api/feedback` and `/api/review` serverless endpoints with CORS preflight handling and strict IP rate limiting.
- **Production Domain Alignment**: Configured `https://tb-eg.vercel.app` as the primary production API base URL and fallback CORS origin across all serverless API handlers (`agent.js`, `gemini.js`, `tts.js`, `middleware.ts`).
- **Zero-Secret Client Bundles**: Purged client-side webhook environments and secured all webhook tokens in git-ignored `.env` variables.

### UI & Accessibility
- **WCAG AA Color Palette**: Verified high-contrast typography (`Readex Pro`) and adaptive themes (Midnight Dark & Clean Slate Light) for learners of all ages.
- **Game-First Progression**: Reinforced instant +100 XP rewards, Streak Shield 🛡️ protection, Variable-Ratio Mystery Chests 🎁, and hands-free voice AI practice.

## [3.2.0] - 2026-03-30 (Masterpiece Release)

### Added
- **Multi-Language Profile Combinatorics Engine (`profileMatcherEngine.ts`)**: Supports all 16 language/dialect codes (`en`, `ar`, `arz`, `apc`, `afb`, `ary`, `de`, `ja`, `es`, `fr`, `it`, `pt`, `ru`, `zh`, `hi`, `el`), generating $16 \times 15 = 240$ directional language pairs $\times 6$ focus areas = 1,440 profiles.
- **Universal N-by-N Dictionary Pivot Bridge**: Pivot-indexes target dictionaries against English glosses offline (`buildLanguagePairLexicon`).
- **CEFR Progression Sorter (`cefrSorter.ts`)**: Assigns frequency-based CEFR levels (`A0`–`C2`) with survival word overrides and cognate similarity boosting.
- **Bulk Kaikki Dictionary Ingestion Pipeline (`scripts/ingest-dictionaries.mjs`)**: Streamlined pipeline ingesting structured Kaikki Wiktionary dumps for 15 target languages and Arabic dialects.
- **Vercel Serverless Feedback & Review Proxies (`api/feedback.ts`, `api/review.ts`)**: Rate-limited, sanitized serverless proxies forwarding to Discord webhooks without exposing webhooks in client app bundles.
- **App Reviews Tab & Sharing Utils**: Native sharing with WhatsApp fallback and interactive reviews modal/tab.

### Fixed
- Removed hardcoded Discord webhook URLs from client-side source code.
- Resolved build file size thresholds for offline PWA precaching.
- Fixed procedural 100-lesson engine generation for non-English source languages.
