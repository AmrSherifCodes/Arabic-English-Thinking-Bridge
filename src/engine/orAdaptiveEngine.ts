// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { CefrLevelId, ExerciseItem, PhaseId } from '../progression/types';
import type { UiMode } from '../utils/uiMode';

// ============================================================
// Part A: 2PL-IRT + Maximum Fisher Information CAT Placement
// ============================================================

export type OrCefrBand = 'Pre-A0' | 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type SkillDimension = 'vocab' | 'syntax' | 'listening' | 'l1_transfer';

export const ALL_SKILL_DIMENSIONS: readonly SkillDimension[] = [
  'vocab',
  'syntax',
  'listening',
  'l1_transfer',
] as const;

export type L1WeaknessPattern =
  | 'copula_omission'
  | 'adjective_order'
  | 'preposition_transfer'
  | 'article_omission';

export interface DiagnosticOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface DiagnosticItem {
  id: string;
  difficulty: number; // b_i in [-2.5, +2.5]
  discrimination: number; // a_i in [0.8, 2.2]
  skill: SkillDimension;
  band: OrCefrBand;
  badgeAr: string;
  badgeEn: string;
  promptAr: string;
  promptEn: string;
  audioText?: string;
  l1Pattern?: L1WeaknessPattern;
  options: DiagnosticOption[];
}

export interface PlacementResponse {
  itemId: string;
  difficulty: number;
  discrimination: number;
  skill: SkillDimension;
  correct: boolean;
  latencyMs: number;
  l1Pattern?: L1WeaknessPattern;
}

export interface PlacementSessionState {
  theta: number; // Posterior mean in [-3.0, +3.0]
  variance: number; // Posterior variance sigma^2(theta)
  sigma: number; // Posterior standard deviation sigma(theta)
  posterior: number[]; // Discrete grid posterior probabilities (61 points)
  askedItemIds: string[];
  coveredSkills: SkillDimension[];
  responses: PlacementResponse[];
  skills: Record<SkillDimension, number>; // 4D skill vector in [0, 1]
  detectedWeakPatterns: L1WeaknessPattern[];
}

export interface PlacementFinalResult {
  theta: number;
  sigma: number;
  band: OrCefrBand;
  levelId: CefrLevelId;
  phaseId: PhaseId;
  scorePercent: number;
  itemsAnswered: number;
  skills: Record<SkillDimension, number>;
  detectedWeakPatterns: L1WeaknessPattern[];
  whyAr: string;
  whyEn: string;
}

export const THETA_MIN = -3.0;
export const THETA_MAX = 3.0;
export const THETA_GRID_POINTS = 61; // Step 0.1: -3.0, -2.9, ..., +3.0
export const MAX_PLACEMENT_ITEMS = 7;
export const STOP_SIGMA_THRESHOLD = 0.35;

export const THETA_GRID: readonly number[] = Array.from(
  { length: THETA_GRID_POINTS },
  (_, idx) => Number((THETA_MIN + idx * ((THETA_MAX - THETA_MIN) / (THETA_GRID_POINTS - 1))).toFixed(2))
);

/**
 * Maps continuous latent proficiency theta in [-3.0, +3.0] to CEFR bands:
 * Pre-A0 [-3.0, -2.0), A0 [-2.0, -1.2), A1 [-1.2, -0.3),
 * A2 [-0.3, +0.5), B1 [+0.5, +1.3), B2 [+1.3, +2.1), C1 [+2.1, +3.0]
 */
export function thetaToCefrBand(theta: number): OrCefrBand {
  if (theta < -2.0) return 'Pre-A0';
  if (theta < -1.2) return 'A0';
  if (theta < -0.3) return 'A1';
  if (theta < 0.5) return 'A2';
  if (theta < 1.3) return 'B1';
  if (theta < 2.1) return 'B2';
  return 'C1';
}

export function bandToCefrLevelId(band: OrCefrBand): CefrLevelId {
  if (band === 'Pre-A0' || band === 'A0' || band === 'A1') return 'A1';
  return band;
}

export function bandToPhaseId(band: OrCefrBand): PhaseId {
  const level = bandToCefrLevelId(band);
  return `${level}.1`;
}

export const OR_BAND_DESCRIPTIONS: Record<
  OrCefrBand,
  { labelAr: string; labelEn: string; whyAr: string; whyEn: string }
> = {
  'Pre-A0': {
    labelAr: 'Pre-A0 (بداية من الصفر)',
    labelEn: 'Pre-A0 (Complete Starter)',
    whyAr: 'هنبدأ معاك من أول خطوة بأبسط الكلمات والجمل اليومية بصوت واضح وبدون أي ضغط.',
    whyEn: 'We will start from step one with clear audio and simple everyday words.',
  },
  A0: {
    labelAr: 'A0 (الأساس التمهيدي)',
    labelEn: 'A0 (Foundational Starter)',
    whyAr: 'تعرف بعض الكلمات الأساسية — هنبني معاك الجمل القصيرة بثقة وسهولة.',
    whyEn: 'You recognize key starter words — let us build simple sentences with confidence.',
  },
  A1: {
    labelAr: 'A1 (التأسيس العملي)',
    labelEn: 'A1 (Elementary Foundation)',
    whyAr: 'عندك أساس كويس في المفردات، وهنظبط معاك ترتيب الجملة الإنجليزية بدون ترجمة حرفية.',
    whyEn: 'Solid starter vocabulary — now we lock in clean English sentence structure.',
  },
  A2: {
    labelAr: 'A2 (الجسر اليومي)',
    labelEn: 'A2 (Everyday Bridge)',
    whyAr: 'بتفهم المواقف اليومية كويس، وتجاوزنا لك الدروس التمهيدية عشان تبدأ من مستواك الحقيقي.',
    whyEn: 'You handle everyday English well — we fast-forwarded the basics to match your level.',
  },
  B1: {
    labelAr: 'B1 (الطلاقة المتوسطة)',
    labelEn: 'B1 (Intermediate Fluency)',
    whyAr: 'تجاوزت مصايد الترجمة الحرفية وفهمت السماع الطبيعي — جاهز لتقوية الطلاقة والثقة.',
    whyEn: 'You avoided common L1 traps and handled natural audio — ready for fluent expression.',
  },
  B2: {
    labelAr: 'B2 (فوق المتوسط)',
    labelEn: 'B2 (Upper-Intermediate)',
    whyAr: 'دقتك وسرعة بديهتك عالية — فتحنا لك المسار المتقدم مباشرة بدون تضييع وقت في الأساسيات.',
    whyEn: 'High accuracy and fast recall — we fast-forwarded foundational nodes right to B2.',
  },
  C1: {
    labelAr: 'C1 (الإتقان المتقدم)',
    labelEn: 'C1 (Advanced Mastery)',
    whyAr: 'إتقان قوي للتعبيرات الدقيقة والسياق الطبيعي — جاهز لتحديات الإتقان والعمل الاحترافي.',
    whyEn: 'Strong command of nuance and natural idioms — straight to advanced mastery.',
  },
};

