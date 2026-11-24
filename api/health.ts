import { readFileSync } from 'node:fs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ServiceCheck {
  ok: boolean;
  configured: boolean;
  latencyMs?: number;
  error?: string;
}

function getPackageVersion(): string {
  try {
    const raw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
    const parsed = JSON.parse(raw) as { version?: string };
    if (parsed?.version) {
      return parsed.version.startsWith('v') ? parsed.version : `v${parsed.version}`;
    }
  } catch {
    // Fallback below
  }
  return 'v8.0.0';
}

function sendJson(res: VercelResponse, statusCode: number, payload: unknown): void {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.end(JSON.stringify(payload));
}

function sendEmpty(res: VercelResponse, statusCode: number): void {
  if (typeof res.status === 'function') {
    res.status(statusCode).end();
    return;
  }
  res.statusCode = statusCode;
  res.end();
}

async function checkSupabase(): Promise<ServiceCheck> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, configured: false };
  }

  const started = Date.now();
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(3000),
    });
    const latencyMs = Date.now() - started;
    const ok = res.status < 500 && res.status !== 401 && res.status !== 403;
    return { ok, configured: true, latencyMs, ...(ok ? {} : { error: `HTTP_${res.status}` }) };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.name : 'FETCH_ERROR',
    };
  }
}

async function checkRedis(): Promise<ServiceCheck> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return { ok: false, configured: false };
  }

  const started = Date.now();
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(3000),
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return { ok: false, configured: true, latencyMs, error: `HTTP_${res.status}` };
    }
    const data = (await res.json().catch(() => null)) as { result?: string } | null;
    const ok = data?.result === 'PONG';
    return { ok, configured: true, latencyMs, ...(ok ? {} : { error: 'UNEXPECTED_PING' }) };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.name : 'FETCH_ERROR',
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  const method = req?.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'GET, HEAD');
    }
    sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const [supabase, redis] = await Promise.all([checkSupabase(), checkRedis()]);

  const supabaseHealthy = !supabase.configured || supabase.ok;
  const redisHealthy = !redis.configured || redis.ok;
  const ok = supabaseHealthy && redisHealthy;

  const payload = {
    ok,
    status: ok ? 'healthy' : 'degraded',
    version: getPackageVersion(),
    timestamp: new Date().toISOString(),
    checks: {
      supabase,
      redis,
    },
  };

  if (method === 'HEAD') {
    sendEmpty(res, ok ? 200 : 503);
    return;
  }

  sendJson(res, ok ? 200 : 503, payload);
}
