<div align="center">
  <h1>🌉 Thinking Bridge</h1>
  <p><strong>Master English the Smart Way. Learn Egyptian Arabic the Real Way.</strong></p>
  <p>100% Free. 100% Private. 0% App Store Fees.</p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI-orange?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square" alt="License" />
</div>

---

## 🚀 What's New in v3.0.0

- Interactive Onboarding & Adaptive Leveling Algorithm (A1 to C1)
- Sub-Second Voice Streaming with Parallel TTS Prefetch
- Native Android Haptics, Status Bar, and Keyboard integration
- Premium UI Landing Page with Creator CV and Project Constitution
- 98/98 Unit Tests Passing

## 🚀 The Mission

Most language apps charge you a monthly subscription, track your every move, and force you to learn stiff, formal textbook Arabic that nobody actually speaks in the streets. 

**Thinking Bridge is the antidote.** 

Built in a 24-hour coding marathon, this is a fully open-source, offline-first Progressive Web App (PWA) designed to bridge the gap between Arabic and English. Whether you are an Arabic speaker trying to master English for your career, or an English speaker trying to learn authentic **Egyptian Ammiya**, this app is built for you.

There are no ads, no accounts required, and no tracking. It's just you, the language, and a bridge built on code.

## ✨ Features That Slap

- 🧠 **AI Language Tutor:** Powered by Google Gemini. Ask questions about grammar, get instant translations, and practice conversations. (Runs securely through Vercel Serverless Functions).
- 🗣️ **Premium Neural Voices:** We ditched the robotic browser voices. Integrated Microsoft Edge TTS for stunning, natural-sounding audio (Salma for Egyptian Arabic, Ava for English).
- 🃏 **Anki-Style Flashcards:** Features a full Spaced Repetition System (SRS). Rate your memory (Again, Hard, Good, Easy) and let the algorithm show you words right before you forget them.
- 🎮 **Duolingo-Style Gamification:** 3D flashcard flips, bouncy buttons, confetti explosions, streak counters, and XP chests. 
- 📚 **5,299 Real Words & Phrases:** A massive, curated dictionary covering Student, Call Center, and Public Matter situations, strictly filtered by dialect (Egyptian vs. MSA).
- 📴 **True Offline Mode:** Powered by `vite-plugin-pwa` and Workbox. Install it to your home screen and use it on the subway with zero internet connection.
- 🔒 **Bulletproof Privacy:** No Google Analytics. No tracking pixels. All progress is saved locally on your device (`localStorage`).

## 📱 Building Across All Platforms

This project is built from a single codebase (React + Vite + Capacitor) targeting Web, PWA, Android, and iOS.

### 🌐 Web & PWA
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production PWA
npm run build
```

### 🤖 Android (Capacitor)
```bash
# Build web assets & sync with Capacitor Android project
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK via CLI
cd android
./gradlew assembleRelease
```

### 🍎 iOS (Capacitor)
*Note: Requires macOS with Xcode installed.*
```bash
# Add iOS platform (if not already added)
npx cap add ios

# Sync web build to iOS project
npm run build
npx cap sync ios

# Open in Xcode to build and sign for App Store / TestFlight
npx cap open ios
```

---

## 📊 Capacity & Free Tier Limits

Thinking Bridge is architected to remain **100% Free Forever** without requiring paid cloud infrastructure or surprise bills.

### Live Health & Capacity Endpoint
* Endpoint: `/api/health`
* Inspect health, server uptime, and active capacity limits.

### Free Limits to Monitor & Where to Check
1. **Supabase Database & Auth (Free Tier)**
   * **Limits**: 500 MB DB Storage, 50,000 Monthly Active Users (MAU), 5 GB Egress/month.
   * **Architecture Safeguard**: Single compact row (`public.user_state`) capped at 64 KB per user. Guests make 0 DB calls.
   * **Dashboard**: [app.supabase.com](https://app.supabase.com) ➔ Settings ➔ Usage.
2. **Google Gemini AI (Free Tier)**
   * **Limits**: 15 Requests/Minute (RPM), 1,500 Requests/Day (RPD).
   * **Architecture Safeguard**: Per-IP/User daily quotas with response caching. Users can also enter their own free Gemini key in Settings (`localStorage`). Fallbacks automatically to local offline engine.
   * **Dashboard**: [console.cloud.google.com](https://console.cloud.google.com) ➔ API & Services.
3. **Vercel Web Hosting (Free Hobby Tier)**
   * **Limits**: 100 GB Bandwidth/month, 100k Serverless Function Executions/day.
   * **Dashboard**: [vercel.com](https://vercel.com) ➔ Usage.

---

## 🔑 Required GitHub Actions Secrets

To enable automated database keep-alive pings and weekly `pg_dump` backups in GitHub Actions, add these secrets to your repository Settings ➔ Secrets ➔ Actions:
* `VITE_SUPABASE_URL`: Your Supabase project URL (e.g. `https://xxxx.supabase.co`).
* `VITE_SUPABASE_ANON_KEY`: Your Supabase public anonymous key.
* `SUPABASE_DB_URL`: Postgres connection string (e.g. `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`) for `pg_dump`.

