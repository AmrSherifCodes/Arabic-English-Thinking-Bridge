import { motion } from 'framer-motion';
import { BookOpen, Home, MessageCircle, Mic, User } from 'lucide-react';
import type { UserProfile } from '../hooks/useUserProfile';
import { isArabicUI, uiText } from '../utils/i18n';

export type BottomNavTab = 'home' | 'lessons' | 'practice' | 'messages' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  language?: UserProfile['language'];
}

const TABS = [
  { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', Icon: Home },
  { id: 'lessons', labelEn: 'Lessons', labelAr: 'الدروس', Icon: BookOpen },
  { id: 'practice', labelEn: 'Practice', labelAr: 'التدريب', Icon: Mic },
  { id: 'messages', labelEn: 'Messages', labelAr: 'الرسائل', Icon: MessageCircle },
  { id: 'profile', labelEn: 'Profile', labelAr: 'حسابي', Icon: User }
] as const;

export function BottomNav({ activeTab, onTabChange, language }: BottomNavProps) {
  const rtl = isArabicUI(language);

  return (
    <nav
      dir={rtl ? 'rtl' : 'ltr'}
      aria-label={uiText(language, 'Main navigation', 'التنقل الرئيسي')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-3xl">
        {TABS.map(({ id, labelEn, labelAr, Icon }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(id)}
              whileTap={{ scale: 0.94 }}
              className={`flex min-h-16 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2 text-xs transition-colors ${
                isActive
                  ? 'font-semibold text-olive-800 dark:text-olive-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <motion.span
                animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -2 : 0 }}
                transition={{ duration: 0.32, type: 'spring', stiffness: 360, damping: 16 }}
                className="flex items-center justify-center"
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
              </motion.span>
              <span>{uiText(language, labelEn, labelAr)}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
