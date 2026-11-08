/**
 * Utility functions for Web Share API and sharing fallback.
 */

export interface ShareDataPayload {
  title?: string;
  text: string;
  url?: string;
}

export async function shareAchievementOrProgress(data: ShareDataPayload): Promise<boolean> {
  const shareUrl = data.url || 'https://tb-eg.vercel.app';
  const fullText = `${data.text}\n\n🚀 Learn to think directly in target languages: ${shareUrl}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title || 'Thinking Bridge',
        text: fullText,
        url: shareUrl,
      });
      return true;
    } catch {
      /* User cancelled or share failed, fallback to copy to clipboard */
    }
  }

  // Fallback: Copy to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(fullText);
    }
  } catch {
    /* Copy failed */
  }
  return true;
}
