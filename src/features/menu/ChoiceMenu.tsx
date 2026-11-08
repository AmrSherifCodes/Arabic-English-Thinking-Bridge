import React, { useState } from 'react';
import { ActionTile } from './ActionTile';
import { UserRound, ScrollText, Zap, Shield, BookMarked, Download, ExternalLink, HelpCircle, Star, Globe, Users } from 'lucide-react';
import { UserProfile, UserProgress, SourceLanguage, TargetLanguage } from '../../types';
import { getCurriculum } from '../../data/curriculumRegistry';
import { getPairConfig, SOURCE_LANGUAGES, TARGET_LANGUAGE_META } from '../../data/languages';
import { LanguagePairBanner } from '../../components/LanguagePairBanner';
import { LanguageSelectorModal } from '../../components/LanguageSelectorModal';
import { usePresence } from '../../hooks/usePresence';
import './menu.css';

export type MenuRoute = 'voice' | 'lesson' | 'flashcards' | 'preferences' | 'corporate';

export interface ChoiceMenuProps {
  dueCards: number;
  profile?: UserProfile | null;
  progress?: UserProgress;
  onLanguageChange?: (lang: 'arabic' | 'english') => void;
  onSelect: (r: MenuRoute) => void;
  onOpenCV?: () => void;
  onOpenConstitution?: () => void;
  onOpenTutorial?: () => void;
  onOpenReview?: () => void;
  onOpenLanding?: () => void;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
  onSelectPair?: (source: SourceLanguage, target: TargetLanguage) => void;
  onToast?: (msg: string) => void;
}

