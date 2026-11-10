# Constitution — Thinking Bridge v1.0.0

> **Preamble:**  
> Thinking Bridge (`AmrSherifCodes/Arabic-English-Thinking-Bridge`) exists to deliver a free, offline-first, high-quality cognitive language learning platform for Arabic speakers to think directly in English and 10+ global target languages without internal translation. This project is built with absolute commitment to zero tracking, radical privacy, open-source accessibility, and inclusive pedagogy for learners of all ages.

---

## Article 1 — Core Principles

1. **Offline-First by Design**: Every core feature—from flashcards, CEFR progression paths, SRS SM-2 scheduling, and phonetic transliteration to offline voice recognition—must function 100% offline without requiring active internet connectivity.
2. **Zero Tracking & Absolute Privacy**: No analytics, telemetry, user accounts, or third-party tracking scripts shall ever be introduced. All user progress, custom decks, and settings remain local on the user's device.
3. **Single-File & Component Simplicity**: Core architecture maintains minimal dependency overhead, fast bundling, and instant sub-second loading across Web, PWA, Android, and Desktop platforms.
4. **Accessible & Inclusive by Default**: The UI strictly supports high-contrast dark/light themes, RTL/LTR dynamic direction, age-tailored font sizing, and full keyboard navigation with ARIA accessibility.
5. **Additive, Non-Disruptive Easter Eggs**: Hidden features and easter eggs (such as the 8-click poem and the 99-click Captain Erwin video checkpoint) must remain strictly additive, non-blocking, and per-session without disrupting core learning.
6. **Cultural Neutrality & Respect**: Pedagogy respects all Arabic dialects (Egyptian, Levantine, Gulf, Moroccan, MSA) and global target languages with warm, encouraging, non-judgmental guidance.

---

## Article 2 — Technical Constraints

1. **Zero Runtime Tracking Dependencies**: External analytics libraries, telemetry trackers, or paywall gates are strictly prohibited.
2. **Service Worker PWA Integrity**: Service worker configurations must enforce `autoUpdate`, `skipWaiting: true`, `clientsClaim: true`, and `cleanupOutdatedCaches: true` to prevent stale caching.
3. **Strict Content Security Policy (CSP)**: `script-src 'self'` without `unsafe-inline` scripts in HTML; `object-src 'none'`; `frame-ancestors 'none'`.
4. **Offline Asset Safety**: External video or heavy media assets must be embedded via lightweight non-blocking embeds or lazy fallbacks without inflating the offline app bundle.

---

## Article 3 — Decision Authority

1. **Founder & Maintainer (Amr Sherif)**: Holds final decision authority on project scope, architecture, core pedagogical principles, and official release tags.
2. **AI Agents & Automated Tools**: Authorized to refactor code, fix bugs, optimize performance, run tests, and generate build artifacts, provided no core principle in Article 1 or 2 is violated.
3. **Community Contributors**: May propose features, report issues, and submit pull requests that align with Article 1, Article 2, and the project comment policy.

---

## Article 4 — Verification & Definition of Done

Any code modification or pull request is defined as **DONE** only when:
1. All automated test suites (`npm test`) pass with zero errors.
2. The TypeScript compiler (`npm run lint`) reports 0 type errors.
3. Production web build (`npm run build`) compiles cleanly without bundle errors.
4. Offline functionality, PWA installability, and accessibility guidelines remain intact.
5. This Constitution remains unchanged or is formally updated via Article 5.

---

## Article 5 — Amendment Process

1. **Proposal & Justification**: Amendments must be proposed with explicit justification proving alignment with user privacy, accessibility, and offline pedagogy.
2. **Approval**: Require explicit approval from the project founder.
3. **Version Bump**: Upon approval, increment the version header in the file header (`# Constitution — Thinking Bridge vX.Y.Z`).
