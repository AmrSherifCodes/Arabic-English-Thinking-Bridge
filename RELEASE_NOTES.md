# Thinking Bridge v4.2.0 — Release Notes

### Think in the language. Don't translate it.

Thinking Bridge v4.2.0 brings dynamic exercise randomization, an upgraded topic-aware on-device vector artwork engine, and UI alignment refinements across all CEFR levels.

---

## 🚀 What's New in v4.2.0

- **🔀 Randomized Exercise Order**: Every lesson session now automatically shuffles exercise order upon start, preventing repetitive first-exercise loops across sessions.
- **⚡ On-Demand Shuffle Control (`🔀`)**: Added an interactive exercise randomization button in the header of `LessonRunner` and `LessonView` with haptic/audio feedback.
- **🎨 Topic-Aware On-Device Scene Engine**:
  - Automatically generates rich 3D vector SVG illustrations matching the exact subject of each exercise (Firefighter, Doctor/Hospital, Architect/Engineer, Programmer/AI, Pilot/Aviation, Chef/Culinary, Police/Law, Athlete/Sports, Teacher/Education, Space, Weather, Business, Science, and Arts).
  - Features hero character badges flanked by contextual accessory badges, dynamic gradient backdrops, and glowing aura filters.
  - Displays a live Grammar Structure Pattern pill tag (`Subject ➔ Copula ➔ Noun/Adj`, `Modal Verb ➔ Action`, `Conditional Clause`, `Phrasal Verb`, etc.).
- **⚡ 100% On-Device & Zero Asset Weight**: All vector graphics generate locally in 0ms without any network requests or external API calls, adding 0 MB to the app installation size.
- **🎯 Randomized Evaluation Tests**: Placement tests, level capstones, and phase mastery checks now shuffle exercise pools dynamically on each attempt.

---

## 🛠️ UI & Stability Fixes

- **Landing Page Collision**: Resolved static fallback HTML layout bleed under SPA mounts in `index.html` and `main.tsx`.
- **Level Visual Aspect Ratio**: Updated `LevelVisualIllustration` container to `aspect-[400/220]` and `object-contain`, preserving full top badge rendering (`A1 · المستوى 1` and `⚡ Pyodide/Local`) without edge clipping.
- **Build & Test Verification**: Clean compilation, type verification, and production Vite bundling.

---

## 📜 Constitution

- **100% Offline-First**: All core learning modules, flashcards, SRS scheduling, TTS capabilities, and vector artwork generation function completely offline.
- **Radical Privacy**: Zero telemetry, zero tracking scripts, zero third-party profiling, and zero user account mandates. All data stays strictly on-device.

---

## 📦 Downloads & Artifacts

- **Android APK**: `https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.2.0/Thinking-Bridge-v4.2.0.apk`
- **Web App**: [https://tb-eg.vercel.app](https://tb-eg.vercel.app)
- **Source Code**: Available on GitHub (`v4.2.0`)

---
*Built in Alexandria, Egypt by Amr Sherif Abdelaal. Open source & free forever.*
