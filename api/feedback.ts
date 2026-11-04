import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'Missing Webhook URL' });

  try {
    const { rating, category, message, isAnonymous, userName, profileGoal, dialect, createdAt } = req.body;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: \📩 **New Thinking Bridge Feedback!**\n**Rating:** \/5 ⭐\n**Category:** \\n**Message:** \\n**User:** \\n**Goal:** \ | **Dialect:** \\
      }),
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send' });
  }
}
