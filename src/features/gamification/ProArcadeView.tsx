import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Crown,
  Flame,
  KeyRound,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  loadGamificationStore,
  recordArcadeResult,
  SteamAchievement,
} from './achievements';
import { ArabicPhraseAssist } from '../../components/ArabicPhraseAssist';
import { useDailyProTimer } from '../../hooks/useDailyProTimer';
import { DailyProExpiredCard, DailyProTimerPill } from '../../components/DailyProTimerPill';

export interface ProArcadeViewProps {
  isPro: boolean;
  isArabic?: boolean;
  onBack: () => void;
  onOpenActivateCode?: () => void;
  onXpEarned?: (xp: number) => void;
}

interface BlitzTrap {
  id: string;
  trap: string;
  arabicOrigin: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  tipAr: string;
  tipEn: string;
}

interface BossQuestion {
  promptAr: string;
  promptEn: string;
  l1TrapHint: string;
  l1TrapHintEn: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanationAr: string;
  explanationEn: string;
}

interface BossDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  levelTag: string;
  icon: string;
  maxHp: number;
  questions: BossQuestion[];
}

const BLITZ_TRAPS: readonly BlitzTrap[] = [
  {
    id: 'agree',
    trap: 'I am agree with you.',
    arabicOrigin: 'أنا موافق معاك',
    options: ['I agree with you.', 'I am agreeing you.', 'I have agree with you.'],
    correctIndex: 0,
    tipAr: 'agree فعل أساسي في الإنجليزي، لا يأخذ am قبله.',
    tipEn: '"Agree" is a main verb — never pair it with "am".',
  },
  {
    id: 'didnt-went',
    trap: "He didn't went to work.",
    arabicOrigin: 'هو ماراحش الشغل',
    options: ["He didn't go to work.", "He wasn't went to work.", "He not went to work."],
    correctIndex: 0,
    tipAr: 'بعد didn\'t يرجع الفعل للمصدر الأساسي (go).',
    tipEn: 'After "didn\'t", always use the base verb ("go").',
  },
  {
    id: 'open-light',
    trap: 'Please open the light.',
    arabicOrigin: 'افتح النور من فضلك',
    options: ['Please turn on the light.', 'Please switch up the light.', 'Please start the light.'],
    correctIndex: 0,
    tipAr: 'مع الكهرباء والنور نستخدم turn on / turn off مش open / close.',
    tipEn: 'For lights & electronics, use "turn on / turn off".',
  },
  {
    id: 'have-years',
    trap: 'I have 22 years old.',
    arabicOrigin: 'عندي 22 سنة',
    options: ['I am 22 years old.', 'I got 22 years old.', 'My age has 22.'],
    correctIndex: 0,
    tipAr: 'العمر في الإنجليزي يستخدم verb to be (I am) مش have.',
    tipEn: 'English expresses age with "be" ("I am 22"), not "have".',
  },
  {
    id: 'she-doctor',
    trap: 'She doctor at the hospital.',
    arabicOrigin: 'هي دكتورة في المستشفى',
    options: ['She is a doctor at the hospital.', 'She is doctor in hospital.', 'She has a doctor at the hospital.'],
    correctIndex: 0,
    tipAr: 'الجملة الاسمية تحتاج الرابط الخفي (is) وأداة النكرة (a) قبل الوظيفة.',
    tipEn: 'Include both the copula ("is") and indefinite article ("a").',
  },
  {
    id: 'married-from',
    trap: 'She is married from an engineer.',
    arabicOrigin: 'هي متجوزة من مهندس',
    options: ['She is married to an engineer.', 'She married with an engineer.', 'She is married by an engineer.'],
    correctIndex: 0,
    tipAr: 'نستخدم married to وليس married from.',
    tipEn: 'Always say "married to", never "married from".',
  },
  {
    id: 'went-to-home',
    trap: 'I went to home early.',
    arabicOrigin: 'روحت البيت بدري',
    options: ['I went home early.', 'I went at home early.', 'I went in home early.'],
    correctIndex: 0,
    tipAr: 'كلمة home مع أفعال الحركة (go / come) لا تأخذ حرف الجر to.',
    tipEn: 'With motion verbs, "home" takes no preposition ("went home").',
  },
  {
    id: 'waiting-you',
    trap: 'I am waiting you outside.',
    arabicOrigin: 'أنا مستنيك بره',
    options: ['I am waiting for you outside.', 'I wait you outside.', 'I am waiting to you outside.'],
    correctIndex: 0,
    tipAr: 'الفعل wait يحتاج حرف الجر for قبل الشخص.',
    tipEn: '"Wait" requires "for" before a person ("waiting for you").',
  },
  {
    id: 'told-to-me',
    trap: 'He told to me the truth.',
    arabicOrigin: 'هو قال لي الحقيقة',
    options: ['He told me the truth.', 'He said me the truth.', 'He told for me the truth.'],
    correctIndex: 0,
    tipAr: 'told يأخذ المفعول مباشرة بدون to (told me).',
    tipEn: '"Tell" takes a direct object without "to" ("told me").',
  },
  {
    id: 'news-are',
    trap: 'The news are very exciting.',
    arabicOrigin: 'الأخبار حلوة جداً',
    options: ['The news is very exciting.', 'The news were very exciting.', 'A news is very exciting.'],
    correctIndex: 0,
    tipAr: 'كلمة news غير معدودة وتعامل كمفرد (is).',
    tipEn: '"News" is uncountable and always singular ("is").',
  },
  {
    id: 'more-tall',
    trap: 'Ahmed is more tall than Ali.',
    arabicOrigin: 'أحمد أطول من علي',
    options: ['Ahmed is taller than Ali.', 'Ahmed is more taller than Ali.', 'Ahmed is tallest than Ali.'],
    correctIndex: 0,
    tipAr: 'الصفة القصيرة (tall) نضيف لها -er مباشرة (taller).',
    tipEn: 'Short adjectives take "-er" ("taller"), not "more".',
  },
  {
    id: 'am-live',
    trap: 'I am live in Alexandria.',
    arabicOrigin: 'أنا عايش في إسكندرية',
    options: ['I live in Alexandria.', 'I living in Alexandria.', 'I am lives in Alexandria.'],
    correctIndex: 0,
    tipAr: 'للحقائق الثابتة نستخدم المضارع البسيط (I live) بدون am.',
    tipEn: 'For permanent states, use simple present ("I live") without "am".',
  },
  {
    id: 'close-fan',
    trap: 'Could you close the fan?',
    arabicOrigin: 'ممكن تقفل المروحة؟',
    options: ['Could you turn off the fan?', 'Could you lock the fan?', 'Could you shut the fan?'],
    correctIndex: 0,
    tipAr: 'الأجهزة الكهربائية تُغلق بـ turn off مش close.',
    tipEn: 'Use "turn off" for fans, ACs, and appliances.',
  },
  {
    id: 'didnt-saw',
    trap: "I didn't saw him yesterday.",
    arabicOrigin: 'أنا ماشفتوش امبارح',
    options: ["I didn't see him yesterday.", "I wasn't see him yesterday.", "I haven't saw him yesterday."],
    correctIndex: 0,
    tipAr: 'بعد didn\'t نستخدم المصدر see وليس saw.',
    tipEn: 'Always revert to base form ("see") after "didn\'t".',
  },
  {
    id: 'brother-have',
    trap: 'My brother have a new job.',
    arabicOrigin: 'أخويا عنده شغل جديد',
    options: ['My brother has a new job.', 'My brother is have a new job.', 'My brother having a new job.'],
    correctIndex: 0,
    tipAr: 'مع he / she / it نستخدم has مش have.',
    tipEn: 'Third-person singular takes "has", not "have".',
  },
];

