export const PLATFORM_CHAR_LIMITS = {
  x: 280,
  bluesky: 300,
  mastodon: 500,
  linkedin: 3000,
  facebook: 63206,
  telegram: 4096,
  discord: 2000,
  reddit: 40000,
} as const;

export type SocialPlatformLimitKey = keyof typeof PLATFORM_CHAR_LIMITS;

export interface SocialPreset {
  id: string;
  label: string;
  title: string;
  text: string;
  url: string;
}

export const DEFAULT_APP_URL = 'https://tb-eg.vercel.app';

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: 'linkedin-en',
    label: 'LinkedIn EN',
    title: 'Thinking Bridge v5.0.0 — Free Offline Cognitive Transfer App (14 Languages)',
    url: DEFAULT_APP_URL,
    text:
      'Just shipped Thinking Bridge v5.0.0 — First Official Stable Release.\n\n' +
      'Built in Alexandria, Egypt for Arabic-speaking STEM students & language learners:\n' +
      '• 100% Offline-First (PWA + Capacitor Android APK + Desktop)\n' +
      '• Zero ads, zero paywalls, unlimited free hearts\n' +
      '• Offline L1 Cognitive Coach + Word-by-Word Diff in Egyptian Arabic & English\n' +
      '• 14 languages, SM-2 spaced repetition, 356 automated tests + 19 E2E checks\n\n' +
      'Try it live or grab the v5.0.0 APK: https://tb-eg.vercel.app\n' +
      'GitHub: https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v5.0.0\n\n' +
      '#OpenSource #EdTech #OfflineFirst #PWA #Android',
  },
  {
    id: 'linkedin-ar',
    label: 'LinkedIn AR',
    title: 'إطلاق النسخة الرسمية v5.0.0 من Thinking Bridge',
    url: DEFAULT_APP_URL,
    text:
      'تم إطلاق النسخة الرسمية المستقرة الأولى v5.0.0 من تطبيق Thinking Bridge (جسر التفكير)! 🎉🇪🇬\n\n' +
      'مشروع مجاني 100% ومفتوح المصدر صُمم في الإسكندرية لتدريب العقل العربي على التفكير بالإنجليزية والألمانية و14 لغة بدون ترجمة حرفية.\n' +
      '• يعمل 100% بدون إنترنت (Web PWA + Android APK + Desktop)\n' +
      '• بدون إعلانات، بدون اشتراكات، وقلوب لا محدودة (∞)\n' +
      '• مدرب أخطاء ذكي مجاني بالمصري + مقارنة كلمة بكلمة\n\n' +
      'جربه الآن: https://tb-eg.vercel.app',
  },
  {
    id: 'x-en',
    label: 'X / Short',
    title: 'Thinking Bridge v5.0.0 Official Stable',
    url: DEFAULT_APP_URL,
    text:
      'Shipped Thinking Bridge v5.0.0 — Duolingo without hearts, ads, or internet.\n' +
      '14 languages, offline L1 Egyptian Arabic mistake coach + word diff, Android APK + PWA.\n' +
      '100% free & open source: https://tb-eg.vercel.app',
  },
  {
    id: 'campus-ar',
    label: 'WhatsApp Campus',
    title: 'جسر التفكير v5.0.0 — تطبيق مجاني بدون نت',
    url: DEFAULT_APP_URL,
    text:
      'يا جماعة عملت تطبيق مجاني 100% ومفتوح المصدر اسمه Thinking Bridge (جسر التفكير — v5.0.0) لتعليم الإنجليزي والألماني و14 لغة.\n' +
      'شغال بدون نت جوه المدرجات، بدون إعلانات، وبدون قلوب أو اشتراكات — ولما تغلط بيشرحلك السبب بالمصري ويخليك تصلح الغلطة فوراً.\n' +
      'جربوه من المتصفح أو حملوا نسخة الأندرويد APK: https://tb-eg.vercel.app',
  },
  {
    id: 'youtube-ar',
    label: 'YouTube AR',
    title: 'Thinking Bridge v5.0.0 على قناة @SciAmrSherif',
    url: DEFAULT_APP_URL,
    text:
      'النسخة الرسمية الأولى v5.0.0 من تطبيق جسر التفكير (Thinking Bridge) متاحة دلوقتي مجاناً وبدون إنترنت! 🔥\n' +
      '14 لغة + مدرب تفكير بالمصري + مقارنة كلمة بكلمة + قلوب لا محدودة.\n' +
      'جربه حالاً من هنا: https://tb-eg.vercel.app',
  },
];

export function truncateForPlatform(
  text: string,
  platform: SocialPlatformLimitKey,
  url?: string
): string {
  const limit = PLATFORM_CHAR_LIMITS[platform];
  const normalizedText = (text ?? '').trim();
  const cleanUrl = (url ?? '').trim();

  let combined = normalizedText;
  if (cleanUrl && !normalizedText.includes(cleanUrl)) {
    combined = normalizedText ? `${normalizedText}\n${cleanUrl}` : cleanUrl;
  }

  if (combined.length <= limit) {
    return combined;
  }

  if (cleanUrl && cleanUrl.length + 5 <= limit) {
    const budget = limit - cleanUrl.length - 4; // "...\n" + url
    const body = normalizedText.replace(cleanUrl, '').trim().slice(0, budget).trimEnd();
    return `${body}...\n${cleanUrl}`;
  }

  return `${combined.slice(0, Math.max(1, limit - 3)).trimEnd()}...`;
}

export interface SocialShareUrls {
  x: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  reddit: string;
  bluesky: string;
  threads: string;
  youtubeCommunity: string;
}

export function buildSocialShareUrls(
  text: string,
  url: string = DEFAULT_APP_URL,
  title: string = 'Thinking Bridge v5.0.0'
): SocialShareUrls {
  const cleanUrl = (url || DEFAULT_APP_URL).trim();
  const baseText = (text || '').trim();
  const fullWithUrl = baseText.includes(cleanUrl) ? baseText : `${baseText}\n${cleanUrl}`.trim();

  const xText = truncateForPlatform(baseText, 'x', cleanUrl);
  const bskyText = truncateForPlatform(baseText, 'bluesky', cleanUrl);

  return {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(xText)}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&mini=true&text=${encodeURIComponent(fullWithUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(fullWithUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(baseText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}&quote=${encodeURIComponent(baseText)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(cleanUrl)}&title=${encodeURIComponent(title || xText)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(bskyText)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(truncateForPlatform(baseText, 'mastodon', cleanUrl))}`,
    youtubeCommunity: 'https://www.youtube.com/@sciamrsherif/community',
  };
}
