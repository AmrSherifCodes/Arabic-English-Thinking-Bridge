import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Layers, MessageCircle, MessageSquare, Mic, ArrowRight, Target } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { UserProgress } from '../types';
import { isArabicUI, uiText } from '../utils/i18n';
import { ThinkingMap } from './ThinkingMap';
import { getAdaptiveRecommendation, getProfileTrackInfo } from '../utils/adaptiveCurriculum';

export type HomeAction = 'flashcards' | 'speaking' | 'situations' | 'daily-review' | 'messages';

export interface HomeViewProps {
  profile: UserProfile;
  progress: UserProgress;
  onNavigate: (action: HomeAction) => void;
  onOpenWhyEnglish: () => void;
  onOpenLesson: (lessonIdx: number) => void;
  onStartAiPractice?: () => void;
}

const FEATURES = [
  {
    id: 'flashcards',
    titleEn: 'Flashcards',
    titleAr: 'البطاقات التعليمية',
    descriptionEn: 'Master vocab with 3D cards',
    descriptionAr: 'أتقن المفردات عبر البطاقات التفاعلية ثلاثية الأبعاد',
    Icon: Layers,
    iconClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
  },
  {
    id: 'speaking',
    titleEn: 'Speaking Practice',
    titleAr: 'تدريب التحدث والنطق',
    descriptionEn: 'Talk with AI voice recognition',
    descriptionAr: 'تدرب على النطق السليم مع التعرف الصوتي الذكي',
    Icon: Mic,
    iconClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
  },
  {
    id: 'situations',
    titleEn: 'Situations',
    titleAr: 'المواقف العملية',
    descriptionEn: 'Student, Call Center, Public',
    descriptionAr: 'مواقف الدراسة، خدمة العملاء، والحياة اليومية',
    Icon: MessageSquare,
    iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
  },
  {
    id: 'daily-review',
    titleEn: 'Daily Review',
    titleAr: 'المراجعة اليومية',
    descriptionEn: 'Review your due words',
    descriptionAr: 'راجع الكلمات والجمل المستحقة اليوم',
    Icon: CalendarDays,
    iconClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
  },
  {
    id: 'messages',
    titleEn: 'Contact Admin',
    titleAr: 'تواصل مع الإدارة',
    descriptionEn: 'Send feedback or a question',
    descriptionAr: 'أرسل ملاحظاتك أو استفسارك مباشرة',
    Icon: MessageCircle,
    iconClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
  }
] as const;

