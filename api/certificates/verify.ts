import type { VercelRequest, VercelResponse } from '@vercel/node';

const CERT_CODE_REGEX = /^TB-CERT-[A-Z0-9]{4,20}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

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
