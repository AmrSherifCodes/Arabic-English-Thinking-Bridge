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
    title: 'Thinking Bridge V6 (v6.0.0) — Tuned Like a Six-Cylinder Cognitive Engine',
    url: DEFAULT_APP_URL,
    text:
      'Just shipped Thinking Bridge V6 (v6.0.0) — The Six-Cylinder Release.\n\n' +
      'No cloud bloat, no paywalls, no ads, no infinite loading spinners — just a naturally aspirated 100% offline engine built in Alexandria, Egypt for Arabic-speaking learners.\n\n' +
      'Under the hood — all 6 cylinders firing in sync:\n' +
      '1. Top-5 Languages Track-Verified (EN, DE, FR, ES, TR): 0 gloss/grammar leaks across every dialect including Egyptian Arabic (arz).\n' +
      '2. O(1) Gloss Lookup Map: Replaced 50k-entry linear scans — full audit dropped from ~66s to <1s.\n' +
      '3. Smart Dictionary 10/10 Top-1 Precision: Exact match #1 across all 5 languages + clean BCP-47 TTS.\n' +
      '4. Natural Arabic Copy & 48px Touch Targets: Proper prepositions, RTL arrow mirroring, zero ellipsis truncation.\n' +
      '5. Honor 400 (DNY-NX9) Hardware-Verified: 0 live CDP/CSP errors, 0 overflow even at 150% font scale, and safeVibrate WebView protection.\n' +
      '6. Unified Cross-Platform Build: Web PWA + Signed Capacitor Android APK (versionCode 6000) — 365/365 unit tests passing.\n\n' +
      'Web App & PWA: https://tb-eg.vercel.app\n' +
      'V6 Release & Signed APK: https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0\n\n' +
      '#OpenSource #EdTech #OfflineFirst #Android #PWA #Egypt',
  },
  {
    id: 'linkedin-ar',
    label: 'LinkedIn AR',
    title: 'إطلاق جسر التفكير V6 (v6.0.0) — محرك الستة سلندر',
    url: DEFAULT_APP_URL,
    text:
      'تم إطلاق النسخة الجديدة Thinking Bridge V6 (v6.0.0) — محرك الستة سلندر! 🏎️🇪🇬\n\n' +
      'فكّر بالإنجليزي والألماني والفرنساوي والإسباني والتركي مباشرة بعقلك العربي — بدون ترجمة حرفية، بدون نت، وبدون إعلانات أو قلوب.\n\n' +
      'إيه الجديد تحت الكبوت في V6؟\n' +
      '• فحص شامل لأهم 5 لغات (EN / DE / FR / ES / TR): 0 أخطاء ترجمة أو تسريب قواعد\n' +
      '• القاموس الذكي 10/10 في المركز الأول لكل الكلمات الأساسية مع نطق سليم\n' +
      '• محرك بحث O(1) فوري نزّل وقت الفحص من 66 ثانية لأقل من ثانية\n' +
      '• 365/365 اختبار برمجي ناجح + تجربة حية على Honor 400 بنسبة 0 انحراف حتى مع تكبير الخط 150%\n\n' +
      'جرّبه الآن أو حمّل ملف الأندرويد APK:\n' +
      'https://tb-eg.vercel.app\n' +
      'صفحة الإطلاق على GitHub:\n' +
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0\n\n' +
      '#مفتوح_المصدر #تعليم #برمجة #أندرويد #الإسكندرية',
  },
  {
    id: 'x-en',
    label: 'X / Bsky EN',
    title: 'Thinking Bridge V6 (v6.0.0)',
    url: DEFAULT_APP_URL,
    text:
      'Thinking Bridge V6 (v6.0.0) just dropped — tuned like a naturally aspirated V6 engine 🏎️\n' +
      '• Top 5 languages (EN/DE/FR/ES/TR): 0 leaks, 10/10 Top-1 Smart Dict\n' +
      '• O(1) gloss speedup (66s→<1s) · 365/365 tests\n' +
      '• 100% offline · 0 ads · ∞ hearts\n' +
      'https://tb-eg.vercel.app',
  },
  {
    id: 'x-ar',
    label: 'X / Bsky AR',
    title: 'جسر التفكير V6 (v6.0.0)',
    url: DEFAULT_APP_URL,
    text:
      'انطلاق جسر التفكير V6 (v6.0.0) — محرك الستة سلندر 🏎️🇪🇬\n' +
      '• 5 لغات موثقة: 0 أخطاء قاموس، 10/10 بحث ذكي\n' +
      '• سرعة O(1) فورية و365/365 اختبار ناجح\n' +
      '• مجاني 100% بدون نت أو إعلانات أو قلوب\n' +
      'https://tb-eg.vercel.app',
  },
  {
    id: 'campus-ar',
    label: 'WhatsApp Campus',
    title: 'جسر التفكير V6 (v6.0.0) — مجاني وبدون نت',
    url: DEFAULT_APP_URL,
    text:
      'يا جماعة نزلنا التحديث الجبار Thinking Bridge V6 (v6.0.0 — نسخة الستة سلندر) 🏎️🔥\n\n' +
      'تطبيق مصري مجاني 100% ومفتوح المصدر شغال بدون نت جوه المدرجات، بدون إعلانات، وبدون قلوب أو اشتراكات.\n' +
      '• 5 لغات رئيسية (إنجليزي، ألماني، فرنساوي، إسباني، تركي) مضبوطين بالمللي\n' +
      '• قاموس ذكي ونطق أوفلاين + مدرب تفكير بيشرح الغلطة بالمصري\n' +
      '• سريع صاروخ وخالي من أي تقطيع على الموبايل\n\n' +
      'افتحه من المتصفح أو حمّل الأندرويد APK مجاناً:\n' +
      'https://tb-eg.vercel.app',
  },
  {
    id: 'youtube-ar',
    label: 'YouTube AR',
    title: 'جسر التفكير V6 (v6.0.0) — @SciAmrSherif',
    url: DEFAULT_APP_URL,
    text:
      'نسخة Thinking Bridge V6 (v6.0.0) وصلت! 🏎️💨\n' +
      '6 سلندرات شغالين بتناغم تام: 5 لغات موثقة (إنجليزي، ألماني، فرنساوي، إسباني، تركي) + بحث لحظي O(1) + 365 اختبار ناجح + 100% أوفلاين بدون إعلانات أو قلوب!\n\n' +
      'جرّبه من المتصفح أو حمّل نسخة الأندرويد APK دلوقتي:\n' +
      'https://tb-eg.vercel.app\n' +
      'ملاحظات الإطلاق والـ APK على GitHub:\n' +
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0',
  },
  {
    id: 'facebook-ar',
    label: 'Facebook AR',
    title: 'تحديث جسر التفكير V6 (v6.0.0) — بدون نت ومجاني 100%',
    url: DEFAULT_APP_URL,
    text:
      'بعد شغل ومراجعة دقيقة على 365 اختبار وعلى الموبايل الحقيقي، بنعلن عن إطلاق Thinking Bridge V6 (v6.0.0) — نسخة الستة سلندر! 🏎️🇪🇬\n\n' +
      'لو زهقت من التطبيقات اللي بتوقفك بعد 5 أخطاء أو تطلعلك إعلانات كل دقيقة:\n' +
      '✅ يعمل 100% بدون إنترنت (تطبيق أندرويد APK + ويب PWA)\n' +
      '✅ قلوب لا محدودة ومجاني بالكامل بدون أي باقات\n' +
      '✅ فحص كامل لأهم 5 لغات (إنجليزي، ألماني، فرنساوي، إسباني، تركي) بنسبة 10/10 في القاموس الذكي\n' +
      '✅ مدرب تفكير ذكي بالمصري يشرحلك تركيب الجملة بدل الحفظ والترجمة الحرفية\n' +
      '✅ خط واضح ومقروء ومناسب حتى لو مكبّر خط الموبايل 150%\n\n' +
      'رابط التشغيل والتحميل المباشر:\n' +
      'https://tb-eg.vercel.app\n' +
      'الكود المصدري مفتوح للجميع (AGPLv3) على GitHub:\n' +
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0',
  },
  {
    id: 'reddit-en',
    label: 'Reddit EN',
    title: 'Thinking Bridge V6 (v6.0.0) — 100% Offline, Open-Source Arabic→Language Cognitive App (EN/DE/FR/ES/TR)',
    url: DEFAULT_APP_URL,
    text:
      'Hi everyone! I just shipped Thinking Bridge V6 (v6.0.0) — an open-source, 100% offline-first language-thinking app built in Alexandria, Egypt (inspired by the Language Transfer *Thinking Method*).\n\n' +
      "Why 'V6'?\n" +
      'We tuned six core subsystems like a six-cylinder engine:\n' +
      '1. Top-5 languages verified (English, German, French, Spanish, Turkish) across Egyptian & MSA Arabic — 0 gloss or grammar leaks.\n' +
      '2. Indexed O(1) gloss lookup map replacing linear 50k-entry scans (cut full audit runtime from ~66s to <1s).\n' +
      '3. Smart Dictionary ranking with 10/10 Top-1 accuracy for everyday core vocabulary + clean BCP-47 offline TTS.\n' +
      '4. Natural Arabic UX, proper RTL mirroring, and >=48px tap targets.\n' +
      '5. Live Honor 400 WebView CDP verification across all 5 languages (0 console/CSP errors, 0 overflow at 150% font scale, safeVibrate intervention guard).\n' +
      '6. 365/365 automated tests passing across PWA and signed Android APK.\n\n' +
      'Zero ads, zero telemetry, unlimited hearts, AGPLv3 code + CC BY-NC-SA 4.0 content.\n' +
      'Live PWA: https://tb-eg.vercel.app\n' +
      'Release & APK: https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0',
  },
  {
    id: 'discord-en',
    label: 'Discord EN',
    title: 'Thinking Bridge V6 (v6.0.0) — Release Notes',
    url: DEFAULT_APP_URL,
    text:
      '🏎️ **Thinking Bridge V6 (`v6.0.0`) is LIVE!**\n\n' +
      'All 6 cylinders firing in sync — 100% offline, 0 ads, unlimited hearts:\n' +
      '• **5 Target Languages Verified (`EN`, `DE`, `FR`, `ES`, `TR`)**: `0` gloss/grammar leaks across all Arabic dialects\n' +
      '• **`O(1)` Gloss Lookup Engine**: Audit runtime cut from `~66s` → `<1s`\n' +
      '• **Smart Dictionary `10/10` Top-1**: Clean exact matches + BCP-47 TTS\n' +
      '• **Device-Verified (Honor 400)**: `0` CDP/CSP errors & `0` overflow at `150%` font scale\n' +
      '• **`365/365` Automated Tests Green**\n\n' +
      '🌐 Web / PWA: https://tb-eg.vercel.app\n' +
      '📦 Signed Android APK: https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0',
  },
  {
    id: 'telegram-ar',
    label: 'Telegram AR',
    title: 'جسر التفكير V6 (v6.0.0)',
    url: DEFAULT_APP_URL,
    text:
      '🏎️ انطلاق التحديث الكبير: جسر التفكير V6 (v6.0.0)\n\n' +
      '• 5 لغات موثقة بالكامل (الإنجليزي، الألماني، الفرنساوي، الإسباني، التركي) بدون أخطاء ترجمة\n' +
      '• بحث لحظي O(1) في القاموس الذكي بنسبة 10/10 في النتائج الأولى مع نطق سليم\n' +
      '• يعمل 100% بدون إنترنت، بدون إعلانات، وقلوب لا محدودة\n' +
      '• متوافق تماماً مع الهواتف وتكبير الخط 150%\n\n' +
      '🌐 التشغيل الفوري عبر المتصفح (PWA):\n' +
      'https://tb-eg.vercel.app\n' +
      '📱 تحميل تطبيق الأندرويد (APK) وملاحظات الإصدار:\n' +
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0',
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
  title: string = 'Thinking Bridge V6 (v6.0.0)'
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