export function HomeView({
  profile,
  progress,
  onNavigate,
  onOpenWhyEnglish,
  onOpenLesson,
  onStartAiPractice
}: HomeViewProps) {
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine
  );
  useEffect(() => {
    const updateConnection = () => setIsOffline(!navigator.onLine);
    window.addEventListener('offline', updateConnection);
    window.addEventListener('online', updateConnection);
    return () => {
      window.removeEventListener('offline', updateConnection);
      window.removeEventListener('online', updateConnection);
    };
  }, []);

  const rtl = isArabicUI(profile.language);
  const t = (en: string, ar: string) => uiText(profile.language, en, ar);
  const trackInfo = getProfileTrackInfo(profile);
  const adaptiveRec = getAdaptiveRecommendation(progress, profile);

  const levelLabel =
    profile.level === 'beginner'
      ? t('Beginner', 'مبتدئ')
      : profile.level === 'intermediate'
        ? t('Intermediate', 'متوسط')
        : t('Advanced', 'متقدم');

  const dialectLabel =
    profile.dialect === 'egyptian'
      ? t('Egyptian Arabic 🇪🇬', 'العامية المصرية 🇪🇬')
      : t('Modern Standard Arabic 📖', 'العربية الفصحى 📖');

  // Feature prioritization according to learningStyle & goal
  const prioritizedFeatureIds: HomeAction[] = [];
  if (profile.learningStyle === 'audio') {
    prioritizedFeatureIds.push('speaking', 'situations');
  } else if (profile.learningStyle === 'visual') {
    prioritizedFeatureIds.push('flashcards', 'situations');
  } else if (profile.learningStyle === 'text') {
    prioritizedFeatureIds.push('daily-review', 'situations');
  }

  if (profile.goal === 'travel') {
    prioritizedFeatureIds.push('situations', 'speaking');
  } else if (profile.goal === 'business' || profile.goal === 'work') {
    prioritizedFeatureIds.push('situations', 'flashcards');
  }

  const features = [...FEATURES].sort((first, second) => {
    const firstPriority = prioritizedFeatureIds.indexOf(first.id);
    const secondPriority = prioritizedFeatureIds.indexOf(second.id);

    if (firstPriority === -1) return secondPriority === -1 ? 0 : 1;
    if (secondPriority === -1) return -1;
    return firstPriority - secondPriority;
  });

  const userName = profile.name ? profile.name : t('Learner', 'المتعلم');

  return (
    <section
      dir={rtl ? 'rtl' : 'ltr'}
      aria-labelledby="home-heading"
      className="w-full min-w-0 space-y-6 sm:space-y-7"
    >
      {isOffline && (
        <p
          role="status"
          className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {t('Offline Mode Active 🟢', 'وضع عدم الاتصال نشط 🟢')}
        </p>
      )}

      {/* Header with clean, bold greeting and subtle track tag */}
      <header className="pt-1 space-y-1.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1
            id="home-heading"
            className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white"
          >
            {t(`Welcome back, ${userName}! 👋`, `مرحبًا بك، ${userName}! 👋`)}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 shadow-2xs">
            <span>{trackInfo.icon}</span>
            <span>{t(trackInfo.titleEn, trackInfo.titleAr)}</span>
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-teal-700 dark:text-teal-300">
          {profile.language === 'arabic'
            ? `Ready to master ${profile.dialect === 'egyptian' ? 'Egyptian Arabic' : 'Arabic'}?`
            : 'هل أنت مستعد لتطوير طريقة تفكيرك بالإنجليزية؟'}
        </p>

        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
          {t(
            `Track: ${levelLabel} · ${dialectLabel}`,
            `المسار: ${levelLabel} · ${dialectLabel}`
          )}
        </p>
      </header>

      {/* Clean, High-Contrast Adaptive Recommendation Card */}
      <div className="rounded-2xl border-2 border-teal-600/40 bg-white dark:bg-stone-900 p-5 shadow-sm text-stone-900 dark:text-stone-100 space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-teal-600/10 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-600/20">
            <Target size={14} className="text-teal-600 dark:text-teal-400" />
            {t('Adaptive Focus Recommendation', 'الهدف التكيفي المقترح')}
          </span>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 tabular-nums">
            {t(`Lesson #${adaptiveRec.lesson.number}`, `الدرس #${adaptiveRec.lesson.number}`)}
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
            {adaptiveRec.lesson.number}. {t(adaptiveRec.lesson.title, adaptiveRec.lesson.titleAr)}
          </h3>
          <p className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300 leading-relaxed">
            {t(adaptiveRec.reasonEn, adaptiveRec.reasonAr)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenLesson(adaptiveRec.lessonIndex)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
          >
            <span>{t('Launch Adaptive Lesson →', 'ابدأ الدرس التكيفي الآن ←')}</span>
            <ArrowRight size={14} className="rtl-flip" />
          </button>
          {onStartAiPractice && (
            <button
              type="button"
              onClick={onStartAiPractice}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-400/60 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60 font-bold text-xs shadow-xs transition active:scale-[0.98]"
            >
              <span>{t('🎲 Infinite AI Practice', '🎲 تمرين الذكاء الاصطناعي اللانهائي')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Soft secondary "Why Learn With Thinking Bridge?" card */}
      <motion.button
        type="button"
        onClick={onOpenWhyEnglish}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={`flex min-h-16 w-full items-center gap-3.5 rounded-2xl border border-teal-500/30 bg-teal-50/60 dark:bg-stone-800/80 p-4 ${
          rtl ? 'text-right' : 'text-left'
        } text-stone-900 dark:text-stone-100 shadow-xs hover:border-teal-500/50 hover:bg-teal-50/80 dark:hover:bg-stone-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600/15 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300">
          <BookOpen size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">
            {t('Why Learn With Thinking Bridge? 📖', 'لماذا تتعلم الإنجليزية؟ 📖')}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            {t('Discover your motivation & cognitive shift', 'اكتشف دافعك الحقيقي والتحول الإدراكي')}
          </span>
        </span>
        <ArrowRight size={16} className="text-teal-700 dark:text-teal-400 shrink-0 rtl-flip" />
      </motion.button>

      {/* Visual English Thinking Map (Personalized by Profile) */}
      <ThinkingMap
        progress={progress}
        onOpenLesson={onOpenLesson}
        language={profile.language}
        profile={profile}
      />

      {/* Feature Navigation Grid with consistent gap and clean borders */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map(({ id, titleEn, titleAr, descriptionEn, descriptionAr, Icon, iconClass }) => {
          const isWorkFocus = (profile.goal === 'work' || profile.goal === 'business') && id === 'situations';
          const cardTitle = isWorkFocus
            ? t('Situations (Work & Career)', 'المواقف العملية (العمل والمهنة)')
            : t(titleEn, titleAr);
          const cardDescription =
            id === 'situations' && profile.goal === 'travel'
              ? t(
                  'Practice airport, hotel, and travel conversations',
                  'تدرب على محادثات المطار والفندق والسفر'
                )
              : isWorkFocus
                ? t(
                    'Practice workplace, interview, and call center dialogs',
                    'تدرب على محادثات العمل والمقابلات ومراكز الاتصال'
                  )
                : t(descriptionEn, descriptionAr);

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`flex min-h-24 w-full min-w-0 touch-manipulation items-center gap-3.5 rounded-2xl border bg-white dark:bg-stone-900 p-4 ${
                rtl ? 'text-right' : 'text-left'
              } border-stone-300 dark:border-stone-700 shadow-xs transition-colors hover:border-teal-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-sm text-stone-900 dark:text-white">
                  {cardTitle}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                  {cardDescription}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <footer className="pt-2 text-center text-xs font-medium text-stone-600 dark:text-stone-400">
        <p>Thinking English · Personalized Adaptive Engine</p>
      </footer>
    </section>
  );
}
