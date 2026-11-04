# Changelog

## [3.2.0] - 2026-03-30 (Masterpiece Release)

### Added
- **Multi-Language Profile Combinatorics Engine (`profileMatcherEngine.ts`)**: Supports all 16 language/dialect codes (`en`, `ar`, `arz`, `apc`, `afb`, `ary`, `de`, `ja`, `es`, `fr`, `it`, `pt`, `ru`, `zh`, `hi`, `el`), generating $16 \times 15 = 240$ directional language pairs $\times 6$ focus areas = 1,440 profiles.
- **Universal N-by-N Dictionary Pivot Bridge**: Pivot-indexes target dictionaries against English glosses offline (`buildLanguagePairLexicon`).
- **CEFR Progression Sorter (`cefrSorter.ts`)**: Assigns frequency-based CEFR levels (`A0`–`C2`) with survival word overrides and cognate similarity boosting.
- **Bulk Kaikki Dictionary Ingestion Pipeline (`scripts/ingest-dictionaries.mjs`)**: Streamlined pipeline ingesting structured Kaikki Wiktionary dumps for 15 target languages and Arabic dialects.
- **Vercel Serverless Feedback & Review Proxies (`api/feedback.ts`, `api/review.ts`)**: Rate-limited, sanitized serverless proxies forwarding to Discord webhooks without exposing webhooks in client app bundles.
- **App Reviews Tab & Sharing Utils**: Native sharing with WhatsApp fallback and interactive reviews modal/tab.

### Fixed
- Removed hardcoded Discord webhook URLs from client-side source code.
- Resolved build file size thresholds for offline PWA precaching.
- Fixed procedural 100-lesson engine generation for non-English source languages.
