# Phase 04b — Explain My Answer & Hacker Terminal Mode

1. Verify "Explain My Answer" linguistic tool with bilingual explanations.
2. Verify Hacker Terminal practice mode for rapid keyboard drills.
3. Run: powershell -File scripts/verify.ps1 -Mode all
4. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "feat(terminal): verify explain-my-answer and hacker terminal practice mode"
   - powershell -File scripts/advance-state.ps1 -ToPhase 05-todo-sweep
