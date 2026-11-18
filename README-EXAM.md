# "اختبار يا باشا" — Gamified CEFR Exam Feature (Ya Basha Check)

**Version:** 1.0.0  
**License:** CC0 1.0 Universal - Public Domain  
**Attribution:** Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria.

---

## 1. Overview & Architecture

**"اختبار يا باشا" (Ya Basha Check)** is an offline-first, account-free, gamified CEFR assessment and practice feature built for Egyptian Arabic speakers learning **English**, **Deutsch**, and **Hebrew (עברית / عبري)**.

- **Offline-First & Account-Free**: 100% of exam state, XP, streaks, badges, and cosmetic settings live in `localStorage`.
- **Zero Remote Cloud/APIs**: No user accounts, no login, no leaderboards, no analytics, no remote LLM, no telemetry.
- **Tone**: Warm, self-deprecating, café-style Egyptian Arabic.

---

## 2. Adaptive Staircase Algorithm & Scoring

- **Starting Level**: Starts at **A2** (index 2 out of A1=1, A2=2, B1=3, B2=4, C1=5).
- **Staircase Progression**:
  - Correct answer: Moves up 1 sub-step with 50% probability or guaranteed if 2+ consecutive correct answers.
  - Incorrect answer: Moves down 1 sub-step immediately.
- **Session Duration**: 20 questions total or until 3 tea cups (lives) run out.
- **CEFR Score Estimation**: Computes the weighted median level of the last 8 questions answered (correct answers weighted 2x).

---

## 3. Supported Target Languages

1. **English (`en`)**: 40 seeded questions across A1–C1 covering grammar, vocabulary, reading, and speech listening.
2. **Deutsch (`de`)**: 40 seeded questions across A1–C1 with Egyptian Arabic explanations.
3. **Hebrew (`he`)**: 40 seeded questions across A1–C1 focused on linguistic comparative study (Arabic↔Hebrew cognates & Semitic roots).
   - **Neutrality Standard**: Strictly neutral; zero political, country, or religious references (`Israel`, `Israeli`, `إسرائيل`, `إسرائيلي`, `peace process`, `promised land`, etc.).

---

## 4. Gamification System

- **XP ("نقط" / "كرم")**: +10 per correct answer, +25 bonus for a 5-answer streak, +50 for level completion.
- **Streak ("السلسلة")**: Consecutive correct answer counter.
- **Tea Cups ("كوباية شاي")**: 3 lives per session. Decrements only on wrong answers. Session ends gracefully at 0 tea cups with "معلش يا صاحبي، الشاي خلص — بس النتيجة وصلت." (No hearts wall, no paywall).
- **Metro Progress Bar**: Horizontal Alexandrian Metro line (`الرمل` → `سيدي جابر` → `العطارين` → `محطة مصر` → `المنصورة`), reaching `القاهرة` arrival upon completing 20 questions.
- **Daily Challenge ("سؤال النهارده")**: Deterministic question selected via date string hash (`YYYY-MM-DD` + `lang`). Appears only if not completed today; awards +15 XP without consuming tea cups or altering CEFR score.
- **Badges**: Local unlockables including `first_exam`, `streak_5`, `streak_10`, `level_up`, `perfect_grammar`, `deutsch_rookie`, `hebrew_rookie`, `night_owl`, and `koshary_combo` (unlocked strictly when all 4 skills are correct in a single session).

---

## 5. Supporter Mode (cosmetic, honor-system)

Supporter Mode is a cosmetic layer for viewers who support the channel at `@SciAmrSherif`. It changes colors, adds confetti, gilds the share card, and adds the Cairo arrival flourish. It **never** changes content, difficulty, access, or results — the exam is identical whether the toggle is on or off. There is no verification, no OAuth, no YouTube API call. The app trusts the user; that trust is the feature. If you're about to add a check that gates content on `supporterMode`, re-read the Channel Constitution first.

- **Toggle Persistence**: Stored in `localStorage` as `te_exam_supporter_mode: 'on' | 'off'`.
- **Cosmetic Enhancements**:
  - Gilded share card border (`#D4A94A`) + "💚 Supporter" ribbon.
  - Zero-dependency canvas confetti burst on correct answers and Cairo arrival.
  - Gold-rimmed tea cups with steam animation.
  - Gradient track glow on the Metro progress bar.
  - Neutral Cairo skyline silhouette backdrop behind level-up toasts.
  - Animated gradient background on the result screen.
  - All animations respect `prefers-reduced-motion`.

---

## 6. Offline Share Card PNG Generator

- Uses native HTML5 Canvas API (1080x1080) to render an image containing the user's estimated CEFR grade, Can-Do statement, stats, and URL `tb-eg.vercel.app/exam`.
- Awaits `document.fonts.ready` prior to drawing to guarantee Arabic & Hebrew text rendering.
- Supports RTL text orientation (`ctx.direction = 'rtl'`).
- Zero personal data, usernames, or IPs included in exported blobs.
