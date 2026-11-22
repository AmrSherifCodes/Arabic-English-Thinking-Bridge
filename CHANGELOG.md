# Changelog

## [6.0.0] - V6 Edition (The Six-Cylinder Release)

### Six Cylinders Tuned & Track-Verified (Web PWA + Capacitor Android + Honor 400)
- **Cylinder 1 — Top-5 Language Viability Verified (`en`, `de`, `fr`, `es`, `tr`):** Added dedicated multi-language pedagogy and integrity suite (`src/utils/top5Languages.test.ts`), normalized Arabic dialect routing (`ar`, `arz`, `apc`, `afb`, `ary`, `ar-*`) across `curriculumRegistry.ts`, `frenchCurriculum.ts`, and `spanishCurriculum.ts`, and eliminated English/Russian/Chinese leaks in Arabic lesson hints and `cefrHierarchy.ts`.
- **Cylinder 2 — `O(1)` Gloss Lookup Engine & Zero Wiktionary Leaks:** Replaced linear 50k-entry dictionary scans with an `O(1)` indexed `getDictLookupMaps` cache in `glossHelper.ts` (cutting full curriculum verification from ~66s to `<1s`) and stripped Wiktionary metadata (`diminutive of`, `verbal noun of`, `plural of`, `inflection of`, `alternative form of`) in `dictionaryCurriculum.ts`.
- **Cylinder 3 — Smart Dictionary 10/10 Top-1 & Clean BCP-47 Audio:** Exported `scoreDictionaryMatch`, `sanitizeDictionaryTranslation`, `suppressRedundantPhonetic`, and `formatDictionaryEntryForUi` in `src/data/dictionaries/index.ts`, suppressed redundant `[word]` phonetics when identical to the headword, and verified clean target-language TTS extraction (`en-US`, `de-DE`, `fr-FR`, `es-ES`, `tr-TR`).
- **Cylinder 4 — Natural Arabic Grammar, RTL Mirroring & `48px` Touch Targets:** Fixed awkward prefix concatenation in `PathView.tsx` (`باللغة ...`), removed truncating ellipses on `LanguagePairBanner.tsx`, enforced RTL arrow direction (`rotate-180`), and upgraded interactive controls to `min-h-[48px]`.
- **Cylinder 5 — Track-Tested on Honor 400 (`DNY-NX9`) + `safeVibrate` WebView Hardening:** Passed live 5-language USB WebView CDP sweep (`0` console/page/CSP errors, `0` overflow even at `150%` `font_scale`), added `safeVibrate` checking `navigator.userActivation?.hasBeenActive` (`fx.ts`, `LessonRunner.tsx`, `InteractiveArabicSentence.tsx`), and verified `0` errors in release `logcat`.
- **Cylinder 6 — Unified V6 (`v6.0.0` / `versionCode 6000`) & All-Socials Launch Kit:** Synchronized `6.0.0` across Web/PWA, Capacitor Android (`ThinkingBridge-v6.0.0.apk`), API health, and Tauri Desktop, and expanded `scripts/social-posts.json` + `socialAutoPoster.ts` with 10 platform-ready V6 launch presets and `docs/releases/V6_RELEASE_NOTES.md`.
- **German V6 Immersion & Webapp Zero-Freeze Overhaul:** Added native `de-DE` TTS audio, color-coded visual gender cues (`der`/`die`/`das`), non-self-echoing German glosses, and expanded German Phase 1 lessons (`LessonRunner.tsx`, `germanCurriculum.ts`, `glossHelper.ts`). Eliminated 15.5 MB critical-path dictionary preloads via lazy chunking (`dictionaries/index.ts`, `dictionaryCurriculum.ts`, `vite.config.ts`, `cefrHierarchy.ts`), eliminated >30s Master Dictionary flashcards freezes with `O(1)` `WeakMap` indexes and deferred enrichment (`deckUtils.ts`, `useDeckEngine.ts`), added Schwartzian single-pass search scoring + 150ms debouncing in `DictionaryView`, shrank oversized PWA icons by ~8.9 MB, and removed CSP-blocked Unsplash CSS URLs (`LandingPage.css`).

## [5.0.0] - First Official Stable Release

### Official Stable Release & UX Rescue
- **Default Bright UI + One-Time Big `X` Supporter Popup:** Removed gloomy desaturated `tb-sad-mode` filter completely so the UI launches crisp and bright by default, backed by a one-time dismissible `@sciamrsherif` YouTube supporter popup (`YouTubeSupporterPopup.tsx`).
- **Guaranteed Word-Bank Completeness Across All 14 Languages:** Fixed punctuation-stripping and Hard-mode required-token drops (`sentenceBuilderHelper.ts`, `adaptiveCurriculum.ts`, `LessonRunner.tsx`, `courseData.ts`), fixed Turkish gloss mapping (`glossHelper.ts`) and multilingual curriculum entries, and added a 100%-curriculum word-bank integrity test (`wordBankIntegrity.test.ts`).
- **Unclipped Non-Leaking Scene Banner:** Fixed `LevelVisualIllustration` / `localLevelImageGenerator.ts` SVG aspect ratio (`400x220` `viewBox`) and suppressed target sentence rendering while the learner is answering (`revealTarget`).
- **Better-Than-Duolingo Pedagogical Upgrades (100% Offline):**
  - **Unlimited Free Hearts (`❤️ ∞`)** & **Automatic Mistake Repair Queue**: Wrong answers re-queue cleanly in-session until mastered—zero energy walls, zero ads.
  - **Free Offline L1 Cognitive Interference Coach & Word-by-Word Visual Diff (`computeSentenceDiff`, `diagnoseL1TransferHint`)**: Highlights missing/swapped words and explains English/German/Turkish L1 transfer mistakes in Arabic and English without any paid subscription.
  - **Interactive Sentence Map & Universal Keyboard Mode**: Every completed exercise reveals tap-to-hear word chips with localized glosses, contraction/umlaut-tolerant grading (`checkAnswerMatch`), Backspace/Clear controls, and Keyboard mode across both Simple and Pro layouts.
- **PayPal QR Support & Unified Cross-Platform Versioning:** Installed `public/paypal-qr.png` and synchronized `5.0.0` Official Stable across Web/PWA, Capacitor Android (`versionCode 5000`, `ThinkingBridge-v5.0.0.apk`), and Tauri Desktop (`5.0.0`).

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
