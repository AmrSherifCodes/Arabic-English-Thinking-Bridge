# Release Checklist: v4.0.0

- [x] **Version Bump**: `package.json` confirmed at `4.0.0`.
- [x] **Android Bump**: `android/app/build.gradle` `versionCode` updated to `401`, `versionName` to `4.0.0`.
- [x] **UI Edge Fixes**: RTL line-heights, safe areas, i18next integrations completed.
- [x] **Build Verification**: `npm run build` locally tested successfully without warnings.
- [x] **Workflow Configured**: `.github/workflows/ci-release.yml` triggers on `v*.*.*` tags, signs APK, and attaches it to the GitHub Release.
- [x] **Changelog**: `CHANGELOG.md` updated for v4.0.0.

### Tag & Release Instructions
Since repository secrets (Android Keystore, Key Alias, Passwords) are secured remotely and not present in the local environment, the **signed APK** is produced by GitHub Actions upon pushing the tag.

Run these commands to trigger the pipeline and publish the release:
```bash
git add .
git commit -m "chore: release v4.0.0 with edge refinements"
git tag v4.0.0
git push origin main --tags
```
