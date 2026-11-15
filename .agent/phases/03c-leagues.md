# Phase 03c — Offline Leagues & Card Generator

1. Verify local weekly XP leaderboard (Leagues) and offline shareable achievement card generator.
2. Ensure zero remote tracking dependencies during card render.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "feat(leagues): verify local leagues and achievement card generator"
   - powershell -File scripts/advance-state.ps1 -ToPhase 04a-teacher-verify
