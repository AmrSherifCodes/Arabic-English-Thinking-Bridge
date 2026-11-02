import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Mic,
  BookOpen,
  Layers,
  Settings,
  Sparkles,
  CheckCircle2,
  Volume2,
  Brain,
  Star,
  Target,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type TabId = 'voice' | 'lesson' | 'flashcards' | 'preferences';

export interface TabTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'english' | 'arabic';
  initialTab?: TabId;
}

interface Step {
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
  icon: React.ReactNode;
  proTip?: { en: string; ar: string };
  bulletPoints?: { en: string; ar: string }[];
}

interface TabGuide {
  id: TabId;
  label: { en: string; ar: string };
  icon: React.ReactNode;
  badge: { en: string; ar: string };
  steps: Step[];
}

const TAB_GUIDES: Record<TabId, TabGuide> = {
  voice: {
    id: 'voice',
    label: { en: 'Voice Practice', ar: 'تدريب المحادثة' },
    icon: <Mic className="w-4 h-4 text-purple-400" />,
    badge: { en: '🎙️ Live Conversational AI', ar: '🎙️ محادثة صوتية ذكية' },
    steps: [
      {
        icon: <Mic className="w-8 h-8 text-teal-400" />,
        title: { en: '1. Tap & Speak Freely', ar: '١. اضغط وتحدث بحرية' },
        desc: {
          en: 'Tap the glowing orb to start speaking. Express your thoughts in English, or ask in Arabic ("ازاي اقول...؟"). The AI tutor listens, understands, and replies conversationally.',
          ar: 'اضغط على الدائرة للبدء. تحدث بالإنجليزية بشكل طبيعي، أو اسأل بالعربي (مثل: «إزاي أقول...؟»). سيفهمك المعلم الذكي ويرد عليك بصوت طبيعي وفوري.',
        },
        proTip: {
          en: 'You can interrupt the AI anytime by tapping the stop/hand button (✋).',
          ar: 'يمكنك مقاطعة المعلم في أي لحظة بالضغط على زر التوقف (✋).',
        },
        bulletPoints: [
          { en: 'Practice unscripted everyday dialogues', ar: 'تدرّب على حوارات يومية طبيعية' },
          { en: 'Instant feedback on phrasing and grammar', ar: 'تصحيح فوري لصياغة الجمل والقواعد' },
        ],
      },
      {
        icon: <Volume2 className="w-8 h-8 text-amber-400" />,
        title: { en: '2. Live Karaoke Audio Highlighting', ar: '٢. تظليل الكلمات المباشر' },
        desc: {
          en: 'Watch the words light up with an animated underline in real time as the AI speaks. This trains your brain to instantly associate written words with authentic native pronunciation.',
          ar: 'تابع الكلمات وهي تضيء في الوقت الحقيقي مع نطق المعلم للكلمة. هذا يدرّب عقلك وأذنك على ربط طريقة الكتابة بالنطق الطبيعي السليم.',
        },
        proTip: {
          en: 'Adjust speaking speed in Preferences if you need slower pacing.',
          ar: 'يمكنك إبطاء سرعة النطق من شاشة الإعدادات إذا كنت بحاجة لسرعة أهدأ.',
        },
      },
      {
        icon: <Star className="w-8 h-8 text-purple-400 fill-current" />,
        title: { en: '3. Discover New Words (★ NEW WORD)', ar: '٣. اكتشاف الكلمات الجديدة ★' },
        desc: {
          en: 'Whenever the AI introduces a word outside your mastered vocabulary, it is highlighted in purple with a ★ star. The app automatically flags it for your review deck.',
          ar: 'كلما استخدم المعلم كلمة جديدة لم تتقنها بعد، تظهر باللون البنفسجي مع علامة نجمة ★ ويتم حفظها تلقائياً لمراجعتها في البطاقات.',
        },
        bulletPoints: [
          { en: 'Passive vocabulary turns into active speaking', ar: 'تحويل الكلمات المخزونة إلى كلام فعلي' },
          { en: 'Automatic spaced repetition scheduling', ar: 'جدولة تلقائية لمراجعة المفردات الجديدة' },
        ],
      },
    ],
  },
  lesson: {
    id: 'lesson',
    label: { en: 'Interactive Lessons', ar: 'الدروس التفاعلية' },
    icon: <BookOpen className="w-4 h-4 text-teal-400" />,
    badge: { en: '📖 Cognitive Structure Track', ar: '📖 منهج التفكير العقلي' },
    steps: [
      {
        icon: <Brain className="w-8 h-8 text-teal-400" />,
        title: { en: '1. Think the Meaning, Not the Words', ar: '١. فكّر بالمعنى مش بالترجمة الحرفية' },
        desc: {
          en: 'Read the Arabic Thought Card. Do not translate word-for-word in your head. Instead, construct the complete natural English thought using the word chips or typing.',
          ar: 'اقرأ بطاقة الفكرة بالعربي. لا تترجم كلمة بكلمة في عقلك، بل كوّن الجملة بالإنجليزية مباشرة باستخدام الكلمات المساعدة أو الكتابة.',
        },
        proTip: {
          en: 'Click any word chip to insert it quickly, or type with your keyboard.',
          ar: 'اضغط على الكلمات المقترحة لإضافتها بسرعة أو اكتب مباشرة بلوحة المفاتيح.',
        },
      },
      {
        icon: <Sparkles className="w-8 h-8 text-amber-400" />,
        title: { en: '2. Structural Cognitive Blueprint', ar: '٢. التركيب العقلي الملوّن' },
        desc: {
          en: 'Every correct answer unlocks a color-coded structural breakdown: Subject (Blue), Verb (Green), Object (Amber), and Connectors (Purple) to visualize natural English syntax.',
          ar: 'عند حل التمرين، يظهر لك التركيب اللغوي بالألوان: الأزرق للفاعل، الأخضر للفعل، الكهرماني للمفعول، والبنفسجي للروابط، لتعتاد عينك على الترتيب السليم.',
        },
        bulletPoints: [
          { en: 'Stops L1 native Arabic grammatical interference', ar: 'يمنع عادات التدخل اللغوي والترجمة الحرفية' },
          { en: 'Builds intuition for English word order', ar: 'يبني حدساً تلقائياً لترتيب الكلمات' },
        ],
      },
      {
        icon: <Volume2 className="w-8 h-8 text-emerald-400" />,
        title: { en: '3. Arabic Phonetic Transliteration', ar: '٣. النطق الصوتي بالحروف العربية' },
        desc: {
          en: 'Unsure how to pronounce an English sentence? Look at the Arabic phonetic guide (e.g. [ هيلو ]). It shows you the exact sound in familiar letters so you can speak confidently.',
          ar: 'غير متأكد من طريقة نطق الكلمة؟ يعرض لك كل تمرين النطق الصوتي الدقيق بأحرف عربية واضحة لتعرف نطق كل صوت ومقطع بسهولة وثقة.',
        },
      },
      {
        icon: <Target className="w-8 h-8 text-sky-400" />,
        title: { en: '4. Goal-Based Adaptive Filter', ar: '٤. تخصيص الدروس حسب هدفك' },
        desc: {
          en: 'Use the top syllabus pills to switch between Phase 1-3, or tap "⭐ Recommended for My Goal" to focus on lessons tailored for your field (Call Center, Academic, Travel).',
          ar: 'استخدم أزرار الفلترة أعلى المنهج للتنقل بين المراحل، أو اضغط على «⭐ موصى به لهدفي» لتركيز ممارستك على الدروس المتوافقة مع مجالك (كول سنتر، دراسة، سفر).',
        },
      },
    ],
  },
  flashcards: {
    id: 'flashcards',
    label: { en: 'Smart Flashcards', ar: 'البطاقات الذكية' },
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    badge: { en: '🧠 SM-2 Spaced Repetition', ar: '🧠 التكرار المتباعد الذكي' },
    steps: [
      {
        icon: <Layers className="w-8 h-8 text-teal-400" />,
        title: { en: '1. Flip & Test Your Recall', ar: '١. اقلب البطاقة واختبر ذاكرتك' },
        desc: {
          en: 'See the prompt sentence, think of the English translation, then tap the card to flip. The back reveals the correct target, phonetic guide, and sentence context.',
          ar: 'اقرأ الجملة في وجه البطاقة، حاول تذكر التعبير الإنجليزي في عقلك، ثم اضغط لقلبها. ستجد الترجمة الصحيحة والنطق الصوتي وسياق الاستخدام.',
        },
      },
      {
        icon: <Zap className="w-8 h-8 text-amber-400" />,
        title: { en: '2. The 4 SM-2 Review Buttons', ar: '٢. أزرار المراجعة الذكية الأربعة' },
        desc: {
          en: 'Rate honestly: "Again" (<10 min) if you missed it, "Hard" (1 day), "Good" (6 days), or "Easy" (15 days). The mathematical SM-2 algorithm ensures you never forget.',
          ar: 'قيّم استذكارك بأمانة: «إعادة» إذا نسيتها، «صعب» (يوم واحد)، «جيد» (٦ أيام)، أو «سهل» (١٥ يوماً). خوارزمية SM-2 تضمن تثبيت الكلمة قبل نسيانها.',
        },
        bulletPoints: [
          { en: 'Only review words due today without burnout', ar: 'راجع فقط البطاقات المستحقة اليوم دون إرهاق' },
          { en: 'Long-term retention guaranteed mathematically', ar: 'تثبيت في الذاكرة طويلة المدى بطريقة رياضية' },
        ],
      },
      {
        icon: <Sparkles className="w-8 h-8 text-purple-400" />,
        title: { en: '3. Curated Thematic Decks (+10k Words)', ar: '٣. باقات مخصصة (+١٠ آلاف كلمة)' },
        desc: {
          en: 'Switch between Starter Decks, Call Center & Business, Academic Science, and Everyday Travel. All decks are 100% public domain (CC0 1.0) and work fully offline.',
          ar: 'اختر بين باقات المبتدئين، الكول سنتر والأعمال، العلوم والجامعة، ومحادثات السفر. جميع البطاقات حرة ومجانية تماماً وتعمل بدون إنترنت.',
        },
      },
    ],
  },
  preferences: {
    id: 'preferences',
    label: { en: 'Preferences', ar: 'الإعدادات' },
    icon: <Settings className="w-4 h-4 text-sky-400" />,
    badge: { en: '⚙️ Personalized Learning Engine', ar: '⚙️ تخصيص تجربة التعلم' },
    steps: [
      {
        icon: <Target className="w-8 h-8 text-emerald-400" />,
        title: { en: '1. Dialect & Learning Goal', ar: '١. اللهجة والهدف التعليمي' },
        desc: {
          en: 'Choose between Egyptian Arabic (عامية مصرية 🇪🇬) and Modern Standard Arabic (فصحى 🌍). Set your goal (Work, Academic, Travel) to auto-calibrate curriculum and dictionary.',
          ar: 'اختر بين العامية المصرية والفصحى. حدد هدفك (كول سنتر وأعمال، دراسة وامتحانات، سفر) لتخصيص الدروس والقاموس تلقائياً وفقاً لاحتياجك.',
        },
      },
      {
        icon: <Volume2 className="w-8 h-8 text-teal-400" />,
        title: { en: '2. Natural Voice & Speaking Speed', ar: '٢. الصوت الطبيعي وسرعة النطق' },
        desc: {
          en: 'Select from high-quality neural voices. Use the speed slider (0.75x slow for learning to 1.25x for native-speed practice) to match your listening comprehension.',
          ar: 'اختر نبرة الصوت المفضلة لديك واضبط شريط سرعة النطق: 0.75x لسماع التفاصيل الصوتية بهدوء أو 1.25x لتحدي سرعة المتحدثين الأصليين.',
        },
      },
      {
        icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
        title: { en: '3. 100% Offline, Ad-Free & Private', ar: '٣. بدون إنترنت وبدون تتبّع أو إعلانات' },
        desc: {
          en: 'All your progress, streak data, and dictionary are stored locally on your device. No signups, no analytics, no ads. Built under the CC0 1.0 open-source constitution.',
          ar: 'كل بياناتك وتقدمك وسجلك مخزنة محلياً على جهازك. لا حاجة لتسجيل حساب، وبدون أي إعلانات أو تتبّع. مشروع مفتوح المصدر بموجب رخصة CC0.',
        },
      },
    ],
  },
};

