import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Layers, MessageCircle, MessageSquare, Mic } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { isArabicUI, uiText } from '../utils/i18n';

export type HomeAction = 'flashcards' | 'speaking' | 'situations' | 'daily-review' | 'messages';

interface HomeViewProps {
  profile: UserProfile;
  onNavigate: (action: HomeAction) => void;
  onOpenWhyEnglish: () => void;
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

export function HomeView({ profile, onNavigate, onOpenWhyEnglish }: HomeViewProps) {
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

  const levelLabel =
    profile.level === 'beginner'
      ? t('Beginner', 'مبتدئ')
      : profile.level === 'intermediate'
        ? t('Intermediate', 'متوسط')
        : t('Advanced', 'متقدم');
  const goalLabel =
    profile.goal === 'work'
      ? t('Work', 'العمل')
      : profile.goal === 'travel'
        ? t('Travel', 'السفر')
        : t('General', 'عام');
  const dialectLabel =
    profile.dialect === 'egyptian'
      ? t('Egyptian Arabic 🇪🇬', 'العامية المصرية 🇪🇬')
      : t('Modern Standard Arabic 📖', 'العربية الفصحى 📖');

  const goalFeatureIds: Record<UserProfile['goal'], HomeAction[]> = {
    travel: ['situations', 'speaking', 'flashcards', 'messages'],
    work: ['situations', 'speaking', 'flashcards', 'messages'],
    general: ['flashcards', 'speaking', 'situations', 'daily-review', 'messages']
  };
  const visibleFeatureIds = new Set(goalFeatureIds[profile.goal]);
  const prioritizedFeatureIds: HomeAction[] =
    profile.goal === 'work'
      ? ['situations', 'speaking']
      : profile.goal === 'travel'
        ? ['situations', 'speaking']
        : [];
  const features = FEATURES.filter(feature => visibleFeatureIds.has(feature.id)).sort(
    (first, second) => {
      const firstPriority = prioritizedFeatureIds.indexOf(first.id);
      const secondPriority = prioritizedFeatureIds.indexOf(second.id);

      if (firstPriority === -1) return secondPriority === -1 ? 0 : 1;
      if (secondPriority === -1) return -1;
      return firstPriority - secondPriority;
    }
  );

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
        <p className="text-sm font-medium text-olive-800 dark:text-olive-300">
          {t('Welcome back', 'مرحبًا بك من جديد')} · {dialectLabel}
        </p>
        <h2
          id="home-heading"
          className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
        >
          {profile.language === 'arabic'
            ? `Ready to learn ${profile.dialect === 'egyptian' ? 'Egyptian Arabic' : 'Arabic'}?`
            : 'هل أنت مستعد لتعلم الإنجليزية؟'}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {profile.goal === 'work'
            ? t(
                'Build confidence for workplace conversations.',
                'طوّر ثقتك ومهاراتك في محادثات العمل وخدمة العملاء.'
              )
            : profile.goal === 'travel'
              ? t(
                  'Practice the language you need for your next trip.',
                  'تدرّب على المفردات والجمل التي تحتاجها في رحلتك القادمة.'
                )
              : t(
                  'Choose a path and keep your learning momentum going.',
                  'اختر مسارك واستمر في تقدمك اليومي.'
                )}
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {t(
            `Your ${levelLabel} · ${goalLabel} · ${dialectLabel} learning path`,
            `مسارك التعليمي: المستوى ${levelLabel} · الهدف: ${goalLabel} · ${dialectLabel}`
          )}
        </p>
      </header>

      <motion.button
        type="button"
        onClick={onOpenWhyEnglish}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border border-indigo-700/60 bg-gradient-to-r from-indigo-800 to-violet-700 p-4 ${
          rtl ? 'text-right' : 'text-left'
        } text-white shadow-lg shadow-indigo-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <BookOpen size={24} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-white">
            {t('Why Learn With Thinking Bridge? 📖', 'لماذا تتعلم الإنجليزية؟ 📖')}
          </span>
          <span className="mt-1 block text-sm text-indigo-100">
            {t('Discover your motivation', 'اكتشف دافعك الحقيقي للتعلم')}
          </span>
        </span>
      </motion.button>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map(({ id, titleEn, titleAr, descriptionEn, descriptionAr, Icon, iconClass }) => {
          const isWorkFocus = profile.goal === 'work' && id === 'situations';
          const cardTitle = isWorkFocus
            ? t('Situations (Call Center)', 'المواقف العملية (خدمة العملاء)')
            : t(titleEn, titleAr);
          const cardDescription =
            id === 'situations' && profile.goal === 'travel'
              ? t(
                  'Practice airport, hotel, and travel conversations',
                  'تدرب على محادثات المطار والفندق والسفر'
                )
              : isWorkFocus
                ? t(
                    'Practice workplace and call center conversations',
                    'تدرب على محادثات العمل ومراكز الاتصال'
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
              } text-slate-900 dark:text-slate-100 shadow-md shadow-slate-900/5 dark:shadow-black/30 outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-olive-500 ${
                isWorkFocus
                  ? 'border-olive-500 dark:border-olive-400 ring-1 ring-olive-500/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon size={25} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{cardTitle}</span>
                <span className="mt-1 block text-sm leading-snug text-slate-600 dark:text-slate-300">
                  {cardDescription}
                </span>
                {isWorkFocus && (
                  <span className="mt-2 inline-block text-xs font-semibold text-olive-800 dark:text-olive-300">
                    {t('Work focus', 'تركيز العمل')}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
