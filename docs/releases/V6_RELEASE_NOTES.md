# 🏎️ Thinking Bridge V6 (`v6.0.0`) — The Six-Cylinder Release

> **فكّر بالإنجليزي (والألماني والفرنساوي والإسباني والتركي) — مش تترجم. والمرة دي: محرك 6 سلندر مضبوط عالداينو.**
>
> *Naturally aspirated, 100% offline, zero ads, unlimited free hearts, and track-verified on real Android hardware.*

[![Live Web PWA](https://img.shields.io/badge/Live%20Web%20PWA-tb--eg.vercel.app-00E5FF?style=for-the-badge)](https://tb-eg.vercel.app)
[![Release](https://img.shields.io/badge/Release-V6%20(v6.0.0)-gold?style=for-the-badge)](https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0)
[![License](https://img.shields.io/badge/License-AGPLv3%20%2B%20CC%20BY--NC--SA%204.0-emerald?style=for-the-badge)](#%EF%B8%8F-3-tier-open-source-licensing)

---

## 🔥 Why "V6"?

Language apps today are sluggish, cloud-gated 3-cylinder commuters choked with ads, 5-heart paywalls, and literal translation slop.

**Thinking Bridge V6 (`v6.0.0`)** is tuned like a **balanced, naturally aspirated V6**: **6 synchronized subsystems** — covering Arabic + our Top 5 target languages (`EN`, `DE`, `FR`, `ES`, `TR`) — firing with zero lag, zero network calls, zero gloss leaks, and zero UI overflow.

---

## ⚙️ Under the Hood: All 6 Cylinders Firing in Sync

### Cylinder 1 — Top-5 Language Curriculum & Dialect Routing (`en`, `de`, `fr`, `es`, `tr`)
- Unified Arabic source normalization across **all Arabic dialect codes** (`ar`, `arz` Egyptian Arabic, `apc`, `afb`, `ary`, `ar-*`) in `curriculumRegistry.ts`, `frenchCurriculum.ts`, and `spanishCurriculum.ts`.
- Verified `arz -> en` routing directly through `PHASES_DATA`, normalized `breakdownChunks` using Arabic `sourceText`, and eliminated non-Arabic (`en`/`ru`/`zh`) leaks in `explanationAr`, `habitHintAr`, and `cefrHierarchy.ts`.
- Added dedicated multi-language pedagogy test suite: `src/utils/top5Languages.test.ts`.

### Cylinder 2 — `O(1)` Indexed Gloss Engine & Zero Wiktionary Leaks
- Replaced brute-force 50,000-entry linear dictionary scans with a cached `O(1)` lookup index (`getDictLookupMaps` in `src/utils/glossHelper.ts`), slashing full curriculum verification from **~66 seconds down to under 1 second** and eliminating main-thread UI stalls.
- Stripped Wiktionary metadata leaks (`verbal noun of`, `plural of`, `inflection of`, `diminutive of`, `alternative form of`, etc.) across `dictionaryCurriculum.ts`, `sanitizeDictionaryTranslation`, and `glossHelper.ts`.

### Cylinder 3 — Smart Dictionary `10/10` Top-1 Precision & Clean BCP-47 Audio
- Verified 10 everyday core concepts (`water`, `book`, `house`, `hello`, `thank you`, `friend`, `time`, `good`, `eat`, `go`) across **all 5 target languages** via `scoreDictionaryMatch` and `CORE_TOP5_DICTIONARY_ENTRIES` (`10/10` #1 rank).
- Exported `formatDictionaryEntryForUi` & `suppressRedundantPhonetic` (`src/data/dictionaries/index.ts`) to suppress noisy `([word])` brackets whenever phonetic text duplicates the headword.
- Enforced clean target-language audio extraction mapped strictly to valid BCP-47 locales: `en-US`, `de-DE`, `fr-FR`, `es-ES`, `tr-TR`.

### Cylinder 4 — Natural Arabic UX, RTL Mirroring & `48px+` Accessibility
- Fixed awkward prefix concatenations in `PathView.tsx` (`باللغة ...` instead of `بـ...`).
- Removed truncating ellipses on `LanguagePairBanner.tsx`, wrapped full Arabic dialect & target names cleanly, and mirrored directional flow arrows (`rotate-180`) in RTL.
- Upgraded interactive controls across `PathView.tsx`, `LanguagePairBanner.tsx`, `LanguageSelectorModal.tsx`, `LessonRunner.tsx`, `DualSpeedAudio.tsx`, `AppShell.tsx`, `PracticeHubView.tsx`, and `App.tsx` to meet `>= 48px` touch targets.

### Cylinder 5 — Live Honor 400 (`DNY-NX9`) Track Telemetry & `safeVibrate`
- Executed a full multi-language **USB WebView Chrome DevTools Protocol (CDP)** hardware sweep across `en`, `de`, `fr`, `es`, and `tr` — verifying live language switching, banner rendering, Lesson 1 submission + above-fold Arabic feedback, and Smart Dictionary Top-1 search + TTS audio.
- Added `safeVibrate` (`src/utils/fx.ts`, `LessonRunner.tsx`, `InteractiveArabicSentence.tsx`) checking `navigator.userActivation?.hasBeenActive` to eliminate Chromium WebView haptic intervention console errors completely.
- Passed **`150%` (`1.5x`) system `font_scale` stress test** with `0` horizontal overflow (`scrollWidth === innerWidth`) and `0` truncated spans.

### Cylinder 6 — Signed V6 Release (`v6.0.0` / `versionCode 6000`) & Zero-Drift Packaging
- Synchronized `v6.0.0` across Web/PWA (`package.json`, `api/health.js`, `index.html`, `public/download.html`), Capacitor Android (`versionCode 6000`, `ThinkingBridge-v6.0.0.apk`), Tauri Desktop (`Cargo.toml`, `tauri.conf.json`), and the V6 All-Socials Launch Kit (`scripts/social-posts.json`, `scripts/social-autoposter.mjs`, `src/utils/socialAutoPoster.ts`).
- Confirmed release APK cold-launch on Honor 400 with `0` crashes in `logcat` (`AndroidRuntime:E Chromium:E Capacitor:E`) and `0` open `webview_devtools_remote` sockets.

### Cylinder 7 — German V6 Immersion & Webapp Zero-Freeze Overhaul
- **German (`de-DE`) Pedagogy & Gender Cues:** Added native `de-DE` TTS routing across German lessons/flashcards, color-coded visual gender cues for German articles (`der`/`den`/`dem` sky blue, `die`/`eine`/`diese` rose, `das`/`ein`/`dieses` emerald), non-self-echoing German glosses (`glossHelper.ts`), expanded German Phase 1 Satzbau/V2/Perfekt lessons, and fixed English breakdown chunk bleed in `LessonRunner.tsx`.
- **Zero-Freeze Startup & Core Shell PWA:** Removed eager static imports of `ARABIC_DICTIONARY` (`src/data/dictionaries/index.ts`), 6 large secondary dictionaries (`src/data/curriculum/dictionaryCurriculum.ts`), and `courseData` (`src/App.tsx`), and split `dict-arabic-core` from `dict-arabic-dialects` (`vite.config.ts`). Eliminated 15.5 MB of critical-path dictionary parsing on `/` and `/app`, shrank oversized PWA icons by ~8.9 MB (`1143 KiB` precache shell), and removed Unsplash CSS URLs (`LandingPage.css`) for 0 CSP console errors.
- **`O(1)` Flashcards & Debounced Smart Dictionary:** Added `WeakMap` indexes and deferred cross-language card enrichment in `deckUtils.ts` / `useDeckEngine.ts` (eliminating >30s Master Dictionary freezes on 4,090 cards), and switched `searchTargetDictionary` / `searchTargetDictionaryAsync` to Schwartzian O(N) single-pass scoring with 150ms input debouncing in `DictionaryView`.

---

## 📊 Dyno Sheet — Verified Top-5 Language Scorecard (Honor 400 `DNY-NX9`)

| Language | BCP-47 TTS | Gloss / Grammar Leaks | Smart Dict Top-1 | Live CDP & CSP Errors | 150% Font-Scale Overflow | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **English (`en`)** | `en-US` | `0` | `10 / 10` | `0` | `0` (`false`) | **PASS** |
| **German (`de`)** | `de-DE` | `0` | `10 / 10` | `0` | `0` (`false`) | **PASS** |
| **French (`fr`)** | `fr-FR` | `0` | `10 / 10` | `0` | `0` (`false`) | **PASS** |
| **Spanish (`es`)** | `es-ES` | `0` | `10 / 10` | `0` | `0` (`false`) | **PASS** |
| **Turkish (`tr`)** | `tr-TR` | `0` | `10 / 10` | `0` | `0` (`false`) | **PASS** |

- **Automated Test Suite (`npm test`):** `100%` passing (including `top5Languages.test.ts`, `wordBankIntegrity.test.ts`, `dictionaryAudit.test.ts`, `productionReadinessAudit.test.ts`, `security.test.ts`, `socialAutoPoster.test.ts`)
- **TypeScript (`npx tsc --noEmit`):** `0` errors
- **Vitest (`npx vitest run src/utils/top5Languages.test.ts`):** `4 / 4` suites passing
- **Network / Telemetry / Ads / Paywalls:** `0` — 100% offline-first

---

## 📦 Downloads & Checksums

| Platform | Target | Integrity / Notes |
| :--- | :--- | :--- |
| **Android APK (Signed Release)** | `ThinkingBridge-v6.0.0.apk` (`versionCode 6000`) | Size: `40.51 MB` (`42,480,169 bytes`) · **SHA-256:** `8722807507461FB96EC06D3A58173772D19B1616FCA2674C1B47B792ADA5C181` |
| **Web App / Offline PWA** | [https://tb-eg.vercel.app](https://tb-eg.vercel.app) | Installable via Chrome / Safari / Edge "Add to Home Screen" |
| **Quick Download Portal** | [https://tb-eg.vercel.app/apk](https://tb-eg.vercel.app/apk) | 30-second bilingual onboarding guide |

> **🔍 Verify before installing (`PowerShell`):**
> ```powershell
> Get-FileHash .\ThinkingBridge-v6.0.0.apk -Algorithm SHA256
> ```
> **🛡️ VirusTotal:** Scan `ThinkingBridge-v6.0.0.apk` or verify the SHA-256 above directly at [virustotal.com](https://www.virustotal.com).

---

## 🇪🇬 النسخة المختصرة بالعربي (Thinking Bridge V6)

تحديث **V6 (`v6.0.0`)** هو أقوى ضبط ميكانيكي لتطبيق **فكّر إنجليزي (Thinking Bridge)** لحد النهاردة:
- ✅ **أهم 5 لغات موثقة بالكامل** (الإنجليزي، الألماني، الفرنساوي، الإسباني، والتركي) لكل اللهجات العربية بما فيها العامية المصرية (`arz`).
- ✅ **صفر أخطاء في شروحات القواعد والترجمة الفورية** مع تسريع محرك البحث في القاموس لـ **`O(1)`** (أقل من ثانية بدل 66 ثانية).
- ✅ **القاموس الذكي 10/10 في النتيجة الأولى** مع إزالة أي تكرار صوتي مزعج ونطق سليم بلهجة كل لغة.
- ✅ **متجرب على الموبايل الحقيقي (Honor 400)** بدون أي تقطيع أو خروج عن الشاشة حتى مع تكبير خط النظام **150%**.
- ✅ **100% بدون إنترنت · بدون إعلانات · بدون قلوب (`∞`) · مجاني ومفتوح المصدر**.

---

## ❤️ Support & Community (100% Optional — Nothing Is Ever Paywalled)
- **YouTube (Physics, AI & EdTech):** [@SciAmrSherif](https://youtube.com/@SciAmrSherif)
- **LinkedIn:** [Amr Sherif Abdelaal](https://linkedin.com/in/sciamrsherif-abdelaal)
- **PayPal:** [paypal.com/ncp/payment/TXQB2CWGRV5ZQ](https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ)
- **InstaPay (Egypt):** `amrsherifabdelaal1@instapay`

---

## 🛡️ 3-Tier Open Source Licensing
- **Software Source Code:** GNU Affero General Public License v3 (`AGPL-3.0-or-later`)
- **Educational Content (Lessons, Flashcards, Curricula):** Creative Commons `CC BY-NC-SA 4.0`
- **Brand & Trademarks:** `Thinking Bridge™`, `Thinking English™`, `فكّر إنجليزي™`, and associated logos reserved by **Amr Sherif Abdelaal** (Alexandria, Egypt 🇪🇬).
- **Pedagogical Inspiration:** Mihalis Eleftheriou & [Language Transfer](https://www.languagetransfer.org/) · Lexical data via Kaikki.org / Wiktionary (`CC BY-SA 4.0`).
