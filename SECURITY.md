# Security Hardening & OWASP Top 10:2025 Checklist

## 1. Broken Access Control
- **Mitigation:** API Keys are strictly local (BYOK). There is no backend proxy that stores keys or manages access. All routes are client-side protected.

## 2. Cryptographic Failures
- **Mitigation:** Implemented `KeyVault.ts` using Web Crypto API. The Gemini API key is encrypted at rest in IndexedDB using AES-GCM, derived from a user passphrase via PBKDF2.

## 3. Injection
- **Mitigation:** React's native data binding escapes variables by default. For Markdown or other dynamic HTML content, `DOMPurify` is enforced to prevent XSS. No `dangerouslySetInnerHTML` is used for untrusted input.

## 4. Insecure Design
- **Mitigation:** The application is offline-first and local-only by design. Zero telemetry or server-side data storage prevents massive data breaches.

## 5. Security Misconfiguration
- **Mitigation:** Added robust `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, and `Permissions-Policy` in `vercel.json`.

## 6. Vulnerable and Outdated Components
- **Mitigation:** A dependency audit process is in place. Packages are pinned to exact versions where necessary. Run `npm audit --production` continuously in CI.

## 7. Identification and Authentication Failures
- **Mitigation:** BYOK keys are bound to a local device and passphrase. No shared passwords or weak auth mechanisms are stored on a centralized server.

## 8. Software and Data Integrity Failures
- **Mitigation:** Service Worker caches use versioning and content-hashing. Stale-while-revalidate is applied carefully. Subresource Integrity (SRI) is considered for external scripts if any are added.

## 9. Security Logging and Monitoring Failures
- **Mitigation:** Local errors are logged to the console for debugging but no sensitive keys or user data are sent to external logging services like Sentry.

## 10. Server-Side Request Forgery (SSRF)
- **Mitigation:** The application makes direct client-to-API requests (to Google Gemini). There is no backend server to be manipulated into making internal requests.

## Cross-Origin-Embedder-Policy (COEP)
- **Tradeoff:** `COEP: credentialless` is used instead of `require-corp` to allow loading Google Fonts. This has slightly less browser support than `require-corp` but maintains strong security while preventing font breakage.

## CSP Nonce Details
- **Note:** The Content-Security-Policy is static (no nonce is used). This is because the application is fully static and offline-first without Server-Side Rendering (SSR). A static `script-src 'self'` is used instead.
