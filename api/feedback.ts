import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (PROJECT_PREVIEW_ORIGIN_RE.test(origin)) return true;
  return false;
}

export function getCorsOrigin(origin: string | null | undefined): string {
  if (isAllowedOrigin(origin)) {
    return origin!;
  }
  return 'https://tb-eg.vercel.app';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_FEEDBACK_WEBHOOK || process.env.DISCORD_REVIEWS_WEBHOOK;

  try {
    const { type, email, rating, category, message, isAnonymous, userName, profileGoal, dialect, createdAt } = req.body || {};

    let discordPayload;
    if (type === 'subscribe' || email) {
      discordPayload = {
        content: `🎉 **New Thinking Bridge Newsletter Subscription!**\n**Email:** \`${email || 'N/A'}\`\n**Date:** ${createdAt || new Date().toISOString()}`
      };
    } else {
      discordPayload = {
        content: `📩 **New Thinking Bridge Feedback!**
**Rating:** ${rating || 5}/5 ⭐
**Category:** ${category || 'general'}
**Message:** ${message || 'N/A'}
**User:** ${isAnonymous ? 'Anonymous' : (userName || 'Learner')}
**Goal:** ${profileGoal || 'N/A'} | **Dialect:** ${dialect || 'N/A'}
**Date:** ${createdAt || new Date().toISOString()}`
      };
    }

    let webhookFailed = false;
    let webhookStatus: number | null = null;

    if (webhookUrl) {
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      if (!discordResponse.ok) {
        console.warn(`Discord API Error: ${discordResponse.status}`);
        webhookFailed = true;
        webhookStatus = discordResponse.status;
      }
    } else {
      console.warn("DISCORD_WEBHOOK_URL is not set in Vercel env; stored feedback locally.");
      webhookFailed = true;
    }

    return res.status(200).json({
      success: true,
      savedLocally: true,
      webhookFailed,
      webhookStatus
    });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(200).json({ success: true, savedLocally: true, webhookFailed: true, webhookStatus: 500 });
  }
}
