import React, { useState, Suspense } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Volume2,
  Sparkles,
  Mic,
  Send,
  Briefcase,
  Headphones,
  UserCheck,
  Lock,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { RTLIcon } from '../../components/RTLIcon';
import { API_BASE_URL } from '../../utils/api';
import { useNativeSpeech } from '../voice/useNativeSpeech';
import { isFranco, francoToArabic } from '../../utils/franco';
import { speakWithRate } from '../../utils/audio';
import { getUserGeminiKey } from '../../services/geminiLexicon';
import { consumeDailyApiQuota } from '../../utils/apiQuota';
import { buildCorporateBridgeOffline } from '../../services/corporateBridgeOffline';
import { isOnline } from '../../utils/connectivity';
import { useEntitlement } from '../../hooks/useEntitlement';
import { useDailyProTimer } from '../../hooks/useDailyProTimer';
import { DailyProExpiredCard, DailyProTimerPill } from '../../components/DailyProTimerPill';
import { TargetLanguage } from '../../types';
import './corporate.css';

const LazyActivateCodeModal = React.lazy(() =>
  import('../../components/ActivateCodeModal').then((m) => ({ default: m.ActivateCodeModal }))
);

interface ToneOption {
  label: string;
  english: string;
  context: string;
}

interface CorporateBridgeResult {
  originalThought: string;
  thinkingShift: string;
  tones: {
    polite: ToneOption;
    assertive: ToneOption;
    executive: ToneOption;
  };
}

interface L1CoachingTip {
  literalTrap: string;
  nativeFix: string;
  whyArabic: string;
}

interface EgyptianProScenario {
  id: string;
  category: 'interview' | 'call_center' | 'workplace';
  categoryLabelAr: string;
  isFreePreview: boolean;
  titleAr: string;
  situationAr: string;
  egyptianThought: string;
  naturalResponse: string;
  executiveResponse: string;
  l1Tips: L1CoachingTip[];
}

interface CorporateBridgeViewProps {
  onBack: () => void;
  onToast?: (msg: string) => void;
  preferredVoice?: string;
  targetLang?: TargetLanguage;
  isArabic?: boolean;
}

const PRESETS = [
  'العميل مأخر الداتا وبيماطل في الرد',
  'معلش كنت في ميتنج ومشوفتش إيميلك',
  'يا ريت نراجع الحسابات دي عشان في غلطة',
  'محتاجين نخلّص قبل آخر الأسبوع ضروري',
  'الميزانية دي مش مكفية الشغل المطلوب',
];

