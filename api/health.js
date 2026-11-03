import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let dbReachable = false;
  let todayQuotaCount = 0;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ai_quotas')
        .select('request_count')
        .eq('id', `global:${today}`)
        .single();

      if (!error) {
        dbReachable = true;
        todayQuotaCount = data?.request_count || 0;
      } else {
        const { error: pingErr } = await supabase.from('user_state').select('version').limit(1);
        if (!pingErr) dbReachable = true;
      }
    } catch {
      dbReachable = false;
    }
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: dbReachable ? 'healthy' : 'degraded',
      service: 'Thinking Bridge AI & Core API',
      version: 'v3.1.0',
      uptime: Math.round(process.uptime()),
      timestamp: Date.now(),
      database: {
        reachable: dbReachable,
        provider: 'Supabase PostgreSQL',
      },
      aiQuotasToday: {
        globalRequestsToday: todayQuotaCount,
        globalCapLimit: 1000,
      },
      note: 'All free tier limit numbers are threshold targets. Verify live usage on respective cloud dashboards.',
    })
  );
}
