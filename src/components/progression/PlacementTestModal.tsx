// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useEffect, useState } from 'react';
import { CefrLevelId, PhaseId, ProgressionState } from '../../progression/types';
import { X, Compass, CheckCircle2, ArrowLeft, ArrowRight, Award, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import { DualSpeedAudio } from '../DualSpeedAudio';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProgressionState;
  onCompletePlacement: (levelId: CefrLevelId, phaseId: PhaseId, score: number) => void;
  isArabic?: boolean;
}

type StaircaseBand = 'Pre-A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type QuestionKind = 'l1-trap' | 'listening' | 'natural';

interface AdaptiveQuestion {
  id: string;
  band: StaircaseBand;
  kind: QuestionKind;
  badgeAr: string;
  badgeEn: string;
  promptAr: string;
  promptEn: string;
  audioText?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

const BAND_ORDER: StaircaseBand[] = ['Pre-A0', 'A1', 'A2', 'B1', 'B2', 'C1'];
const TOTAL_QUESTIONS = 5;

const BAND_META: Record<
  StaircaseBand,
  {
    levelId: CefrLevelId;
    phaseId: PhaseId;
    mapLevel: number;
    labelAr: string;
    labelEn: string;
    whyAr: string;
    whyEn: string;
  }
> = {
  'Pre-A0': {
    levelId: 'A1',
    phaseId: 'A1.1',
    mapLevel: 1,
    labelAr: 'Pre-A0 (تحت الصفر)',
    labelEn: 'Pre-A0 (Complete Beginner)',
    whyAr: 'هنبدأ معاك من الصفر خطوة بخطوة بأبسط الجمل اليومية من غير أي ضغط.',
    whyEn: 'We will build your foundation from scratch with simple daily English.',
  },
  A1: {
    levelId: 'A1',
    phaseId: 'A1.1',
    mapLevel: 2,
    labelAr: 'A1 (التأسيس)',
    labelEn: 'A1 (Foundation)',
    whyAr: 'عندك أساس كويس في الكلمات البسيطة، وهنظبط معاك تركيب الجملة الأساسية.',
    whyEn: 'You know core words—now we will lock in clean everyday sentence structure.',
  },
  A2: {
    levelId: 'A2',
    phaseId: 'A2.1',
    mapLevel: 4,
    labelAr: 'A2 (الجسر الأساسي)',
    labelEn: 'A2 (Elementary Bridge)',
    whyAr: 'بتفهم الجمل اليومية كويس، وجاهز تتخلص من مصايد الترجمة الحرفية.',
    whyEn: 'You handle everyday English well and are ready to drop literal Arabic habits.',
  },
  B1: {
    levelId: 'B1',
    phaseId: 'B1.1',
    mapLevel: 6,
    labelAr: 'B1 (الطلاقة المتوسطة)',
    labelEn: 'B1 (Intermediate Fluency)',
    whyAr: 'تجاوزت أخطاء الترجمة الشائعة وفهمت السماع الطبيعي — جاهز لتقوية الطلاقة.',
    whyEn: 'You avoided common L1 traps and handled natural audio—ready to build fluency.',
  },
  B2: {
    levelId: 'B2',
    phaseId: 'B2.1',
    mapLevel: 8,
    labelAr: 'B2 (فوق المتوسط)',
    labelEn: 'B2 (Upper-Intermediate)',
    whyAr: 'إجاباتك دقيقة وطبيعية، ففتحنا لك المستويات المتقدمة مباشرة بدون تضييع وقت.',
    whyEn: 'Your choices are accurate and natural—we unlocked upper-intermediate right away.',
  },
  C1: {
    levelId: 'C1',
    phaseId: 'C1.1',
    mapLevel: 10,
    labelAr: 'C1 (الإتقان المتقدم)',
    labelEn: 'C1 (Advanced Mastery)',
    whyAr: 'مستواك قوي جداً في النطق والتعبيرات الدقيقة — جاهز لتحديات الإتقان والبيزنس.',
    whyEn: 'Strong command of nuance and idioms—straight to mastery and executive challenges.',
  },
};

/**
 * 5-slot adaptive staircase question bank:
 * Slot 0 (Q1, starts at A2): L1-trap fix
 * Slot 1 (Q2, A1 or B1): Audio listening tap (DualSpeedAudio)
 * Slot 2 (Q3, Pre-A0..B2): L1-trap fix #2
 * Slot 3 (Q4, Pre-A0..C1): Natural sentence/meaning choice
 * Slot 4 (Q5, Pre-A0..C1): Final calibration sentence/meaning choice
 */
const QUESTION_BANK: Record<number, Partial<Record<StaircaseBand, AdaptiveQuestion>>> = {
  // SLOT 0 — Always starts at A2 (Egyptian L1-trap fix #1)
  0: {
    A2: {
      id: 'q1-a2-trap',
      band: 'A2',
      kind: 'l1-trap',
      badgeAr: 'فخ الترجمة الحرفية · A2',
      badgeEn: 'L1 Trap Fix · A2',
      promptAr: 'إزاي تقول "أنا موافق معاك" بالإنجليزي الصح؟',
      promptEn: 'Which sentence is natural English (no literal Arabic trap)?',
      options: [
        { id: 'a', text: 'I am agree with you.', isCorrect: false },
        { id: 'b', text: 'I agree with you.', isCorrect: true },
        { id: 'c', text: 'I agreeing with you.', isCorrect: false },
      ],
    },
  },

  // SLOT 1 — Audio listening tap (DualSpeedAudio) at A1 (if Q1 wrong) or B1 (if Q1 right)
  1: {
    A1: {
      id: 'q2-a1-audio',
      band: 'A1',
      kind: 'listening',
      badgeAr: 'تحدي الاستماع · A1',
      badgeEn: 'Listening Check · A1',
      promptAr: 'اسمع الجملة واختار معناها الصح:',
      promptEn: 'Listen to the audio and pick the exact meaning:',
      audioText: 'Can I have a cup of coffee, please?',
      options: [
        { id: 'a', text: 'ممكن فنجان قهوة لو سمحت؟ / Asking for coffee', isCorrect: true },
        { id: 'b', text: 'فين أقرب كافيه؟ / Asking for directions', isCorrect: false },
        { id: 'c', text: 'القهوة باردة جداً / Complaining about coffee', isCorrect: false },
      ],
    },
    B1: {
      id: 'q2-b1-audio',
      band: 'B1',
      kind: 'listening',
      badgeAr: 'تحدي الاستماع · B1',
      badgeEn: 'Listening Check · B1',
      promptAr: 'اسمع الجملة واختار المعنى الدقيق:',
      promptEn: 'Listen closely and choose what the speaker means:',
      audioText: 'I would rather work from home today.',
      options: [
        { id: 'a', text: 'بفضّل أشتغل من البيت النهاردة / Prefers working from home', isCorrect: true },
        { id: 'b', text: 'لازم أروح المكتب حالاً / Must go to the office now', isCorrect: false },
        { id: 'c', text: 'نسيت اللابتوب في البيت / Left the laptop at home', isCorrect: false },
      ],
    },
  },

  // SLOT 2 — Egyptian L1-trap fix #2 across Pre-A0, A2, B2
  2: {
    'Pre-A0': {
      id: 'q3-prea0-trap',
      band: 'Pre-A0',
      kind: 'l1-trap',
      badgeAr: 'الأساسيات · Pre-A0',
      badgeEn: 'Basics · Pre-A0',
      promptAr: 'إزاي تعرّف نفسك وتقول "أنا اسمي عمر"؟',
      promptEn: 'How do you introduce yourself naturally?',
      options: [
        { id: 'a', text: 'My name is Omar.', isCorrect: true },
        { id: 'b', text: 'I name Omar.', isCorrect: false },
        { id: 'c', text: 'Name me Omar.', isCorrect: false },
      ],
    },
    A1: {
      id: 'q3-a1-trap',
      band: 'A1',
      kind: 'l1-trap',
      badgeAr: 'فخ الترجمة الحرفية · A1',
      badgeEn: 'L1 Trap Fix · A1',
      promptAr: 'إزاي تقول "عندي 20 سنة" بالإنجليزي؟',
      promptEn: 'Fix the common Arabic-to-English age trap:',
      options: [
        { id: 'a', text: 'I have 20 years.', isCorrect: false },
        { id: 'b', text: 'I am 20 years old.', isCorrect: true },
        { id: 'c', text: 'My age have 20.', isCorrect: false },
      ],
    },
    A2: {
      id: 'q3-a2-trap',
      band: 'A2',
      kind: 'l1-trap',
      badgeAr: 'فخ الترجمة الحرفية · A2',
      badgeEn: 'L1 Trap Fix · A2',
      promptAr: 'إزاي تقول "هتصل بيك بكرة" بدون حرف جر غلط؟',
      promptEn: 'Pick the natural English without an extra Arabic preposition:',
      options: [
        { id: 'a', text: 'I will call to you tomorrow.', isCorrect: false },
        { id: 'b', text: 'I will call you tomorrow.', isCorrect: true },
        { id: 'c', text: 'I will calling with you tomorrow.', isCorrect: false },
      ],
    },
    B1: {
      id: 'q3-b1-trap',
      band: 'B1',
      kind: 'l1-trap',
      badgeAr: 'فخ الترجمة الحرفية · B1',
      badgeEn: 'L1 Trap Fix · B1',
      promptAr: 'إزاي تقول "أنا مهتم بالبرمجة"؟',
      promptEn: 'Choose the right adjective form:',
      options: [
        { id: 'a', text: 'I am interesting in coding.', isCorrect: false },
        { id: 'b', text: 'I am interested in coding.', isCorrect: true },
        { id: 'c', text: 'I interest about coding.', isCorrect: false },
      ],
    },
    B2: {
      id: 'q3-b2-trap',
      band: 'B2',
      kind: 'l1-trap',
      badgeAr: 'فخ الترجمة الحرفية · B2',
      badgeEn: 'L1 Trap Fix · B2',
      promptAr: 'اختار الجملة الاحترافية الصح في الإيميل:',
      promptEn: 'Select the grammatically natural email closing:',
      options: [
        { id: 'a', text: 'I look forward to hear from you.', isCorrect: false },
        { id: 'b', text: 'I look forward to hearing from you.', isCorrect: true },
        { id: 'c', text: 'I am looking forward hear you.', isCorrect: false },
      ],
    },
  },

  // SLOT 3 — Natural sentence/meaning choice across all bands
  3: {
    'Pre-A0': {
      id: 'q4-prea0-nat',
      band: 'Pre-A0',
      kind: 'natural',
      badgeAr: 'معنى طبيعي · Pre-A0',
      badgeEn: 'Everyday Meaning · Pre-A0',
      promptAr: 'حد قالك "Thank you!"، ترد وتقول إيه؟',
      promptEn: 'What is the natural reply to "Thank you!"?',
      options: [
        { id: 'a', text: "You're welcome!", isCorrect: true },
        { id: 'b', text: 'Good night!', isCorrect: false },
        { id: 'c', text: 'Where is it?', isCorrect: false },
      ],
    },
    A1: {
      id: 'q4-a1-nat',
      band: 'A1',
      kind: 'natural',
      badgeAr: 'جملة يومية · A1',
      badgeEn: 'Daily English · A1',
      promptAr: 'إزاي تقول "هي بتشتغل في مستشفى"؟',
      promptEn: 'Choose the correct daily routine sentence:',
      options: [
        { id: 'a', text: 'She work in a hospital.', isCorrect: false },
        { id: 'b', text: 'She works at a hospital.', isCorrect: true },
        { id: 'c', text: 'She is work a hospital.', isCorrect: false },
      ],
    },
    A2: {
      id: 'q4-a2-nat',
      band: 'A2',
      kind: 'natural',
      badgeAr: 'تعبير طبيعي · A2',
      badgeEn: 'Natural Choice · A2',
      promptAr: 'إزاي تقول "لسه مخلص شغلي حالاً"؟',
      promptEn: 'How do you say you finished work a moment ago?',
      options: [
        { id: 'a', text: 'I just finished my work.', isCorrect: true },
        { id: 'b', text: 'I am finish my work now.', isCorrect: false },
        { id: 'c', text: 'I finish my work yesterday.', isCorrect: false },
      ],
    },
    B1: {
      id: 'q4-b1-nat',
      band: 'B1',
      kind: 'natural',
      badgeAr: 'تعبير طبيعي · B1',
      badgeEn: 'Natural Choice · B1',
      promptAr: 'صاحبك متأخر وعايز تقوله "ولا يهمك، خد وقتك":',
      promptEn: 'Pick the most natural reassuring phrase:',
      options: [
        { id: 'a', text: 'No worries, take your time.', isCorrect: true },
        { id: 'b', text: 'No problem, catch your clock.', isCorrect: false },
        { id: 'c', text: 'Do not worry, bring your time.', isCorrect: false },
      ],
    },
    B2: {
      id: 'q4-b2-nat',
      band: 'B2',
      kind: 'natural',
      badgeAr: 'تعبير متقدم · B2',
      badgeEn: 'Natural Choice · B2',
      promptAr: 'إزاي تقول "لو كنت عرفت بدري، كنت ساعدتك"؟',
      promptEn: 'Choose the natural third-conditional sentence:',
      options: [
        { id: 'a', text: 'If I would know earlier, I helped you.', isCorrect: false },
        { id: 'b', text: 'If I had known earlier, I would have helped you.', isCorrect: true },
        { id: 'c', text: 'If I knew earlier, I will help you.', isCorrect: false },
      ],
    },
    C1: {
      id: 'q4-c1-nat',
      band: 'C1',
      kind: 'natural',
      badgeAr: 'دقة متقدمة · C1',
      badgeEn: 'Nuance Check · C1',
      promptAr: 'اختار الجملة الأكثر دقة في سياق اجتماع رسمي:',
      promptEn: 'Choose the most natural executive phrasing:',
      options: [
        { id: 'a', text: 'Despite of the tight deadline, we shipped on time.', isCorrect: false },
        { id: 'b', text: 'Notwithstanding the tight deadline, we delivered ahead of schedule.', isCorrect: true },
        { id: 'c', text: 'Although the tight deadline, we made deliver on time.', isCorrect: false },
      ],
    },
  },

  // SLOT 4 — Final calibration choice across all bands
  4: {
    'Pre-A0': {
      id: 'q5-prea0-cal',
      band: 'Pre-A0',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · Pre-A0',
      badgeEn: 'Final Check · Pre-A0',
      promptAr: 'معنى كلمة "Water" إيه؟',
      promptEn: 'Which sentence asks for water?',
      options: [
        { id: 'a', text: 'ميه / Some water, please.', isCorrect: true },
        { id: 'b', text: 'كتاب / A book, please.', isCorrect: false },
        { id: 'c', text: 'كرسي / A chair, please.', isCorrect: false },
      ],
    },
    A1: {
      id: 'q5-a1-cal',
      band: 'A1',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · A1',
      badgeEn: 'Final Check · A1',
      promptAr: 'إزاي تسأل "فين محطة المترو؟"',
      promptEn: 'How do you ask for the metro station?',
      options: [
        { id: 'a', text: 'Where is the metro station?', isCorrect: true },
        { id: 'b', text: 'What is metro station go?', isCorrect: false },
        { id: 'c', text: 'Who is the metro station?', isCorrect: false },
      ],
    },
    A2: {
      id: 'q5-a2-cal',
      band: 'A2',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · A2',
      badgeEn: 'Final Check · A2',
      promptAr: 'إزاي تقول "متعود أشرب شاي الصبح"؟',
      promptEn: 'Pick the natural way to talk about a habit:',
      options: [
        { id: 'a', text: 'I usually drink tea in the morning.', isCorrect: true },
        { id: 'b', text: 'I am use drink tea at morning.', isCorrect: false },
        { id: 'c', text: 'I drinking tea every mornings.', isCorrect: false },
      ],
    },
    B1: {
      id: 'q5-b1-cal',
      band: 'B1',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · B1',
      badgeEn: 'Final Check · B1',
      promptAr: 'إزاي تقول "الموضوع طلع أسهل مما توقعت"؟',
      promptEn: 'Choose the natural expression for a pleasant surprise:',
      options: [
        { id: 'a', text: 'It turned out to be easier than I expected.', isCorrect: true },
        { id: 'b', text: 'It went out more easy from my thinking.', isCorrect: false },
        { id: 'c', text: 'It appeared easy than I was expect.', isCorrect: false },
      ],
    },
    B2: {
      id: 'q5-b2-cal',
      band: 'B2',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · B2',
      badgeEn: 'Final Check · B2',
      promptAr: 'إزاي تقول "بصراحة، النقطة دي تستاهل نناقشها"؟',
      promptEn: 'Pick the natural idiomatic phrasing:',
      options: [
        { id: 'a', text: 'To be fair, that point is well worth discussing.', isCorrect: true },
        { id: 'b', text: 'To be honest, that point deserves we discuss.', isCorrect: false },
        { id: 'c', text: 'Honestly, that point is worth to discuss it.', isCorrect: false },
      ],
    },
    C1: {
      id: 'q5-c1-cal',
      band: 'C1',
      kind: 'natural',
      badgeAr: 'السؤال الأخير · C1',
      badgeEn: 'Final Check · C1',
      promptAr: 'اختار الصياغة الأكثر طبيعية لإقناع فريقك بتأجيل الإطلاق:',
      promptEn: 'Choose the most persuasive, idiomatic C1 sentence:',
      options: [
        { id: 'a', text: 'Rushing the launch now would do more harm than good in the long run.', isCorrect: true },
        { id: 'b', text: 'Making the launch fast now will do big harm than good in long time.', isCorrect: false },
        { id: 'c', text: 'To hurry launching now makes more damage rather than benefit.', isCorrect: false },
      ],
    },
  },
};

function getQuestionForStep(stepIdx: number, bandIdx: number): AdaptiveQuestion {
  const slot = QUESTION_BANK[stepIdx] || QUESTION_BANK[4];
  const targetBand = BAND_ORDER[Math.max(0, Math.min(BAND_ORDER.length - 1, bandIdx))];
  if (slot[targetBand]) return slot[targetBand]!;
  // Fallback to closest available band in this slot
  for (let delta = 1; delta < BAND_ORDER.length; delta++) {
    const lower = BAND_ORDER[bandIdx - delta];
    if (lower && slot[lower]) return slot[lower]!;
    const upper = BAND_ORDER[bandIdx + delta];
    if (upper && slot[upper]) return slot[upper]!;
  }
  return Object.values(slot)[0]!;
}

export function PlacementTestModal({
  isOpen,
  onClose,
  state: _state,
  onCompletePlacement,
  isArabic = true,
}: PlacementTestModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [bandIdx, setBandIdx] = useState(2); // Start at A2 (index 2)
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [resultBand, setResultBand] = useState<StaircaseBand | null>(null);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStepIdx(0);
    setBandIdx(2);
    setCorrectCount(0);
    setSelectedOptionId(null);
    setResultBand(null);
    setFinalScore(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuestion = getQuestionForStep(stepIdx, bandIdx);

  const handleCompleteBeginnerSkip = () => {
    setResultBand('Pre-A0');
    setFinalScore(0);
  };

  const handleNext = () => {
    if (!selectedOptionId) return;
    const chosen = currentQuestion.options.find((o) => o.id === selectedOptionId);
    const isCorrect = Boolean(chosen?.isCorrect);
    const nextBandIdx = isCorrect
      ? Math.min(BAND_ORDER.length - 1, bandIdx + 1)
      : Math.max(0, bandIdx - 1);
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);

    if (stepIdx < TOTAL_QUESTIONS - 1) {
      setBandIdx(nextBandIdx);
      setCorrectCount(nextCorrect);
      setStepIdx((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      const placedBand = BAND_ORDER[nextBandIdx];
      setCorrectCount(nextCorrect);
      setFinalScore(Math.round((nextCorrect / TOTAL_QUESTIONS) * 100));
      setResultBand(placedBand);
    }
  };

  const handleRestart = () => {
    setStepIdx(0);
    setBandIdx(2);
    setCorrectCount(0);
    setSelectedOptionId(null);
    setResultBand(null);
    setFinalScore(0);
  };

  const handleApplyResult = () => {
    if (!resultBand) return;
    const meta = BAND_META[resultBand];
    try {
      localStorage.setItem('tb.placementDone', 'true');
      localStorage.setItem('tb.placementBand', resultBand);
    } catch {
      // Ignore storage errors
    }
    onCompletePlacement(meta.levelId, meta.phaseId, finalScore);
    onClose();
  };

  const resultMeta = resultBand ? BAND_META[resultBand] : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 pt-safe pb-safe bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'اختبار تحديد المستوى السريع' : '60-Second Adaptive Placement Test'}
    >
      <div
        className="relative w-full max-w-[460px] overflow-hidden rounded-[20px] border shadow-2xl flex flex-col max-h-[88dvh]"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--ink)',
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Clean Single-Row Modal Header */}
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl border shrink-0"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black leading-tight truncate" style={{ color: 'var(--ink)' }}>
                {isArabic ? 'اختبار المستوى الذكي (60 ثانية)' : '60s Adaptive Level Test'}
              </h3>
              <p className="text-[11px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                {resultMeta
                  ? isArabic
                    ? 'تم تحديد مستواك بنجاح'
                    : 'Your level is ready'
                  : isArabic
                  ? `السؤال ${stepIdx + 1} من ${TOTAL_QUESTIONS} · التدرج التكيفي`
                  : `Question ${stepIdx + 1} of ${TOTAL_QUESTIONS} · Adaptive`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border cursor-pointer transition shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--ink-muted)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!resultMeta ? (
          <>
            {/* Segmented Progress Bar */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 shrink-0">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: idx <= stepIdx ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* 1-Tap Complete Beginner Skip Button */}
              <button
                type="button"
                onClick={handleCompleteBeginnerSkip}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink-muted)',
                }}
              >
                <span className="truncate">
                  {isArabic
                    ? '🌱 أنا من تحت الصفر — ابدأ من المستوى 1'
                    : '🌱 Complete Beginner — Start from Level 1'}
                </span>
                <span className="text-[11px] font-black shrink-0" style={{ color: 'var(--accent)' }}>
                  {isArabic ? 'تخطي' : 'Skip'}
                </span>
              </button>

              {/* Prompt Card */}
              <div className="space-y-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {currentQuestion.kind === 'listening' ? <Volume2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isArabic ? currentQuestion.badgeAr : currentQuestion.badgeEn}</span>
                </span>

                <h4 className="text-base font-black leading-snug" style={{ color: 'var(--ink)' }}>
                  {isArabic ? currentQuestion.promptAr : currentQuestion.promptEn}
                </h4>

                {/* Audio Listening Tap (DualSpeedAudio) */}
                {currentQuestion.kind === 'listening' && currentQuestion.audioText && (
                  <div
                    className="p-3 rounded-2xl border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                      {isArabic ? 'اضغط للاستماع (عادي أو بطيء)' : 'Tap to listen (1.0x or 0.75x)'}
                    </span>
                    <DualSpeedAudio
                      text={currentQuestion.audioText}
                      targetLang="en"
                      isArabic={isArabic}
                      showLabels
                    />
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      dir={currentQuestion.kind === 'listening' ? (isArabic ? 'rtl' : 'ltr') : 'ltr'}
                      className="w-full text-start px-4 py-3.5 min-h-[52px] rounded-2xl border text-sm font-bold transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99]"
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'var(--accent-soft)',
                              borderColor: 'var(--accent)',
                              color: 'var(--ink)',
                            }
                          : {
                              backgroundColor: 'var(--bg)',
                              borderColor: 'var(--border)',
                              color: 'var(--ink)',
                            }
                      }
                    >
                      <span className="leading-snug break-words">{opt.text}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Action */}
            <div
              className="px-4 py-3 border-t shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
            >
              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleNext}
                className="w-full min-h-[48px] px-5 py-3 text-sm font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-ink)',
                }}
              >
                <span>
                  {stepIdx === TOTAL_QUESTIONS - 1
                    ? isArabic
                      ? 'اعرف مستواك الآن'
                      : 'See My Level'
                    : isArabic
                    ? 'التالي'
                    : 'Next'}
                </span>
                {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </>
        ) : (
          /* Crisp Motivating Result Screen */
          <div className="p-5 text-center space-y-4 flex-1 flex flex-col justify-center items-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderColor: 'var(--accent)',
              }}
            >
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-black border"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                {isArabic ? resultMeta.labelAr : resultMeta.labelEn}
              </span>

              <h3 className="text-xl font-black leading-snug" style={{ color: 'var(--ink)' }}>
                {isArabic
                  ? `مستواك الحالي: ${resultBand} — المستوى ${resultMeta.mapLevel} من 10`
                  : `Your Level: ${resultBand} — Level ${resultMeta.mapLevel} of 10`}
              </h3>
            </div>

            <p
              className="w-full p-3.5 rounded-2xl border text-xs font-bold leading-relaxed"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink-muted)',
              }}
            >
              {isArabic ? resultMeta.whyAr : resultMeta.whyEn}
            </p>

            <div className="w-full space-y-2 pt-1">
              <button
                type="button"
                onClick={handleApplyResult}
                className="w-full min-h-[48px] py-3 px-4 text-sm font-black rounded-2xl transition cursor-pointer active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-ink)',
                }}
              >
                {isArabic
                  ? `ابدأ الآن من المستوى ${resultMeta.mapLevel}`
                  : `Jump to Level ${resultMeta.mapLevel} Now`}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="w-full min-h-[44px] py-2 px-4 text-xs font-bold rounded-2xl border flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink-muted)',
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إعادة الاختبار' : 'Retake Test'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
