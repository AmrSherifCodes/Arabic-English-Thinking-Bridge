# Phase 02 — YouTube promotion patch

1. Find channel handle (@sciamrsherif) in README.md, index.html footer, public/download.html footer.
2. Verify YouTube promotion structure & metadata mappings.
3. Generate/update YOUTUBE_PROMOTION_PATCH.md: per-video bilingual description + pinned comment with repo URL + lessonId + git commit hash + Rule 7 neutrality check.
4. Run: powershell -File scripts/verify.ps1 -Mode all
5. If 0 failures:
   - powershell -File scripts/agent-commit.ps1 -Message "docs(youtube): promotion patch for latest channel videos"
   - powershell -File scripts/advance-state.ps1 -ToPhase 03a-xp-streak
