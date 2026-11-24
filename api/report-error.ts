import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_PAYLOAD_BYTES = 32_768;
const MAX_ERRORS_PER_REPORT = 15;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface IncomingErrorEntry {
  id?: unknown;
  timestamp?: unknown;
  source?: unknown;
  message?: unknown;
  stack?: unknown;
  appVersion?: unknown;
  route?: unknown;
  viewportWidth?: unknown;
  theme?: unknown;
  perfMode?: unknown;
}

interface IncomingReportBody {
  appVersion?: unknown;
  generatedAt?: unknown;
  platform?: unknown;
  viewportWidth?: unknown;
  route?: unknown;
  theme?: unknown;
  perfMode?: unknown;
  errors?: unknown;
}

const memoryRateBuckets = new Map<string, number[]>();

let cachedRatelimit: Ratelimit | null | undefined;

function getUpstashRatelimit(): Ratelimit | null {
  if (cachedRatelimit !== undefined) return cachedRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedRatelimit = null;
    return null;
  }
  try {
    const redis = new Redis({ url, token });
    cachedRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, '15 m'),
      prefix: 'tb:ratelimit:report-error',
    });
  } catch {
    cachedRatelimit = null;
  }
  return cachedRatelimit;
}

function checkMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (memoryRateBuckets.get(ip) || []).filter((ts) => ts > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    memoryRateBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  memoryRateBuckets.set(ip, recent);
  if (memoryRateBuckets.size > 1000) {
    for (const [key, timestamps] of memoryRateBuckets.entries()) {
      if (timestamps.every((ts) => ts <= cutoff)) {
        memoryRateBuckets.delete(key);
      }
    }
  }
  return true;
}

async function isWithinRateLimit(ip: string): Promise<boolean> {
  const limiter = getUpstashRatelimit();
  if (limiter) {
    try {
      const result = await limiter.limit(ip);
      return result.success;
    } catch {
      // Fall back to in-memory limiter if Upstash is temporarily unreachable
    }
  }
  return checkMemoryRateLimit(ip);
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function scrubText(input: unknown, maxLen: number): string {
  const raw = typeof input === 'string' ? input : input == null ? '' : String(input);
  let clean = raw
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[^\s"'`]+/gi, '[REDACTED_WEBHOOK]')
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{5,}/g, '[REDACTED_JWT]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_KEY]')
    .replace(/\b(?:sk|pk|rk|ghp|gho|xox[baprs])_[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_TOKEN]')
    .replace(/([?&](?:token|key|api_key|apikey|secret|password|pin|auth|code|email)=)[^&\s"'`]+/gi, '$1[REDACTED]')
    .replace(
      /(\b(?:pin|password|passwd|secret|token|apikey|api_key|authorization|recoveryCode|recovery_code|voucher)\b\s*[:=]\s*["']?)[^\s"',;}\]]+/gi,
      '$1[REDACTED]'
    )
    .replace(/```/g, "'''")
    .trim();

  if (clean.length > maxLen) {
    clean = `${clean.slice(0, Math.max(0, maxLen - 1))}…`;
  }
  return clean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const clientIp = getClientIp(req);
  const allowed = await isWithinRateLimit(clientIp);
  if (!allowed) {
    return res.status(429).json({ ok: false, error: 'RATE_LIMITED' });
  }

  const body = req.body as IncomingReportBody | undefined;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'INVALID_PAYLOAD' });
  }

  const rawSize = Buffer.byteLength(JSON.stringify(body), 'utf8');
  if (rawSize > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({ ok: false, error: 'PAYLOAD_TOO_LARGE' });
  }

  if (!Array.isArray(body.errors) || body.errors.length === 0 || body.errors.length > MAX_ERRORS_PER_REPORT) {
    return res.status(400).json({ ok: false, error: 'INVALID_ERRORS_ARRAY' });
  }

  const sanitizedErrors = (body.errors as IncomingErrorEntry[]).slice(0, MAX_ERRORS_PER_REPORT).map((err) => ({
    source: scrubText(err?.source || 'unknown', 32),
    message: scrubText(err?.message || 'Unknown error', 240),
    stack: scrubText(err?.stack || '', 750),
    route: scrubText(err?.route || '/', 100),
    timestamp: scrubText(err?.timestamp || new Date().toISOString(), 40),
  }));

  const appVersion = scrubText(body.appVersion || '8.0.0', 24) || '8.0.0';
  const platform = scrubText(body.platform || 'web', 32) || 'web';
  const viewportWidth =
    typeof body.viewportWidth === 'number' && Number.isFinite(body.viewportWidth)
      ? Math.max(0, Math.min(10000, Math.round(body.viewportWidth)))
      : 0;
  const route = scrubText(body.route || sanitizedErrors[sanitizedErrors.length - 1]?.route || '/', 100) || '/';
  const theme = scrubText(body.theme || 'default', 32) || 'default';
  const perfMode = scrubText(body.perfMode || 'unknown', 24) || 'unknown';

  const latestError = sanitizedErrors[sanitizedErrors.length - 1];
  const isManualOnly = sanitizedErrors.every((e) => e.source === 'manual');

  const summaryLines = sanitizedErrors
    .slice(-5)
    .map((e, idx) => `${idx + 1}. [${e.source}] ${e.message}`)
    .join('\n');

  const stackSnippet = latestError?.stack ? `\`\`\`\n${latestError.stack.slice(0, 850)}\n\`\`\`` : '_No stack trace_';

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return res.status(200).json({
      ok: true,
      forwarded: false,
      reason: 'WEBHOOK_NOT_CONFIGURED',
    });
  }

  const isDiscordWebhook = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(
    webhookUrl
  );
  if (!isDiscordWebhook) {
    return res.status(200).json({
      ok: true,
      forwarded: false,
      reason: 'INVALID_WEBHOOK_CONFIG',
    });
  }

  const embed = {
    title: isManualOnly
      ? `🩺 Thinking Bridge v${appVersion} — Diagnostic Log`
      : `🚨 Thinking Bridge v${appVersion} — Error Report`,
    color: isManualOnly ? 0x14b8a6 : 0xef4444,
    fields: [
      { name: 'Version', value: `\`${appVersion}\``, inline: true },
      { name: 'Platform / Viewport', value: `${platform} · ${viewportWidth}px`, inline: true },
      { name: 'Route', value: `\`${route}\``, inline: true },
      { name: 'Theme / Perf', value: `${theme} / ${perfMode}`, inline: true },
      {
        name: `Error Summary (${sanitizedErrors.length})`,
        value: summaryLines.slice(0, 1000) || 'No summary',
        inline: false,
      },
      {
        name: 'Stack Snippet',
        value: stackSnippet.slice(0, 1000),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Arabic-English Thinking Bridge · Zero-PII User-Approved Diagnostic',
    },
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Thinking Bridge Diagnostics',
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      return res.status(502).json({ ok: false, error: 'UPSTREAM_WEBHOOK_FAILED' });
    }

    return res.status(200).json({ ok: true, forwarded: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'UPSTREAM_NETWORK_ERROR' });
  }
}
