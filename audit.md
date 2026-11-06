# Edge Refinement Audit - v4.0.0

## 1. UI/UX Edges
- **RTL/LTR Mirroring & Arabic Line Height**: Tailwind default line heights clip Arabic diacritics. Addressed by applying `html[dir="rtl"] body { line-height: 1.8; }` inside `src/index.css`.
- **Mobile Safe-Area Insets**: Bottom tabs and main content wrappers lack iOS/Android safe area padding. Addressed by injecting `.pb-safe` and `.pt-safe` utility classes wrapping `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)`.
- **Hardcoded Strings**: Isolated hardcoded fallback strings in `ErrorBoundary.tsx` and `PwaInstallBanner.tsx`. Replaced with `react-i18next` hooks to adhere to localization policy.
- **Focus Rings**: Standardized `focus-visible` styling in PWA banner buttons for a11y compliance.

## 2. Performance Edges
- **Bundle splitting & PWA precache**: Vite config and Service Worker generate perfectly. Precache chunks correctly.
- **Lighthouse**: Mobile scoring benefits from localized fonts avoiding cumulative layout shifts (handled by default in `Cairo/Inter` system fonts).

## 3. Security Edges
- **Headers & CSP**: Confirmed `vercel.json` applies strict `Content-Security-Policy`, `Strict-Transport-Security`, and `Permissions-Policy`.
- **Zero-Secret Client Bundles**: No webhooks leaked into client build.

## 4. Release Edges
- **Versioning**: Confirmed `package.json` at `4.0.0`, Android `versionCode` bumped to `401`, and `versionName` to `4.0.0`.
- **Signing**: Configured in `.github/workflows/ci-release.yml`. CI builds signed APK natively using GitHub Repository Secrets.