export function TabTutorialModal({
  isOpen,
  onClose,
  language,
  initialTab = 'voice',
}: TabTutorialModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [stepIndex, setStepIndex] = useState(0);

  const isArabic = language === 'arabic';

  // Sync initial tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStepIndex(0);
    }
  }, [isOpen, initialTab]);

  // Keyboard navigation & escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') {
        if (isArabic) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isArabic) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stepIndex, activeTab, isArabic]);

  if (!isOpen) return null;

  const guide = TAB_GUIDES[activeTab] || TAB_GUIDES.voice;
  const currentStep = guide.steps[stepIndex] || guide.steps[0];
  const isLastStep = stepIndex === guide.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStepIndex((prev) => Math.min(prev + 1, guide.steps.length - 1));
    }
  };

  const handlePrev = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setStepIndex(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tab-tutorial-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-5 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs Navigation */}
        <div className="pr-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'دليل الأقسام التفاعلي' : 'Interactive Tab Guide'}</span>
          </div>

          {/* Quick Tab Switcher Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-stone-950 border border-stone-800">
            {(Object.keys(TAB_GUIDES) as TabId[]).map((tId) => {
              const item = TAB_GUIDES[tId];
              const isActive = activeTab === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => handleTabChange(tId)}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isActive
                      ? 'bg-teal-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{isArabic ? item.label.ar : item.label.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Title & Progress Dots */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="text-xs font-bold text-stone-400">
            {isArabic ? guide.badge.ar : guide.badge.en}
          </div>
          <div className="flex items-center gap-1.5">
            {guide.steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStepIndex(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-6 bg-teal-400'
                    : 'w-2 bg-stone-700 hover:bg-stone-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="space-y-4 min-h-[220px]">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 shrink-0">
              {currentStep.icon}
            </div>
            <div>
              <h3
                id="tab-tutorial-title"
                className="text-lg font-black text-stone-100"
              >
                {isArabic ? currentStep.title.ar : currentStep.title.en}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                {isArabic ? currentStep.desc.ar : currentStep.desc.en}
              </p>
            </div>
          </div>

          {/* Optional Bullet Points */}
          {currentStep.bulletPoints && currentStep.bulletPoints.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-stone-950/60 border border-stone-800">
              {currentStep.bulletPoints.map((bp, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{isArabic ? bp.ar : bp.en}</span>
                </div>
              ))}
            </div>
          )}

          {/* Optional Pro Tip */}
          {currentStep.proTip && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>{isArabic ? '💡 نصيحة ذكية: ' : '💡 Pro-Tip: '}</strong>
                {isArabic ? currentStep.proTip.ar : currentStep.proTip.en}
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
          >
            {isArabic ? (
              <>
                <span>التالي</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </>
            )}
          </button>

          <div className="text-xs text-stone-500">
            {stepIndex + 1} / {guide.steps.length}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 font-bold text-xs shadow-md transition flex items-center gap-1"
          >
            {isLastStep ? (
              <span>{isArabic ? 'فهمت ذلك! 🚀' : 'Got it! 🚀'}</span>
            ) : isArabic ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>الخطوة التالية</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

