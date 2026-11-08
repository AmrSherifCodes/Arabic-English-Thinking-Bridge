import { translateArabicToEnglish } from './offlineTranslator';

export interface CorporateToneOption {
  label: string;
  english: string;
  context: string;
}

export interface CorporateBridgeResult {
  originalThought: string;
  thinkingShift: string;
  tones: {
    polite: CorporateToneOption;
    assertive: CorporateToneOption;
    executive: CorporateToneOption;
  };
}

interface PresetBridge {
  match: RegExp;
  thinkingShift: string;
  polite: string;
  assertive: string;
  executive: string;
}

const PRESET_BRIDGES: PresetBridge[] = [
  {
    match: /مأخر|ماخر|بيماطل|مباطل/,
    thinkingShift:
      'بدل توصيف الشخص ("بيماطل")، اوصف السلوك المهني نفسه (تأخير في الداتا والرد) وحط طلب واضح في الآخر.',
    polite:
      'Hi team, a quick update: the client is delaying the data and has been slow to reply. Could we please follow up with them today?',
    assertive:
      'The client is delaying the data and stalling on replies. Please follow up today and confirm a delivery date.',
    executive:
      'Client delay on data and responses is blocking progress. Action: escalate today and secure a firm delivery date.',
  },
  {
    match: /كنت في ميتنج|مشوفتش|مشوفت|معلش/,
    thinkingShift:
      'الاعتذار في الإنجليزي المهني = اعتراف مختصر + سبب + التزام بالخطوة الجاية. من غير مبالغة.',
    polite:
      "Apologies for the delayed reply — I was in a meeting and missed your email. I'll get back to you shortly.",
    assertive:
      "I was in a meeting and missed your email. I'm reviewing it now and will respond by end of day.",
    executive:
      'Missed your email due to a meeting. Reviewing now; response by EOD.',
  },
  {
    match: /نراجع الحسابات|في غلطة|غلطة|مراجعة/,
    thinkingShift:
      'بلاش "في غلطة" بشكل مباشر. استخدم "there appears to be an error" + اطلب مراجعة مش اتهام.',
    polite:
      'Could we please review these accounts? I believe there may be an error that needs checking.',
    assertive:
      'We need to review these accounts — there appears to be an error that should be corrected.',
    executive:
      'Action: review these accounts. An error has been identified and requires correction.',
  },
  {
    match: /آخر الأسبوع|اخر الاسبوع|نخلّص|نخلص|ضروري/,
    thinkingShift:
      'حدد الموعد النهائي بوضوح (hard deadline) + اطلب تأكيد ملكية المهمة، بدل كلمة "ضروري" العامة.',
    polite:
      'We need to wrap this up before the end of the week if possible. Could we align on a plan and owners?',
    assertive:
      'We must finish this before the end of the week. Please confirm your part today.',
    executive:
      'Hard deadline: end of week. All owners to confirm completion today.',
  },
  {
    match: /ميزانية|مكفية|تكفي|الفلوس/,
    thinkingShift:
      'بدل "الميزانية مش مكفية"، اذكر الفجوة بين الميزانية والنطاق المطلوب واطلب قرار واضح.',
    polite:
      "The current budget doesn't seem to cover the required scope. Could we review it together?",
    assertive:
      'The budget does not cover the required scope. We need a revised figure before we proceed.',
    executive:
      'Budget gap vs. scope. Decision needed: increase the budget or reduce the scope.',
  },
];

const CONTEXTS = {
  polite: 'نبرة هادئة ومهنية — مناسبة لأول تواصل أو عميل حساس.',
  assertive: 'نبرة حاسمة وواضحة — مناسبة للمتابعة وطلب التزام بموعد.',
  executive: 'نبرة تنفيذية مختصرة — مناسبة للتقارير والإدارة العليا.',
};

function ensureSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const capitalized =
    /^[A-Z]/.test(cleaned) || /^I\b/.test(cleaned)
      ? cleaned
      : cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function lowerFirst(text: string): string {
  const cleaned = text.replace(/[.!?]+$/g, '').trim();
  if (!cleaned) return '';
  if (/^I\b/.test(cleaned) || /^[A-Z]{2,}/.test(cleaned)) return cleaned;
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function genericBridge(thought: string): CorporateBridgeResult {
  const translation = translateArabicToEnglish(thought);
  const core = lowerFirst(translation.text) || 'this needs our attention';

  return {
    originalThought: thought,
    thinkingShift:
      'السر مش ترجمة كل كلمة: حدد الموضوع (what) + المطلوب (action) + الموعد (when). الجملة القصيرة الواضحة أقوى من كلام كتير.',
    tones: {
      polite: {
        label: 'Polite',
        english: ensureSentence(
          `Hi team, just a quick note: ${core}. Could you please look into it when you get a chance? Thanks`
        ),
        context: CONTEXTS.polite,
      },
      assertive: {
        label: 'Assertive',
        english: ensureSentence(
          `Team, ${core}. Please prioritize this and confirm the timeline today`
        ),
        context: CONTEXTS.assertive,
      },
      executive: {
        label: 'Executive',
        english: ensureSentence(
          `Action required: ${core}. Owner and ETA to be confirmed by end of day`
        ),
        context: CONTEXTS.executive,
      },
    },
  };
}

/**
 * 100% offline "Egyptian → Corporate English" bridge.
 *
 * Curated situational presets cover the most common workplace messages, and any
 * other thought is translated through the deterministic offline engine, then
 * wrapped in three professional tones. No network, no API key.
 */
export function buildCorporateBridgeOffline(thought: string): CorporateBridgeResult {
  const raw = String(thought || '').trim();
  if (!raw) {
    return genericBridge('this needs our attention');
  }

  const preset = PRESET_BRIDGES.find((entry) => entry.match.test(raw));
  if (preset) {
    return {
      originalThought: raw,
      thinkingShift: preset.thinkingShift,
      tones: {
        polite: { label: 'Polite', english: preset.polite, context: CONTEXTS.polite },
        assertive: { label: 'Assertive', english: preset.assertive, context: CONTEXTS.assertive },
        executive: { label: 'Executive', english: preset.executive, context: CONTEXTS.executive },
      },
    };
  }

  return genericBridge(raw);
}