export function ChoiceMenu({
  dueCards,
  profile,
  progress,
  onLanguageChange,
  onSelect,
  onOpenCV,
  onOpenConstitution,
  onOpenTutorial,
  onOpenReview,
  onOpenLanding,
  sourceLang = 'ar',
  targetLang = 'en',
  onSelectPair,
  onToast,
}: ChoiceMenuProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  const source: SourceLanguage = sourceLang || (profile?.language === 'arabic' ? 'ar' : 'en');
  const target: TargetLanguage = targetLang || 'en';
  const isArabic = source === 'ar';

  const pairConfig = getPairConfig(source, target);
  const curriculum = getCurriculum(source, target);
  const totalLessons = curriculum.reduce((acc, p) => acc + p.lessons.length, 0);

  const { liveCount } = usePresence();
  const [secretTaps, setSecretTaps] = useState(0);

  const handleSecretTap = () => {
    const next = secretTaps + 1;
    setSecretTaps(next);
    if (next >= 5) {
      setSecretTaps(0);
      onToast?.(isArabic ? '🕵️ ميزة سرية: تم فتح نمط Corporate Bridge!' : '🕵️ Easter Egg Unlocked: Corporate Bridge Mode!');
      onSelect('corporate');
    } else if (next >= 3) {
      onToast?.(isArabic ? `اضغط ${5 - next} مرات لفتح الميزة السرية...` : `Tap ${5 - next} more times for secret feature...`);
    }
  };

  return (
    <div className="menu" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="menu__container">
        {/* 0. Top Bar: Language Switcher & Quick Tutorial */}
        <div className="menu__top-bar">
          <div className="menu__lang-switch" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`menu__lang-btn ${source === 'ar' ? 'menu__lang-btn--active' : ''}`}
              onClick={() => {
                onLanguageChange?.('arabic');
                onSelectPair?.('ar', target);
              }}
              aria-label="Switch to Arabic"
            >
              العربية
            </button>
            <button
              type="button"
              className={`menu__lang-btn ${source === 'en' ? 'menu__lang-btn--active' : ''}`}
              onClick={() => {
                onLanguageChange?.('english');
                onSelectPair?.('en', target);
              }}
              aria-label="Switch to English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectorOpen(true)}
              className="menu__lang-btn !bg-amber-500/20 !text-amber-400 !border-amber-500/30 flex items-center gap-1 font-bold"
              title={isArabic ? 'تغيير اللغات' : 'Change languages'}
            >
              <span>{TARGET_LANGUAGE_META[target]?.flag}</span>
              <span>{TARGET_LANGUAGE_META[target]?.nameNative}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenTutorial}
            className="menu__guide-pill"
            aria-label={isArabic ? 'دليل الاستخدام السريع' : 'Quick Tutorial'}
          >
            <HelpCircle className="menu__guide-pill-icon" />
            <span>{isArabic ? '❓ كيفية الاستخدام' : '❓ How to use'}</span>
          </button>
        </div>

        {/* 1. Language Pair Selector Banner */}
        <LanguagePairBanner
          sourceLang={source}
          targetLang={target}
          onOpenSelector={() => setSelectorOpen(true)}
          onQuickSwitchTarget={(t) => onSelectPair?.(source, t)}
          onToast={onToast}
          className="mb-5"
        />

        {/* 2. Top Badge & Hero */}
        <header className="menu__hero">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="menu__badge cursor-pointer" onClick={handleSecretTap}>
              <span>{isArabic ? '✦ جاهز بدون إنترنت' : '✦ Offline Ready'}</span>
            </div>
            <div className="menu__badge flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-bold">{liveCount} {isArabic ? 'يتعلمون الآن' : 'learning now'}</span>
            </div>
          </div>
          <h1 className="menu__title cursor-pointer select-none" onClick={handleSecretTap}>
            {isArabic ? pairConfig.titleAr : pairConfig.titleEn}
          </h1>
          <p className="menu__tagline">
            {isArabic ? pairConfig.taglineAr : pairConfig.taglineEn}
          </p>
        </header>

        {/* 2. Tracked Learner Progress HUD */}
        {progress && (
          <section className="menu__progress-hud" aria-label="Tracked learner progress">
            <div className="menu__hud-item" title={isArabic ? 'أيام الاستمرارية' : 'Day streak'}>
              <span className="menu__hud-icon">🔥</span>
              <div className="menu__hud-text">
                <span className="menu__hud-val">{progress.streak || 0}</span>
                <span className="menu__hud-lbl">{isArabic ? 'حماسة' : 'Streak'}</span>
              </div>
            </div>
            <div className="menu__hud-divider" />
            <div className="menu__hud-item" title={isArabic ? 'مجموع نقاط الخبرة' : 'Total XP Earned'}>
              <span className="menu__hud-icon">🏆</span>
              <div className="menu__hud-text">
                <span className="menu__hud-val">{progress.score || 0}</span>
                <span className="menu__hud-lbl">XP</span>
              </div>
            </div>
            <div className="menu__hud-divider" />
            <div className="menu__hud-item" title={isArabic ? 'الدروس المكتملة' : 'Completed Lessons'}>
              <span className="menu__hud-icon">📚</span>
              <div className="menu__hud-text">
                <span className="menu__hud-val">
                  {progress.completedLessonIds?.length || 0}/{totalLessons}
                </span>
                <span className="menu__hud-lbl">{isArabic ? 'دروس' : 'Lessons'}</span>
              </div>
            </div>
            <div className="menu__hud-divider" />
            <div className="menu__hud-item" title={isArabic ? 'دروع حماية الاستمرارية' : 'Streak Shields'}>
              <span className="menu__hud-icon">🛡️</span>
              <div className="menu__hud-text">
                <span className="menu__hud-val">{progress.streakShields ?? 2}</span>
                <span className="menu__hud-lbl">{isArabic ? 'دروع' : 'Shields'}</span>
              </div>
            </div>
          </section>
        )}

        {/* Psychological Streak Loss Aversion & Urgency Banner */}
        {dueCards > 0 && (
          <div className="my-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-300 shadow-md">
            <div className="flex items-center gap-2 text-start">
              <span className="text-base animate-bounce">⚡</span>
              <span>
                {isArabic
                  ? `عندك ${dueCards} بطاقة مستحقة اليوم! كمل جلسة الآن لحماية حماستك 🔥`
                  : `${dueCards} cards due today! Practice now to protect your streak 🔥`}
              </span>
            </div>
            <button
              onClick={() => onSelect('flashcards')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-[11px] hover:bg-amber-400 transition shrink-0"
            >
              {isArabic ? 'بدء الآن 🚀' : 'Start Now 🚀'}
            </button>
          </div>
        )}

        {/* 3. Stats Strip */}
        <section className="menu__stats-strip" aria-label="Key app features">
          <div className="menu__stat-item">
            <Zap className="menu__stat-icon" />
            <span className="menu__stat-label">{isArabic ? '١٠٠٪ مجاني' : '100% Free'}</span>
          </div>
          <div className="menu__stat-divider" />
          <div className="menu__stat-item">
            <Shield className="menu__stat-icon" />
            <span className="menu__stat-label">{isArabic ? '٠٪ تتبّع' : '0% Tracking'}</span>
          </div>
          <div className="menu__stat-divider" />
          <div className="menu__stat-item">
            <BookMarked className="menu__stat-icon" />
            <span className="menu__stat-label">{isArabic ? '+١٠,٠٠٠ كلمة' : '+10,000 Words'}</span>
          </div>
        </section>

        {/* 3. Quote Banner */}
        <aside className="menu__quote-banner">
          <p className="menu__quote-en">
            {isArabic ? '«افهم بناء الفكرة، مش حفظ الجداول»' : '“Think the structure, don\'t memorize words.”'}
          </p>
          <p className="menu__quote-ar" dir={isArabic ? 'ltr' : 'rtl'}>
            {isArabic ? '“Think the structure, don\'t memorize words.”' : '«افهم بناء الفكرة، مش حفظ الجداول»'}
          </p>
        </aside>

        {/* 4. Action Grid (Tutorial, CV, Constitution & Review) */}
        <div className="menu__action-grid">
          <button
            type="button"
            onClick={onOpenTutorial}
            className="menu__sub-btn menu__sub-btn--highlight"
            aria-label={isArabic ? 'دليل الاستخدام السريع' : 'How to use tutorial'}
          >
            <HelpCircle className="menu__sub-btn-icon" />
            <span>{isArabic ? 'دليل الاستخدام' : 'How to use'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenCV}
            className="menu__sub-btn"
            aria-label={isArabic ? 'عرض السيرة الذاتية' : 'View Creator CV'}
          >
            <UserRound className="menu__sub-btn-icon" />
            <span>{isArabic ? 'السيرة الذاتية' : 'View CV'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenConstitution}
            className="menu__sub-btn"
            aria-label={isArabic ? 'قراءة دستور القناة' : 'Read Channel Constitution'}
          >
            <ScrollText className="menu__sub-btn-icon" />
            <span>{isArabic ? 'الدستور' : 'Constitution'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenReview}
            className="menu__sub-btn menu__sub-btn--reward"
            aria-label={isArabic ? 'قيّم التطبيق واكسب ١٠٠ نقطة' : 'Review app and earn 100 XP'}
            title={isArabic ? 'ضمان مراجعة وحل المشاكل في أقل من أسبوع' : '7-Day Resolution Pledge'}
          >
            <Star className="menu__sub-btn-icon text-amber-400 fill-amber-400" />
            <span>{isArabic ? '⭐ تقييم (+100 XP)' : '⭐ Review (+100 XP)'}</span>
          </button>
        </div>

        {/* 5. Core Navigation Tiles */}
        <nav className="menu__tiles" aria-label="Main navigation">
          <ActionTile
            primary
            icon="🎙️"
            label={isArabic ? 'تدريب المحادثة' : 'Voice Practice'}
            hint={isArabic ? 'اضغط للتحدث مع شريكك اللغوي' : 'Tap to speak with your partner'}
            onClick={() => onSelect('voice')}
          />
          <ActionTile
            icon="📖"
            label={isArabic ? 'متابعة الدرس' : 'Continue Lesson'}
            hint={isArabic ? 'تابع مسارك التعليمي التفاعلي' : 'Resume your adaptive track'}
            onClick={() => onSelect('lesson')}
          />
          <ActionTile
            icon="🗂️"
            label={isArabic ? 'البطاقات التعليمية' : 'Flashcards'}
            hint={isArabic ? `${dueCards} بطاقة مستحقة اليوم · +10k كلمة جديدة` : `${dueCards} cards due today · +10k new words`}
            badge={dueCards}
            onClick={() => onSelect('flashcards')}
          />
          <ActionTile
            icon="⚙️"
            label={isArabic ? 'الإعدادات' : 'Preferences'}
            hint={isArabic ? 'الصوت، السرعة، والبيانات' : 'Voice, speed, and data'}
            onClick={() => onSelect('preferences')}
          />
        </nav>

        {/* 6. Download App Button */}
        <a
          href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v4.0.2/ThinkingBridge-v4.0.2.apk"
          target="_blank"
          rel="noopener noreferrer"
          download="ThinkingBridge-v4.0.2.apk"
          className="menu__download-btn"
          aria-label={isArabic ? 'تحميل تطبيق الأندرويد v4.0.2' : 'Download Android APK v4.0.2'}
        >
          <div className="menu__download-info">
            <Download className="menu__download-icon" />
            <div className="menu__download-text">
              <span className="menu__download-title">
                {isArabic ? '📱 تحميل تطبيق الأندرويد' : '📱 Download Android APK'}
              </span>
              <span className="menu__download-sub">
                {isArabic
                  ? 'تثبيت مباشر وتجربة بدون إنترنت'
                  : 'Direct APK install · Full offline access'}
              </span>
            </div>
          </div>
          <span className="menu__download-badge">v4.0.2 · APK</span>
        </a>

        {/* 7. Two-line Footer + Socials */}
        <footer className="menu__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="menu__footer-line1">
            {isArabic ? 'صُنع في الإسكندرية، مصر 🇪🇬 · v4.0.2' : 'Crafted in Alexandria, Egypt 🇪🇬 · v4.0.2'}
          </p>
          <p className="menu__footer-line2">
            {isArabic ? 'مستوحى من ميهاليس إلفثيريو · CC0 1.0' : 'Inspired by Mihalis Eleftheriou · CC0 1.0'}
          </p>
          <a href="https://ipn.eg/S/amrsherifabdelaal/instapay/1c8JpA" target="_blank" rel="noopener noreferrer" className="menu__footer-line1 hover:text-teal-400 transition" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            ☕ {isArabic ? 'دعم المشروع اختياري (InstaPay)' : 'Optional Tip / Support (InstaPay)'}
          </a>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '12px', marginTop: '4px' }}>
            {onOpenLanding && (
              <button onClick={onOpenLanding} style={{ color: 'var(--accent, #14b8a6)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
                {isArabic ? '🌐 صفحة التعريف (Landing)' : '🌐 Landing Page'}
              </button>
            )}
            <a href="https://www.linkedin.com/in/sciamrsherif-abdelaal/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>LinkedIn</a>
            <a href="https://github.com/AmrSherifCodes" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>GitHub</a>
            <a href="https://www.patreon.com/c/SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>Patreon</a>
            <a href="https://www.youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>YouTube</a>
            <a href="https://x.com/SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>X</a>
            <a href="mailto:amrsherifbusiness@gmail.com" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>Email</a>
          </div>
        </footer>

        <LanguageSelectorModal
          isOpen={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          currentSource={source}
          currentTarget={target}
          onSelectPair={(s, t) => {
            onSelectPair?.(s, t);
          }}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
