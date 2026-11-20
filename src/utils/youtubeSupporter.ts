/**
 * Shared YouTube Subscription & Supporter Mode utility
 * Synchronizes 'tb.yt_subscribed' and 'te_exam_supporter_mode'
 */

const YT_SUB_KEY = 'tb.yt_subscribed';
const SUPPORTER_MODE_KEY = 'te_exam_supporter_mode';

export function isYouTubeSubscribed(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const ytSub = window.localStorage.getItem(YT_SUB_KEY) === 'true';
    const supporter = window.localStorage.getItem(SUPPORTER_MODE_KEY) === 'on';
    return ytSub || supporter;
  } catch {
    return false;
  }
}

export function setYouTubeSubscribed(subscribed: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    const val = subscribed ? 'true' : 'false';
    const supVal = subscribed ? 'on' : 'off';
    window.localStorage.setItem(YT_SUB_KEY, val);
    window.localStorage.setItem(SUPPORTER_MODE_KEY, supVal);

    if (subscribed) {
      document.documentElement.classList.remove('tb-sad-mode');
    } else {
      document.documentElement.classList.add('tb-sad-mode');
    }

    window.dispatchEvent(
      new CustomEvent('tb:supporter-change', { detail: { subscribed } })
    );
  } catch (err) {
    console.warn('Unable to persist YouTube subscription state.', err);
  }
}

export function initYouTubeSupporter(): void {
  try {
    if (typeof window === 'undefined') return;
    const subscribed = isYouTubeSubscribed();
    if (subscribed) {
      document.documentElement.classList.remove('tb-sad-mode');
    } else {
      document.documentElement.classList.add('tb-sad-mode');
    }
  } catch {}
}
