import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

async function callSupabaseRpc<T>(url: string, key: string, rpcName: string, body: Record<string, unknown>): Promise<T> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

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
