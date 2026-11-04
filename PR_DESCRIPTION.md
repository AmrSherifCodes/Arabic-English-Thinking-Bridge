# Pull Request: v3.2.0 Masterpiece Release (Stabilize ➔ Wire ➔ Polish ➔ Ship)

## Summary of Changes
1. **Security & Vercel Proxies**:
   - Removed hardcoded Discord webhooks from client-side files.
   - Added rate-limited, sanitized Vercel serverless proxy handlers (`/api/feedback` and `/api/review`).

2. **Multi-Language Profile Combinatorics & Ranking Engine**:
   - Implemented `src/progression/profileMatcherEngine.ts` modeling 16 languages/dialects ($240$ directional pairs $\times 6$ focus tracks = 1,440 profiles).
   - Implemented Universal N-by-N Pivot Dictionary Bridge (`buildLanguagePairLexicon`) pivoting non-English source languages through English glosses offline.

3. **CEFR Sorter & Ingestion Pipeline**:
   - Created `src/progression/cefrSorter.ts` implementing `assignCEFRLevels()` with frequency rank mapping (`A0`–`C2`), survival word overrides, and Levenshtein cognate similarity boosting ($\ge 0.72$).
   - Created `scripts/ingest-dictionaries.mjs` ingesting Kaikki Wiktionary dumps for 15 target languages and Arabic dialects.

4. **UX & Reviews**:
   - Refactored language selection into a 2-step wizard.
   - Added `ReviewModal`, `ReviewTab`, and native `shareUtils`.

## Test Results
- `npm test` passed 100% (190 / 190 tests passed).
- `npm run build` Vite production build succeeded in 3.56s.
- `npx cap sync android` synced in 0.26s.
- Gradle `:app:assembleDebug` built successfully.
