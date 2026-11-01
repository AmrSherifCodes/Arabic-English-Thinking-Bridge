import { motion } from 'framer-motion';
import { BookOpen, Home, Mic, Sparkles, User } from 'lucide-react';
import type { UserProfile } from '../hooks/useUserProfile';
import { isArabicUI, uiText } from '../utils/i18n';

export type BottomNavTab = 'home' | 'lessons' | 'practice' | 'conversation' | 'messages' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  language?: UserProfile['language'];
}

const TABS = [
  { id: 'home' as BottomNavTab, labelEn: 'Home', labelAr: 'الرئيسية', Icon: Home },
  { id: 'lessons' as BottomNavTab, labelEn: 'Lessons', labelAr: 'الدروس', Icon: BookOpen },
  { id: 'practice' as BottomNavTab, labelEn: 'Practice', labelAr: 'التدريب', Icon: Sparkles },
  { id: 'conversation' as BottomNavTab, labelEn: 'Voice AI', labelAr: 'محادثة صوتية', Icon: Mic },
  { id: 'profile' as BottomNavTab, labelEn: 'Profile', labelAr: 'حسابي', Icon: User }
] as const;

export function BottomNav({ activeTab, onTabChange, language }: BottomNavProps) {
  const rtl = isArabicUI(language);

  return (
    <nav
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label={uiText(language, 'Main navigation', 'التنقل الرئيسي')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-xl">
        {TABS.map(({ id, labelEn, labelAr, Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(id)}
              whileTap={{ scale: 0.94 }}
              className={`flex min-h-16 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-1.5 py-2 text-xs transition-colors ar ${
                isActive
                  ? 'font-black text-teal-700 dark:text-teal-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-bold'
              }`}
            >
              <motion.span
                animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -2 : 0 }}
                transition={{ duration: 0.28, type: 'spring', stiffness: 380, damping: 18 }}
                className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.6 : 2} aria-hidden="true" />
              </motion.span>
              <span className="truncate max-w-[68px] sm:max-w-none text-[11px] sm:text-xs">
                {uiText(language, labelEn, labelAr)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
