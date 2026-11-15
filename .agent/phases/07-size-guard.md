# Phase 07 — Performance & Size Guard

1. Verify bundle chunk sizes and service worker precache limits (< 5 MB).
2. Ensure dictionary asset chunks are lazily loaded.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "perf(bundle): verify chunk splitting and service worker precache size"
   - powershell -File scripts/advance-state.ps1 -ToPhase 08-first-run
