# DECISIONS.md — Architecture & Constitutional Trade-offs

1. **PWA Primary over APK hosting**: Due to GitHub release artifact size limits (>100MB offline dictionary chunks bundled in assets), the PWA installable web app is designated as the primary instant install channel, with local APK build instructions for Android developers.
2. **Local-First State over Cloud DB**: All XP, streaks, hearts, and SRS cards remain strictly local in localStorage and Dexie / Room database, upholding the Zero Tracking & Absolute Privacy Article 1.
3. **Safe Node Testing for Vite Environments**: Added `typeof import.meta !== 'undefined' && import.meta.env?.DEV` checks to support Node.js native test runner (`tsx --test`) without breaking Vite build optimizations.
