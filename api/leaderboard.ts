// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { VercelRequest, VercelResponse } from '@vercel/node';

const rateBucket = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_CORS_ORIGINS = new Set([
  'https://tb-eg.vercel.app',
  'https://tb-amr.vercel.app',
  'https://fekr-eg.vercel.app',
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost',
]);

function isAllowedOrigin(origin: string | undefined): origin is string {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

function checkRateLimit(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateBucket.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateBucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function sanitizeName(raw: unknown): string {
  return String(raw || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32);
}

async function callSupabaseRpc(rpcName: string, body: Record<string, unknown>) {
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, configured: false, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, configured: true, error: data?.message || 'RPC_FAILED' };
    }
    return data;
  } catch {
    return { ok: false, configured: true, error: 'RPC_NETWORK_ERROR' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(204).end();
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

  if (req.method === 'GET') {
    const result = await callSupabaseRpc('get_top_leaderboard', { p_limit: 50 });
    if (!result?.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, offlineFallback: true, entries: [] });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      ok: true,
      offlineFallback: false,
      entries: Array.isArray(result.entries) ? result.entries : [],
    });
  }

  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    if (!checkRateLimit(ip, 15, 60_000)) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED' });
    }

    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const userId = String(body.userId || '').trim();
    const displayName = sanitizeName(body.displayName);
    const country = String(body.country || 'EG').toUpperCase().slice(0, 2);
    const xpDelta = Math.max(0, Math.min(150, Math.floor(Number(body.xpDelta) || 0)));
    const streak = Math.max(0, Math.min(3650, Math.floor(Number(body.streak) || 0)));
    const hidden = Boolean(body.hidden);

    if (userId.length < 8 || userId.length > 128) {
      return res.status(400).json({ ok: false, error: 'INVALID_USER_ID' });
    }

    const result = await callSupabaseRpc('submit_leaderboard_xp', {
      p_user_id: userId,
      p_display_name: displayName || 'Learner',
      p_country: /^[A-Z]{2}$/.test(country) ? country : 'EG',
      p_xp_delta: xpDelta,
      p_streak: streak,
      p_hidden: hidden,
    });

    if (!result?.ok) {
      return res.status(200).json({ ok: false, error: result?.error || 'UNAVAILABLE' });
    }
    return res.status(200).json(result);
  }

  return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
}
