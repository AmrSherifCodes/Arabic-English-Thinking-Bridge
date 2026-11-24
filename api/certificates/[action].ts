import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CERT_CODE_REGEX = /^TB-CERT-[A-Z0-9]{4,20}$/;

function constantTimeEquals(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function isAdminAuthorized(req: VercelRequest): boolean {
  const expected = process.env.ADMIN_API_SECRET?.trim();
  if (!expected) return false;
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization.trim() : '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) return false;
  const provided = authHeader.slice(7).trim();
  return Boolean(provided) && constantTimeEquals(provided, expected);
}

function getAction(req: VercelRequest): string {
  const q = req.query?.action;
  if (typeof q === 'string' && q.trim()) return q.trim().toLowerCase();
  if (Array.isArray(q) && q[0]) return q[0].trim().toLowerCase();
  const pathname = (req.url || '').split('?')[0];
  const parts = pathname.split('/').filter(Boolean);
  return (parts[parts.length - 1] || '').toLowerCase();
}

async function callSupabaseRpc<T>(
  url: string,
  key: string,
  rpcName: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`SUPABASE_RPC_${response.status}`);
  }
  return (await response.json()) as T;
}

async function handleIssue(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  let authorized = isAdminAuthorized(req);

  if (!authorized) {
    const teacherDeviceId = typeof body.teacherDeviceId === 'string' ? body.teacherDeviceId.trim() : '';
    if (teacherDeviceId.length >= 8 && teacherDeviceId.length <= 128) {
      try {
        const ent = await callSupabaseRpc<{ ok?: boolean; tier?: string }>(url, key, 'get_device_entitlement', {
          p_device_id: teacherDeviceId,
        });
        if (ent?.ok && ent.tier === 'academy_teacher') {
          authorized = true;
        }
      } catch {
        // Fall through to 401
      }
    }
  }

  if (!authorized) {
    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  }

  const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
  const trackTitle = typeof body.trackTitle === 'string' ? body.trackTitle.trim() : '';
  const orgSlug = typeof body.orgSlug === 'string' && body.orgSlug.trim() ? body.orgSlug.trim().toLowerCase() : null;

  if (studentName.length < 2 || studentName.length > 120) {
    return res.status(400).json({ ok: false, error: 'INVALID_STUDENT_NAME' });
  }
  if (trackTitle.length < 2 || trackTitle.length > 160) {
    return res.status(400).json({ ok: false, error: 'INVALID_TRACK_TITLE' });
  }

  try {
    const issued = await callSupabaseRpc<{
      ok?: boolean;
      certificate?: Record<string, unknown>;
      error?: string;
    }>(url, key, 'issue_certificate', {
      p_student_name: studentName,
      p_track_title: trackTitle,
      p_org_slug: orgSlug,
    });

    if (!issued?.ok || !issued.certificate) {
      return res.status(400).json({ ok: false, error: issued?.error || 'ISSUE_FAILED' });
    }

    return res.status(200).json({
      ok: true,
      certificate: issued.certificate,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}

async function handleVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const rawCode = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  if (!CERT_CODE_REGEX.test(rawCode)) {
    return res.status(400).json({ ok: false, error: 'INVALID_FORMAT' });
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'SERVER_UNCONFIGURED' });
  }

  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/verify_certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_cert_code: rawCode }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'VERIFY_FAILED' });
    }

    const data = (await response.json()) as {
      ok?: boolean;
      valid?: boolean;
      certificate?: Record<string, unknown>;
      error?: string;
    };

    if (!data?.ok) {
      const status = data?.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ ok: false, error: data?.error || 'NOT_FOUND' });
    }

    return res.status(200).json({
      ok: true,
      valid: Boolean(data.valid),
      certificate: data.certificate,
    });
  } catch {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const action = getAction(req);
  if (action === 'issue') return handleIssue(req, res);
  if (action === 'verify') return handleVerify(req, res);
  return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
}
