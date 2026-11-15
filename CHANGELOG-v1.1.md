# v1.1.0-unofficial.1 — First Public Release

**Release date:** 2026-11-15
**Status:** Unofficial — first public build

## Highlights

- **Telltale Story Engine** — Interactive visual novel with 7-language support, branching dialogue, Dexie-backed offline save, and age-adaptive scenes (KG → Adult).
- **Hacker Terminal** — Pyodide-powered local Python assessment. Adjusts the Age Slider based on interactive questions. 100% offline after first use.
- **Age Slider** — UI slider (Kindergarten → Adult) that dynamically modifies story complexity.
- **Auto-Read Mode** — Web Speech API TTS on every dialogue line. Toggleable, persisted.
- **Word-Hover Dictionary** — Hover any word for instant translation. Debounced. Lazy-loaded dictionary chunks per language.
- **Teacher Mode** — Classroom projector view with QR-code share, big-type reveal/hide, and copy-link fallback.

## Offline Behavior

- **Core learning loop (Story Engine):** 100% offline, precached at install.
- **Advanced tools (Hacker Terminal, Teacher Mode):** cache on first use, then 100% offline.

## What's NOT in 1.1

- Full accessibility pass (WCAG AAA, dyslexia font, high-contrast toggle) — planned for v1.2
- Additional chapters (Chapter 2+) — planned for v1.2
- Hindi, Russian, Chinese story translations beyond the Pivot Bridge — planned for v1.3

## Known Limitations

- Empirical 3G cold-load test not yet run by a human. Please report slow loads.
- Teacher Mode is new and has not been tested in a real classroom projector.
- The "Start from absolute zero" path in the Age Slider is a stub.

## Verify the install

- Precache size: ~2.95 MB
- Total dist/: ~70 MB
- Languages in Story Engine: AR, EN, DE, FR, ES, JA, ZH
- Languages in Pivot Bridge (curriculum): +HI, RU, EL, IT, PT, TR

## Credits

Built by Amr Sherif (Alexandria University, Faculty of Science).
Inspired by Mihalis Eleftheriou's Language Transfer Thinking Method.

## License

Content: CC0 1.0 Universal.
Code: MIT.

**Think, don't memorize.**
