/**
 * Shared YouTube Subscription & Supporter Mode utility
 * Synchronizes 'tb.yt_subscribed', 'te_exam_supporter_mode', and 'tb.yt_nudge_dismissed_v1'.
 * The UI is always crisp and bright — never dimmed or desaturated.
 */

const YT_SUB_KEY = 'tb.yt_subscribed';
const SUPPORTER_MODE_KEY = 'te_exam_supporter_mode';
export const YT_NUDGE_DISMISSED_KEY = 'tb.yt_nudge_dismissed_v1';

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

export function isSupporterPopupDismissed(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(YT_NUDGE_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function shouldShowSupporterPopup(): boolean {
  if (typeof window === 'undefined') return false;
  return !isYouTubeSubscribed() && !isSupporterPopupDismissed();
}

export function setYouTubeSubscribed(subscribed: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    const val = subscribed ? 'true' : 'false';
    const supVal = subscribed ? 'on' : 'off';
    window.localStorage.setItem(YT_SUB_KEY, val);
    window.localStorage.setItem(SUPPORTER_MODE_KEY, supVal);

    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('tb-sad-mode');
    }

    window.dispatchEvent(
      new CustomEvent('tb:supporter-change', { detail: { subscribed } })
    );
  } catch (err) {
    console.warn('Unable to persist YouTube subscription state.', err);
  }
}

export function dismissSupporterPopupWithPromise(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(YT_NUDGE_DISMISSED_KEY, 'true');
    }
  } catch {
    // Ignore storage errors
  }
  setYouTubeSubscribed(true);
}

export function markSupporterSubscribed(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(YT_NUDGE_DISMISSED_KEY, 'true');
    }
  } catch {
    // Ignore storage errors
  }
  setYouTubeSubscribed(true);
}

export function initYouTubeSupporter(): void {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('tb-sad-mode');
    }
  } catch {}
}