const EGYPTIAN_PRO_SCENARIOS: EgyptianProScenario[] = [
  {
    id: 'interview-intro-free',
    category: 'interview',
    categoryLabelAr: 'إنترفيو · مقابلة عمل',
    isFreePreview: true,
    titleAr: 'كلمني عن نفسك وليه عايز تسيب شغلك الحالي؟',
    situationAr: 'أشهر سؤال افتتاحي في أي إنترفيو إنجليزي في مصر أو شركات ريموت.',
    egyptianThought: 'أنا متخرج من تجارة من ٢٠٢٢ وبشتغل مبيعات من سنتين وعايز فرصة أكبر.',
    naturalResponse:
      "I graduated with a Commerce degree in 2022, and I've been working in sales for the past two years. I'm now looking for a role where I can take on larger accounts and keep growing.",
    executiveResponse:
      "Over the last two years in sales, I've consistently grown client accounts, and I'm excited to bring that hands-on impact to a faster-scaling team like yours.",
    l1Tips: [
      {
        literalTrap: 'I work here since two years',
        nativeFix: "I've been working here for two years",
        whyArabic: 'في المصري بنقول «من سنتين» فبنترجمها حرفياً since، لكن مع المدة الزمنية بنستخدم for + Present Perfect Continuous.',
      },
      {
        literalTrap: 'I am graduate from Commerce',
        nativeFix: 'I graduated with a Commerce degree',
        whyArabic: '«أنا متخرج» بالعربي صفة، لكن بالإنجليزي فعل ماضي مباشر بدون am.',
      },
    ],
  },
  {
    id: 'callcenter-deescalate',
    category: 'call_center',
    categoryLabelAr: 'كول سنتر · خدمة عملاء',
    isFreePreview: false,
    titleAr: 'تهدئة عميل أجنبي غاضب بسبب تأخير أوردر أو خصم زيادة',
    situationAr: 'سيناريو يومي في حسابات UK/US (فودافون UK، أمازون، أو شركات الشحن).',
    egyptianThought: 'اهدى يا فندم، دي مش غلطتي، استنى دقيقة هشوفلك السيستم.',
    naturalResponse:
      "I completely understand why you're frustrated, and I'm going to look into this right away so we can get it resolved for you today.",
    executiveResponse:
      "Thank you for flagging this. May I place you on a brief hold for about two minutes while I verify the billing record and fix this immediately?",
    l1Tips: [
      {
        literalTrap: 'Calm down please, wait one minute',
        nativeFix: 'I understand your frustration — may I place you on a brief hold?',
        whyArabic: 'قول "Calm down" للعميل الأجنبي بيزوّد غضبه وبيتحسب خطأ QA؛ ابدأ بالتعاطف (Acknowledge) ثم اطلب الإذن للـ Hold.',
      },
      {
        literalTrap: 'This is not my problem / not my fault',
        nativeFix: "Let's get this sorted out for you right away",
        whyArabic: 'في ثقافة خدمة العملاء الإنجليزية التركيز دائماً على الحل (Ownership) مش تبرئة النفس.',
      },
    ],
  },
  {
    id: 'callcenter-tech-support',
    category: 'call_center',
    categoryLabelAr: 'كول سنتر · دعم فني',
    isFreePreview: false,
    titleAr: 'توجيه عميل في خطوات حل مشكلة إنترنت أو تطبيق بهدوء',
    situationAr: 'إعطاء تعليمات تقنية واضحة بدون ترجمة حرفية لأفعال «افتح / اقفل».',
    egyptianThought: 'افتح الراوتر واقفله تاني وقولّي اللمبة لونها إيه عشان نقفل المكالمة.',
    naturalResponse:
      'Could you please unplug the router for ten seconds, plug it back in, and let me know what color the status light shows?',
    executiveResponse:
      'To make sure everything is working smoothly before we wrap up the call, could we run one quick connection check together?',
    l1Tips: [
      {
        literalTrap: 'Open the router / Close the call',
        nativeFix: 'Turn on (or restart) the router / Wrap up (or end) the call',
        whyArabic: 'في العربي بنستخدم «افتح/اقفل» للأجهزة والمكالمات، لكن بالإنجليزي للأجهزة بنقول turn on/off وللمكالمة end/wrap up.',
      },
      {
        literalTrap: 'Tell me your name and number',
        nativeFix: 'Could I confirm your full name and account number, please?',
        whyArabic: 'صيغة الأمر المباشر "Tell me" بتتسمع حادة جداً؛ استبدلها بـ "Could I confirm...".',
      },
    ],
  },
  {
    id: 'interview-salary-weakness',
    category: 'interview',
    categoryLabelAr: 'إنترفيو · تفاوض وراتب',
    isFreePreview: false,
    titleAr: 'الرد الذكي على سؤال المرتب المتوقع وأكبر نقطة ضعف',
    situationAr: 'أكثر سؤالين بيوتروا المتقدمين المصريين في مقابلات الشركات الدولية.',
    egyptianThought: 'أنا عايز ١٨ ألف جنيه ومفيش عندي نقاط ضعف غير إني بشتغل كتير.',
    naturalResponse:
      "Based on my experience and the scope of this role, I'm targeting a range between 18,000 and 22,000 EGP, and I'm open to discussing the full package.",
    executiveResponse:
      "One area I've actively worked on is delegating earlier instead of perfecting every detail myself — using weekly checkpoints has helped me balance speed with quality.",
    l1Tips: [
      {
        literalTrap: 'I want 18,000 pounds / I have no weakness',
        nativeFix: "I'm targeting a range of... / One area I've been improving is...",
        whyArabic: 'تحديد Range بيديك مرونة تفاوضية، وإنكار وجود نقطة ضعف بيظهر كعدم وعي ذاتي (Self-awareness).',
      },
    ],
  },
  {
    id: 'workplace-pushback',
    category: 'workplace',
    categoryLabelAr: 'شغل واجتماعات · Workplace',
    isFreePreview: false,
    titleAr: 'الاعتراض باحترافية على ديدلاين غير واقعي في ميتنج',
    situationAr: 'إزاي تقول «لأ، الوقت مش هيكفي» لمدير أجنبي بدون ما تبان متذمر.',
    egyptianThought: 'مستحيل نخلص ده بكرة، أنا مشغول جداً وعندي تاسكات تانية.',
    naturalResponse:
      'To deliver this at the quality we need, we can either ship the core part tomorrow and the rest on Thursday, or move the deadline to Thursday. Which works better for you?',
    executiveResponse:
      'Given our current sprint priorities, hitting tomorrow would risk quality. If this is top priority, which existing deliverable should we shift to next week?',
    l1Tips: [
      {
        literalTrap: 'This is impossible, I am very busy',
        nativeFix: 'To maintain quality, we can either prioritize X or adjust the timeline to Y',
        whyArabic: 'بدل الرفض المغلق ("Impossible")، قدّم خيارين واضحين (Trade-offs) تخلي المدير يشارك في القرار.',
      },
    ],
  },
  {
    id: 'workplace-own-mistake',
    category: 'workplace',
    categoryLabelAr: 'شغل واجتماعات · ثقة مهنية',
    isFreePreview: false,
    titleAr: 'تحمل مسؤولية خطأ في التقرير بدون مبالغة في الاعتذار',
    situationAr: 'الفرق بين الاعتذار المتكرر اللي بيضعف صورتك، والاعتراف الاحترافي الواثق.',
    egyptianThought: 'آسف آسف جداً والله غصب عني ومش هتتكرر تاني.',
    naturalResponse:
      "Thanks for catching that. I've already fixed the numbers and uploaded the corrected report so the team stays on track.",
    executiveResponse:
      "Good catch — I've updated the file and added a quick validation check to our workflow so it won't slip through again.",
    l1Tips: [
      {
        literalTrap: 'Sorry sorry, it was my mistake, it will never happen again',
        nativeFix: "Thanks for catching that — I've already corrected it and updated the link",
        whyArabic: 'تكرار "Sorry" في بيئة العمل الإنجليزية بيوحي بالذعر؛ الشكر السريع + إثبات الحل الفوري بيعكس ثقة عالية.',
      },
    ],
  },
];

