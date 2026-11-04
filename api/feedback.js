import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

export const ALLOWED_CORS_ORIGINS = new Set([
  'https://tb-eg.vercel.app',
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'https://amrsherif.localhost.cc',
  'https://www.amrsherif.localhost.cc',
  'http://amrsherif.localhost.cc',
  'http://www.amrsherif.localhost.cc',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost',
]);

const PROJECT_PREVIEW_ORIGIN_RE = /^https?:\/\/(?:tb-eg|thinkingbridge|arabic-?english-?thinking-?bridge|amrsherif\.localhost\.cc|www\.amrsherif\.localhost\.cc)(?:-[a-z0-9-]+)?\.(?:vercel\.app|localhost\.cc)$/i;

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return PROJECT_PREVIEW_ORIGIN_RE.test(origin);
}

export function getCorsOrigin(origin) {
  return isAllowedOrigin(origin) ? origin : 'https://amrsherif.localhost.cc';
}

function isAllowedUrlOrigin(urlString) {
  if (!urlString) return false;
  try {
    return isAllowedOrigin(new URL(urlString).origin);
  } catch {
    return false;
  }
}

const feedbackRateLimits = new Map();
const RATE_LIMIT_COUNT = 5;
const RATE_WINDOW_MS = 5 * 60 * 1000;

export function checkFeedbackRateLimit(ip) {
  const now = Date.now();
  if (feedbackRateLimits.size > 2000) {
    for (const [key, value] of feedbackRateLimits.entries()) {
      if (value.resetAt <= now) feedbackRateLimits.delete(key);
    }
  }
  const record = feedbackRateLimits.get(ip);
  if (!record || record.resetAt <= now) {
    feedbackRateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_COUNT) return false;
  record.count += 1;
  return true;
}

export function getClientIp(req) {
  const headers = req.headers || {};
  for (const headerName of ['x-real-ip', 'x-vercel-forwarded-for', 'x-forwarded-for']) {
    const value = headers[headerName];
    if (typeof value === 'string' && value.trim()) return value.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function normalizeSubscriptionEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function safeCompare(candidate, secret) {
  if (typeof candidate !== 'string' || typeof secret !== 'string') return false;
  const candidateBuffer = Buffer.from(candidate);
  const secretBuffer = Buffer.from(secret);
  if (candidateBuffer.length !== secretBuffer.length) return false;
  return crypto.timingSafeEqual(candidateBuffer, secretBuffer);
}

export function isAdminAuthorized(req) {
  const secret = process.env.FEEDBACK_ADMIN_KEY || process.env.ADMIN_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length < 16) return false;
  const headers = req.headers || {};
  const authorization = typeof headers.authorization === 'string' ? headers.authorization : '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const candidate = headers['x-admin-key'] || bearer;
  return safeCompare(candidate, secret);
}

function getPostgres() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString || !/neon(?:\.tech|\.)/i.test(connectionString)) return null;
  return neon(connectionString);
}

function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(data));
}

let tablesInitialized = false;

async function ensureTables(sql) {
  if (tablesInitialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rating INT NOT NULL,
      category VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
      user_name VARCHAR(255),
      profile_goal VARCHAR(255),
      focus_area VARCHAR(255),
      dialect VARCHAR(255)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      email VARCHAR(254) PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  tablesInitialized = true;
}

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  const referer = req.headers?.referer;
  const corsOrigin = getCorsOrigin(origin);
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (!['GET', 'POST'].includes(req.method)) {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  if (req.headers?.['sec-fetch-site'] === 'cross-site' && !origin && !referer) {
    return sendJson(res, 403, { error: 'Cross-site request rejected.' });
  }
  if (origin && !isAllowedOrigin(origin)) return sendJson(res, 403, { error: 'Origin not allowed.' });
  if (!origin && referer && !isAllowedUrlOrigin(referer)) {
    return sendJson(res, 403, { error: 'Referer origin not allowed.' });
  }

  const postgres = getPostgres();
  if (!postgres) {
    return sendJson(res, 503, { error: 'PostgreSQL connection is not configured.' });
  }

  if (req.method === 'GET') {
    if (!isAdminAuthorized(req)) {
      return sendJson(res, 401, { error: 'Unauthorized: Admin authorization required.' });
    }
    try {
      await ensureTables(postgres);
      const rows = await postgres`
        SELECT id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
        FROM feedback_submissions
        ORDER BY created_at DESC
        LIMIT 100;
      `;
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    } catch (error) {
      console.error('Could not read feedback records.', error);
      return sendJson(res, 500, { error: 'Failed to retrieve feedback.' });
    }
  }

  if (!checkFeedbackRateLimit(getClientIp(req))) {
    return sendJson(res, 429, { error: 'Too many feedback submissions. Please wait a few minutes.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    await ensureTables(postgres);

    if (body.type === 'subscribe') {
      const email = normalizeSubscriptionEmail(body.email);
      if (!email) return sendJson(res, 400, { error: 'A valid email address is required.' });
      const inserted = await postgres`
        INSERT INTO subscribers (email)
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING
        RETURNING email;
      `;
      return sendJson(res, inserted.length ? 201 : 200, {
        success: true,
        alreadySubscribed: inserted.length === 0,
      });
    }

    const rating = Math.min(5, Math.max(1, Number.parseInt(body.rating, 10) || 5));
    const allowedCategories = new Set(['general', 'bug', 'feature', 'content']);
    const category = allowedCategories.has(body.category) ? body.category : 'general';
    const message = String(body.message || '').trim().slice(0, 2000);
    const isAnonymous = body.isAnonymous !== false;
    const userName = isAnonymous ? null : String(body.userName || '').trim().slice(0, 100) || null;
    const profileGoal = String(body.profileGoal || '').trim().slice(0, 100) || null;
    const focusArea = String(body.focusArea || '').trim().slice(0, 100) || null;
    const dialect = String(body.dialect || '').trim().slice(0, 50) || null;

    if (!message) return sendJson(res, 400, { error: 'Feedback message is required.' });

    const [inserted] = await postgres`
      INSERT INTO feedback_submissions (
        rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
      ) VALUES (
        ${rating}, ${category}, ${message}, ${isAnonymous}, ${userName}, ${profileGoal}, ${focusArea}, ${dialect}
      )
      RETURNING id, created_at;
    `;
    return sendJson(res, 201, {
      success: true,
      message: 'Feedback submitted successfully.',
      id: inserted?.id,
      created_at: inserted?.created_at,
    });
  } catch (error) {
    console.error('Could not store feedback.', error);
    return sendJson(res, 500, { error: 'Failed to record feedback. Please try again later.' });
  }
}
