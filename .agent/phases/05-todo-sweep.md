# Phase 05 — Missing-Feature & TODO Sweep

1. Scan codebase for lingering TODO/FIXME comments in core path.
2. Verify all routes return valid React components without unhandled promise rejections.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "refactor(core): sweep TODO comments and verify route handlers"
   - powershell -File scripts/advance-state.ps1 -ToPhase 06-i18n-a11y
