# 🚀 Thinking Bridge (فكّر إنجليزي) v4.0.0 — The Ultimate Duolingo-Style Arabic-First Evolution

> **Master English the Smart Way. Learn Egyptian Arabic the Real Way.**  
> *100% Free Forever · 100% Ad-Free · 0% App Store Fees · Dual-Layer Encryption & Local-First Privacy.*

---

## 🌟 What's New in Release v4.0.0

### 🗺️ 1. Duolingo-Style Interactive CEFR Learning Path (A0 - C2)
* **7 Stage CEFR Progression Map (A0 Starter to C2 Native Mastery)**: Navigate interactive stage units with Crown Levels (1–5) that unlock progressive sentence variants and deeper cognitive challenges.
* **Interactive Lesson Runner with Instant "WHY" Rule Explanations**: 5-8 short exercises per session with structure builders, drag-and-drop word chips, instant rule breakdowns, and celebratory confetti.
* **5 Cognitive Skill Axes**: Real-time 5-axis tracking (`Structure`, `Vocabulary`, `Listening`, `Speaking`, `Writing`) visualized with a pure SVG Radar Chart on your profile.

### 🧠 2. Ultra-Lean Single-Row User State Architecture & Local-First Sync
* **1 Row Per User State Compaction (<= 64 KB)**: Replaced thousands of per-card database rows with a unified, high-speed JSON state payload (`public.user_state`).
* **Absolute Local-First Privacy**: Unauthenticated guest users make **ZERO network or database calls**. All progress stays 100% private on your device until optional sign-in.
* **Smart Sign-In Merge Engine**: Merges local guest progress seamlessly on sign-in (XP additive, completed lessons union, latest streak preserved).
* **Debounced Background Sync & Offline Queue**: Auto-syncs batched changes at lesson end and app backgrounding with exponential backoff retries and a real-time status indicator.

### ⚡ 3. Tailored Experience & Personalization Options
* **Theme System (Dark Default & Light Mode)**: Toggle seamlessly between dark navy (`#0B1324`) and high-contrast light mode with WCAG 2.1 AA certified contrast ratios.
* **Custom Free Gemini API Key Input**: Enter your own free Gemini key from Google AI Studio in Settings for unlimited, priority AI response times.
* **Daily SRS Capping**: Spaced repetition daily review queue capped to manageable daily limits (30 cards/day) so you never feel overwhelmed by large dictionaries.
* **Egyptian Ammiya vs. MSA Dialect Focus**: Tailor vocabulary & voice practice to real-life Egyptian street communication or formal academic MSA.

### 🏆 4. Safe Anonymous Leagues & Daily Quests
* **Honest Competition (No Fake Bots)**: Weekly anonymous leagues activate cleanly when 5 real learners join, featuring Bronze through Diamond tiers.
* **Daily & Weekly Quests**: Earn XP rewards for completing lessons, practicing voice, and reviewing flashcards.

---

## 🔒 Security & Privacy Audit Summary
* **Content Security Policy (CSP)**: Disallows `unsafe-inline` in `script-src` and executes nonces via `public/theme-init.js`.
* **Database RLS & Quota Safeguards**: Row Level Security enabled across all Supabase tables with server-side service role key daily quotas (`ai_quotas`).
* **GPG Encrypted Database Backups**: Automated GitHub Actions backup workflow executes `pg_dump` and encrypts output with symmetric GPG passphrases before storing private 30-day artifacts.

---

## 📱 Supported Platforms & Download Links
* **Web & PWA**: [https://tb-eg.vercel.app](https://tb-eg.vercel.app)
* **Android APK**: Download signed release `app-release.apk` directly from Assets below.

*Copyright (c) 2024-Present Amr Sherif Abdelaal (Amr Sherif). All Rights Reserved.*
