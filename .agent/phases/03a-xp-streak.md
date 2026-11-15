# Phase 03a — Local XP & Streak Engine

1. Inspect src/utils/srsEngine.ts and streak/XP local state handlers.
2. Verify local XP calculations (10 XP per lesson, 20 XP per story) and streak flame counter persistence in DataStore / localStorage.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "feat(gamification): verify local XP and streak flame engine"
   - powershell -File scripts/advance-state.ps1 -ToPhase 03b-hearts-srs