---

## ☁️ Cloudflare Pages Hosting Portability

Thinking Bridge builds purely to static client assets in `dist/`. If you ever wish to move hosting away from Vercel to Cloudflare Pages:
1. Connect your GitHub repository in the [Cloudflare Pages Dashboard](https://dash.cloudflare.com).
2. Set Build Command to: `npm run build`
3. Set Build Output Directory to: `dist`
4. Deploy with 0 configuration needed!

---

## 🔒 Copyright & Proprietary License
All rights reserved, **Amr Sherif Abdelaal** (2024-Present). See `LICENSE` for full proprietary license terms.

---

## 🏛️ The Constitution

This project is governed by a strict [Channel Constitution](./CONSTITUTION.md). The core rules are simple:
1. **Radical openness:** Everything is open-source and free forever.
2. **Neutrality:** A refuge from internet noise.
3. **Attribution:** Credit every source loudly (Language Transfer, Wiktionary, Hugging Face).

## 🌐 Multi-Language Cognitive Architecture (v3.1.0)

Thinking Bridge supports multi-source and multi-target language immersion:

| Source / UI Language | Target Thinking Language | Pedagogical Bridge Focus | Shareable Link |
| :--- | :--- | :--- | :--- |
| 🇪🇬 **العربية (Arabic)** | 🇬🇧 **English** | Copula omission & preposition interference | `/?from=ar&to=en` |
| 🇪🇬 **العربية (Arabic)** | 🇩🇪 **Deutsch (German)** | Strict V2 verb placement & Accusative cases | `/?from=ar&to=de` |
| 🇪🇬 **العربية (Arabic)** | 🇯🇵 **日本語 (Japanese)** | SOV order, Particles (は, を, に), & Furigana | `/?from=ar&to=ja` |
| 🇬🇧 **English** | 🇩🇪 **Deutsch (German)** | V2 main clause syntax & Gender shifts | `/?from=en&to=de` |
| 🇬🇧 **English** | 🇯🇵 **日本語 (Japanese)** | SOV order & Natural pro-drop context | `/?from=en&to=ja` |

### How to Add More Languages or Exercises
1. **Curriculum Definition:** Add a new file under `src/data/curriculum/` (e.g. `frenchCurriculum.ts`). Follow the `Phase` and `Lesson` schemas with `sourceThought`, `targetSentence`, `wordChips`, and `breakdownChunks`.
2. **Registry:** Register the language pair in `src/data/curriculumRegistry.ts` inside `getCurriculum(source, target)`.
3. **Metadata:** Declare the language and pair in `src/data/languages.ts`.

---

## 🛠️ The Tech Stack

This isn't just a static site; it's a full-stack application built with modern, production-grade tools.

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion.
- **Backend & Auth:** Supabase (PostgreSQL) with Row Level Security (RLS) and JWT authentication.
- **AI:** `@google/genai` (Gemini 2.5 Flash).
- **Voice:** `voipi` (Microsoft Edge Neural TTS) with native Web Speech API fallback.
- **Hosting:** Vercel (Frontend + Serverless Functions).

## 💻 Run It Locally

Want to spin up your own version? It takes less than a minute.

1. **Clone the repo:**
   ```bash
   git clone https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge.git
   cd Arabic-English-Thinking-Bridge

## 🔒 Copyright & Proprietary License

All rights reserved, **Amr Sherif Abdelaal** (2024-Present).

This software, application codebase, and pedagogical datasets are the exclusive proprietary property of Amr Sherif Abdelaal. See `LICENSE` for full terms.

---

### Inspired By & Connect
Gratefully inspired by **Mihalis Eleftheriou** & *The Thinking Method* (Language Transfer).

**Connect with me:**
- [LinkedIn](https://www.linkedin.com/in/sciamrsherif-abdelaal/)
- [GitHub](https://github.com/AmrSherifCodes)
- [Patreon](https://www.patreon.com/c/SciAmrSherif)
- [YouTube](https://www.youtube.com/@SciAmrSherif)
- [X (Twitter)](https://x.com/SciAmrSherif)
- Email: amrsherifbusiness@gmail.com
