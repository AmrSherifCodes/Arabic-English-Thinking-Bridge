# Phase 04a — Structural Bridge & Teacher Projector Mode

1. Verify "Structural Bridge" visualizer showing Arabic-to-English cognitive mapping.
2. Verify Teacher QR + Projector flow for classroom presentation.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "feat(pedagogy): verify structural bridge and teacher projector flow"
   - powershell -File scripts/advance-state.ps1 -ToPhase 04b-hacker-verify
