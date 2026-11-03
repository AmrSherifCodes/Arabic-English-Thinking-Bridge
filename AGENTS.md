# Agent Instructions & Multi-Platform Architecture Specification

## Role
You are a senior full-stack and design engineer working inside this repo (**Thinking English / Arabic-English Thinking Bridge**, tb-eg.vercel.app). Redesign the landing page and make the product ship on all platforms from ONE codebase. Do not break existing app routes, lessons, flashcards, auth, or data logic.

---

## STEP 0: System Inspection & Stack Rules
Inspect the repo: framework (React + Vite), router, styling system, build tooling, how the Android APK is currently produced (Capacitor), where state/progress is stored (`localStorage` / local vault). Reuse the existing stack; do not rewrite it.

---

## STEP 1: LANDING PAGE (Arabic-first, RTL, bilingual AR/EN)

### Design Tokens:
- `bg`: `#0A0E13`
- `surface`: `#0F151C`
- `border`: `#1E2933`
- `text`: `#EEF2F5`
- `muted`: `#9AA7B2`
- `accent teal`: `#2DD4BF`
- `secondary amber`: `#F5B942`
- `font`: Readex Pro (400-700)
- `radius`: 12–28px
- `max-width`: 1200px
Put tokens in CSS variables, supporting dark (default) and light theme.

### Sections (In Order):
1. **Nav**: Logo, links (`اشترك`, `كيف يعمل`, `التحميل`), AR/EN toggle only. *Clean layout — keep gamification inside the app*.
2. **Hero**:
   - Pill: `"مجاني · يعمل بدون إنترنت"`
   - H1: `"فكّر بالإنجليزي، مش تترجم."` (second line teal)
   - Tagline: `"Think the structure. Don't memorize words."` (amber)
   - CTAs: Download, Try on web
   - Meta: 27 lessons, 10,000+ words, 100% free
   - Right side: CSS phone mockup with a sample AR to EN chat
3. **How it works**: 3 cards (understand structure, practice speaking, review daily).
4. **Stats strip**: 27 lessons, 4090 flashcards, 10k+ words, 0 cost.
5. **Subscribe**: Email input + button. Validate, POST to `/api/feedback` or dedicated subscription route, success state, persist in `localStorage`.
6. **EASTER EGG**: Only after a successful subscribe, reveal and smooth-scroll to a hidden features section (2x2 cards: conversation practice, 27 interactive lessons, "من البلدي إلى Corporate" translator, 4090 spaced-repetition flashcards). Never render it for non-subscribers.
7. **Download section**: Smart platform detection (Android APK, iOS/PWA, Windows, macOS).
8. **Footer**: `"صُنع في الإسكندرية، مصر"`, Copyright (c) 2024-Present Amr Sherif Abdelaal, GitHub, YouTube, LinkedIn, Email.

### Quality Bar:
Semantic HTML, real button/a elements, `aria-label`s on icon-only controls, 4.5:1 contrast, visible focus states, `prefers-reduced-motion` respected, inline SVG icons, hover states, no layout shift, responsive from 320px to 4K (single column under 820px), Lighthouse 95+ on all four scores.

---

## STEP 2: ALL PLATFORMS FROM ONE CODEBASE

- **Web**: Responsive, SEO meta + Open Graph + `hreflang` (ar/en), sitemap, fast (code-split, lazy images).
- **PWA**: Manifest, maskable icons, service worker with offline cache for lessons/flashcards, install prompt (`beforeinstallprompt`) and iOS "Add to Home Screen" hint.
- **Android**: Wrapped with Capacitor (`:app`), producing signed APK/AAB (current v3.1.0); safe-area handling and hardware back button.
- **iOS**: Capacitor iOS project, safe-area insets, App Store-ready assets. *(Requires Xcode & Apple Developer account for final signing/submission)*.
- **Desktop (Windows/macOS/Linux)**: Optional Tauri/Electron integration or PWA desktop installation.
- **Download Section**: Detect OS via `navigator.userAgent` and highlight matching button (Android APK, iOS/PWA, Windows, macOS), with all options listed below. Link to GitHub Releases.
- **Platform Adapter**: Abstract storage, share, audio/mic permissions, and speech recognition behind an adapter module so UI code stays identical.
- **Speech/Mic**: Verify conversation practice works on each platform with graceful fallback messages when unsupported.

---

## STEP 3: CI/CD & DELIVERABLES

- **GitHub Actions**: Lint, type-check, build web, deploy to Vercel, build Android artifacts on tag push.
- **Documentation**: Clear steps in `README.md` on how to build each platform and manual signing steps.

---

## CONSTRAINTS & COPYRIGHT
- All rights reserved by **Amr Sherif Abdelaal**.
- Never commit secrets or API keys.
- Keep bundle size small and lightweight.
