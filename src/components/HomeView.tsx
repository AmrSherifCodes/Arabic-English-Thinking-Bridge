import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Flame, Layers, MessageSquare, Mic } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { UserProgress } from '../types';
import { ThinkingMap } from './ThinkingMap';
import { getAdaptiveRecommendation } from '../utils/adaptiveCurriculum';
import { TutorAvatar } from './TutorAvatar';

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

  // Dynamic Mascot Tip based on user state
  const getAvatarTip = () => {
    if ((progress.streak || 0) === 0) {
      return "Welcome! Let's start your first lesson today. (أهلاً بيك! يلا نبدأ أول درس النهاردة)";
    }
    if ((progress.todayWins ?? 0) < 5) {
      return "You're close to your daily goal! One more lesson? (قربت من هدفك اليومي! يلا درس كمان؟)";
    }
    return "Welcome back! Ready to learn? (أهلاً بيك تاني يا بطل! جاهز نكمل؟)";
  };

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

          {/* Massive streak flame */}
          <div
            title={`حماسك مستمر منذ ${progress.streak || 0} يوم`}
            className="flex items-center gap-2 font-black text-orange-600 dark:text-orange-400 animate-pulse text-2xl sm:text-3xl shrink-0"
          >
            <Flame size={28} aria-hidden="true" />
            <span>🔥 {progress.streak || 0} Day Streak</span>
          </div>
        </div>
      </header>

      {/* Amr Animated AI Avatar with Speech Bubble at Top of HomeView */}
      <div className="my-2 p-3 sm:p-4 rounded-3xl border border-teal-500/20 bg-gradient-to-r from-teal-50/50 via-white to-white dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 shadow-sm">
        <TutorAvatar
          expression="happy"
          size="md"
          speechText={getAvatarTip()}
        />
      </div>

      {(progress.todayWins ?? 0) < 5 && (
        <div className="my-3 rounded-2xl bg-red-600 text-white p-3 text-center font-bold text-sm animate-pulse shadow-md">
          🔥 Your {progress.streak || 0}-day streak is about to end! Complete 1 lesson to keep it alive.
        </div>
      )}

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

      {/* Daily Missions Card */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-sm mt-4">
        <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-stone-900 dark:text-white">
          🎯 Daily Missions
        </h3>
        <div className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" /> Complete 2 lessons
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" /> Talk to AI Tutor for 1 minute
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" /> Review 10 flashcards
          </label>
        </div>
        <button
          type="button"
          onClick={() => {
            // Simple visual reward trigger
            const btn = document.getElementById('mystery-chest-btn');
            if (btn) {
              btn.textContent = '✅ Chest Claimed!';
              (btn as HTMLButtonElement).disabled = true;
            }
            alert('🎁 You found +50 XP and a Streak Shield!');
          }}
          id="mystery-chest-btn"
          className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 font-black text-sm shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          🎁 Claim Mystery Chest
        </button>
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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-start gap-4 p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-teal-500/50 transition-all text-right group"
          >
            <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${iconClass}`}>
              <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                {titleAr}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                {descriptionAr}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Credits Footer */}
      {onOpenCredits && (
        <div className="pt-4 text-center border-t border-stone-200/60 dark:border-stone-800/60">
          <button
            type="button"
            onClick={onOpenCredits}
            className="text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition"
          >
            عن التطبيق وفريق العمل · Credits
          </button>
        </div>
      )}
    </section>
  );
}
