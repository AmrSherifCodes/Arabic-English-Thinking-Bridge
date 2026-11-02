#!/usr/bin/env node

/**
 * Thinking Bridge Automated Production Release Script
 * Usage:
 *   npm run release
 *   node scripts/release.js 3.0.1
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Determine Target Version
const pkgPath = path.join(ROOT_DIR, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const targetVersion = process.argv[2] || pkg.version || '3.0.1';
const tag = `v${targetVersion}`;

console.log(`\n======================================================`);
console.log(`🚀 Thinking Bridge Automated Release: ${tag}`);
console.log(`======================================================\n`);

function run(cmd, cwd = ROOT_DIR, env = process.env) {
  console.log(`\n▶️  [RUN]: ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

// 2. Synchronize Version Across Files
console.log(`📦 1. Synchronizing version ${targetVersion} across project files...`);

// A. package.json
if (pkg.version !== targetVersion) {
  pkg.version = targetVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`   ✓ package.json -> ${targetVersion}`);
}

// B. android/app/build.gradle
const gradlePath = path.join(ROOT_DIR, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/g, `versionName "${targetVersion}"`);
  
  // Increment versionCode if updating
  const codeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  if (codeMatch) {
    const currentCode = parseInt(codeMatch[1], 10);
    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${currentCode}`);
    console.log(`   ✓ android/app/build.gradle -> versionName "${targetVersion}", versionCode ${currentCode}`);
  }
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
}

// C. src/utils/storage.ts
const storagePath = path.join(ROOT_DIR, 'src', 'utils', 'storage.ts');
if (fs.existsSync(storagePath)) {
  let storageContent = fs.readFileSync(storagePath, 'utf8');
  storageContent = storageContent.replace(
    /APP_STORAGE_VERSION\s*=\s*'[^']+'/g,
    `APP_STORAGE_VERSION = '${targetVersion}'`
  );
  fs.writeFileSync(storagePath, storageContent, 'utf8');
  console.log(`   ✓ src/utils/storage.ts -> APP_STORAGE_VERSION = '${targetVersion}'`);
}

// D. src/features/menu/ChoiceMenu.tsx
const menuPath = path.join(ROOT_DIR, 'src', 'features', 'menu', 'ChoiceMenu.tsx');
if (fs.existsSync(menuPath)) {
  let menuContent = fs.readFileSync(menuPath, 'utf8');
  menuContent = menuContent.replace(
    /v[0-9.]+\s*·\s*APK/g,
    `${tag} · APK`
  );
  menuContent = menuContent.replace(
    /v[0-9.]+(?=['"]\s*:\s*['"]Download Android APK)/g,
    `${tag}`
  );
  menuContent = menuContent.replace(
    /تحميل تطبيق الأندرويد v[0-9.]+/g,
    `تحميل تطبيق الأندرويد ${tag}`
  );
  fs.writeFileSync(menuPath, menuContent, 'utf8');
  console.log(`   ✓ src/features/menu/ChoiceMenu.tsx -> updated APK download badges to ${tag}`);
}

// E. vercel.json redirects
const vercelPath = path.join(ROOT_DIR, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  let vercelContent = fs.readFileSync(vercelPath, 'utf8');
  vercelContent = vercelContent.replace(
    /download\/v[0-9.]+\/Thinking-Bridge-v[0-9.]+\.apk/g,
    `download/${tag}/Thinking-Bridge-${tag}.apk`
  );
  fs.writeFileSync(vercelPath, vercelContent, 'utf8');
  console.log(`   ✓ vercel.json -> updated /apk and /download redirects to ${tag}`);
}

// F. src/components/LandingView.tsx & locales
const landingPath = path.join(ROOT_DIR, 'src', 'components', 'LandingView.tsx');
if (fs.existsSync(landingPath)) {
  let landingContent = fs.readFileSync(landingPath, 'utf8');
  landingContent = landingContent.replace(/v[0-9.]+\s*APK/g, `${tag} APK`);
  landingContent = landingContent.replace(/APK مباشرة \(v[0-9.]+\)/g, `APK مباشرة (${tag})`);
  fs.writeFileSync(landingPath, landingContent, 'utf8');
  console.log(`   ✓ src/components/LandingView.tsx -> updated APK badges to ${tag}`);
}

for (const locFile of ['ar.json', 'en.json']) {
  const locPath = path.join(ROOT_DIR, 'src', 'locales', locFile);
  if (fs.existsSync(locPath)) {
    let locContent = fs.readFileSync(locPath, 'utf8');
    locContent = locContent.replace(/v[0-9.]+\)/g, `${tag})`);
    fs.writeFileSync(locPath, locContent, 'utf8');
    console.log(`   ✓ src/locales/${locFile} -> updated versions to ${tag}`);
  }
}

// 3. Run Automated Tests
console.log(`\n🧪 2. Running test suite...`);
run('npm test');

// 4. Build Vite Web Production Bundle
console.log(`\n⚡ 3. Building Vite web production bundle...`);
run('npm run build');

// 5. Sync Capacitor Android (guaranteed offline standalone mode)
console.log(`\n📱 4. Syncing Capacitor Android assets (offline mode)...`);
delete process.env.CAPACITOR_LIVE_RELOAD;
delete process.env.CAPACITOR_LIVE_URL;
run('node scripts/live-reload.js off');
run('npx cap sync android');

// 6. Build Android Universal Release APK
console.log(`\n🤖 5. Assembling Android Universal Release APK...`);
const javaFallback = 'C:\\Users\\MSI\\AppData\\Roaming\\.minecraft\\runtime\\java-runtime-delta\\windows\\java-runtime-delta';
const androidEnv = { ...process.env };
if (!androidEnv.JAVA_HOME && fs.existsSync(javaFallback)) {
  androidEnv.JAVA_HOME = javaFallback;
  console.log(`   (Using JDK 21 at: ${javaFallback})`);
}

const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
run(`${gradlewCmd} assembleRelease --no-daemon`, path.join(ROOT_DIR, 'android'), androidEnv);

// 7. Copy Output APKs
console.log(`\n📋 6. Copying production APK...`);
const builtApkPath = path.join(ROOT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-universal-release.apk');
const arm64ApkPath = path.join(ROOT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-arm64-v8a-release.apk');
const desktopApkPath = `C:\\Users\\MSI\\Desktop\\Thinking-Bridge-${tag}.apk`;
const desktopArm64Path = `C:\\Users\\MSI\\Desktop\\Thinking-Bridge-${tag}-arm64.apk`;

if (fs.existsSync(builtApkPath)) {
  try {
    fs.copyFileSync(builtApkPath, desktopApkPath);
    console.log(`   ✓ Copied Universal APK to Desktop: ${desktopApkPath}`);
  } catch (err) {
    console.warn(`   ⚠️ Could not copy universal APK to desktop: ${err.message}`);
  }
}

if (fs.existsSync(arm64ApkPath)) {
  try {
    fs.copyFileSync(arm64ApkPath, desktopArm64Path);
    console.log(`   ✓ Copied Lean ARM64 APK to Desktop: ${desktopArm64Path}`);
  } catch (err) {
    console.warn(`   ⚠️ Could not copy arm64 APK to desktop: ${err.message}`);
  }
}

// 8. Git Commit, Tag & Push
console.log(`\n🌐 7. Committing and pushing ${tag} to GitHub...`);
try {
  run(`git add -A`);
  try {
    run(`git commit -m "chore(release): ${tag}"`);
  } catch {
    console.log(`   (No new changes to commit)`);
  }
  run(`git tag -f ${tag} HEAD`);
  run(`git push origin main`);
  run(`git push -f origin ${tag}`);
  console.log(`   ✓ Pushed main branch and tag ${tag} to GitHub!`);
} catch (err) {
  console.warn(`   ⚠️ Git push encountered an issue: ${err.message}`);
}

console.log(`\n======================================================`);
console.log(`🎉 RELEASE ${tag} COMPLETED SUCCESSFULLY!`);
console.log(`======================================================`);
console.log(`\nDesktop APK: ${desktopApkPath}`);
console.log(`Web URL:     https://tb-eg.vercel.app/`);
console.log(`Direct APK:  https://tb-eg.vercel.app/apk`);
console.log(`GitHub Tag:  ${tag}\n`);

