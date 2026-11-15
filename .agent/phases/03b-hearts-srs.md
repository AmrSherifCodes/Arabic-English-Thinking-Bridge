# Phase 03b — Hearts & SRS Scheduler

1. Verify Hearts system (5 hearts max, regenerate via review / SRS card completion).
2. Integrate SM-2 / FSRS spaced repetition card queue with main pathway.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "feat(srs): verify hearts system and SM-2 review scheduler"
   - powershell -File scripts/advance-state.ps1 -ToPhase 03c-leagues
