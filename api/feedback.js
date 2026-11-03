// Vercel Serverless Function — PostgreSQL (Supabase / Neon) Feedback API
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getNeon() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) return null;
  // Neon driver requires a Neon HTTP endpoint (*.neon.tech)
  if (connectionString.includes('neon.tech') || connectionString.includes('neon.')) {
    return neon(connectionString);
  }
  return null;
}

function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  for (const [key, val] of Object.entries(headers)) {
    res.setHeader(key, val);
  }
  res.end(JSON.stringify(data));
}

let tableInitialized = false;

async function ensureNeonTable(sql) {
  if (tableInitialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      rating INT NOT NULL,
      category VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT TRUE,
      user_name VARCHAR(255),
      profile_goal VARCHAR(255),
      focus_area VARCHAR(255),
      dialect VARCHAR(255)
    );
  `;
  tableInitialized = true;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  const supabase = getSupabase();
  const neonSql = getNeon();

  if (!supabase && !neonSql) {
    return sendJson(res, 503, {
      error: 'PostgreSQL connection is not configured on Vercel. Set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY or POSTGRES_URL.'
    });
  }

  // 1. GET: Fetch feedback submissions (for Admin dashboard)
  if (req.method === 'GET') {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('feedback_submissions')
          .select('id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return sendJson(res, 200, { success: true, count: (data || []).length, data: data || [] });
      }

      if (neonSql) {
        await ensureNeonTable(neonSql);
        const rows = await neonSql`
          SELECT id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
          FROM feedback_submissions
          ORDER BY created_at DESC
          LIMIT 100;
        `;
        return sendJson(res, 200, { success: true, count: rows.length, data: rows });
      }
    } catch (err) {
      console.error('PostgreSQL GET error:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve feedback from PostgreSQL.', details: err.message });
    }
  }

  // 2. POST: Submit new feedback
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));
      const category = String(body.category || 'general').slice(0, 50);
      const message = String(body.message || '').trim().slice(0, 2000);
      const isAnonymous = body.isAnonymous !== false;
      const userName = isAnonymous ? null : String(body.userName || '').trim().slice(0, 255) || null;
      const profileGoal = String(body.profileGoal || '').trim().slice(0, 255) || null;
      const focusArea = String(body.focusArea || '').trim().slice(0, 255) || null;
      const dialect = String(body.dialect || '').trim().slice(0, 255) || null;

      if (!message && rating === 0) {
        return sendJson(res, 400, { error: 'Feedback message or rating is required.' });
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('feedback_submissions')
          .insert([
            {
              rating,
              category,
              message,
              is_anonymous: isAnonymous,
              user_name: userName,
              profile_goal: profileGoal,
              focus_area: focusArea,
              dialect: dialect
            }
          ])
          .select('id, created_at')
          .single();

        if (error) throw error;
        return sendJson(res, 201, {
          success: true,
          message: 'Feedback submitted successfully to PostgreSQL!',
          id: data?.id,
          created_at: data?.created_at
        });
      }

      if (neonSql) {
        await ensureNeonTable(neonSql);
        const [inserted] = await neonSql`
          INSERT INTO feedback_submissions (
            rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
          ) VALUES (
            ${rating}, ${category}, ${message}, ${isAnonymous}, ${userName}, ${profileGoal}, ${focusArea}, ${dialect}
          )
          RETURNING id, created_at;
        `;

        return sendJson(res, 201, {
          success: true,
          message: 'Feedback submitted successfully to PostgreSQL!',
          id: inserted?.id,
          created_at: inserted?.created_at
        });
      }
    } catch (err) {
      console.error('PostgreSQL POST error:', err);
      return sendJson(res, 500, { error: 'Failed to record feedback.', details: err.message });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}
