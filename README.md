<div align="center">
  <h1>🌉 Thinking Bridge</h1>
  <p><strong>Master English the Smart Way. Learn Egyptian Arabic the Real Way.</strong></p>
  <p>100% Free. 100% Private. 0% App Store Fees.</p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI-orange?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey?style=flat-square" alt="License" />
</div>

---

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

## 🏛️ The Constitution

This project is governed by a strict [Channel Constitution](./CONSTITUTION.md). The core rules are simple:
1. **Radical openness:** Everything is open-source and free forever.
2. **Neutrality:** A refuge from internet noise.
3. **Attribution:** Credit every source loudly (Language Transfer, Wiktionary, Hugging Face).

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
