import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_FEEDBACK_WEBHOOK;

  try {
    const { rating, category, message, isAnonymous, userName, profileGoal, dialect, createdAt } = req.body || {};

    const discordPayload = {
      content: `📩 **New Thinking Bridge Feedback!**
**Rating:** ${rating || 5}/5 ⭐
**Category:** ${category || 'general'}
**Message:** ${message || 'N/A'}
**User:** ${isAnonymous ? 'Anonymous' : (userName || 'Learner')}
**Goal:** ${profileGoal || 'N/A'} | **Dialect:** ${dialect || 'N/A'}
**Date:** ${createdAt || new Date().toISOString()}`
    };

    if (webhookUrl) {
      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      if (!discordResponse.ok) {
        console.warn(`Discord API Error: ${discordResponse.status}`);
      }
    } else {
      console.warn("DISCORD_WEBHOOK_URL is not set in Vercel env; stored feedback locally.");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(200).json({ success: true, savedLocally: true });
  }
}
