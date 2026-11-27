// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { VercelRequest, VercelResponse } from '@vercel/node';

const rateBucket = new Map<string, { count: number; resetAt: number }>();

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
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, configured: false, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, configured: true, error: data?.message || 'RPC_FAILED' };
  }
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    const result = await callSupabaseRpc('get_top_leaderboard', { p_limit: 100 });
    if (!result?.ok) {
      return res.status(200).json({ ok: true, offlineFallback: true, entries: [] });
    }
    return res.status(200).json({ ok: true, entries: result.entries || [] });
  }

  if (req.method === 'POST') {
    if (!checkRateLimit(ip, 15, 60_000)) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED' });
    }

    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const userId = String(body.userId || '').trim();
    const displayName = sanitizeName(body.displayName);
    const country = String(body.country || 'EG').toUpperCase().slice(0, 2);
    const xpDelta = Math.max(0, Math.min(150, Number(body.xpDelta) || 0));
    const streak = Math.max(0, Math.min(3650, Number(body.streak) || 0));
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
