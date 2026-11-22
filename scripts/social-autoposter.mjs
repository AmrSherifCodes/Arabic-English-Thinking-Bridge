#!/usr/bin/env node
/**
 * Thinking Bridge V6 (v6.0.0) — Zero-Dependency All-Socials CLI Auto-Poster
 * Publishes to X, LinkedIn, Facebook, Telegram, Discord, Bluesky, Mastodon, and Reddit
 * via official APIs using Node 22 built-in fetch, and outputs ready-to-launch intent URLs
 * for WhatsApp, Threads, and YouTube Community.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function loadEnvSocial() {
  const envPath = path.join(ROOT_DIR, '.env.social');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const opts = {
    dryRun: true,
    preset: 'linkedin-en',
    text: '',
    title: '',
    url: '',
    platforms: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--live') {
      opts.dryRun = false;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--preset' && argv[i + 1]) {
      opts.preset = argv[++i];
    } else if (arg === '--text' && argv[i + 1]) {
      opts.text = argv[++i];
    } else if (arg === '--title' && argv[i + 1]) {
      opts.title = argv[++i];
    } else if (arg === '--url' && argv[i + 1]) {
      opts.url = argv[++i];
    } else if (arg === '--platforms' && argv[i + 1]) {
      opts.platforms = new Set(
        argv[++i]
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      );
    }
  }
  return opts;
}

const LIMITS = {
  x: 280,
  bluesky: 300,
  mastodon: 500,
  discord: 2000,
  linkedin: 3000,
  telegram: 4096,
  reddit: 40000,
  facebook: 63206,
};

function fitText(text, limit, url) {
  const base = text.trim();
  const cleanUrl = (url || '').trim();
  let combined = base;
  if (cleanUrl && !base.includes(cleanUrl)) {
    combined = base ? `${base}\n${cleanUrl}` : cleanUrl;
  }
  if (combined.length <= limit) return combined;
  if (cleanUrl && cleanUrl.length + 5 <= limit) {
    const budget = limit - cleanUrl.length - 4;
    const clipped = base.replace(cleanUrl, '').trim().slice(0, budget).trimEnd();
    return `${clipped}...\n${cleanUrl}`;
  }
  return `${combined.slice(0, Math.max(1, limit - 3)).trimEnd()}...`;
}

async function apiRequest(url, options) {
  const res = await fetch(url, options);
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return body;
}

const PUBLISHERS = [
  {
    id: 'x',
    label: 'X (Twitter)',
    isConfigured: () => Boolean(process.env.SOCIAL_X_ACCESS_TOKEN),
    format: (text, url) => fitText(text, LIMITS.x, url),
    publish: async (payload) =>
      apiRequest('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SOCIAL_X_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: payload }),
      }),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    isConfigured: () => Boolean(process.env.SOCIAL_LINKEDIN_ACCESS_TOKEN && process.env.SOCIAL_LINKEDIN_AUTHOR_URN),
    format: (text, url) => fitText(text, LIMITS.linkedin, url),
    publish: async (payload) =>
      apiRequest('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SOCIAL_LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202405',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: process.env.SOCIAL_LINKEDIN_AUTHOR_URN,
          commentary: payload,
          visibility: 'PUBLIC',
          distribution: { feedDistribution: 'MAIN_FEED' },
          lifecycleState: 'PUBLISHED',
        }),
      }),
  },
  {
    id: 'facebook',
    label: 'Facebook Page',
    isConfigured: () => Boolean(process.env.SOCIAL_FB_PAGE_ID && process.env.SOCIAL_FB_ACCESS_TOKEN),
    format: (text, url) => fitText(text, LIMITS.facebook, url),
    publish: async (payload, url) => {
      const params = new URLSearchParams({
        message: payload,
        link: url,
        access_token: process.env.SOCIAL_FB_ACCESS_TOKEN,
      });
      return apiRequest(`https://graph.facebook.com/v21.0/${process.env.SOCIAL_FB_PAGE_ID}/feed`, {
        method: 'POST',
        body: params,
      });
    },
  },
  {
    id: 'telegram',
    label: 'Telegram',
    isConfigured: () => Boolean(process.env.SOCIAL_TELEGRAM_BOT_TOKEN && process.env.SOCIAL_TELEGRAM_CHAT_ID),
    format: (text, url) => fitText(text, LIMITS.telegram, url),
    publish: async (payload) =>
      apiRequest(`https://api.telegram.org/bot${process.env.SOCIAL_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.SOCIAL_TELEGRAM_CHAT_ID,
          text: payload,
          disable_web_page_preview: false,
        }),
      }),
  },
  {
    id: 'discord',
    label: 'Discord',
    isConfigured: () => Boolean(process.env.SOCIAL_DISCORD_WEBHOOK_URL),
    format: (text, url) => fitText(text, LIMITS.discord, url),
    publish: async (payload) =>
      apiRequest(process.env.SOCIAL_DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: payload }),
      }),
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    isConfigured: () => Boolean(process.env.SOCIAL_BSKY_HANDLE && process.env.SOCIAL_BSKY_APP_PASSWORD),
    format: (text, url) => fitText(text, LIMITS.bluesky, url),
    publish: async (payload) => {
      const sessionRaw = await apiRequest('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: process.env.SOCIAL_BSKY_HANDLE,
          password: process.env.SOCIAL_BSKY_APP_PASSWORD,
        }),
      });
      const session = JSON.parse(sessionRaw);
      return apiRequest('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: session.did,
          collection: 'app.bsky.feed.post',
          record: {
            $type: 'app.bsky.feed.post',
            text: payload,
            createdAt: new Date().toISOString(),
          },
        }),
      });
    },
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    isConfigured: () => Boolean(process.env.SOCIAL_MASTODON_INSTANCE && process.env.SOCIAL_MASTODON_TOKEN),
    format: (text, url) => fitText(text, LIMITS.mastodon, url),
    publish: async (payload) => {
      const base = process.env.SOCIAL_MASTODON_INSTANCE.replace(/\/+$/, '');
      return apiRequest(`${base}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SOCIAL_MASTODON_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: payload }),
      });
    },
  },
  {
    id: 'reddit',
    label: 'Reddit',
    isConfigured: () => Boolean(process.env.SOCIAL_REDDIT_ACCESS_TOKEN && process.env.SOCIAL_REDDIT_SUBREDDIT),
    format: (text, url) => fitText(text, LIMITS.reddit, url),
    publish: async (payload, url, title) => {
      const params = new URLSearchParams({
        api_type: 'json',
        kind: 'self',
        sr: process.env.SOCIAL_REDDIT_SUBREDDIT,
        title: title || 'Thinking Bridge V6 (v6.0.0) — Free Offline Cognitive Transfer App',
        text: payload,
        url,
      });
      return apiRequest('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SOCIAL_REDDIT_ACCESS_TOKEN}`,
          'User-Agent': 'ThinkingBridgeAutoPoster/6.0.0',
        },
        body: params,
      });
    },
  },
];

async function main() {
  loadEnvSocial();
  const opts = parseArgs(process.argv.slice(2));
  const postsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'social-posts.json'), 'utf8'));
  const chosenPreset = postsData.presets[opts.preset] || postsData.presets['linkedin-en'];

  const shareUrl = opts.url || postsData.defaultUrl || 'https://tb-eg.vercel.app';
  const postText = opts.text || chosenPreset.text;
  const postTitle = opts.title || chosenPreset.title;

  console.log(`\n=== Thinking Bridge V6 (v6.0.0) All-Socials Auto-Poster (${opts.dryRun ? 'DRY-RUN' : 'LIVE'}) ===`);
  console.log(`Preset: ${opts.preset} | Target URL: ${shareUrl}\n`);

  let hadFailure = false;

  for (const target of PUBLISHERS) {
    if (opts.platforms && !opts.platforms.has(target.id)) continue;
    const formatted = target.format(postText, shareUrl);
    const configured = target.isConfigured();

    if (opts.dryRun) {
      console.log(`[DRY-RUN] ${target.label} (${configured ? 'API configured' : 'no token — skipped in live mode'}) — ${formatted.length} chars`);
      continue;
    }

    if (!configured) {
      console.log(`[SKIP] ${target.label} — set credentials in .env.social to enable API publishing.`);
      continue;
    }

    try {
      await target.publish(formatted, shareUrl, postTitle);
      console.log(`[OK]   ${target.label} published successfully.`);
    } catch (err) {
      hadFailure = true;
      console.error(`[FAIL] ${target.label}:`, err instanceof Error ? err.message : String(err));
    }
  }

  const fullShare = fitText(postText, 4000, shareUrl);
  const xText = fitText(postText, LIMITS.x, shareUrl);
  console.log('\nReady-to-Click Web Intent Links (WhatsApp, Threads, X, LinkedIn, YouTube):');
  console.log(`- X:        https://x.com/intent/tweet?text=${encodeURIComponent(xText)}`);
  console.log(`- LinkedIn: https://www.linkedin.com/feed/?shareActive=true&mini=true&text=${encodeURIComponent(fullShare)}`);
  console.log(`- WhatsApp: https://wa.me/?text=${encodeURIComponent(fullShare)}`);
  console.log(`- Telegram: https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postText)}`);
  console.log(`- Threads:  https://www.threads.net/intent/post?text=${encodeURIComponent(fitText(postText, LIMITS.mastodon, shareUrl))}`);
  console.log(`- YouTube:  https://www.youtube.com/@sciamrsherif/community\n`);

  if (hadFailure) {
    process.exitCode = 1;
  }
}

void main();
