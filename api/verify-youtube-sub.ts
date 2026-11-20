import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function to verify YouTube Channel Subscription via Google OAuth Access Token
 * Endpoint: POST /api/verify-youtube-sub
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body || {};
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid accessToken in request body.' });
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    return res.status(500).json({ error: 'YOUTUBE_CHANNEL_ID is not configured on server.' });
  }

  try {
    const ytUrl = `https://www.googleapis.com/youtube/v3/subscriptions?part=id&mine=true&forChannelId=${encodeURIComponent(
      channelId
    )}`;

    const response = await fetch(ytUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || 'YouTube API verification failed.',
        subscribed: false,
      });
    }

    const data = await response.json();
    const isSubscribed = Array.isArray(data.items) && data.items.length > 0;

    return res.status(200).json({
      subscribed: isSubscribed,
      totalResults: data.pageInfo?.totalResults || 0,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Internal server error while verifying subscription.',
      subscribed: false,
    });
  }
}
