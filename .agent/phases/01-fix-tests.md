# Phase 01 — Fix the 4 failing tests

1. Run: npm test
2. Inspect failing security.test.ts assertions.
3. Fix index.html inline script, CSP header match, og/twitter image URLs, and theme-init script tag.
4. Run: powershell -File scripts/verify.ps1 -Mode all
5. If 0 failure groups:
   - powershell -File scripts/agent-commit.ps1 -Message "fix(test): resolve security unit tests and verify script matching"
   - powershell -File scripts/advance-state.ps1 -ToPhase 02-youtube