/**
 * 2-Parameter Logistic (2PL) IRT probability of correct response:
 * P_i(theta) = 1 / (1 + exp(-a_i * (theta - b_i)))
 */
export function irt2plProbability(theta: number, a: number, b: number): number {
  const exponent = -a * (theta - b);
  if (exponent > 35) return 1e-15;
  if (exponent < -35) return 1 - 1e-15;
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Fisher Information of item i at proficiency theta:
 * I_i(theta) = a_i^2 * P_i(theta) * (1 - P_i(theta))
 */
export function fisherInformation(theta: number, a: number, b: number): number {
  const p = irt2plProbability(theta, a, b);
  return a * a * p * (1 - p);
}

/**
 * Computes soft response-latency confidence weight:
 * - Fast accurate tap (<= 4000ms): reinforces upward shift (1.10 .. 1.35)
 * - Normal accurate tap (4000..8000ms): neutral (1.0)
 * - Slow hesitant guess (> 8000ms): damps over-estimation (0.55 .. 0.85)
 * - Incorrect response: 1.0 (or 1.12 if very slow struggle)
 */
export function computeLatencyWeight(correct: boolean, latencyMs: number): number {
  const clampedMs = Math.max(300, Math.min(30000, latencyMs));
  if (correct) {
    if (clampedMs <= 2500) return 1.35;
    if (clampedMs <= 4500) return 1.15;
    if (clampedMs <= 8000) return 1.0;
    if (clampedMs <= 14000) return 0.75;
    return 0.55;
  }
  if (clampedMs >= 12000) return 1.12;
  return 1.0;
}

/**
 * Calibrated offline diagnostic item bank spanning Pre-A0..C1 across all 4 skill dimensions.
 */
export const DIAGNOSTIC_ITEMS: readonly DiagnosticItem[] = [
  // --- Pre-A0 / A0 (b in [-2.4, -1.4]) ---
  {
    id: 'diag-vocab-prea0-1',
    difficulty: -2.4,
    discrimination: 1.6,
    skill: 'vocab',
    band: 'Pre-A0',
    badgeAr: 'مفردات أساسية · Pre-A0',
    badgeEn: 'Core Vocabulary · Pre-A0',
    promptAr: 'ما معنى كلمة "Water"؟',
    promptEn: 'What does "Water" mean?',
    audioText: 'Water',
    options: [
      { id: 'a', text: 'ماء / Drinkable water', isCorrect: true },
      { id: 'b', text: 'كتاب / A book', isCorrect: false },
      { id: 'c', text: 'كرسي / A chair', isCorrect: false },
    ],
  },
  {
    id: 'diag-listen-prea0-1',
    difficulty: -2.1,
    discrimination: 1.55,
    skill: 'listening',
    band: 'Pre-A0',
    badgeAr: 'استماع · Pre-A0',
    badgeEn: 'Listening · Pre-A0',
    promptAr: 'اسمع التحية واختار معناها:',
    promptEn: 'Listen to the greeting and choose its meaning:',
    audioText: 'Good morning!',
    options: [
      { id: 'a', text: 'صباح الخير / Morning greeting', isCorrect: true },
      { id: 'b', text: 'تصبح على خير / Good night', isCorrect: false },
      { id: 'c', text: 'أين الباب؟ / Where is the door?', isCorrect: false },
    ],
  },
  {
    id: 'diag-syntax-a0-1',
    difficulty: -1.7,
    discrimination: 1.7,
    skill: 'syntax',
    band: 'A0',
    badgeAr: 'تركيب الجملة · A0',
    badgeEn: 'Sentence Structure · A0',
    promptAr: 'إزاي تقول "اسمي عمر" بالإنجليزي الصح؟',
    promptEn: 'How do you introduce yourself naturally?',
    audioText: 'My name is Omar.',
    l1Pattern: 'copula_omission',
    options: [
      { id: 'a', text: 'My name is Omar.', isCorrect: true },
      { id: 'b', text: 'My name Omar.', isCorrect: false },
      { id: 'c', text: 'Name me Omar.', isCorrect: false },
    ],
  },
  {
    id: 'diag-l1-a0-1',
    difficulty: -1.5,
    discrimination: 1.8,
    skill: 'l1_transfer',
    band: 'A0',
    badgeAr: 'فخ الترجمة · A0',
    badgeEn: 'L1 Bridge · A0',
    promptAr: 'إزاي تقول "أنا سعيد" بدون نسيان فعل الربط؟',
    promptEn: 'Pick the sentence with the required English linking verb:',
    l1Pattern: 'copula_omission',
    options: [
      { id: 'a', text: 'I happy today.', isCorrect: false },
      { id: 'b', text: 'I am happy today.', isCorrect: true },
      { id: 'c', text: 'Me happy today.', isCorrect: false },
    ],
  },

  // --- A1 (b in [-1.1, -0.4]) ---
  {
    id: 'diag-l1-a1-1',
    difficulty: -1.0,
    discrimination: 1.85,
    skill: 'l1_transfer',
    band: 'A1',
    badgeAr: 'فخ الترجمة · A1',
    badgeEn: 'L1 Bridge · A1',
    promptAr: 'إزاي تقول "عندي 20 سنة" بالإنجليزي؟',
    promptEn: 'Fix the common Arabic-to-English age expression:',
    l1Pattern: 'copula_omission',
    options: [
      { id: 'a', text: 'I have 20 years.', isCorrect: false },
      { id: 'b', text: 'I am 20 years old.', isCorrect: true },
      { id: 'c', text: 'My age have 20.', isCorrect: false },
    ],
  },
  {
    id: 'diag-listen-a1-1',
    difficulty: -0.9,
    discrimination: 1.7,
    skill: 'listening',
    band: 'A1',
    badgeAr: 'استماع · A1',
    badgeEn: 'Listening · A1',
    promptAr: 'اسمع الجملة واختار معناها الصح:',
    promptEn: 'Listen and pick the exact meaning:',
    audioText: 'Can I have a cup of coffee, please?',
    options: [
      { id: 'a', text: 'ممكن فنجان قهوة لو سمحت؟ / Asking for coffee', isCorrect: true },
      { id: 'b', text: 'فين أقرب كافيه؟ / Asking for directions', isCorrect: false },
      { id: 'c', text: 'القهوة باردة جداً / Complaining about coffee', isCorrect: false },
    ],
  },
  {
    id: 'diag-syntax-a1-1',
    difficulty: -0.7,
    discrimination: 1.8,
    skill: 'syntax',
    band: 'A1',
    badgeAr: 'ترتيب الصفة · A1',
    badgeEn: 'Word Order · A1',
    promptAr: 'إزاي تقول "عندي عربية جديدة" بالإنجليزي؟',
    promptEn: 'Choose the correct English adjective-noun order:',
    l1Pattern: 'adjective_order',
    options: [
      { id: 'a', text: 'I have a car new.', isCorrect: false },
      { id: 'b', text: 'I have a new car.', isCorrect: true },
      { id: 'c', text: 'I have new a car.', isCorrect: false },
    ],
  },
  {
    id: 'diag-vocab-a1-1',
    difficulty: -0.5,
    discrimination: 1.65,
    skill: 'vocab',
    band: 'A1',
    badgeAr: 'مفردات يومية · A1',
    badgeEn: 'Daily Vocab · A1',
    promptAr: 'إزاي تسأل "فين محطة المترو؟"',
    promptEn: 'How do you ask for the metro station?',
    options: [
      { id: 'a', text: 'Where is the metro station?', isCorrect: true },
      { id: 'b', text: 'Who is the metro station?', isCorrect: false },
      { id: 'c', text: 'When go metro station?', isCorrect: false },
    ],
  },

  // --- A2 (b in [-0.2, +0.4]) ---
  {
    id: 'diag-l1-a2-1',
    difficulty: -0.1,
    discrimination: 2.0,
    skill: 'l1_transfer',
    band: 'A2',
    badgeAr: 'فخ الترجمة · A2',
    badgeEn: 'L1 Trap Fix · A2',
    promptAr: 'إزاي تقول "أنا موافق معاك" بالإنجليزي الطبيعي؟',
    promptEn: 'Which sentence is natural English without a literal Arabic trap?',
    l1Pattern: 'copula_omission',
    options: [
      { id: 'a', text: 'I am agree with you.', isCorrect: false },
      { id: 'b', text: 'I agree with you.', isCorrect: true },
      { id: 'c', text: 'I agreeing with you.', isCorrect: false },
    ],
  },
  {
    id: 'diag-l1-a2-2',
    difficulty: 0.15,
    discrimination: 1.9,
    skill: 'l1_transfer',
    band: 'A2',
    badgeAr: 'حروف الجر · A2',
    badgeEn: 'Preposition Trap · A2',
    promptAr: 'إزاي تقول "هتصل بيك بكرة" بدون حرف جر زيادة؟',
    promptEn: 'Pick the natural English without an extra Arabic preposition:',
    l1Pattern: 'preposition_transfer',
    options: [
      { id: 'a', text: 'I will call to you tomorrow.', isCorrect: false },
      { id: 'b', text: 'I will call you tomorrow.', isCorrect: true },
      { id: 'c', text: 'I will call with you tomorrow.', isCorrect: false },
    ],
  },
  {
    id: 'diag-syntax-a2-1',
    difficulty: 0.25,
    discrimination: 1.85,
    skill: 'syntax',
    band: 'A2',
    badgeAr: 'تركيب الجملة · A2',
    badgeEn: 'Tense & Habit · A2',
    promptAr: 'إزاي تقول "متعود أشرب شاي الصبح"؟',
    promptEn: 'Pick the natural way to describe a daily habit:',
    options: [
      { id: 'a', text: 'I usually drink tea in the morning.', isCorrect: true },
      { id: 'b', text: 'I am use drink tea at morning.', isCorrect: false },
      { id: 'c', text: 'I drinking tea every mornings.', isCorrect: false },
    ],
  },
  {
    id: 'diag-vocab-a2-1',
    difficulty: 0.35,
    discrimination: 1.75,
    skill: 'vocab',
    band: 'A2',
    badgeAr: 'تعبير يومي · A2',
    badgeEn: 'Everyday Phrase · A2',
    promptAr: 'إزاي تقول "لسه مخلص شغلي حالاً"؟',
    promptEn: 'How do you say you finished work a moment ago?',
    options: [
      { id: 'a', text: 'I just finished my work.', isCorrect: true },
      { id: 'b', text: 'I am finish my work now.', isCorrect: false },
      { id: 'c', text: 'I finish my work yesterday.', isCorrect: false },
    ],
  },

  // --- B1 (b in [+0.6, +1.2]) ---
  {
    id: 'diag-listen-b1-1',
    difficulty: 0.7,
    discrimination: 1.9,
    skill: 'listening',
    band: 'B1',
    badgeAr: 'استماع طبيعي · B1',
    badgeEn: 'Natural Listening · B1',
    promptAr: 'اسمع الجملة واختار المعنى الدقيق:',
    promptEn: 'Listen closely and choose what the speaker means:',
    audioText: 'I would rather work from home today.',
    options: [
      { id: 'a', text: 'بفضّل أشتغل من البيت النهاردة / Prefers working from home', isCorrect: true },
      { id: 'b', text: 'لازم أروح المكتب حالاً / Must go to the office now', isCorrect: false },
      { id: 'c', text: 'نسيت اللابتوب في البيت / Left the laptop at home', isCorrect: false },
    ],
  },
  {
    id: 'diag-l1-b1-1',
    difficulty: 0.9,
    discrimination: 2.0,
    skill: 'l1_transfer',
    band: 'B1',
    badgeAr: 'فخ الترجمة · B1',
    badgeEn: 'L1 Nuance · B1',
    promptAr: 'إزاي تقول "أنا مهتم بالبرمجة"؟',
    promptEn: 'Choose the right participial adjective form:',
    options: [
      { id: 'a', text: 'I am interesting in coding.', isCorrect: false },
      { id: 'b', text: 'I am interested in coding.', isCorrect: true },
      { id: 'c', text: 'I interest about coding.', isCorrect: false },
    ],
  },
  {
    id: 'diag-vocab-b1-1',
    difficulty: 1.05,
    discrimination: 1.85,
    skill: 'vocab',
    band: 'B1',
    badgeAr: 'تعبير طبيعي · B1',
    badgeEn: 'Natural Idiom · B1',
    promptAr: 'إزاي تقول "الموضوع طلع أسهل مما توقعت"؟',
    promptEn: 'Choose the natural phrasing for a pleasant surprise:',
    options: [
      { id: 'a', text: 'It turned out to be easier than I expected.', isCorrect: true },
      { id: 'b', text: 'It went out more easy from my thinking.', isCorrect: false },
      { id: 'c', text: 'It appeared easy than I was expect.', isCorrect: false },
    ],
  },
  {
    id: 'diag-syntax-b1-1',
    difficulty: 1.15,
    discrimination: 1.9,
    skill: 'syntax',
    band: 'B1',
    badgeAr: 'تركيب مترابط · B1',
    badgeEn: 'Complex Syntax · B1',
    promptAr: 'اختار الجملة السليمة للمقارنة والسبب:',
    promptEn: 'Select the grammatically sound sentence:',
    options: [
      { id: 'a', text: 'Although it was raining, we still went for a walk.', isCorrect: true },
      { id: 'b', text: 'Although it was raining, but we still went for a walk.', isCorrect: false },
      { id: 'c', text: 'Despite it was raining, we went for a walk.', isCorrect: false },
    ],
  },

  // --- B2 (b in [+1.4, +1.95]) ---
  {
    id: 'diag-l1-b2-1',
    difficulty: 1.45,
    discrimination: 2.05,
    skill: 'l1_transfer',
    band: 'B2',
    badgeAr: 'إنجليزية احترافية · B2',
    badgeEn: 'Professional L1 Fix · B2',
    promptAr: 'اختار خاتمة الإيميل الاحترافية الصح:',
    promptEn: 'Select the grammatically natural email closing:',
    l1Pattern: 'preposition_transfer',
    options: [
      { id: 'a', text: 'I look forward to hear from you.', isCorrect: false },
      { id: 'b', text: 'I look forward to hearing from you.', isCorrect: true },
      { id: 'c', text: 'I am looking forward hear you.', isCorrect: false },
    ],
  },
  {
    id: 'diag-syntax-b2-1',
    difficulty: 1.65,
    discrimination: 2.1,
    skill: 'syntax',
    band: 'B2',
    badgeAr: 'شرط مركب · B2',
    badgeEn: 'Third Conditional · B2',
    promptAr: 'إزاي تقول "لو كنت عرفت بدري، كنت ساعدتك"؟',
    promptEn: 'Choose the natural third-conditional sentence:',
    options: [
      { id: 'a', text: 'If I would know earlier, I helped you.', isCorrect: false },
      { id: 'b', text: 'If I had known earlier, I would have helped you.', isCorrect: true },
      { id: 'c', text: 'If I knew earlier, I will help you.', isCorrect: false },
    ],
  },
  {
    id: 'diag-listen-b2-1',
    difficulty: 1.8,
    discrimination: 1.95,
    skill: 'listening',
    band: 'B2',
    badgeAr: 'استماع متقدم · B2',
    badgeEn: 'Nuanced Listening · B2',
    promptAr: 'اسمع الجملة واختار المقصود بدقة:',
    promptEn: 'Listen and choose the exact nuance:',
    audioText: 'We had better wrap this up before the deadline slips.',
    options: [
      { id: 'a', text: 'الأفضل ننهي الشغل ده قبل ما الموعد يفوتنا / Finish urgently before missing the deadline', isCorrect: true },
      { id: 'b', text: 'ممكن نأجل التسليم للأسبوع الجاي / We can postpone until next week', isCorrect: false },
      { id: 'c', text: 'الموعد النهائي اتلغى خلاص / The deadline was cancelled', isCorrect: false },
    ],
  },
  {
    id: 'diag-vocab-b2-1',
    difficulty: 1.9,
    discrimination: 2.0,
    skill: 'vocab',
    band: 'B2',
    badgeAr: 'تعبير اصطلاحي · B2',
    badgeEn: 'Idiomatic Precision · B2',
    promptAr: 'إزاي تقول "بصراحة، النقطة دي تستاهل نناقشها"؟',
    promptEn: 'Pick the natural idiomatic phrasing:',
    options: [
      { id: 'a', text: 'To be fair, that point is well worth discussing.', isCorrect: true },
      { id: 'b', text: 'To be honest, that point deserves we discuss.', isCorrect: false },
      { id: 'c', text: 'Honestly, that point is worth to discuss it.', isCorrect: false },
    ],
  },

  // --- C1 (b in [+2.15, +2.45]) ---
  {
    id: 'diag-syntax-c1-1',
    difficulty: 2.2,
    discrimination: 2.15,
    skill: 'syntax',
    band: 'C1',
    badgeAr: 'دقة متقدمة · C1',
    badgeEn: 'Executive Syntax · C1',
    promptAr: 'اختار الجملة الأكثر دقة في سياق اجتماع رسمي:',
    promptEn: 'Choose the most natural executive phrasing:',
    options: [
      { id: 'a', text: 'Despite of the tight deadline, we shipped on time.', isCorrect: false },
      { id: 'b', text: 'Notwithstanding the tight deadline, we delivered ahead of schedule.', isCorrect: true },
      { id: 'c', text: 'Although the tight deadline, we made deliver on time.', isCorrect: false },
    ],
  },
  {
    id: 'diag-vocab-c1-1',
    difficulty: 2.35,
    discrimination: 2.1,
    skill: 'vocab',
    band: 'C1',
    badgeAr: 'صياغة مقنعة · C1',
    badgeEn: 'Persuasive Idiom · C1',
    promptAr: 'اختار الصياغة الأكثر طبيعية لإقناع فريقك بتأجيل الإطلاق:',
    promptEn: 'Choose the most persuasive, idiomatic C1 sentence:',
    options: [
      { id: 'a', text: 'Rushing the launch now would do more harm than good in the long run.', isCorrect: true },
      { id: 'b', text: 'Making the launch fast now will do big harm than good in long time.', isCorrect: false },
      { id: 'c', text: 'To hurry launching now makes more damage rather than benefit.', isCorrect: false },
    ],
  },
  {
    id: 'diag-listen-c1-1',
    difficulty: 2.4,
    discrimination: 2.05,
    skill: 'listening',
    band: 'C1',
    badgeAr: 'استماع دقيق · C1',
    badgeEn: 'C1 Listening · C1',
    promptAr: 'اسمع الجملة واختار معناها المقصود:',
    promptEn: 'Listen and select the intended implication:',
    audioText: 'Had they consulted the engineers earlier, the outage could have been averted.',
    options: [
      { id: 'a', text: 'لو كانوا استشاروا المهندسين بدري، كان ممكن تجنب العطل / Earlier consultation would have prevented the outage', isCorrect: true },
      { id: 'b', text: 'المهندسين هم السبب في العطل / Engineers caused the outage', isCorrect: false },
      { id: 'c', text: 'العطل لسه ما حصلش / The outage has not happened yet', isCorrect: false },
    ],
  },
  {
    id: 'diag-l1-c1-1',
    difficulty: 2.25,
    discrimination: 2.1,
    skill: 'l1_transfer',
    band: 'C1',
    badgeAr: 'تركيب متقدم · C1',
    badgeEn: 'Inversion & Precision · C1',
    promptAr: 'اختار الجملة الصحيحة التي تبدأ بـ "Rarely":',
    promptEn: 'Pick the sentence with correct negative inversion:',
    options: [
      { id: 'a', text: 'Rarely have I seen such a well-structured proposal.', isCorrect: true },
      { id: 'b', text: 'Rarely I have seen such a well-structured proposal.', isCorrect: false },
      { id: 'c', text: 'Rarely did I saw such a well-structured proposal.', isCorrect: false },
    ],
  },
];

function computeGaussianPrior(mean = 0, stdDev = 1.4): number[] {
  const unnormalized = THETA_GRID.map((t) => {
    const z = (t - mean) / stdDev;
    return Math.exp(-0.5 * z * z);
  });
  const total = unnormalized.reduce((acc, v) => acc + v, 0);
  return unnormalized.map((v) => v / total);
}

function summarizePosterior(posterior: number[]): { theta: number; variance: number; sigma: number } {
  let mean = 0;
  for (let i = 0; i < THETA_GRID.length; i += 1) {
    mean += THETA_GRID[i] * posterior[i];
  }
  let variance = 0;
  for (let i = 0; i < THETA_GRID.length; i += 1) {
    const diff = THETA_GRID[i] - mean;
    variance += diff * diff * posterior[i];
  }
  const clampedMean = Math.max(THETA_MIN, Math.min(THETA_MAX, mean));
  return {
    theta: Number(clampedMean.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    sigma: Number(Math.sqrt(Math.max(0, variance)).toFixed(4)),
  };
}

export function createInitialPlacementSession(priorMean = 0): PlacementSessionState {
  const posterior = computeGaussianPrior(priorMean, 1.4);
  const { theta, variance, sigma } = summarizePosterior(posterior);
  return {
    theta,
    variance,
    sigma,
    posterior,
    askedItemIds: [],
    coveredSkills: [],
    responses: [],
    skills: {
      vocab: 0.5,
      syntax: 0.5,
      listening: 0.5,
      l1_transfer: 0.5,
    },
    detectedWeakPatterns: [],
  };
}

/**
 * Selects the next unasked diagnostic item maximizing Fisher Information I_i(theta_hat),
 * subject to the skill-coverage constraint (at least 1 item per core skill dimension).
 */
export function selectNextDiagnosticItem(
  session: PlacementSessionState,
  itemBank: readonly DiagnosticItem[] = DIAGNOSTIC_ITEMS
): DiagnosticItem | null {
  const asked = new Set(session.askedItemIds);
  const unasked = itemBank.filter((item) => !asked.has(item.id));
  if (unasked.length === 0) return null;

  const uncoveredSkills = ALL_SKILL_DIMENSIONS.filter(
    (dim) => !session.coveredSkills.includes(dim)
  );

  // Enforce skill-coverage constraint: prioritize uncovered skill dimensions
  // until all 4 core dimensions are covered (guaranteed within first 4 items).
  const candidatePool =
    uncoveredSkills.length > 0
      ? unasked.filter((item) => uncoveredSkills.includes(item.skill))
      : unasked;

  const pool = candidatePool.length > 0 ? candidatePool : unasked;

  let bestItem = pool[0];
  let bestInfo = -1;

  for (const item of pool) {
    const info = fisherInformation(session.theta, item.discrimination, item.difficulty);
    if (info > bestInfo + 1e-9 || (Math.abs(info - bestInfo) <= 1e-9 && item.id < bestItem.id)) {
      bestInfo = info;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * Performs Bayesian posterior update over the 61-point discrete grid with
 * response-latency weighting, and updates the 4D skill vector.
 */
export function updatePlacementPosterior(
  session: PlacementSessionState,
  item: DiagnosticItem,
  correct: boolean,
  latencyMs = 4000
): PlacementSessionState {
  const weight = computeLatencyWeight(correct, latencyMs);
  const unnormalized = new Array<number>(THETA_GRID.length);
  let total = 0;

  for (let i = 0; i < THETA_GRID.length; i += 1) {
    const p = irt2plProbability(THETA_GRID[i], item.discrimination, item.difficulty);
    const rawLike = correct ? p : 1 - p;
    const temperedLike = Math.pow(Math.max(1e-12, rawLike), weight);
    const val = session.posterior[i] * temperedLike;
    unnormalized[i] = val;
    total += val;
  }

  const posterior =
    total > 0
      ? unnormalized.map((v) => v / total)
      : [...session.posterior];

  const { theta, variance, sigma } = summarizePosterior(posterior);

  // Update 4D skill vector smoothly
  const prevSkill = session.skills[item.skill] ?? 0.5;
  const speedBonus = correct && latencyMs <= 4000 ? 0.06 : 0;
  const skillDelta = correct ? 0.18 + speedBonus : -0.18;
  const nextSkill = Math.max(0.05, Math.min(1.0, Number((prevSkill + skillDelta).toFixed(3))));

  const coveredSkills = session.coveredSkills.includes(item.skill)
    ? session.coveredSkills
    : [...session.coveredSkills, item.skill];

  const detectedWeakPatterns =
    !correct && item.l1Pattern && !session.detectedWeakPatterns.includes(item.l1Pattern)
      ? [...session.detectedWeakPatterns, item.l1Pattern]
      : session.detectedWeakPatterns;

  const response: PlacementResponse = {
    itemId: item.id,
    difficulty: item.difficulty,
    discrimination: item.discrimination,
    skill: item.skill,
    correct,
    latencyMs,
    l1Pattern: item.l1Pattern,
  };

  return {
    theta,
    variance,
    sigma,
    posterior,
    askedItemIds: [...session.askedItemIds, item.id],
    coveredSkills,
    responses: [...session.responses, response],
    skills: {
      ...session.skills,
      [item.skill]: nextSkill,
    },
    detectedWeakPatterns,
  };
}

/**
 * Optimal Early Stopping:
 * Stops automatically when sigma(theta) < 0.35 (with all 4 skills covered)
 * OR max 7 items reached.
 */
export function shouldStopPlacement(session: PlacementSessionState): boolean {
  if (session.responses.length >= MAX_PLACEMENT_ITEMS) return true;
  const allSkillsCovered = ALL_SKILL_DIMENSIONS.every((d) => session.coveredSkills.includes(d));
  if (allSkillsCovered && session.sigma < STOP_SIGMA_THRESHOLD) {
    return true;
  }
  return false;
}

export function finalizePlacement(session: PlacementSessionState): PlacementFinalResult {
  const band = thetaToCefrBand(session.theta);
  const levelId = bandToCefrLevelId(band);
  const phaseId = bandToPhaseId(band);
  const total = Math.max(1, session.responses.length);
  const correctCount = session.responses.filter((r) => r.correct).length;
  const scorePercent = Math.round((correctCount / total) * 100);
  const meta = OR_BAND_DESCRIPTIONS[band];

  return {
    theta: session.theta,
    sigma: session.sigma,
    band,
    levelId,
    phaseId,
    scorePercent,
    itemsAnswered: session.responses.length,
    skills: { ...session.skills },
    detectedWeakPatterns: [...session.detectedWeakPatterns],
    whyAr: meta.whyAr,
    whyEn: meta.whyEn,
  };
}

// ============================================================
// Part B: Whole-Curriculum Tailoring (DAG + ZPD + 0/1 Knapsack + FSRS)
// ============================================================

export type CurriculumNodeStatus =
  | 'completed'
  | 'mastered_via_placement'
  | 'available'
  | 'locked';

export interface CurriculumNode {
  id: string;
  index: number; // 1-based display index
  difficulty: number; // b_k in [-2.5, +2.5]
  prerequisiteIds: string[];
  levelId?: CefrLevelId;
  phaseId?: PhaseId;
}

export interface CalibratedCurriculumNode extends CurriculumNode {
  status: CurriculumNodeStatus;
  predictedSuccess: number;
  isActiveBeacon: boolean;
}

export interface CurriculumCalibrationResult {
  nodes: CalibratedCurriculumNode[];
  activeNodeId: string | null;
  masteredViaPlacementIds: string[];
  lockedIds: string[];
}

export const ZPD_MIN_PROB = 0.65;
export const ZPD_MAX_PROB = 0.82;
export const MASTERED_THETA_OFFSET = 0.85;
export const LOCKED_THETA_OFFSET = 1.2;

/**
 * Calibrates the entire curriculum DAG for a learner with ability theta:
 * - b_k <= theta - 0.85 -> mastered_via_placement (fast-forwarded, still clickable)
 * - b_k > theta + 1.2 with unmet prerequisites -> locked
 * - Active glowing beacon lands on the optimal ZPD node where P(success | theta, b_k) in [0.65, 0.82]
 */
export function calibrateCurriculumGraph(
  theta: number,
  nodes: readonly CurriculumNode[],
  completedLessonIds: readonly string[] = []
): CurriculumCalibrationResult {
  const completedSet = new Set(completedLessonIds);
  const masteredViaPlacementSet = new Set<string>();

  // Pass 1: Identify completed and mastered_via_placement nodes
  for (const node of nodes) {
    if (!completedSet.has(node.id) && node.difficulty <= theta - MASTERED_THETA_OFFSET) {
      masteredViaPlacementSet.add(node.id);
    }
  }

  const satisfiedSet = new Set<string>([...completedSet, ...masteredViaPlacementSet]);

  // Pass 2: Determine status and predicted success probability for each node
  const calibrated: CalibratedCurriculumNode[] = nodes.map((node) => {
    const predictedSuccess = Number(irt2plProbability(theta, 1.25, node.difficulty).toFixed(4));
    const prereqsMet = node.prerequisiteIds.every((preId) => satisfiedSet.has(preId));

    let status: CurriculumNodeStatus;
    if (completedSet.has(node.id)) {
      status = 'completed';
    } else if (masteredViaPlacementSet.has(node.id)) {
      status = 'mastered_via_placement';
    } else if (node.difficulty > theta + LOCKED_THETA_OFFSET && !prereqsMet) {
      status = 'locked';
    } else if (!prereqsMet && node.difficulty > theta + 0.4) {
      status = 'locked';
    } else {
      status = 'available';
    }

    return {
      ...node,
      status,
      predictedSuccess,
      isActiveBeacon: false,
    };
  });

  // Pass 3: Select active glowing beacon in optimal ZPD [0.65, 0.82]
  const availableNodes = calibrated.filter((n) => n.status === 'available');
  const zpdTarget = (ZPD_MIN_PROB + ZPD_MAX_PROB) / 2; // 0.735

  let activeNode: CalibratedCurriculumNode | null = null;

  if (availableNodes.length > 0) {
    const inZpd = availableNodes.filter(
      (n) => n.predictedSuccess >= ZPD_MIN_PROB && n.predictedSuccess <= ZPD_MAX_PROB
    );
    const pool = inZpd.length > 0 ? inZpd : availableNodes;
    activeNode = pool.reduce((best, curr) => {
      const bestDist = Math.abs(best.predictedSuccess - zpdTarget);
      const currDist = Math.abs(curr.predictedSuccess - zpdTarget);
      if (currDist < bestDist - 1e-6) return curr;
      if (Math.abs(currDist - bestDist) <= 1e-6 && curr.index < best.index) return curr;
      return best;
    }, pool[0]);
  } else if (calibrated.length > 0) {
    // Fallback: if all nodes are mastered/completed, point to the last node
    activeNode = calibrated[calibrated.length - 1];
  }

  if (activeNode) {
    activeNode.isActiveBeacon = true;
  }

  return {
    nodes: calibrated,
    activeNodeId: activeNode?.id ?? null,
    masteredViaPlacementIds: Array.from(masteredViaPlacementSet),
    lockedIds: calibrated.filter((n) => n.status === 'locked').map((n) => n.id),
  };
}

/**
 * Helper to derive calibrated difficulty b_k for a flat list of lessons within a CEFR level.
 */
export function mapLessonsToCurriculumNodes(
  lessons: readonly { id: string; levelId?: CefrLevelId; phaseId?: PhaseId }[],
  levelId: CefrLevelId = 'A1'
): CurriculumNode[] {
  const levelBaseDifficulty: Record<CefrLevelId, number> = {
    A1: -1.6,
    A2: -0.25,
    B1: 0.6,
    B2: 1.4,
    C1: 2.15,
  };
  const base = levelBaseDifficulty[levelId] ?? -1.2;
  const step = lessons.length > 1 ? 0.9 / Math.max(1, lessons.length - 1) : 0;

  return lessons.map((lesson, idx) => ({
    id: lesson.id,
    index: idx + 1,
    difficulty: Number(Math.max(-2.5, Math.min(2.5, base + idx * step)).toFixed(3)),
    prerequisiteIds: idx > 0 ? [lessons[idx - 1].id] : [],
    levelId: lesson.levelId || levelId,
    phaseId: lesson.phaseId,
  }));
}

// ============================================================
// Multi-Objective Session & Word-Bank Optimizer (0/1 Knapsack + FSRS)
// ============================================================

export interface LearningCandidateItem {
  id: string;
  word?: string;
  skill: SkillDimension;
  isNew: boolean;
  isL1Contrast?: boolean;
  stabilityDays: number; // S_j > 0
  elapsedDays: number; // delta_t >= 0
  frequency: number; // freq_j in (0, 1]
  estTimeSec: number; // estTime_j > 0
  prerequisiteIds?: string[];
}

export interface CognitiveLoadCaps {
  maxNewWords: number;
  maxReviews: number;
  includeL1ContrastDrills: boolean;
}

export const COGNITIVE_LOAD_CAPS: Record<UiMode, CognitiveLoadCaps> = {
  simple: { maxNewWords: 2, maxReviews: 3, includeL1ContrastDrills: false },
  standard: { maxNewWords: 4, maxReviews: 4, includeL1ContrastDrills: false },
  pro: { maxNewWords: 6, maxReviews: 6, includeL1ContrastDrills: true },
};

/**
 * FSRS Retrievability: R_j(t) = exp(-delta_t / S_j)
 * Brand-new items have retrievability 0.
 */
export function fsrsRetrievability(elapsedDays: number, stabilityDays: number, isNew = false): number {
  if (isNew) return 0;
  const safeS = Math.max(0.1, stabilityDays);
  const safeDt = Math.max(0, elapsedDays);
  return Math.max(0, Math.min(1, Math.exp(-safeDt / safeS)));
}

/**
 * Expected Mastery Gain per Second:
 * Utility(j) = ((1 - R_j(t)) * (1 + w_gap * skillGap(d_j)) * freq_j) / estTime_j
 */
export function computeItemUtility(
  item: LearningCandidateItem,
  skills: Record<SkillDimension, number>,
  wGap = 0.8
): number {
  const r = fsrsRetrievability(item.elapsedDays, item.stabilityDays, item.isNew);
  const skillScore = Math.max(0, Math.min(1, skills[item.skill] ?? 0.5));
  const skillGap = 1 - skillScore;
  const freq = Math.max(0.05, Math.min(1, item.frequency));
  const estTime = Math.max(1, item.estTimeSec);
  const numerator = (1 - r) * (1 + wGap * skillGap) * freq;
  return Number((numerator / estTime).toFixed(6));
}

export interface OptimizeSessionOptions {
  uiMode: UiMode;
  skills: Record<SkillDimension, number>;
  completedPrerequisiteIds?: readonly string[];
  timeBudgetSec?: number;
  wGap?: number;
}

export interface OptimizedSessionPlan {
  newItems: Array<LearningCandidateItem & { utility: number; retrievability: number }>;
  reviewItems: Array<LearningCandidateItem & { utility: number; retrievability: number }>;
  l1ContrastItems: Array<LearningCandidateItem & { utility: number; retrievability: number }>;
  orderedItems: Array<LearningCandidateItem & { utility: number; retrievability: number }>;
  totalEstimatedTimeSec: number;
  caps: CognitiveLoadCaps;
}

/**
 * 0/1 Knapsack Approximation (density-ordered greedy selection) enforcing:
 * - DAG prerequisite satisfaction
 * - Cognitive Load Caps per UI Mode (Easy: <=2 new + <=3 reviews, Standard: <=4 new + <=4 reviews, Pro: <=6 new + L1 contrast drills)
 * - Optional time budget constraint
 */
export function optimizeSessionItems(
  candidates: readonly LearningCandidateItem[],
  options: OptimizeSessionOptions
): OptimizedSessionPlan {
  const {
    uiMode,
    skills,
    completedPrerequisiteIds = [],
    timeBudgetSec = Number.POSITIVE_INFINITY,
    wGap = 0.8,
  } = options;

  const caps = COGNITIVE_LOAD_CAPS[uiMode];
  const completedSet = new Set(completedPrerequisiteIds);

  // Filter by DAG prerequisites
  const eligible = candidates
    .filter((item) =>
      !item.prerequisiteIds || item.prerequisiteIds.every((pre) => completedSet.has(pre))
    )
    .map((item) => {
      const retrievability = fsrsRetrievability(item.elapsedDays, item.stabilityDays, item.isNew);
      const utility = computeItemUtility(item, skills, wGap);
      return { ...item, retrievability, utility };
    });

  // Sort descending by Utility (deterministic tie-break by id)
  const sortByUtility = <T extends { utility: number; id: string }>(arr: T[]) =>
    [...arr].sort((a, b) => (b.utility !== a.utility ? b.utility - a.utility : a.id.localeCompare(b.id)));

  const newPool = sortByUtility(eligible.filter((i) => i.isNew && !i.isL1Contrast));
  const l1Pool = sortByUtility(eligible.filter((i) => i.isL1Contrast));

  // In Easy Mode, confidence-building reviews prefer higher retrievability (still needing reinforcement)
  const reviewRaw = eligible.filter((i) => !i.isNew && !i.isL1Contrast);
  const reviewPool =
    uiMode === 'simple'
      ? [...reviewRaw].sort((a, b) => {
          // Confidence-building: prefer moderate-to-high retrievability [0.55..0.90] while respecting utility
          const confA = a.retrievability >= 0.5 ? a.retrievability + a.utility : a.utility;
          const confB = b.retrievability >= 0.5 ? b.retrievability + b.utility : b.utility;
          return confB !== confA ? confB - confA : a.id.localeCompare(b.id);
        })
      : sortByUtility(reviewRaw);

  let usedTime = 0;
  const newItems: typeof eligible = [];
  const reviewItems: typeof eligible = [];
  const l1ContrastItems: typeof eligible = [];

  for (const item of newPool) {
    if (newItems.length >= caps.maxNewWords) break;
    if (usedTime + item.estTimeSec <= timeBudgetSec) {
      newItems.push(item);
      usedTime += item.estTimeSec;
    }
  }

  for (const item of reviewPool) {
    if (reviewItems.length >= caps.maxReviews) break;
    if (usedTime + item.estTimeSec <= timeBudgetSec) {
      reviewItems.push(item);
      usedTime += item.estTimeSec;
    }
  }

  if (caps.includeL1ContrastDrills) {
    for (const item of l1Pool) {
      if (l1ContrastItems.length >= 3) break;
      if (usedTime + item.estTimeSec <= timeBudgetSec) {
        l1ContrastItems.push(item);
        usedTime += item.estTimeSec;
      }
    }
  }

  // Interleave reviews & new items gently for Easy Mode (review first for confidence)
  const orderedItems =
    uiMode === 'simple'
      ? [...reviewItems.slice(0, 1), ...newItems, ...reviewItems.slice(1)]
      : [...newItems, ...reviewItems, ...l1ContrastItems];

  return {
    newItems,
    reviewItems,
    l1ContrastItems,
    orderedItems,
    totalEstimatedTimeSec: usedTime,
    caps,
  };
}

// ============================================================
// Continuous Closed-Loop Re-Optimization & Local Persistence
// ============================================================

export interface OrAdaptiveProfile {
  theta: number;
  sigma: number;
  band: OrCefrBand;
  skills: Record<SkillDimension, number>;
  itemStabilities: Record<string, number>; // itemId -> stability S_j in days
  masteredViaPlacementIds: string[];
  activeNodeId: string | null;
  weakL1Patterns: L1WeaknessPattern[];
  updatedAtISO: string;
}

export const OR_ADAPTIVE_PROFILE_KEY = 'tb.orAdaptiveProfile.v1';

export function getDefaultAdaptiveProfile(): OrAdaptiveProfile {
  return {
    theta: -1.5,
    sigma: 1.0,
    band: 'A0',
    skills: {
      vocab: 0.5,
      syntax: 0.5,
      listening: 0.5,
      l1_transfer: 0.5,
    },
    itemStabilities: {},
    masteredViaPlacementIds: [],
    activeNodeId: null,
    weakL1Patterns: [],
    updatedAtISO: new Date().toISOString(),
  };
}

export function loadAdaptiveProfile(): OrAdaptiveProfile {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(OR_ADAPTIVE_PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OrAdaptiveProfile>;
        if (typeof parsed.theta === 'number' && parsed.skills) {
          return {
            ...getDefaultAdaptiveProfile(),
            ...parsed,
          };
        }
      }
    }
  } catch {
    // Fallback to default
  }
  return getDefaultAdaptiveProfile();
}

export function saveAdaptiveProfile(profile: OrAdaptiveProfile): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(OR_ADAPTIVE_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Closed-loop update after every exercise answer in LessonRunner:
 * Updates theta, 4D skill vector, FSRS stability S_j, and detects L1 weakness patterns.
 */
export function recordExerciseOutcome(
  profile: OrAdaptiveProfile,
  outcome: {
    itemId: string;
    skill: SkillDimension;
    correct: boolean;
    latencyMs: number;
    itemDifficulty?: number;
    l1Pattern?: L1WeaknessPattern;
  }
): OrAdaptiveProfile {
  const b = outcome.itemDifficulty ?? profile.theta;
  const p = irt2plProbability(profile.theta, 1.3, b);
  const weight = computeLatencyWeight(outcome.correct, outcome.latencyMs);
  const stepSize = 0.16 * weight;
  const residual = (outcome.correct ? 1 : 0) - p;
  const nextTheta = Math.max(
    THETA_MIN,
    Math.min(THETA_MAX, Number((profile.theta + stepSize * residual).toFixed(4)))
  );

  const prevSkill = profile.skills[outcome.skill] ?? 0.5;
  const nextSkill = Math.max(
    0.05,
    Math.min(1.0, Number((prevSkill + (outcome.correct ? 0.06 : -0.08)).toFixed(3)))
  );

  const prevS = profile.itemStabilities[outcome.itemId] ?? 1.0;
  const nextS = outcome.correct
    ? Number(Math.min(365, prevS * (outcome.latencyMs <= 5000 ? 2.2 : 1.7)).toFixed(2))
    : Number(Math.max(0.5, prevS * 0.45).toFixed(2));

  const weakL1Patterns =
    !outcome.correct && outcome.l1Pattern && !profile.weakL1Patterns.includes(outcome.l1Pattern)
      ? [...profile.weakL1Patterns, outcome.l1Pattern]
      : profile.weakL1Patterns;

  return {
    ...profile,
    theta: nextTheta,
    band: thetaToCefrBand(nextTheta),
    skills: {
      ...profile.skills,
      [outcome.skill]: nextSkill,
    },
    itemStabilities: {
      ...profile.itemStabilities,
      [outcome.itemId]: nextS,
    },
    weakL1Patterns,
    updatedAtISO: new Date().toISOString(),
  };
}

/**
 * Detects an Arabic L1-interference weakness from a mistake and returns
 * a targeted micro-drill ExerciseItem to inject into LessonRunner.
 */
export function detectL1WeaknessFromAnswer(
  userAnswer: string,
  targetSentence: string
): L1WeaknessPattern | null {
  const u = userAnswer.trim().toLowerCase();
  const t = targetSentence.trim().toLowerCase();
  if (!u || !t) return null;

  // Copula omission: target has am/is/are, user omitted it
  if (/\b(am|is|are)\b/.test(t) && !/\b(am|is|are)\b/.test(u)) {
    return 'copula_omission';
  }
  // Adjective order: e.g. "car new" instead of "new car"
  if (/\b(new|big|small|good|red|fast|hot|cold)\s+\w+/.test(t)) {
    const match = t.match(/\b(new|big|small|good|red|fast|hot|cold)\s+(\w+)/);
    if (match && u.includes(`${match[2]} ${match[1]}`)) {
      return 'adjective_order';
    }
  }
  // Extra Arabic preposition transfer: "call to you", "married with"
  if (/\b(call|tell|ask|meet)\s+(to|with)\b/.test(u)) {
    return 'preposition_transfer';
  }
  // Article omission
  if (/\b(a|an)\s+\w+/.test(t) && !/\b(a|an)\b/.test(u)) {
    return 'article_omission';
  }
  return null;
}

export function getTargetedL1MicroDrill(pattern: L1WeaknessPattern): ExerciseItem {
  switch (pattern) {
    case 'copula_omission':
      return {
        id: `l1-micro-copula-${pattern}`,
        type: 'structure_builder',
        promptAr: 'تدريب سريع (فعل الربط): أنا جاهز الآن',
        promptEn: 'Quick L1 Bridge Drill (Linking Verb): I am ready now',
        targetSentence: 'I am ready now',
        wordChips: ['I', 'am', 'ready', 'now'],
        explanationAr: 'في الإنجليزي لا نترك الجملة بدون فعل ربط (am / is / are) بين الفاعل والصفة.',
        explanationEn: 'English always requires a linking verb (am / is / are) between subject and adjective.',
        skillAxes: ['structure'],
        weakSpotTag: 'copula_omission',
      };
    case 'adjective_order':
      return {
        id: `l1-micro-adj-${pattern}`,
        type: 'structure_builder',
        promptAr: 'تدريب سريع (ترتيب الصفة): هذا كتاب جديد',
        promptEn: 'Quick L1 Bridge Drill (Adjective Order): This is a new book',
        targetSentence: 'This is a new book',
        wordChips: ['This', 'is', 'a', 'new', 'book'],
        explanationAr: 'في الإنجليزي الصفة تأتي قبل الاسم دائماً: new book وليس book new.',
        explanationEn: 'In English, adjectives always come before the noun: "new book".',
        skillAxes: ['structure'],
        weakSpotTag: 'adjective_order',
      };
    case 'preposition_transfer':
      return {
        id: `l1-micro-prep-${pattern}`,
        type: 'structure_builder',
        promptAr: 'تدريب سريع (بدون حرف جر زائد): سأتصل بك غداً',
        promptEn: 'Quick L1 Bridge Drill (No Extra Preposition): I will call you tomorrow',
        targetSentence: 'I will call you tomorrow',
        wordChips: ['I', 'will', 'call', 'you', 'tomorrow'],
        explanationAr: 'الفعل call يأخذ المفعول مباشرة بدون حرف الجر to.',
        explanationEn: 'The verb "call" takes a direct object with no preposition ("call you").',
        skillAxes: ['structure'],
        weakSpotTag: 'preposition_transfer',
      };
    case 'article_omission':
      return {
        id: `l1-micro-art-${pattern}`,
        type: 'structure_builder',
        promptAr: 'تدريب سريع (أداة النكرة): أنا طالب',
        promptEn: 'Quick L1 Bridge Drill (Indefinite Article): I am a student',
        targetSentence: 'I am a student',
        wordChips: ['I', 'am', 'a', 'student'],
        explanationAr: 'الاسم المفرد المعدود في الإنجليزي يحتاج أداة نكرة (a أو an) قبله.',
        explanationEn: 'Singular countable nouns in English require "a" or "an".',
        skillAxes: ['structure'],
        weakSpotTag: 'article_omission',
      };
  }
}
