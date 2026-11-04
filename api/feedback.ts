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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

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
    const { rating, category, message, isAnonymous, userName } = req.body || {};

    const cleanMessage = sanitizeText(String(message || ''));
    if (!cleanMessage || cleanMessage.length < 2 || cleanMessage.length > 1000) {
      return res.status(400).json({ ok: false, error: 'Message must be between 2 and 1000 characters' });
    }

    const cleanRating = Number(rating) || 5;
    const cleanCategory = String(category || 'general').slice(0, 30);
    const cleanUser = isAnonymous ? 'Anonymous' : sanitizeText(String(userName || 'Learner')).slice(0, 40);

    const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK;
    if (webhookUrl) {
      const content = `📩 **New Thinking Bridge Feedback!**\n**Rating:** ${cleanRating}/5 ⭐\n**Category:** ${cleanCategory}\n**User:** ${cleanUser}\n**Message:** ${cleanMessage}`;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ ok: false, error: errMsg });
  }
}
