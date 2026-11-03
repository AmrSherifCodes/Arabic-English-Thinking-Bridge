// Health & Capacity Check Endpoint
export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');

  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'Thinking Bridge AI & Core API',
      version: 'v3.0.5',
      uptime: process.uptime(),
      timestamp: Date.now(),
      freeTierLimits: {
        supabaseDbMb: 500,
        supabaseMau: 50000,
        geminiRpm: 15,
        geminiRpd: 1500,
        vercelBandwidthGb: 100,
      },
    })
  );
}
