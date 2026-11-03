import { API_BASE_URL } from '../utils/api';

export interface FeedbackData {
  originalText?: string;
  draftedMessage?: string;
  message?: string;
  category?: 'bug' | 'feature' | 'content' | 'general';
  rating?: number;
  userName?: string;
  profileGoal?: string;
  focusArea?: string;
  dialect?: string;
  timestamp?: number;
  status?: 'draft' | 'confirmed';
}

export async function saveFeedback(data: FeedbackData): Promise<boolean> {
  try {
    const payload = {
      rating: data.rating || 5,
      category: data.category || 'general',
      message: (data.message || data.draftedMessage || data.originalText || '').trim(),
      isAnonymous: false,
      userName: data.userName || 'AI Coach Learner',
      profileGoal: data.profileGoal || null,
      focusArea: data.focusArea || null,
      dialect: data.dialect || null
    };

    if (!payload.message) return false;

    // 1. Local backup log
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('thinking_english_anonymous_reviews_v1');
        const list = stored ? JSON.parse(stored) : [];
        list.push({ ...payload, createdAt: new Date().toISOString() });
        window.localStorage.setItem('thinking_english_anonymous_reviews_v1', JSON.stringify(list.slice(-50)));
      }
    } catch {
      // ignore
    }

    // 2. Submit to PostgreSQL backend via Vercel Serverless
    const endpoint = typeof window !== 'undefined' ? '/api/feedback' : `${API_BASE_URL || 'http://localhost:3000'}/api/feedback`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return false;
  }
}
