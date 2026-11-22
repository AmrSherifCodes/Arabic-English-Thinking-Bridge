#!/usr/bin/env node
/**
 * Thinking Bridge V6 (v6.0.0) — Launch Command CLI Orchestrator
 *
 * Default (safe verification mode):
 *   node scripts/launch-v6.mjs
 *   npm run launch:v6
 *
 * Interactive user helpers:
 *   npm run launch:v6 -- --copy-notes        # Copy V6_RELEASE_NOTES.md to clipboard
 *   npm run launch:v6 -- --open              # Open Launchpad HTML + APK Explorer + assets folder
 *   npm run launch:v6 -- --live              # Publish configured .env.social APIs via social-autoposter
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const APK_REL = path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'ThinkingBridge-v6.0.0.apk');
const APK_PATH = path.join(ROOT_DIR, APK_REL);
const NOTES_PATH = path.join(ROOT_DIR, 'docs', 'releases', 'V6_RELEASE_NOTES.md');
const KIT_PATH = path.join(ROOT_DIR, 'docs', 'releases', 'V6_SOCIALS_KIT.md');
const LAUNCHPAD_PATH = path.join(ROOT_DIR, 'docs', 'releases', 'v6-launchpad.html');
const ASSETS_DIR = path.join(ROOT_DIR, 'docs', 'releases', 'assets');
const ENV_SOCIAL_PATH = path.join(ROOT_DIR, '.env.social');

const EXPECTED_ASSETS = [
  'v6-hero-banner.png',
  'v6-carousel-01-cover.png',
  'v6-carousel-02-cyl1.png',
  'v6-carousel-03-cyl2.png',
  'v6-carousel-04-cyl3.png',
  'v6-carousel-05-cyl4-5.png',
  'v6-carousel-06-cta.png',
];

const SOCIAL_TOKEN_GROUPS = [
  { id: 'x', label: 'X (Twitter)', keys: ['SOCIAL_X_ACCESS_TOKEN'] },
  { id: 'linkedin', label: 'LinkedIn', keys: ['SOCIAL_LINKEDIN_ACCESS_TOKEN', 'SOCIAL_LINKEDIN_AUTHOR_URN'] },
  { id: 'facebook', label: 'Facebook Page', keys: ['SOCIAL_FB_PAGE_ID', 'SOCIAL_FB_ACCESS_TOKEN'] },
  { id: 'telegram', label: 'Telegram', keys: ['SOCIAL_TELEGRAM_BOT_TOKEN', 'SOCIAL_TELEGRAM_CHAT_ID'] },
  { id: 'discord', label: 'Discord', keys: ['SOCIAL_DISCORD_WEBHOOK_URL'] },
  { id: 'bluesky', label: 'Bluesky', keys: ['SOCIAL_BSKY_HANDLE', 'SOCIAL_BSKY_APP_PASSWORD'] },
  { id: 'mastodon', label: 'Mastodon', keys: ['SOCIAL_MASTODON_INSTANCE', 'SOCIAL_MASTODON_TOKEN'] },
  { id: 'reddit', label: 'Reddit', keys: ['SOCIAL_REDDIT_ACCESS_TOKEN', 'SOCIAL_REDDIT_SUBREDDIT'] },
];

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) result[k] = v;
  }
  return result;
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex').toUpperCase();
}

function copyTextToClipboard(textPath) {
  if (process.platform === 'win32') {
    const safePath = textPath.replace(/'/g, "''");
    execFileSync(
      'powershell',
      ['-NoProfile', '-Command', `Set-Clipboard -Value ([System.IO.File]::ReadAllText('${safePath}', [System.Text.Encoding]::UTF8))`],
      { stdio: 'inherit' }
    );
    return true;
  }
  if (process.platform === 'darwin') {
    execFileSync('pbcopy', { input: fs.readFileSync(textPath), stdio: ['pipe', 'inherit', 'inherit'] });
    return true;
  }
  return false;
}

function openWithShell(target, selectMode = false) {
  if (process.platform === 'win32') {
    if (selectMode) {
      spawn('explorer.exe', [`/select,${target}`], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('cmd.exe', ['/c', 'start', '""', target], { detached: true, stdio: 'ignore' }).unref();
    }
    return;
  }
  const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(opener, [target], { detached: true, stdio: 'ignore' }).unref();
}

async function checkLiveHealth() {
  try {
    const res = await fetch('https://tb-eg.vercel.app/api/health', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return { ok: false, note: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      ok: data?.status === 'healthy' && data?.version === 'v6.0.0',
      note: `${data?.status || 'unknown'} · ${data?.version || 'missing-version'}`,
    };
  } catch (err) {
    return {
      ok: null,
      note: `offline/sandboxed (${err instanceof Error ? err.message : String(err)})`,
    };
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const doOpen = args.has('--open');
  const doCopyNotes = args.has('--copy-notes');
  const doLive = args.has('--live');

  console.log('\n=== Thinking Bridge V6 (v6.0.0) Launch Command Center ===\n');

  let failed = false;

  // 1. APK & Checksum Verification
  if (fs.existsSync(APK_PATH)) {
    const bytes = fs.statSync(APK_PATH).size;
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const sha256 = sha256File(APK_PATH);
    const notesText = fs.existsSync(NOTES_PATH) ? fs.readFileSync(NOTES_PATH, 'utf8') : '';
    const kitText = fs.existsSync(KIT_PATH) ? fs.readFileSync(KIT_PATH, 'utf8') : '';
    const notesMatch = notesText.includes(sha256);
    const kitMatch = kitText.includes(sha256);
    console.log(`[OK]   APK verified: ${APK_REL}`);
    console.log(`       Size: ${mb} MB (${bytes.toLocaleString('en-US')} bytes)`);
    console.log(`       SHA-256: ${sha256}`);
    console.log(`       Docs Sync: V6_RELEASE_NOTES=${notesMatch ? 'MATCH' : 'MISMATCH'} | V6_SOCIALS_KIT=${kitMatch ? 'MATCH' : 'MISMATCH'}`);
    if (!notesMatch || !kitMatch) failed = true;
  } else {
    console.error(`[MISS] APK not found at ${APK_REL}. Run: .\\android\\gradlew.bat -p android assembleRelease`);
    failed = true;
  }

  // 2. Visual Media Pack Verification
  const missingAssets = EXPECTED_ASSETS.filter((f) => {
    const p = path.join(ASSETS_DIR, f);
    return !fs.existsSync(p) || fs.statSync(p).size === 0;
  });
  if (missingAssets.length === 0) {
    console.log(`[OK]   Visual Media Pack verified: ${EXPECTED_ASSETS.length}/${EXPECTED_ASSETS.length} PNGs in docs/releases/assets/`);
  } else {
    console.error(`[MISS] Missing V6 media assets: ${missingAssets.join(', ')}. Run: npm run social:media`);
    failed = true;
  }

  // 3. Launchpad HTML Verification
  if (fs.existsSync(LAUNCHPAD_PATH)) {
    console.log(`[OK]   Launchpad ready: docs/releases/v6-launchpad.html`);
  } else {
    console.error('[MISS] docs/releases/v6-launchpad.html missing.');
    failed = true;
  }

  // 4. Live Vercel Health
  const health = await checkLiveHealth();
  if (health.ok === true) {
    console.log(`[OK]   Live Production Health: https://tb-eg.vercel.app/api/health (${health.note})`);
  } else if (health.ok === null) {
    console.log(`[INFO] Live Production Health check skipped (${health.note})`);
  } else {
    console.error(`[WARN] Live Production Health: ${health.note}`);
    failed = true;
  }

  // 5. .env.social API Readiness
  const envSocial = parseEnvFile(ENV_SOCIAL_PATH);
  const configured = SOCIAL_TOKEN_GROUPS.filter((g) => g.keys.every((k) => Boolean(envSocial[k] || process.env[k])));
  if (configured.length > 0) {
    console.log(`[OK]   .env.social APIs configured: ${configured.map((g) => g.label).join(', ')}`);
  } else {
    console.log('[INFO] .env.social not configured (API auto-post skipped; 1-click Web Intents active in v6-launchpad.html)');
  }

  // 6. Optional Actions
  if (doCopyNotes && fs.existsSync(NOTES_PATH)) {
    const copied = copyTextToClipboard(NOTES_PATH);
    console.log(copied ? '[OK]   Copied docs/releases/V6_RELEASE_NOTES.md to clipboard!' : '[WARN] Clipboard copy unsupported on this OS.');
  }

  if (doOpen) {
    console.log('[OPEN] Opening v6-launchpad.html, APK folder, and docs/releases/assets/ ...');
    if (fs.existsSync(LAUNCHPAD_PATH)) openWithShell(LAUNCHPAD_PATH, false);
    if (fs.existsSync(APK_PATH)) openWithShell(APK_PATH, true);
    if (fs.existsSync(ASSETS_DIR)) openWithShell(ASSETS_DIR, false);
  }

  if (doLive) {
    if (configured.length === 0) {
      console.log('[SKIP] --live requested, but no credentials found in .env.social. Copy scripts/social.env.example to .env.social first.');
    } else {
      console.log('[LIVE] Triggering scripts/social-autoposter.mjs --live --preset linkedin-en ...');
      execFileSync(process.execPath, [path.join(__dirname, 'social-autoposter.mjs'), '--live', '--preset', 'linkedin-en'], {
        stdio: 'inherit',
      });
    }
  }

  console.log('\nNext useful commands:');
  console.log('  npm run launch:v6 -- --open --copy-notes   # Copy release notes + open Launchpad & APK folder');
  console.log('  npm run social:dry -- --preset linkedin-en   # Preview CLI auto-poster + intent links\n');

  if (failed) process.exitCode = 1;
}

void main();
