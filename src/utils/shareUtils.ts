/**
 * Utility functions for Web Share API and WhatsApp sharing fallback.
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
      /* User cancelled or share failed, fallback to WhatsApp */
    }
  }

  // Fallback: Open WhatsApp directly
  const encoded = encodeURIComponent(fullText);
  const waUrl = `https://wa.me/?text=${encoded}`;
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
  return true;
}