const LEVEL_BOSSES: readonly BossDefinition[] = [
  {
    id: 'boss-copula-guardian',
    nameAr: 'حارس الرابط الخفي',
    nameEn: 'The Copula Guardian',
    titleAr: 'زعيم المستوى A1 — فخ الجملة الاسمية',
    titleEn: 'A1 Boss — Nominal Sentence Trap',
    levelTag: 'A1',
    icon: '🗿',
    maxHp: 100,
    questions: [
      {
        promptAr: 'ترجم بالتفكير الإنجليزي: "الجو حر جداً النهاردة في إسكندرية."',
        promptEn: 'Think in English: "The weather is very hot today in Alexandria."',
        l1TrapHint: 'تجنب: The weather very hot today',
        l1TrapHintEn: 'Avoid: The weather very hot today',
        options: [
          'The weather is very hot today in Alexandria.',
          'The weather very hot today in Alexandria.',
          'Weather has very hot today in Alexandria.',
        ],
        correctIndex: 0,
        explanationAr: 'الرابط الخفي (is) إجباري بين الفاعل والصفة.',
        explanationEn: 'English requires the copula "is" before adjectives.',
      },
      {
        promptAr: 'ترجم: "أختي مهندسة ذكية."',
        promptEn: 'Translate: "My sister is a smart engineer."',
        l1TrapHint: 'تجنب نسيان is أو أداة النكرة a',
        l1TrapHintEn: 'Avoid dropping "is" or the article "a"',
        options: [
          'My sister is a smart engineer.',
          'My sister smart engineer.',
          'My sister is smart engineer.',
        ],
        correctIndex: 0,
        explanationAr: 'نحتاج الرابط (is) + أداة النكرة (a) قبل الصفة والاسم المفرد.',
        explanationEn: 'Singular countable professions need both "is" and "a".',
      },
      {
        promptAr: 'ترجم: "إحنا جاهزين للاجتماع."',
        promptEn: 'Translate: "We are ready for the meeting."',
        l1TrapHint: 'تجنب: We ready for the meeting',
        l1TrapHintEn: 'Avoid: We ready for the meeting',
        options: [
          'We are ready for the meeting.',
          'We ready to the meeting.',
          'We have ready for the meeting.',
        ],
        correctIndex: 0,
        explanationAr: 'مع الجمع نستخدم are قبل الصفة ready.',
        explanationEn: 'Use "are" with "we" before the adjective "ready".',
      },
      {
        promptAr: 'ترجم: "هو مش مشغول دلوقتي."',
        promptEn: 'Translate: "He is not busy right now."',
        l1TrapHint: 'تجنب: He no busy now',
        l1TrapHintEn: 'Avoid: He no busy now',
        options: [
          'He is not busy right now.',
          'He no busy right now.',
          "He doesn't busy right now.",
        ],
        correctIndex: 0,
        explanationAr: 'نفي الصفة يكون بـ is not وليس doesn\'t أو no.',
        explanationEn: 'Negate adjectives with "is not", not "doesn\'t".',
      },
      {
        promptAr: 'ترجم: "أنا موافق على الخطة."',
        promptEn: 'Translate: "I agree with the plan."',
        l1TrapHint: 'تجنب: I am agree',
        l1TrapHintEn: 'Avoid: I am agree',
        options: [
          'I agree with the plan.',
          'I am agree with the plan.',
          'I am agree on the plan.',
        ],
        correctIndex: 0,
        explanationAr: 'agree فعل، فلا نضع am قبله!',
        explanationEn: '"Agree" is a verb, so never put "am" before it.',
      },
    ],
  },
  {
    id: 'boss-tense-phantom',
    nameAr: 'شبح الأزمنة المكسورة',
    nameEn: 'The Tense Phantom',
    titleAr: 'زعيم المستوى A2 — فخ الماضي والمضارع',
    titleEn: 'A2 Boss — Past & Present Interference',
    levelTag: 'A2',
    icon: '👻',
    maxHp: 120,
    questions: [
      {
        promptAr: 'ترجم: "هي ما سافرتش القاهرة الأسبوع اللي فات."',
        promptEn: 'Translate: "She did not travel to Cairo last week."',
        l1TrapHint: "تجنب: She didn't traveled",
        l1TrapHintEn: "Avoid: She didn't traveled",
        options: [
          "She didn't travel to Cairo last week.",
          "She didn't traveled to Cairo last week.",
          "She wasn't travel to Cairo last week.",
        ],
        correctIndex: 0,
        explanationAr: 'didn\'t تحمل زمن الماضي، فيرجع الفعل travel للمصدر.',
        explanationEn: '"Didn\'t" carries past tense, so "travel" stays base form.',
      },
      {
        promptAr: 'ترجم: "أنا شغال هنا بقالي 3 سنين."',
        promptEn: 'Translate: "I have worked here for 3 years."',
        l1TrapHint: 'تجنب: I am working here since 3 years',
        l1TrapHintEn: 'Avoid: I am working here since 3 years',
        options: [
          'I have worked here for 3 years.',
          'I work here since 3 years.',
          'I am work here for 3 years.',
        ],
        correctIndex: 0,
        explanationAr: 'للحدث الذي بدأ في الماضي ومازال مستمراً نستخدم Present Perfect مع for للمدة.',
        explanationEn: 'Use Present Perfect + "for" for durations up to now.',
      },
      {
        promptAr: 'ترجم: "هل شفت الإيميل بتاعي؟"',
        promptEn: 'Translate: "Did you see my email?"',
        l1TrapHint: 'تجنب: Did you saw my email?',
        l1TrapHintEn: 'Avoid: Did you saw my email?',
        options: [
          'Did you see my email?',
          'Did you saw my email?',
          'Are you see my email?',
        ],
        correctIndex: 0,
        explanationAr: 'في السؤال بـ Did نستخدم المصدر see.',
        explanationEn: 'Questions with "Did" always take the base verb "see".',
      },
      {
        promptAr: 'ترجم: "كان بياكل لما التليفون رن."',
        promptEn: 'Translate: "He was eating when the phone rang."',
        l1TrapHint: 'تجنب: He eating when phone ring',
        l1TrapHintEn: 'Avoid: He eating when phone ring',
        options: [
          'He was eating when the phone rang.',
          'He was eat when the phone ringed.',
          'He ate when the phone was ringing.',
        ],
        correctIndex: 0,
        explanationAr: 'الحدث المستمر في الماضي (was eating) يقطعه ماضي بسيط (rang).',
        explanationEn: 'Past continuous ("was eating") interrupted by past simple ("rang").',
      },
      {
        promptAr: 'ترجم: "عمر ما رحتش لندن قبل كده."',
        promptEn: 'Translate: "I have never been to London before."',
        l1TrapHint: 'تجنب: I never went to London before',
        l1TrapHintEn: 'Avoid: I never went to London before',
        options: [
          'I have never been to London before.',
          'I am never been to London before.',
          'I never been to London before.',
        ],
        correctIndex: 0,
        explanationAr: 'الخبرات الحياتية تستخدم have/has + never + التصريف الثالث (been).',
        explanationEn: 'Life experiences use "have never + past participle".',
      },
    ],
  },
  {
    id: 'boss-syntax-dragon',
    nameAr: 'تنين تراكيب إسكندرية',
    nameEn: 'Alexandria Syntax Dragon',
    titleAr: 'زعيم المستوى B1 — حروف الجر والإنترفيو',
    titleEn: 'B1 Boss — Prepositions & Workplace Syntax',
    levelTag: 'B1',
    icon: '🐉',
    maxHp: 140,
    questions: [
      {
        promptAr: 'صياغة احترافية: "محتاجين نناقش المشكلة دي."',
        promptEn: 'Workplace phrasing: "We need to discuss this issue."',
        l1TrapHint: 'تجنب: discuss about this issue',
        l1TrapHintEn: 'Avoid: discuss about this issue',
        options: [
          'We need to discuss this issue.',
          'We need to discuss about this issue.',
          'We need discussing about this issue.',
        ],
        correctIndex: 0,
        explanationAr: 'الفعل discuss لا يأخذ about بعده أبداً!',
        explanationEn: '"Discuss" takes a direct object — never "discuss about".',
      },
      {
        promptAr: 'صياغة احترافية: "أنا مهتم جداً بالوظيفة دي."',
        promptEn: 'Interview phrasing: "I am very interested in this role."',
        l1TrapHint: 'تجنب: I am interesting in',
        l1TrapHintEn: 'Avoid: I am interesting in',
        options: [
          'I am very interested in this role.',
          'I am very interesting in this role.',
          'I have very interested by this role.',
        ],
        correctIndex: 0,
        explanationAr: 'المشاعر البشرية تأخذ -ed (interested) مع حرف الجر in.',
        explanationEn: 'Human feelings take "-ed" ("interested in"), not "-ing".',
      },
      {
        promptAr: 'صياغة احترافية: "ده بيعتمد على الميزانية."',
        promptEn: 'Workplace phrasing: "It depends on the budget."',
        l1TrapHint: 'تجنب: It depend of the budget',
        l1TrapHintEn: 'Avoid: It depend of the budget',
        options: [
          'It depends on the budget.',
          'It is depend on the budget.',
          'It depends of the budget.',
        ],
        correctIndex: 0,
        explanationAr: 'depend فعل يأخذ -s مع it وحرف الجر on.',
        explanationEn: 'Always say "It depends on", with third-person "-s".',
      },
      {
        promptAr: 'صياغة احترافية: "ممكن تشرح لي الخطوة دي؟"',
        promptEn: 'Workplace phrasing: "Could you explain this step to me?"',
        l1TrapHint: 'تجنب: explain me this step',
        l1TrapHintEn: 'Avoid: explain me this step',
        options: [
          'Could you explain this step to me?',
          'Could you explain me this step?',
          'Could you explain for me this step?',
        ],
        correctIndex: 0,
        explanationAr: 'الفعل explain يأخذ الشيء أولاً ثم to me.',
        explanationEn: 'Use "explain [something] to [someone]", never "explain me".',
      },
      {
        promptAr: 'صياغة احترافية: "أنا متطلع للشغل معاكم."',
        promptEn: 'Interview closing: "I look forward to working with you."',
        l1TrapHint: 'تجنب: look forward to work',
        l1TrapHintEn: 'Avoid: look forward to work',
        options: [
          'I look forward to working with you.',
          'I look forward to work with you.',
          'I am looking forward work with you.',
        ],
        correctIndex: 0,
        explanationAr: 'بعد look forward to يأتي الفعل مضافاً له -ing دائماً.',
        explanationEn: '"Look forward to" is followed by a gerund ("working").',
      },
    ],
  },
];

