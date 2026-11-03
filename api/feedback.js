// Vercel Serverless Function — PostgreSQL (Supabase / Neon) Feedback API
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_CORS_ORIGINS = new Set([
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'https://tb-eg.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost'
]);

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

export function getCorsOrigin(origin) {
  if (isAllowedOrigin(origin)) {
    return origin;
  }
  return 'https://arabicenglishthinkingbridge.vercel.app';
}

function isAllowedUrlOrigin(urlStr) {
  if (!urlStr) return false;
  try {
    const u = new URL(urlStr);
    const originOnly = `${u.protocol}//${u.host}`;
    return isAllowedOrigin(originOnly);
  } catch {
    return false;
  }
}

// In-memory rate limiter: max 5 submissions per 5 minutes per IP
const feedbackRateLimits = new Map();
const RATE_LIMIT_COUNT = 5;
const RATE_WINDOW_MS = 5 * 60 * 1000;

export function checkFeedbackRateLimit(ip) {
  const now = Date.now();
  if (feedbackRateLimits.size > 2000) {
    for (const [key, val] of feedbackRateLimits.entries()) {
      if (val.resetAt <= now) feedbackRateLimits.delete(key);
    }
  }
  const record = feedbackRateLimits.get(ip);
  if (!record || record.resetAt <= now) {
    feedbackRateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_COUNT) {
    return false;
  }
  record.count += 1;
  return true;
}

export function getClientIp(req) {
  const headers = req.headers || {};
  const xRealIp = headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.trim()) return xRealIp.trim();
  const xVercel = headers['x-vercel-forwarded-for'];
  if (typeof xVercel === 'string' && xVercel.trim()) return xVercel.split(',')[0].trim();
  const xFwd = headers['x-forwarded-for'];
  if (typeof xFwd === 'string' && xFwd.trim()) return xFwd.split(',')[0].trim();
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function isAdminAuthorized(req) {
  const headers = req.headers || {};
  const authHeader = headers.authorization || '';
  const adminKey = headers['x-admin-key'] || '';
  const secretKey =
    process.env.FEEDBACK_ADMIN_KEY ||
    process.env.ADMIN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    return false;
  }

  if (adminKey && adminKey === secretKey) return true;
  if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() === secretKey) return true;
  return false;
}

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getNeon() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) return null;
  if (connectionString.includes('neon.tech') || connectionString.includes('neon.')) {
    return neon(connectionString);
  }
  return null;
}

function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, val] of Object.entries(headers)) {
    res.setHeader(key, val);
  }
  res.end(JSON.stringify(data));
}

let tableInitialized = false;

async function ensureNeonTable(sql) {
  if (tableInitialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      rating INT NOT NULL,
      category VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT TRUE,
      user_name VARCHAR(255),
      profile_goal VARCHAR(255),
      focus_area VARCHAR(255),
      dialect VARCHAR(255)
    );
  `;
  tableInitialized = true;
}

export default async function handler(req, res) {
  const headers = req.headers || {};
  const origin = headers.origin;
  const referer = headers.referer;

  res.setHeader('Access-Control-Allow-Origin', getCorsOrigin(origin));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Key');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Cross-site request forgery prevention
  const secFetchSite = headers['sec-fetch-site'];
  if (secFetchSite === 'cross-site' && !origin && !referer) {
    return sendJson(res, 403, { error: 'Cross-site request rejected.' });
  }

  if (origin) {
    if (!isAllowedOrigin(origin)) {
      return sendJson(res, 403, { error: 'Origin not allowed.' });
    }
  } else if (referer) {
    if (!isAllowedUrlOrigin(referer)) {
      return sendJson(res, 403, { error: 'Referer origin not allowed.' });
    }
  }

  const supabase = getSupabase();
  const neonSql = getNeon();

  if (!supabase && !neonSql) {
    return sendJson(res, 503, {
      error: 'PostgreSQL connection is not configured on Vercel. Set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY or POSTGRES_URL.'
    });
  }

  // 1. GET: Fetch feedback submissions (Secured Admin endpoint)
  if (req.method === 'GET') {
    if (!isAdminAuthorized(req)) {
      return sendJson(res, 401, {
        error: 'Unauthorized: Admin authorization required to access feedback submissions.'
      });
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('feedback_submissions')
          .select('id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return sendJson(res, 200, { success: true, count: (data || []).length, data: data || [] });
      }

      if (neonSql) {
        await ensureNeonTable(neonSql);
        const rows = await neonSql`
          SELECT id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
          FROM feedback_submissions
          ORDER BY created_at DESC
          LIMIT 100;
        `;
        return sendJson(res, 200, { success: true, count: rows.length, data: rows });
      }
    } catch (err) {
      console.error('PostgreSQL GET error:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve feedback.' });
    }
  }

  // 2. POST: Submit new feedback
  if (req.method === 'POST') {
    const clientIp = getClientIp(req);
    if (!checkFeedbackRateLimit(clientIp)) {
      return sendJson(res, 429, {
        error: 'Too many feedback submissions. Please wait a few minutes before submitting again.'
      });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));
      const allowedCategories = new Set(['general', 'bug', 'feature', 'content']);
      const category = allowedCategories.has(body.category) ? body.category : 'general';
      const message = String(body.message || '').trim().slice(0, 2000);
      const isAnonymous = body.isAnonymous !== false;
      const userName = isAnonymous ? null : String(body.userName || '').trim().slice(0, 100) || null;
      const profileGoal = String(body.profileGoal || '').trim().slice(0, 100) || null;
      const focusArea = String(body.focusArea || '').trim().slice(0, 100) || null;
      const dialect = String(body.dialect || '').trim().slice(0, 50) || null;

      if (!message && rating === 0) {
        return sendJson(res, 400, { error: 'Feedback message or rating is required.' });
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('feedback_submissions')
          .insert([
            {
              rating,
              category,
              message,
              is_anonymous: isAnonymous,
              user_name: userName,
              profile_goal: profileGoal,
              focus_area: focusArea,
              dialect: dialect
            }
          ])
          .select('id, created_at')
          .single();

        if (error) throw error;
        return sendJson(res, 201, {
          success: true,
          message: 'Feedback submitted successfully to PostgreSQL!',
          id: data?.id,
          created_at: data?.created_at
        });
      }

      if (neonSql) {
        await ensureNeonTable(neonSql);
        const [inserted] = await neonSql`
          INSERT INTO feedback_submissions (
            rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
          ) VALUES (
            ${rating}, ${category}, ${message}, ${isAnonymous}, ${userName}, ${profileGoal}, ${focusArea}, ${dialect}
          )
          RETURNING id, created_at;
        `;

        return sendJson(res, 201, {
          success: true,
          message: 'Feedback submitted successfully to PostgreSQL!',
          id: inserted?.id,
          created_at: inserted?.created_at
        });
      }
    } catch (err) {
      console.error('PostgreSQL POST error:', err);
      return sendJson(res, 500, { error: 'Failed to record feedback. Please try again later.' });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}
