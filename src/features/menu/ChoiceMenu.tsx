import React from 'react';
import { ActionTile } from './ActionTile';
import { UserRound, ScrollText, Zap, Shield, BookMarked, Download, ExternalLink } from 'lucide-react';
import { UserProfile } from '../../types';
import './menu.css';

export type MenuRoute = 'voice' | 'lesson' | 'flashcards' | 'preferences';

export interface ChoiceMenuProps {
  dueCards: number;
  profile?: UserProfile | null;
  onLanguageChange?: (lang: 'arabic' | 'english') => void;
  onSelect: (r: MenuRoute) => void;
  onOpenCV?: () => void;
  onOpenConstitution?: () => void;
}

export function ChoiceMenu({
  dueCards,
  profile,
  onLanguageChange,
  onSelect,
  onOpenCV,
  onOpenConstitution,
}: ChoiceMenuProps) {
  const isArabic = profile?.language === 'arabic';

  return (
    <div className="menu" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="menu__container">
        {/* 0. Top Language Switcher */}
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

        {/* 2. Stats Strip */}
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

        {/* 4. 2-Column Action Grid (CV & Constitution) */}
        <div className="menu__action-grid">
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
          href="https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/download/v3.0.0/app-universal-release.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="menu__download-btn"
          aria-label={isArabic ? 'تحميل تطبيق الأندرويد v3.0.0' : 'Download Android APK v3.0.0'}
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
          <span className="menu__download-badge">v3.0.0 · APK</span>
        </a>

        {/* 7. Two-line Footer */}
        <footer className="menu__footer">
          <p className="menu__footer-line1">
            {isArabic ? 'صُنع في الإسكندرية، مصر 🇪🇬' : 'Crafted in Alexandria, Egypt 🇪🇬'}
          </p>
          <p className="menu__footer-line2">
            {isArabic ? 'مستوحى من ميهاليس إلفثيريو · CC0 1.0' : 'Inspired by Mihalis Eleftheriou · CC0 1.0'}
          </p>
        </footer>
      </div>
    </div>
  );
}
