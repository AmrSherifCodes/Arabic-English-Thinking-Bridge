// Vercel Serverless Function — PostgreSQL (Neon / Direct Postgres) Feedback API
import { neon } from '@neondatabase/serverless';

function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) return null;
  return neon(connectionString);
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

async function ensureTable(sql) {
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

  const sql = getDb();
  if (!sql) {
    return sendJson(res, 503, {
      error: 'PostgreSQL connection string (POSTGRES_URL or DATABASE_URL) is not configured on Vercel.'
    });
  }

  // 1. GET: Fetch feedback submissions (for Admin dashboard)
  if (req.method === 'GET') {
    try {
      await ensureTable(sql);
      const rows = await sql`
        SELECT id, created_at, rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
        FROM feedback_submissions
        ORDER BY created_at DESC
        LIMIT 100;
      `;
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('PostgreSQL GET error:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve feedback from PostgreSQL.', details: err.message });
    }
  }

  // 2. POST: Submit new feedback
  if (req.method === 'POST') {
    try {
      await ensureTable(sql);
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

      const [inserted] = await sql`
        INSERT INTO feedback_submissions (
          rating, category, message, is_anonymous, user_name, profile_goal, focus_area, dialect
        ) VALUES (
          ${rating}, ${category}, ${message}, ${isAnonymous}, ${userName}, ${profileGoal}, ${focusArea}, ${dialect}
        )
        RETURNING id, created_at;
      `;

      return sendJson(res, 201, {
        success: true,
        id: inserted?.id,
        created_at: inserted?.created_at,
        message: 'Feedback successfully recorded in PostgreSQL!'
      });
    } catch (err) {
      console.error('PostgreSQL POST error:', err);
      return sendJson(res, 500, { error: 'Failed to insert feedback into PostgreSQL.', details: err.message });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}

