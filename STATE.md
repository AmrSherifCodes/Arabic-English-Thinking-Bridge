# Active Engineering State (STATE.md)

- **Date / Timestamp**: 2026-11-03 21:55 UTC+2
- **Current Branch**: `design-tokens` (synced with `main` at `07e63cb`)
- **App Version**: v3.1.0 (`tb-eg.vercel.app`)
- **Test Status**: 167/167 passing (`npm test`), TypeScript clean (`npm run lint`), build clean (`npm run build`).

### What Was Just Changed:
1. Fixed Arabic pluralization in Onboarding (5/10 دقائق vs 15/20 دقيقة).
2. Hid floating AIHelper FAB during onboarding & active lesson runs.
3. Expanded PathView lesson titles to 2 lines without clipping.
4. Added stage selection freedom: user can select and switch active level (A0, A1, A2) in onboarding & in PathView.
5. Added Google Search Console verification meta tag to `index.html`.
6. Refined Arabic linguistic explanations (فعل الربط / الأفعال المخفية).

### What Remains / Immediate Next Tasks:
1. Execute Hybrid AI workflow routing (80% DeepSeek/Qwen for boilerplate, Claude for high-IQ architecture).
2. Continue expanding interactive drills and offline SRS decks as needed.
3. Monitor Vercel production logs & analytics.
