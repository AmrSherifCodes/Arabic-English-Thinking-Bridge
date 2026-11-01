import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Github, Heart, Layers, Linkedin, MessageCircle, MessageSquare, Mic, Sparkles, ArrowRight, Target } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { UserProgress } from '../types';
import { isArabicUI, uiText } from '../utils/i18n';
import { ThinkingMap } from './ThinkingMap';
import { getAdaptiveRecommendation, getProfileTrackInfo } from '../utils/adaptiveCurriculum';

export type HomeAction = 'flashcards' | 'speaking' | 'situations' | 'daily-review' | 'messages';

interface HomeViewProps {
  profile: UserProfile;
  progress: UserProgress;
  onNavigate: (action: HomeAction) => void;
  onOpenWhyEnglish: () => void;
  onOpenLesson: (lessonIdx: number) => void;
}

const FEATURES = [
  {
    id: 'flashcards',
    titleEn: 'Flashcards',
    titleAr: 'البطاقات التعليمية',
    descriptionEn: 'Master vocab with 3D cards',
    descriptionAr: 'أتقن المفردات عبر البطاقات التفاعلية ثلاثية الأبعاد',
    Icon: Layers,
    iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
  },
  {
    id: 'speaking',
    titleEn: 'Speaking Practice',
    titleAr: 'تدريب التحدث والنطق',
    descriptionEn: 'Talk with AI voice recognition',
    descriptionAr: 'تدرب على النطق السليم مع التعرف الصوتي الذكي',
    Icon: Mic,
    iconClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
  },
  {
    id: 'situations',
    titleEn: 'Situations',
    titleAr: 'المواقف العملية',
    descriptionEn: 'Student, Call Center, Public',
    descriptionAr: 'مواقف الدراسة، خدمة العملاء، والحياة اليومية',
    Icon: MessageSquare,
    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
  },
  {
    id: 'daily-review',
    titleEn: 'Daily Review',
    titleAr: 'المراجعة اليومية',
    descriptionEn: 'Review your due words',
    descriptionAr: 'راجع الكلمات والجمل المستحقة اليوم',
    Icon: CalendarDays,
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  },
  {
    id: 'messages',
    titleEn: 'Contact Admin',
    titleAr: 'تواصل مع الإدارة',
    descriptionEn: 'Send feedback or a question',
    descriptionAr: 'أرسل ملاحظاتك أو استفسارك مباشرة',
    Icon: MessageCircle,
    iconClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
  }
] as const;

export function HomeView({ profile, progress, onNavigate, onOpenWhyEnglish, onOpenLesson }: HomeViewProps) {
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
      className="w-full min-w-0 space-y-5"
    >
      {isOffline && (
        <p
          role="status"
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {t('Offline Mode Active 🟢', 'وضع عدم الاتصال نشط 🟢')}
        </p>
      )}

      <header className="pt-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-olive-800 dark:text-olive-300">
            {t(`Welcome back, ${userName}! 👋`, `مرحبًا بك من جديد، ${userName}! 👋`)}
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
            <span>{trackInfo.icon}</span>
            <span>{t(trackInfo.titleEn, trackInfo.titleAr)}</span>
          </span>
        </div>

        <h2
          id="home-heading"
          className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
        >
          {profile.language === 'arabic'
            ? `Ready to learn ${profile.dialect === 'egyptian' ? 'Egyptian Arabic' : 'Arabic'}?`
            : 'هل أنت مستعد لبناء التفكير الإنجليزي؟'}
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {t(
            `Adaptive Track: ${levelLabel} · Goal: ${profile.goal} (${profile.focusArea || 'General'}) · ${dialectLabel}`,
            `المسار التكيفي: المستوى ${levelLabel} · الهدف: ${profile.goal} (${profile.focusArea || 'عام'}) · ${dialectLabel}`
          )}
        </p>
      </header>

      {/* Adaptive Recommendation Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-teal-500/40 bg-gradient-to-r from-teal-900/30 via-stone-900 to-emerald-900/20 p-4 sm:p-5 shadow-lg border border-teal-500/30 text-white">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-500 text-stone-950">
            <Target size={13} />
            {t('Adaptive Focus Recommendation', 'الهدف التكيفي المقترح')}
          </span>
          <span className="text-xs font-bold text-teal-300">
            {t(`Lesson #${adaptiveRec.lesson.number}`, `الدرس #${adaptiveRec.lesson.number}`)}
          </span>
        </div>
        <h3 className="mt-2 text-base sm:text-lg font-black text-white">
          {adaptiveRec.lesson.number}. {t(adaptiveRec.lesson.title, adaptiveRec.lesson.titleAr)}
        </h3>
        <p className="mt-1 text-xs text-stone-300 leading-relaxed">
          {t(adaptiveRec.reasonEn, adaptiveRec.reasonAr)}
        </p>
        <button
          type="button"
          onClick={() => onOpenLesson(adaptiveRec.lessonIndex)}
          className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-extrabold text-xs shadow-md transition active:scale-[0.98]"
        >
          <span>{t('Launch Adaptive Lesson →', 'ابدأ الدرس التكيفي الآن ←')}</span>
          <ArrowRight size={14} className="rtl-flip" />
        </button>
      </div>

      <motion.button
        type="button"
        onClick={onOpenWhyEnglish}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border border-indigo-700/60 bg-gradient-to-r from-indigo-800 to-violet-700 p-4 ${
          rtl ? 'text-right' : 'text-left'
        } text-white shadow-lg shadow-indigo-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <BookOpen size={22} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-white">
            {t('Why Learn With Thinking Bridge? 📖', 'لماذا تتعلم الإنجليزية؟ 📖')}
          </span>
          <span className="mt-0.5 block text-xs text-indigo-100">
            {t('Discover your motivation & cognitive shift', 'اكتشف دافعك الحقيقي والتحول الإدراكي')}
          </span>
        </span>
      </motion.button>

      {/* Visual English Thinking Map (Personalized by Profile) */}
      <ThinkingMap
        progress={progress}
        onOpenLesson={onOpenLesson}
        language={profile.language}
        profile={profile}
      />

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
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className={`flex min-h-28 w-full min-w-0 touch-manipulation items-center gap-4 rounded-2xl border bg-white dark:bg-slate-800 p-4 ${
                rtl ? 'text-right' : 'text-left'
              } border-stone-200 dark:border-stone-700 shadow-sm transition-colors hover:border-olive-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-olive-600`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900 dark:text-white">
                  {cardTitle}
                </span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                  {cardDescription}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <footer className="pt-2 text-center text-xs text-stone-500 dark:text-stone-400">
        <p>Thinking English · Personalized Adaptive Engine</p>
      </footer>
    </section>
  );
}