export function CorporateBridgeView({
  onBack,
  onToast,
  preferredVoice,
  targetLang = 'en',
  isArabic = true,
}: CorporateBridgeViewProps) {
  const { isPro } = useEntitlement();
  const [activeTab, setActiveTab] = useState<'translator' | 'pro_track'>('translator');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(EGYPTIAN_PRO_SCENARIOS[0].id);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const [inputThought, setInputThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorporateBridgeResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedScenario =
    EGYPTIAN_PRO_SCENARIOS.find((s) => s.id === selectedScenarioId) || EGYPTIAN_PRO_SCENARIOS[0];

  const isUsingProScenario = activeTab === 'pro_track' && !selectedScenario.isFreePreview;
  const { remainingSeconds, formattedRemaining, hasProAccess, showPill } = useDailyProTimer({
    isPro,
    active: isUsingProScenario,
  });

  const { isListening, startListening, stopListening } = useNativeSpeech({
    onSpeechEnd: (transcribed) => {
      setInputThought(transcribed);
      triggerTransform(transcribed);
    },
  });

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening('ar-EG');
    }
  };

  const detectedFranco = isFranco(inputThought);
  const convertedFromFranco = detectedFranco ? francoToArabic(inputThought) : '';

  const triggerTransform = async (thoughtToUse?: string) => {
    const raw = (thoughtToUse || inputThought).trim();
    if (!raw) return;

    const finalThought = isFranco(raw) ? francoToArabic(raw) : raw;

    // Always produce a deterministic offline result first: it renders instantly
    // and guarantees the screen is never empty, with or without a network.
    const offlineResult = buildCorporateBridgeOffline(finalThought, targetLang);
    setResult(offlineResult);

    if (!isOnline()) {
      setLoading(false);
      onToast?.('وضع أوفلاين — تم توليد الصياغة محلياً بالكامل');
      return;
    }

    const userKey = getUserGeminiKey();
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(userKey && {
            'x-user-api-key': userKey,
            'X-User-Gemini-Key': userKey,
          }),
        },
        body: JSON.stringify({
          operation: 'corporate-bridge',
          thought: finalThought,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.data) {
        setResult(resJson.data);
        consumeDailyApiQuota();
      }
    } catch (err: any) {
      console.warn('[CorporateBridge] Cloud unavailable, keeping offline bridge:', err);
      onToast?.('الذكاء الاصطناعي غير متاح — تم استخدام المحرك المباشر');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast?.('تم النسخ إلى الحافظة!');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSpeak = (text: string, rate = 1) => {
    speakWithRate(text, rate, preferredVoice);
  };

  const handleSelectScenario = (scenario: EgyptianProScenario) => {
    setSelectedScenarioId(scenario.id);
  };

  return (
    <div className="corporate" dir="rtl">
      {/* Header */}
      <header className="corporate__header">
        <button type="button" className="corporate__back-btn" onClick={onBack} aria-label="رجوع">
          <RTLIcon icon={ArrowLeft} size={18} />
        </button>
        <div className="corporate__title-group">
          <h1 className="corporate__title">من البلدي لـ Corporate 💼</h1>
          <p className="corporate__subtitle">
            صياغة احترافية + مسار الثقة المصري للإنترفيو والكول سنتر
          </p>
        </div>
        {isPro ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            <Crown size={12} />
            <span>PRO</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setActivateModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-black bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shrink-0 cursor-pointer transition"
          >
            <Sparkles size={12} />
            <span>Pro</span>
          </button>
        )}
      </header>

      {/* Mode Switcher: Translator vs Egyptian Pro Track */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab('translator')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'translator'
              ? 'bg-teal-500 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <Briefcase size={15} />
          <span>مترجم البلدي ← Corporate</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pro_track')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'pro_track'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <Headphones size={15} />
          <span>مسار الإنترفيو والكول سنتر</span>
        </button>
      </div>

      {activeTab === 'pro_track' ? (
        <div className="space-y-4">
          {/* Track Intro Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-teal-950/30 border border-amber-500/30 space-y-2 text-start">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300">
                <UserCheck size={15} />
                <span>مسار الثقة المصري: إنترفيو، كول سنتر، واجتماعات</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {isPro
                  ? 'كل السيناريوهات مفتوحة ✓'
                  : hasProAccess
                  ? `⏱ ${formattedRemaining} مجاني لكل السيناريوهات`
                  : '١ سيناريو مجاني · الباقي Pro'}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              تدريب أوفلاين ١٠٠٪ على أشهر مواقف الشغل والإنترفيو في مصر مع تنبيهات فورية لأخطاء الترجمة الحرفية من المصري للإنجليزي (L1 Interference).
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EGYPTIAN_PRO_SCENARIOS.map((scenario) => {
              const unlocked = scenario.isFreePreview || hasProAccess;
              const isSelected = selectedScenario.id === scenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleSelectScenario(scenario)}
                  className={`p-3.5 rounded-2xl border text-start transition cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-teal-950/50 border-teal-400 shadow-lg shadow-teal-500/10'
                      : unlocked
                      ? 'bg-stone-900/90 border-stone-800 hover:border-teal-500/40'
                      : 'bg-stone-900/60 border-amber-500/25 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-[11px] font-bold text-cyan-300">
                      {scenario.categoryLabelAr}
                    </span>
                    {scenario.isFreePreview ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                        معاينة مجانية ١٠٠٪
                      </span>
                    ) : isPro ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                        PRO ✓
                      </span>
                    ) : hasProAccess ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/40 whitespace-nowrap">
                        مجاني 15د ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 whitespace-nowrap">
                        <Lock size={10} />
                        <span>Pro</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-black text-white leading-snug">
                    {scenario.titleAr}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Detail Card or Warm Daily Expiry Card */}
          {!selectedScenario.isFreePreview && !hasProAccess ? (
            <DailyProExpiredCard
              isArabic={isArabic}
              onOpenActivateCode={() => setActivateModalOpen(true)}
              onBackToLessons={onBack}
            />
          ) : (
          <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-teal-500/30 space-y-4 text-start">
            <div className="space-y-1">
              <span className="text-[11px] font-black text-teal-400 block">
                {selectedScenario.categoryLabelAr}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {selectedScenario.titleAr}
              </h2>
              <p className="text-xs text-stone-400">{selectedScenario.situationAr}</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[10px] font-black text-amber-400 block">
                الفكرة في دماغك بالمصري:
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-200">
                «{selectedScenario.egyptianThought}»
              </p>
            </div>

            {/* Spoken Natural Response */}
            <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black text-teal-300">
                  🗣️ الرد الطبيعي الواثق (Spoken Natural)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(selectedScenario.naturalResponse, 1)}
                  >
                    <Volume2 size={13} />
                    <span>1.0x</span>
                  </button>
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(selectedScenario.naturalResponse, 0.75)}
                  >
                    <Volume2 size={13} />
                    <span>0.75x</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'pro-natural' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(selectedScenario.naturalResponse, 'pro-natural')}
                  >
                    {copiedKey === 'pro-natural' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedKey === 'pro-natural' ? 'نُسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed" dir="ltr">
                {selectedScenario.naturalResponse}
              </p>
            </div>

            {/* Executive / High-Impact Response */}
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black text-blue-300">
                  👔 صياغة احترافية متقدمة (Executive / QA-Ready)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(selectedScenario.executiveResponse, 1)}
                  >
                    <Volume2 size={13} />
                    <span>1.0x</span>
                  </button>
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(selectedScenario.executiveResponse, 0.75)}
                  >
                    <Volume2 size={13} />
                    <span>0.75x</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'pro-exec' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(selectedScenario.executiveResponse, 'pro-exec')}
                  >
                    {copiedKey === 'pro-exec' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedKey === 'pro-exec' ? 'نُسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed" dir="ltr">
                {selectedScenario.executiveResponse}
              </p>
            </div>

            {/* Instant Offline L1-Interference Coaching Tips */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/35 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <AlertTriangle size={15} className="shrink-0" />
                <span>تنبيهات فورية لأخطاء الترجمة الحرفية (L1 Interference):</span>
              </div>
              <div className="space-y-2.5">
                {selectedScenario.l1Tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5"
                  >
                    <div className="text-xs font-mono text-rose-300 break-words" dir="ltr">
                      ❌ {tip.literalTrap}
                    </div>
                    <div className="text-xs font-mono text-emerald-300 font-bold break-words" dir="ltr">
                      ✅ {tip.nativeFix}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">{tip.whyArabic}</p>
                  </div>
                ))}
              </div>
            </div>

            {!hasProAccess && (
              <button
                type="button"
                onClick={() => setActivateModalOpen(true)}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Crown size={16} />
                <span>افتح الـ ٥ سيناريوهات المتبقية للإنترفيو والكول سنتر (Pro) 🔓</span>
              </button>
            )}
          </div>
          )}
        </div>
      ) : (
        <>
          {/* Input Card */}
          <div className="corporate__card">
        <textarea
          className="corporate__textarea"
          value={inputThought}
          onChange={(e) => setInputThought(e.target.value)}
          placeholder="اكتب فكرتك بالبلدي أو الفرانكو... (مثال: العميل مش راضي يبعت الداتا وبيماطل)"
          rows={3}
        />

        {detectedFranco && (
          <div className="corporate__franco-pill">
            <Sparkles size={13} />
            <span>رصد فرانكو: "{convertedFromFranco}"</span>
          </div>
        )}

        <div className="corporate__presets-title">⚡ مواقف شائعة في الشغل:</div>
        <div className="corporate__presets">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="corporate__preset-chip"
              onClick={() => {
                setInputThought(preset);
                triggerTransform(preset);
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="corporate__actions">
          <button
            type="button"
            className="corporate__submit-btn"
            onClick={() => triggerTransform()}
            disabled={loading || !inputThought.trim()}
          >
            {loading ? (
              <span>جاري التحويل الاحترافي...</span>
            ) : (
              <>
                <Send size={16} />
                <span>صياغة بـ ٣ نبرات احترافية</span>
              </>
            )}
          </button>
          <button
            type="button"
            className={`corporate__mic-btn ${isListening ? 'corporate__mic-btn--active' : ''}`}
            onClick={handleMicToggle}
            aria-label={isListening ? 'إيقاف التسجيل' : 'تحدث بالعامية'}
            title="تحدث بفكرتك صوتياً"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="corporate__results animate-fade-in">
          {/* Thinking Shift */}
          <div className="corporate__shift-box">
            <div className="corporate__shift-title">
              <Sparkles size={16} />
              <span>طريقة التفكير (The Thinking Shift)</span>
            </div>
            <p className="corporate__shift-text">{result.thinkingShift}</p>
          </div>

          {/* 3 Tone Cards */}
          <div className="corporate__tones-grid">
            {/* 1. Polite */}
            <div className="corporate__tone-card corporate__tone-card--polite">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--polite">
                  🤝 {result.tones.polite.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.polite.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'polite' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.polite.english, 'polite')}
                  >
                    {copiedKey === 'polite' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'polite' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.polite.english}
              </p>
              <p className="corporate__tone-context">{result.tones.polite.context}</p>
            </div>

            {/* 2. Assertive */}
            <div className="corporate__tone-card corporate__tone-card--assertive">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--assertive">
                  ⚡ {result.tones.assertive.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.assertive.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'assertive' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.assertive.english, 'assertive')}
                  >
                    {copiedKey === 'assertive' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'assertive' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.assertive.english}
              </p>
              <p className="corporate__tone-context">{result.tones.assertive.context}</p>
            </div>

            {/* 3. Executive */}
            <div className="corporate__tone-card corporate__tone-card--executive">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--executive">
                  👔 {result.tones.executive.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.executive.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'executive' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.executive.english, 'executive')}
                  >
                    {copiedKey === 'executive' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'executive' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.executive.english}
              </p>
              <p className="corporate__tone-context">{result.tones.executive.context}</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      <DailyProTimerPill
        visible={showPill}
        remainingSeconds={remainingSeconds}
        isArabic={isArabic}
        onClick={() => setActivateModalOpen(true)}
      />

      {activateModalOpen && (
        <Suspense fallback={null}>
          <LazyActivateCodeModal
            isOpen={activateModalOpen}
            onClose={() => setActivateModalOpen(false)}
            isArabic={isArabic}
            onToast={onToast}
          />
        </Suspense>
      )}
    </div>
  );
}
