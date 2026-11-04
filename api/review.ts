const ALLOWED_CORS_ORIGINS = new Set([
  'https://tb-eg.vercel.app',
  'https://thinkingbridge.vercel.app',
  'https://arabicenglishthinkingbridge.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost'
]);

const PROJECT_PREVIEW_ORIGIN_RE = /^https?:\/\/(?:tb-eg|thinkingbridge|arabic-?english-?thinking-?bridge)(?:-[a-z0-9-]+)?\.vercel\.app$/i;

function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (PROJECT_PREVIEW_ORIGIN_RE.test(origin)) return true;
  return false;
}

function getCorsOrigin(origin: string | null | undefined): string {
  if (isAllowedOrigin(origin)) {
    return origin!;
  }
  return 'https://tb-eg.vercel.app';
}

const ipStore = new Map<string, { count: number; resetTime: number }>();

function applyRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipStore.get(ip);
  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (record.count >= 5) return false;
  record.count += 1;
  return true;
}

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/@everyone/gi, 'everyone')
    .replace(/@here/gi, 'here')
    .replace(/<@&?\d+>/g, '')
    .trim();
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin as string | undefined;
  const corsOrigin = getCorsOrigin(origin);

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
  if (!applyRateLimit(clientIp)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a minute.' });
  }

  try {
    const { rating, text, name, recommend } = req.body || {};

    const cleanText = sanitizeText(String(text || ''));
    if (!cleanText || cleanText.length < 3 || cleanText.length > 500) {
      return res.status(400).json({ ok: false, error: 'Review text must be between 3 and 500 characters' });
    }

    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanName = sanitizeText(String(name || 'Anonymous Learner')).slice(0, 40) || 'Anonymous Learner';
    const isRecommended = recommend !== false;

    let webhookFailed = false;
    let webhookStatus: number | null = null;

    const webhookUrl = process.env.DISCORD_REVIEWS_WEBHOOK || process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_FEEDBACK_WEBHOOK;
    if (webhookUrl) {
      const content = `🌟 **New Thinking Bridge App Review!**\n**Rating:** ${'⭐'.repeat(cleanRating)} (${cleanRating}/5)\n**Reviewer:** ${cleanName}\n**Would Recommend:** ${isRecommended ? 'Yes 👍' : 'No 👎'}\n**Review:** "${cleanText}"`;
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!discordResponse.ok) {
        webhookFailed = true;
        webhookStatus = discordResponse.status;
      }
    } else {
      webhookFailed = true;
    }

    return res.status(200).json({
      ok: true,
      webhookFailed,
      webhookStatus,
      review: {
        id: `rev-${Date.now()}`,
        name: cleanName,
        rating: cleanRating,
        text: cleanText,
        recommend: isRecommended,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ ok: false, error: errMsg });
  }
}
