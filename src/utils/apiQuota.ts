const DAILY_API_USAGE_KEY = 'tb.dailyApiUsage';
const DAILY_API_LIMIT = 50;
export const API_QUOTA_LIMIT_EVENT = 'tb:api-quota-limit';

interface DailyUsage {
  date: string;
  count: number;
}

export function consumeDailyApiQuota(): boolean {
  if (typeof window === 'undefined') return false;

  const today = new Date().toISOString().slice(0, 10);
  let usage: DailyUsage = { date: today, count: 0 };
  try {
    const stored = window.localStorage.getItem(DAILY_API_USAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (
        parsed &&
        typeof parsed === 'object' &&
        'date' in parsed &&
        'count' in parsed &&
        parsed.date === today &&
        typeof parsed.count === 'number' &&
        Number.isInteger(parsed.count) &&
        parsed.count >= 0
      ) {
        usage = { date: today, count: parsed.count };
      }
    }

    if (usage.count >= DAILY_API_LIMIT) {
      window.dispatchEvent(new CustomEvent(API_QUOTA_LIMIT_EVENT));
      return false;
    }

    window.localStorage.setItem(
      DAILY_API_USAGE_KEY,
      JSON.stringify({ date: today, count: usage.count + 1 })
    );
    return true;
  } catch (error) {
    console.error('Unable to verify or update the daily AI request quota.', error);
    return false;
  }
}
