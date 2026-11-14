# Agent Instructions & Architecture Specification — "فكّر إنجليزي" (Arabic-English Thinking Bridge)

## Product Vision & Core Domain

**tb-eg.vercel.app** is an **offline-first Arabic → English cognitive bridge application**.

- **Core Purpose**: Helps Arabic speakers internalize English sentence structures, mental models,
  and thinking patterns, rather than literal word-by-word translation.
- **Core Loop**: `Interactive Lessons` ➔ `Smart Trainer Conversation` ➔
  `SM-2 Spaced-Repetition Review`.
- **Domain Entities**: `Lesson`, `LessonStep`, `Flashcard`, `ReviewCard`, `TrainerMessage`,
  `UserProgress`.

---

## Non-Negotiable Architecture & Stack Rules

### Android & Native Constraints

- **Language**: Kotlin only for Android native code.
- **UI**: Jetpack Compose + Material 3 (or clean Capacitor WebView bridge integration).
- **Single Source of Truth**: Local **Room Database**. UI components observe Room `Flow`s.
- **Preferences**: DataStore only.
- **Async**: Kotlin Coroutines + Flow. ViewModels expose `StateFlow<UiState>`.
- **Network / Backend**: **Offline-first by default**. Do not add Retrofit, Ktor, OkHttp, or any
  mandatory remote backend dependency by default.
- **Smart Trainer**: Fully on-device and local (rule-based / preloaded data / local engine). No
  remote LLM or cloud calls unless explicitly requested.
- **Testing**: JUnit 5 + MockK + Turbine.

### Hybrid & Multi-Platform Constraints

- **Framework**: React + Vite + TypeScript.
- **Styling**: Tailwind CSS / CSS Variables supporting dark `#0A0E13` (default) & light themes.
  Font: Readex Pro.
- **Local Vault**: `localStorage` / IndexedDB abstraction on web/hybrid, synchronized with Room
  native layer where applicable.
- **Capacitor**: Android app (`com.amrsherif.thinkingenglish`), iOS, PWA support.

---

## Landing Page Specifications (tb-eg.vercel.app)

- **RTL & AR/EN Bilingual**: Arabic-first UI with Readex Pro typography.
- **Sections**:
  1. **Nav**: Logo, subscription link, how it works, download, language toggle.
  2. **Hero**: `"مجاني · يعمل بدون إنترنت"`, `"فكّر بالإنجليزي، مش تترجم."`, phone mockup.
  3. **How It Works**: Structural mapping, trainer practice, daily SM-2 review.
  4. **Stats Strip**: 27 lessons, 4090 flashcards, 10,000+ words, 0 cost.
  5. **Subscribe**: Email input, local persistence, optional feedback hook.
  6. **Easter Egg**: Revealed only after subscription (hidden feature cards).
  7. **Download Section**: OS auto-detection (Android APK, iOS/PWA, Windows, macOS).
  8. **Footer**: Copyright (c) Amr Sherif Abdelaal.

---

## Agent Operational & Bounded Workflow Guidelines

1. **Bounded Tasks**: Split complex features into sequential steps (Data Model ➔ Pure Domain
   Algorithm ➔ Repository ➔ UI/ViewModel).
2. **Explicit Verification**: Provide runnable test plans or build instructions for every change.
3. **Domain Real Names**: Always use actual domain entity names (`Lesson`, `LessonStep`,
   `Flashcard`, `ReviewCard`, `TrainerMessage`, `UserProgress`).
4. **No Unrequested Dependencies**: Do not introduce external libraries or network calls unless
   explicitly specified in the prompt.
5. **Copyright**: All rights reserved by Amr Sherif Abdelaal.