type ArcadeScreen = 'lobby' | 'blitz' | 'boss-select' | 'boss-duel';

export function ProArcadeView({
  isPro,
  isArabic = true,
  onBack,
  onOpenActivateCode,
  onXpEarned,
}: ProArcadeViewProps) {
  const [screen, setScreen] = useState<ArcadeScreen>('lobby');
  const [store, setStore] = useState(() => loadGamificationStore());

  // --- Mode A: 60s L1 Trap Blitz state ---
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzShields, setBlitzShields] = useState(3);
  const [blitzStreak, setBlitzStreak] = useState(0);
  const [blitzMaxStreak, setBlitzMaxStreak] = useState(0);
  const [blitzMaxCombo, setBlitzMaxCombo] = useState(1);
  const [blitzIndex, setBlitzIndex] = useState(0);
  const [blitzFeedback, setBlitzFeedback] = useState<{ ok: boolean; tip: string } | null>(null);
  const [blitzFinished, setBlitzFinished] = useState(false);
  const [blitzUnlocked, setBlitzUnlocked] = useState<SteamAchievement[]>([]);

  // --- Mode B: Boss Duel state ---
  const [activeBoss, setActiveBoss] = useState<BossDefinition>(LEVEL_BOSSES[0]);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossQIndex, setBossQIndex] = useState(0);
  const [bossFeedback, setBossFeedback] = useState<{
    ok: boolean;
    crit: boolean;
    text: string;
  } | null>(null);
  const [bossOutcome, setBossOutcome] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [bossUnlocked, setBossUnlocked] = useState<SteamAchievement[]>([]);
  const questionStartRef = useRef<number>(Date.now());

  const { remainingSeconds, formattedRemaining, hasProAccess, showPill } = useDailyProTimer({
    isPro,
    active: true,
  });

  const canPlayRound = hasProAccess;
  const currentCombo = Math.min(5, 1 + Math.floor(blitzStreak / 2));

  // Blitz 1-second timer
  useEffect(() => {
    if (screen !== 'blitz' || blitzFinished) return;
    const interval = window.setInterval(() => {
      setBlitzTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [screen, blitzFinished]);

  // Finish blitz when time hits 0
  useEffect(() => {
    if (screen === 'blitz' && !blitzFinished && blitzTimeLeft === 0) {
      finalizeBlitz(blitzScore, blitzMaxCombo, blitzMaxStreak);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blitzTimeLeft, screen, blitzFinished]);

  const finalizeBlitz = (finalScore: number, maxCombo: number, maxStreak: number) => {
    setBlitzFinished(true);
    const xpEarned = Math.max(40, Math.round(finalScore / 5));
    const res = recordArcadeResult(
      {
        mode: 'blitz',
        score: finalScore,
        maxCombo,
        correctStreak: maxStreak,
        xpEarned,
        markTeaserUsed: !isPro,
      },
      { isPro }
    );
    setStore(res.store);
    setBlitzUnlocked(res.unlocked);
    onXpEarned?.(xpEarned);
    if (finalScore >= 500) {
      try {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti errors
      }
    }
  };

  const startBlitz = () => {
    if (!canPlayRound) return;
    setBlitzTimeLeft(60);
    setBlitzScore(0);
    setBlitzShields(3);
    setBlitzStreak(0);
    setBlitzMaxStreak(0);
    setBlitzMaxCombo(1);
    setBlitzIndex(0);
    setBlitzFeedback(null);
    setBlitzFinished(false);
    setBlitzUnlocked([]);
    setScreen('blitz');
  };

  const handleBlitzAnswer = (optionIdx: number) => {
    if (blitzFinished) return;
    const trap = BLITZ_TRAPS[blitzIndex % BLITZ_TRAPS.length];
    const isCorrect = optionIdx === trap.correctIndex;

    if (isCorrect) {
      const nextStreak = blitzStreak + 1;
      const nextCombo = Math.min(5, 1 + Math.floor(nextStreak / 2));
      const gained = 100 * nextCombo;
      const nextScore = blitzScore + gained;
      const nextMaxStreak = Math.max(blitzMaxStreak, nextStreak);
      const nextMaxCombo = Math.max(blitzMaxCombo, nextCombo);

      setBlitzStreak(nextStreak);
      setBlitzMaxStreak(nextMaxStreak);
      setBlitzMaxCombo(nextMaxCombo);
      setBlitzScore(nextScore);
      setBlitzFeedback({
        ok: true,
        tip: isArabic ? `🎯 +${gained} نقطة (كومبو x${nextCombo})!` : `🎯 +${gained} pts (x${nextCombo} Combo)!`,
      });
      setBlitzIndex((prev) => prev + 1);
    } else {
      const nextShields = blitzShields - 1;
      setBlitzShields(nextShields);
      setBlitzStreak(0);
      setBlitzFeedback({
        ok: false,
        tip: isArabic ? trap.tipAr : trap.tipEn,
      });
      if (nextShields <= 0) {
        finalizeBlitz(blitzScore, blitzMaxCombo, blitzMaxStreak);
      } else {
        setBlitzIndex((prev) => prev + 1);
      }
    }
  };

  const startBossDuel = (boss: BossDefinition) => {
    if (!canPlayRound) return;
    setActiveBoss(boss);
    setBossHp(boss.maxHp);
    setPlayerHp(100);
    setBossQIndex(0);
    setBossFeedback(null);
    setBossOutcome('playing');
    setBossUnlocked([]);
    questionStartRef.current = Date.now();
    setScreen('boss-duel');
  };

  const handleBossAnswer = (optionIdx: number) => {
    if (bossOutcome !== 'playing') return;
    const q = activeBoss.questions[bossQIndex % activeBoss.questions.length];
    const isCorrect = optionIdx === q.correctIndex;
    const elapsedMs = Date.now() - questionStartRef.current;
    const isCrit = isCorrect && elapsedMs <= 5000;

    if (isCorrect) {
      const baseDmg = Math.ceil(activeBoss.maxHp / 4);
      const dmg = isCrit ? Math.round(baseDmg * 1.45) : baseDmg;
      const nextBossHp = Math.max(0, bossHp - dmg);
      setBossHp(nextBossHp);
      setBossFeedback({
        ok: true,
        crit: isCrit,
        text: isCrit
          ? isArabic
            ? `💥 ضربة سريعة قوية! (-${dmg} من طاقة الزعيم)`
            : `💥 CRITICAL HIT! (-${dmg} Boss HP)`
          : isArabic
          ? `⚔️ ضربة دقيقة! (-${dmg} من طاقة الزعيم)`
          : `⚔️ Solid strike! (-${dmg} Boss HP)`,
      });

      if (nextBossHp <= 0) {
        setBossOutcome('victory');
        const flawless = playerHp === 100;
        const xpEarned = flawless ? 260 : 180;
        const res = recordArcadeResult(
          {
            mode: 'boss',
            bossId: activeBoss.id,
            bossDefeated: true,
            flawless,
            xpEarned,
            markTeaserUsed: !isPro,
          },
          { isPro }
        );
        setStore(res.store);
        setBossUnlocked(res.unlocked);
        onXpEarned?.(xpEarned);
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        } catch {
          // Ignore
        }
        return;
      }
    } else {
      const nextPlayerHp = Math.max(0, playerHp - 34);
      setPlayerHp(nextPlayerHp);
      setBossFeedback({
        ok: false,
        crit: false,
        text: isArabic
          ? `🛡️ فخ ترجمة حرفية! (-34 طاقة) — ${q.explanationAr}`
          : `🛡️ L1 Trap hit! (-34 HP) — ${q.explanationEn}`,
      });

      if (nextPlayerHp <= 0) {
        setBossOutcome('defeat');
        const res = recordArcadeResult(
          {
            mode: 'boss',
            bossId: activeBoss.id,
            bossDefeated: false,
            xpEarned: 35,
            markTeaserUsed: !isPro,
          },
          { isPro }
        );
        setStore(res.store);
        onXpEarned?.(35);
        return;
      }
    }

    setBossQIndex((prev) => prev + 1);
    questionStartRef.current = Date.now();
  };

  return (
    <div
      className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip pb-safe"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Top Bar */}
      <header
        className="tb-hud-bar sticky top-0 z-40 border-b px-3 sm:px-6 pb-3 pt-safe"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (screen !== 'lobby') setScreen('lobby');
              else onBack();
            }}
            className="px-3.5 py-2 min-h-[48px] rounded-2xl border font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{screen !== 'lobby' ? (isArabic ? 'الأركيد' : 'Arcade') : isArabic ? 'العودة' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Crown className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
            <h2 className="text-sm sm:text-base font-black leading-snug break-words" style={{ color: 'var(--ink)' }}>
              {isArabic ? 'أركيد Pro — قناص الأخطاء والزعماء' : 'Pro Arcade — Blitz & Boss Duels'}
            </h2>
          </div>

          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0"
            style={
              isPro
                ? { backgroundColor: 'var(--accent-soft)', color: 'var(--gold)', borderColor: 'var(--gold)' }
                : canPlayRound
                ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }
                : { backgroundColor: 'var(--bg)', color: 'var(--ink-muted)', borderColor: 'var(--border)' }
            }
          >
            {isPro
              ? isArabic
                ? 'Pro غير محدود'
                : 'Pro Unlimited'
              : canPlayRound
              ? `⏱ ${formattedRemaining} ${isArabic ? 'مجاني' : 'Free'}`
              : isArabic
              ? 'انتهى وقت اليوم'
              : 'Daily Pass Used'}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Warm Daily Expiry Card (at 00:00) */}
        {!canPlayRound && screen === 'lobby' && (
          <DailyProExpiredCard
            isArabic={isArabic}
            onOpenActivateCode={onOpenActivateCode}
            onBackToLessons={onBack}
          />
        )}

        {/* LOBBY */}
        {screen === 'lobby' && (
          <div className="space-y-4">
            {/* Score Strip */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'أعلى قناص أخطاء' : 'Blitz Best'}</span>
                <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>{store.blitzBestScore}</span>
              </div>
              <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'أعلى سلسلة' : 'Max Combo'}</span>
                <span className="text-lg font-black" style={{ color: 'var(--gold)' }}>x{store.blitzMaxCombo}</span>
              </div>
              <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'زعماء مهزومون' : 'Bosses Slain'}</span>
                <span className="text-lg font-black" style={{ color: 'var(--ink)' }}>{store.bossesDefeated.length} / 3</span>
              </div>
            </div>

            {/* Mode A Card */}
            <div
              className="tb-card-surface p-5 rounded-3xl border space-y-4 text-start shadow-xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'التحدي الأول · 60 ثانية' : 'Mode A · 60 Seconds'}</span>
                </span>
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
                  {isArabic ? 'قناص الأخطاء (تحدي 60 ثانية)' : '60-Second L1 Trap Blitz'}
                </h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic
                    ? 'اصطد أفخاخ الترجمة الحرفية المصرية (مثل I am agree و Open the light) قبل ما الوقت يخلص! ضاعف نقاطك ومعاك 3 دروع 🛡️.'
                    : 'Snipe real Egyptian-English traps ("I am agree", "He didn\'t went", "Open the light") against a 60s clock. Build x2 → x5 combos with 3 shields 🛡️.'}
                </p>
              </div>
              <button
                type="button"
                disabled={!canPlayRound}
                onClick={startBlitz}
                className="w-full min-h-[48px] py-3 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 disabled:opacity-45 cursor-pointer transition"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {canPlayRound
                    ? isArabic
                      ? 'ابدأ تحدي قناص الأخطاء (60ث) ⚡'
                      : 'Start 60s L1 Trap Blitz ⚡'
                    : isArabic
                    ? 'افتح بباقة Pro للعب بلا حدود'
                    : 'Unlock with Pro to Play'}
                </span>
              </button>
            </div>

            {/* Mode B Card */}
            <div
              className="tb-card-surface p-5 rounded-3xl border space-y-4 text-start shadow-xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)' }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'التحدي الثاني · معركة الزعماء' : 'Mode B · RPG Turn Duel'}</span>
                </span>
                <span className="text-2xl">🐉</span>
              </div>
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
                  {isArabic ? 'معركة الزعيم' : 'Level Boss Duel'}
                </h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic
                    ? 'واجه زعماء المستويات (A1 / A2 / B1) في تحدي مباشر! الإجابة السريعة توجه ضربة مضاعفة وهزيمة الزعيم تفتح كأس الزعيم.'
                    : 'Battle A1/A2/B1 Level Bosses with animated HP bars. Fast answers land CRIT! strikes; defeating a boss unlocks a Boss Trophy.'}
                </p>
              </div>
              <button
                type="button"
                disabled={!canPlayRound}
                onClick={() => setScreen('boss-select')}
                className="w-full min-h-[48px] py-3 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 disabled:opacity-45 cursor-pointer transition"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
              >
                <Swords className="w-4 h-4" />
                <span>
                  {canPlayRound
                    ? isArabic
                      ? 'اختر الزعيم وابدأ المعركة ⚔️'
                      : 'Choose Your Boss & Duel ⚔️'
                    : isArabic
                    ? 'افتح بباقة Pro للعب بلا حدود'
                    : 'Unlock with Pro to Play'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* MODE A: 60s L1 TRAP BLITZ */}
        {screen === 'blitz' && (
          <div className="space-y-4">
            {/* HUD */}
            <div className="grid grid-cols-2 min-[380px]:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'الوقت' : 'Time'}</span>
                <span
                  className={`text-lg font-black font-mono ${blitzTimeLeft <= 10 ? 'text-rose-500 animate-pulse' : ''}`}
                  style={blitzTimeLeft > 10 ? { color: 'var(--accent)' } : undefined}
                >
                  {blitzTimeLeft}s
                </span>
              </div>
              <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'النقاط' : 'Score'}</span>
                <span className="text-lg font-black" style={{ color: 'var(--gold)' }}>{blitzScore}</span>
              </div>
              <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'المضاعف' : 'Combo'}</span>
                <span className="text-lg font-black inline-flex items-center gap-0.5" style={{ color: 'var(--accent)' }}>
                  <Flame className="w-4 h-4" />x{currentCombo}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'الدروع' : 'Shields'}</span>
                <span className="text-base font-black" style={{ color: 'var(--ink)' }}>
                  {'🛡️'.repeat(Math.max(0, blitzShields)) || '💔'}
                </span>
              </div>
            </div>

            {!blitzFinished ? (
              (() => {
                const trap = BLITZ_TRAPS[blitzIndex % BLITZ_TRAPS.length];
                return (
                  <div
                    className="tb-card-surface p-5 rounded-3xl border-2 space-y-4 shadow-xl"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}
                  >
                    <div className="space-y-1 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-500 border border-rose-500/40">
                        {isArabic ? '⚠️ فخ ترجمة حرفية' : '⚠️ Egyptian-English L1 Trap'}
                      </span>
                      <p dir="ltr" className="text-xl sm:text-2xl font-black text-rose-500 line-through decoration-rose-500/80 pt-2 break-words">
                        {trap.trap}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold" style={{ color: 'var(--gold)' }}>
                        <span>
                          {isArabic ? `الأصل المصري: "${trap.arabicOrigin}"` : `Arabic origin: "${trap.arabicOrigin}"`}
                        </span>
                        {!isArabic && <ArabicPhraseAssist phrase={trap.arabicOrigin} compact />}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {trap.options.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          dir="ltr"
                          onClick={() => handleBlitzAnswer(idx)}
                          className="w-full min-h-[52px] px-4 py-3 rounded-2xl border font-bold text-sm text-left transition active:scale-[0.98] cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--ink)',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {blitzFeedback && (
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold border ${
                          blitzFeedback.ok
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                        }`}
                      >
                        {blitzFeedback.tip}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div
                className="tb-card-surface p-6 rounded-3xl border-2 text-center space-y-4 shadow-xl"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)' }}
              >
                <div className="text-4xl">🏆</div>
                <h3 className="text-xl font-black" style={{ color: 'var(--ink)' }}>
                  {isArabic ? 'انتهت جولة قناص الأخطاء!' : 'L1 Trap Blitz Complete!'}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'النتيجة' : 'Score'}</span>
                    <span className="text-lg font-black" style={{ color: 'var(--gold)' }}>{blitzScore}</span>
                  </div>
                  <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'أعلى مضاعف' : 'Max Combo'}</span>
                    <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>x{blitzMaxCombo}</span>
                  </div>
                  <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'خبرة XP' : 'XP Earned'}</span>
                    <span className="text-lg font-black" style={{ color: 'var(--ink)' }}>+{Math.max(40, Math.round(blitzScore / 5))}</span>
                  </div>
                </div>

                {blitzUnlocked.length > 0 && (
                  <div
                    className="p-3 rounded-2xl border text-xs font-bold"
                    style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--gold)', color: 'var(--ink)' }}
                  >
                    <Trophy className="w-4 h-4 inline me-1" />
                    {isArabic ? 'إنجازات مفتوحة: ' : 'Unlocked: '}
                    {blitzUnlocked.map((a) => (isArabic ? a.titleAr : a.titleEn)).join(' · ')}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {canPlayRound ? (
                    <button
                      type="button"
                      onClick={startBlitz}
                      className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{isArabic ? 'العب مرة أخرى' : 'Play Again'}</span>
                    </button>
                  ) : (
                    onOpenActivateCode && (
                      <button
                        type="button"
                        onClick={onOpenActivateCode}
                        className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                        style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{isArabic ? 'تفعيل النسخة الكاملة (50 ج/شهر)' : 'Unlock Unlimited Pro (50 EGP/mo)'}</span>
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setScreen('lobby')}
                    className="min-h-[48px] px-4 py-3 rounded-2xl border font-bold text-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    {isArabic ? 'الأركيد' : 'Lobby'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE B: BOSS SELECT */}
        {screen === 'boss-select' && (
          <div className="space-y-3">
            <h3 className="text-base font-black text-start" style={{ color: 'var(--ink)' }}>
              {isArabic ? 'اختر الزعيم للمبارزة ⚔️' : 'Select a Level Boss to Duel ⚔️'}
            </h3>
            {LEVEL_BOSSES.map((boss) => {
              const defeated = store.bossesDefeated.includes(boss.id);
              return (
                <button
                  key={boss.id}
                  type="button"
                  onClick={() => startBossDuel(boss)}
                  className="tb-card-surface w-full min-h-[64px] p-4 rounded-3xl border text-start flex items-center justify-between gap-3 transition cursor-pointer shadow-lg"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl shrink-0">{boss.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-black border"
                          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                        >
                          {boss.levelTag} · {boss.maxHp} {isArabic ? 'طاقة' : 'HP'}
                        </span>
                        {defeated && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/40">
                            {isArabic ? '🏆 مهزوم' : '🏆 Defeated'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm mt-1 break-words" style={{ color: 'var(--ink)' }}>
                        {isArabic ? boss.nameAr : boss.nameEn}
                      </h4>
                      <p className="text-xs break-words" style={{ color: 'var(--ink-muted)' }}>
                        {isArabic ? boss.titleAr : boss.titleEn}
                      </p>
                    </div>
                  </div>
                  <Swords className="w-5 h-5 shrink-0" style={{ color: 'var(--gold)' }} />
                </button>
              );
            })}
          </div>
        )}

        {/* MODE B: BOSS DUEL ARENA */}
        {screen === 'boss-duel' && (
          <div className="space-y-4">
            {/* Animated HP Bars */}
            <div
              className="tb-card-surface p-4 rounded-3xl border space-y-3 shadow-xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Boss HP */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs font-black">
                  <span className="text-rose-500 flex items-center gap-1.5 min-w-0">
                    <span>{activeBoss.icon}</span>
                    <span className="break-words">{isArabic ? activeBoss.nameAr : activeBoss.nameEn}</span>
                  </span>
                  <span className="font-mono text-rose-500 shrink-0">
                    {bossHp} / {activeBoss.maxHp}
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-full border overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.round((bossHp / activeBoss.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Player HP */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs font-black">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span>{isArabic ? 'درعك (أنت)' : 'Your Shield (You)'}</span>
                  </span>
                  <span className="font-mono shrink-0" style={{ color: 'var(--accent)' }}>{playerHp} / 100</span>
                </div>
                <div className="w-full h-3 rounded-full border overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${playerHp}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            </div>

            {bossOutcome === 'playing' ? (
              (() => {
                const q = activeBoss.questions[bossQIndex % activeBoss.questions.length];
                return (
                  <div
                    className="tb-card-surface p-5 rounded-3xl border-2 space-y-4 shadow-xl text-start"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}
                  >
                    <div className="space-y-1">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border"
                        style={{ backgroundColor: 'var(--bg)', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                      >
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>{isArabic ? 'جاوب في أقل من 5 ثواني لضربة مضاعفة 💥' : 'Answer under 5s for CRIT! 💥'}</span>
                      </span>
                      <h4 className="text-base sm:text-lg font-black pt-1 leading-snug" style={{ color: 'var(--ink)' }}>
                        {isArabic ? q.promptAr : q.promptEn}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {isArabic ? q.l1TrapHint : q.l1TrapHintEn}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {q.options.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          dir="ltr"
                          onClick={() => handleBossAnswer(idx)}
                          className="w-full min-h-[52px] px-4 py-3 rounded-2xl border font-bold text-sm text-left transition active:scale-[0.98] cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--ink)',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {bossFeedback && (
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold border ${
                          bossFeedback.ok
                            ? bossFeedback.crit
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-500'
                              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                        }`}
                      >
                        {bossFeedback.text}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div
                className="tb-card-surface p-6 rounded-3xl border-2 text-center space-y-4 shadow-xl"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)' }}
              >
                <div className="text-5xl">{bossOutcome === 'victory' ? '🏆' : '🛡️'}</div>
                <h3 className="text-xl font-black" style={{ color: 'var(--ink)' }}>
                  {bossOutcome === 'victory'
                    ? isArabic
                      ? `انتصار ساحق! هزمت ${activeBoss.nameAr}!`
                      : `Victory! You defeated ${activeBoss.nameEn}!`
                    : isArabic
                    ? 'انكسر درعك! جرّب تاني أقوى.'
                    : 'Your shield broke! Regroup and strike back.'}
                </h3>
                <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                  {bossOutcome === 'victory'
                    ? isArabic
                      ? `+${playerHp === 100 ? 260 : 180} XP · تم تسجيل كأس الزعيم في خزانة الجوائز!`
                      : `+${playerHp === 100 ? 260 : 180} XP · Boss Trophy added to your Trophy Cabinet!`
                    : isArabic
                    ? '+35 XP خبرة تدريب.'
                    : '+35 XP training bonus.'}
                </p>

                {bossUnlocked.length > 0 && (
                  <div
                    className="p-3 rounded-2xl border text-xs font-bold"
                    style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--gold)', color: 'var(--ink)' }}
                  >
                    <Trophy className="w-4 h-4 inline me-1" />
                    {bossUnlocked.map((a) => (isArabic ? a.titleAr : a.titleEn)).join(' · ')}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {canPlayRound ? (
                    <button
                      type="button"
                      onClick={() => startBossDuel(activeBoss)}
                      className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{isArabic ? 'مبارزة جديدة' : 'Rematch'}</span>
                    </button>
                  ) : (
                    onOpenActivateCode && (
                      <button
                        type="button"
                        onClick={onOpenActivateCode}
                        className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-black text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                        style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{isArabic ? 'تفعيل النسخة الكاملة (50 ج/شهر)' : 'Unlock Unlimited Pro (50 EGP/mo)'}</span>
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setScreen('lobby')}
                    className="min-h-[48px] px-4 py-3 rounded-2xl border font-bold text-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    {isArabic ? 'الأركيد' : 'Lobby'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <DailyProTimerPill
        visible={showPill}
        remainingSeconds={remainingSeconds}
        isArabic={isArabic}
        onClick={onOpenActivateCode}
      />
    </div>
  );
}
