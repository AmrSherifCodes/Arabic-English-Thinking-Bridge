// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.

/**
 * Copies text to the clipboard using the async Clipboard API when available,
 * falling back to a hidden textarea + execCommand('copy') for Android WebView.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText &&
    (typeof window === 'undefined' || window.isSecureContext !== false)
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea fallback
    }
  }

  if (typeof document === 'undefined' || !document.body) {
    return false;
  }

  let ta: HTMLTextAreaElement | null = null;
  try {
    ta = document.createElement('textarea');
    ta.value = text;
    ta.readOnly = true;
    ta.setAttribute('aria-hidden', 'true');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (ta && ta.parentNode) {
      ta.parentNode.removeChild(ta);
    }
  }
}
