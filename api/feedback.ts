import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Missing DISCORD_WEBHOOK_URL in Vercel env");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { rating, category, message, isAnonymous, userName, profileGoal, dialect, createdAt } = req.body;

    const discordPayload = {
      content: `📩 **New Thinking Bridge Feedback!**
**Rating:** ${rating}/5 ⭐
**Category:** ${category}
**Message:** ${message}
**User:** ${isAnonymous ? 'Anonymous' : (userName || 'Learner')}
**Goal:** ${profileGoal || 'N/A'} | **Dialect:** ${dialect || 'N/A'}
**Date:** ${createdAt}`
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord API Error: ${discordResponse.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ error: 'Failed to process feedback' });
  }
}
