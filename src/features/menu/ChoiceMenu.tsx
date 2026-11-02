import React from 'react';
import { ActionTile } from './ActionTile';
import { UserRound, ScrollText, Zap, Shield, BookMarked, Download, ExternalLink, HelpCircle, Star } from 'lucide-react';
import { UserProfile, UserProgress } from '../../types';
import { PHASES_DATA } from '../../data/lessons';
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
}: ChoiceMenuProps) {
  const isArabic = profile?.language === 'arabic';
  const totalLessons = PHASES_DATA.reduce((acc, p) => acc + p.lessons.length, 0);

  return (
    <div className="menu" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="menu__container">
        {/* 0. Top Bar: Language Switcher & Quick Tutorial */}
        <div className="menu__top-bar">
          <div className="menu__lang-switch" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`menu__lang-btn ${isArabic ? 'menu__lang-btn--active' : ''}`}
              onClick={() => onLanguageChange?.('arabic')}
              aria-label="Switch to Arabic"
            >
              العربية
            </button>
            <button
              type="button"
              className={`menu__lang-btn ${!isArabic ? 'menu__lang-btn--active' : ''}`}
              onClick={() => onLanguageChange?.('english')}
              aria-label="Switch to English"
            >
              English
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

        {/* 1. Top Badge & Hero */}
        <header className="menu__hero">
          <div className="menu__badge">
            <span>{isArabic ? '✦ جاهز بدون إنترنت' : '✦ Offline Ready'}</span>
          </div>
          <h1 className="menu__title">
            {isArabic ? 'جسر التفكير' : 'Thinking Bridge'}
          </h1>
          <p className="menu__tagline">
            {isArabic
              ? 'أتقن الإنجليزية بالطريقة الذكية. تعلّم العامية المصرية الحقيقية.'
              : 'Master English the Smart Way. Learn Egyptian Arabic the Real Way.'}
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
            icon="💼"
            label={isArabic ? 'من البلدي لـ Corporate' : 'Corporate Bridge'}
            hint={isArabic ? 'حوّل أفكارك بالعامية لصياغة إنجليزية احترافية' : 'Turn raw Egyptian thoughts into executive English'}
            onClick={() => onSelect('corporate')}
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
          href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v3.0.1/app-universal-release.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="menu__download-btn"
          aria-label={isArabic ? 'تحميل تطبيق الأندرويد v3.0.1' : 'Download Android APK v3.0.1'}
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
          <span className="menu__download-badge">v3.0.1 · APK</span>
        </a>

        {/* 7. Two-line Footer + Socials */}
        <footer className="menu__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="menu__footer-line1">
            {isArabic ? 'صُنع في الإسكندرية، مصر 🇪🇬' : 'Crafted in Alexandria, Egypt 🇪🇬'}
          </p>
          <p className="menu__footer-line2">
            {isArabic ? 'مستوحى من ميهاليس إلفثيريو · CC0 1.0' : 'Inspired by Mihalis Eleftheriou · CC0 1.0'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '12px', marginTop: '4px' }}>
            <a href="https://www.linkedin.com/in/sciamrsherif-abdelaal/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>LinkedIn</a>
            <a href="https://github.com/AmrSherifCodes" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>GitHub</a>
            <a href="https://www.patreon.com/c/SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>Patreon</a>
            <a href="https://www.youtube.com/@SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>YouTube</a>
            <a href="https://x.com/SciAmrSherif" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>X</a>
            <a href="mailto:amrsherifbusiness@gmail.com" style={{ color: 'var(--accent, #14b8a6)', textDecoration: 'none' }}>Email</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
