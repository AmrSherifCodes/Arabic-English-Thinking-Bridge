# Thinking Bridge (جسر التفكير) — Architecture Quick-Map (v10.4)

> **100% Free · Offline-First Cognitive Language Bridge** (`tb-eg.vercel.app` & Android `com.amrsherif.thinkingenglish`)
> Arabic-first, RTL-native, Midnight Navy (`#0B1120`) + AMOLED Obsidian (`#05070B`) UI with Auto-Lite hardware scaling for 2–3 GB RAM Android phones.
> **100% Quran-free APK**: Only includes the external `quranhifz://open` launcher card on `LaunchGateScreen`.

---

## Folder Map

| Directory | Purpose | Key Files |
| :--- | :--- | :--- |
| **`src/app/`** | Modular App Shell & Navigation (extracted from `src/App.tsx`) | `useAppNavigation.ts` (routes, tabs, scroll-to-top, Android back button, modal state), `TopScoreboardBar.tsx` (3-item 56px HUD), `ShellChrome.tsx` (Desktop sidebar, Mobile 4-tab dock, Arcade tab), `DictionaryView.tsx` (deduplicated offline dictionary + `🐢 0.75x`), `LazyRouteOverlays.tsx` (code-split routes & modals) |
| **`src/engine/`** | Offline cognitive & translation engines | On-device translator orchestration (ML Kit Native + Local Dictionary + Phrasebook fallback), spaced repetition (SM-2) & scoring |
| **`src/progression/`** | CEFR Pre-A0 → C1 curriculum engine | `cefrHierarchy.ts` (lazy-preloads B2/C1 flagship modules), `courseData.ts`, `engine.ts` (streaks & shields), `migration.ts`, `types.ts` |
| **`src/data/`** | Flagship datasets & lazy dictionaries | `languages.ts`, `b2c1FlagshipModules.ts` *(lazy)*, `travelSprintData.ts` *(lazy)*, `travelScenariosData.ts` *(lazy)*, `dictionaries/` *(split per language)* |
| **`src/components/`** | Core UI, modals, & progression views | `LaunchGateScreen.tsx`, `UserSetupModal.tsx`, `LevelSwitcherSheet.tsx`, `DialectModePopover.tsx`, `LiveTranslatorModal.tsx` *(lazy)*, `TravelSprintModal.tsx` *(lazy)*, `TravelScenariosModal.tsx` *(lazy)*, `WordBankModal.tsx` *(lazy)*, `progression/{PathView,PracticeHubView,QuestsView,LeagueView,ProfileView,LessonRunner}.tsx` |
| **`src/features/`** | Feature verticals (loaded on demand) | `gamification/` (`LightningBlitzModal`, `economy.ts`, `themeStore.ts`), `voice/`, `flashcards/`, `corporate/`, `exam/`, `preferences/`, `studio/` |
| **`src/native/`** | Capacitor native bridge wrappers | `localTranslator.ts` (calls Android `LocalTranslatorPlugin.java` ML Kit Translate) |
| **`src/utils/`** | Lightweight runtime utilities | `devicePerf.ts` (Auto-Lite `deviceMemory <= 3` / `prefers-reduced-motion` + `fireSafeConfetti`), `travelSprintProgress.ts` (tiny localStorage badge state), `dailySelfBattle.ts`, `wordBank.ts`, `guideMode.ts`, `uiMode.ts` |
| **`android/`** | Capacitor Android native project | `app/build.gradle` (`arm64-v8a` + `armeabi-v7a`, `minifyEnabled`, `shrinkResources`, `useLegacyPackaging = true`), `LocalTranslatorPlugin.java`, `MainActivity.java` |
| **`api/`** | Optional Vercel serverless endpoints | `leaderboard.ts` (Supabase global leaderboard), `gemini.js`, `tts.js` |
| **`supabase/migrations/`** | Postgres SQL migrations (Supabase) | `20261126_v10_leaderboard.sql` |

---

## Core Boot & Performance Rules (V11+ Ready)

1. **Zero Boot Bloat**: Keep `src/App.tsx` (~350 lines) as a pure shell coordinator. Never statically import heavy modals or large datasets (`b2c1FlagshipModules`, `travelSprintData`, `travelScenariosData`) in `App.tsx` — always route through `LazyRouteOverlays.tsx` or dynamic `import()`.
2. **Inline Skeletons Only**: Lazy `Suspense` fallbacks use lightweight Midnight Navy cards (`InlineFallback`) — never full-screen dark splash blockers.
3. **Auto-Lite Hardware Diet**: `initDevicePerf()` detects `navigator.deviceMemory <= 3`, `hardwareConcurrency <= 4`, or `prefers-reduced-motion: reduce`, setting `data-perf="lite"` on `<html>` to disable heavy CSS blurs/shadows and throttle confetti via `fireSafeConfetti()`.
4. **Workbox Precache Budget**: `dist/sw.js` precaches only the core shell (`< 1.5 MB`) while dictionaries and lazy chunks cache at runtime (`CacheFirst`).
5. **Android Release Build**: Always verify with `npx tsc --noEmit && npm test && npm run build:android && npx cap sync android` followed by `.\gradlew.bat assembleRelease copyFinalApk`.
