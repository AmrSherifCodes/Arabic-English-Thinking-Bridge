export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'healthy',
    service: 'Thinking Bridge',
    version: 'v3.1.0',
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    storage: 'local-only',
  }));
}
