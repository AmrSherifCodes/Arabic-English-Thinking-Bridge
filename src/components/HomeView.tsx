import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Layers, MessageSquare, Mic } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { UserProgress } from '../types';
import { ThinkingMap } from './ThinkingMap';
import { getAdaptiveRecommendation } from '../utils/adaptiveCurriculum';

export type HomeAction = 'flashcards' | 'speaking' | 'situations' | 'daily-review' | 'messages';

export interface HomeViewProps {
  profile: UserProfile;
  progress: UserProgress;
  onNavigate: (action: HomeAction) => void;
  onOpenWhyEnglish?: () => void;
  onOpenLesson: (lessonIdx: number) => void;
  onStartAiPractice?: () => void;
  onOpenCredits?: () => void;
}

const FEATURES = [
  {
    id: 'speaking' as HomeAction,
    titleAr: 'تدريب التحدث والنطق',
    descriptionAr: 'سجل صوتك واسمع النطق الصح بالذكاء الاصطناعي',
    Icon: Mic,
    iconClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
  },
  {
    id: 'flashcards' as HomeAction,
    titleAr: 'البطاقات التعليمية',
    descriptionAr: 'راجع الكلمات والمصطلحات المهمة بأسلوب التكرار المتباعد',
    Icon: Layers,
    iconClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
  },
  {
    id: 'situations' as HomeAction,
    titleAr: 'المواقف اليومية',
    descriptionAr: 'محادثات عملية للشغل، السفر، والحياة الواقعية',
    Icon: MessageSquare,
    iconClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
  },
  {
    id: 'daily-review' as HomeAction,
    titleAr: 'المراجعة اليومية',
    descriptionAr: 'راجع اللي اتعلمته النهاردة عشان يثبت في دماغك',
    Icon: CalendarDays,
    iconClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
  }
];

export function HomeView({
  profile,
  progress,
  onNavigate,
  onOpenLesson,
  onStartAiPractice,
  onOpenCredits
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

  const adaptiveRec = getAdaptiveRecommendation(progress, profile);
  const nextLessonIdx = adaptiveRec.lessonIndex;
  const nextLesson = adaptiveRec.lesson;

  const displayName = profile.name ? `يا ${profile.name} ` : '';

  return (
    <section
      dir="rtl"
      aria-labelledby="home-heading"
      className="w-full min-w-0 space-y-6 sm:space-y-7 ar"
    >
      {isOffline && (
        <p
          role="status"
          className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          وضع بدون إنترنت نشط 🟢
        </p>
      )}

      {/* Top Header: Simple & Welcoming */}
      <header className="pt-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1
              id="home-heading"
              className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white"
            >
              أهلاً بيك {displayName}يا بطل 👋
            </h1>
            <p className="mt-1 text-sm sm:text-base font-bold text-teal-700 dark:text-teal-300">
              مستعد تتعلم إنجليزي النهاردة؟
            </p>
          </div>

          {/* Tiny streak flame */}
          <div
            title={`حماسك مستمر منذ ${progress.streak || 0} يوم`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 font-black text-sm shrink-0"
          >
            <span aria-hidden="true">🔥</span>
            <span>{progress.streak || 0} يوم</span>
          </div>
        </div>
      </header>

      {/* ONE Huge Prominent Button: Continue Your Lesson */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onOpenLesson(nextLessonIdx)}
          className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black text-lg sm:text-xl shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center"
        >
          <span className="flex items-center gap-2">
            <span>▶️</span>
            <span>كمل الدرس بتاعك</span>
          </span>
          <span className="text-xs sm:text-sm font-bold opacity-95 bg-teal-800/90 dark:bg-teal-900/90 px-3 py-1 rounded-xl">
            الدرس {nextLesson.number}: {nextLesson.titleAr || nextLesson.title}
          </span>
        </button>

        {onStartAiPractice && (
          <button
            type="button"
            onClick={onStartAiPractice}
            className="w-full py-3 px-4 rounded-2xl border border-teal-600/30 bg-teal-50/60 dark:bg-stone-800/60 hover:bg-teal-50 dark:hover:bg-stone-800 text-teal-900 dark:text-teal-200 font-black text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>🎲</span>
            <span>تمرين الذكاء الاصطناعي اللانهائي</span>
          </button>
        )}
      </div>

      {/* Visual English Thinking Map (Curriculum Map) */}
      <ThinkingMap
        progress={progress}
        onOpenLesson={onOpenLesson}
        language={profile.language}
        profile={profile}
      />

      {/* Clean Feature Navigation Grid */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2">
        {FEATURES.map(({ id, titleAr, descriptionAr, Icon, iconClass }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="flex min-h-20 w-full min-w-0 touch-manipulation items-center gap-3.5 rounded-2xl border bg-white dark:bg-stone-900 p-4 text-right border-stone-200/90 dark:border-stone-800 shadow-xs transition-colors hover:border-teal-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
            >
              <Icon size={22} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-black text-sm text-stone-900 dark:text-white">
                {titleAr}
              </span>
              <span className="mt-0.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                {descriptionAr}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      <footer className="pt-2 text-center space-y-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
        <p>فكّر إنجليزي · خطوة بخطوة كل يوم 🚀</p>
        {onOpenCredits && (
          <div>
            <button
              type="button"
              onClick={onOpenCredits}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 underline transition cursor-pointer"
            >
              Privacy, Credits &amp; Licenses · الخصوصية والتراخيص
            </button>
          </div>
        )}
      </footer>
    </section>
  );
}
