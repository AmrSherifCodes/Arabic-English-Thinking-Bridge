# Miracle Sprint State

phase: 04a-teacher-verify
status: in_progress
last_commit: 2e6f0cd
last_verify: "LINT PASS / TEST PASS (0 failures) / BUILD PASS"
blockers: []
hard_rules:
  - "Do NOT set status=completed unless verify.ps1 returns 0 failure groups"
  - "Do NOT skip a phase in the manifest"
  - "Commit after every phase via agent-commit.ps1"
  - "Do NOT commit unless verify.ps1 returns 0 failure groups"




