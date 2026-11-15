# Phase 08 — Quality Gate: 60-Second First-Run

1. Verify cold-start experience (<= 3 clicks to first interactive lesson).
2. Ensure Arabic sentence appears within first 5 seconds.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "qa(first-run): verify 60-second onboarding and immediate lesson start"
   - powershell -File scripts/advance-state.ps1 -ToPhase 09-docs
