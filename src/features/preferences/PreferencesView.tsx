import React, { useState, useMemo, useRef } from 'react';
import { Youtube, Download, Upload, ShieldCheck, Database } from 'lucide-react';
import { TabTutorialModal } from '../../components/TabTutorialModal';
import { CATEGORY_LABELS, CATEGORY_LABELS_AR, PreferenceCategory } from './settingsSchema';
import { usePreferences } from './usePreferences';
import { FieldRenderer } from './FieldRenderer';
import { UserProfile, UserProgress } from '../../types';
import { downloadProgressBackup, importUserProgressJson, getVaultAuditSnapshot } from '../../utils/storage';
import './preferences.css';

interface PreferencesViewProps {
  onBack: () => void;
  profile?: UserProfile | null;
  onSaveProfile?: (profile: UserProfile) => void;
  progress?: UserProgress;
  updateAndSaveProgress?: (updater: (prev: UserProgress) => UserProgress) => void;
  onToast?: (msg: string) => void;
  onOpenReview?: () => void;
}

export function PreferencesView({
  onBack,
  profile,
  onSaveProfile,
  progress,
  updateAndSaveProgress,
  onToast,
  onOpenReview
}: PreferencesViewProps) {
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { values, set, schema } = usePreferences();
  const isArabic = profile?.language === 'arabic';

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('tb.theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const [customGeminiKey, setCustomGeminiKey] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('tb.userGeminiKey') || '';
    }
    return '';
  });

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tb.theme', newTheme);
    }
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    }
    onToast?.(isArabic ? `☀️ تم التبديل إلى الوضع ${newTheme === 'light' ? 'الفاتح' : 'الداكن'}` : `Switched to ${newTheme} mode`);
  };

  const handleSaveGeminiKey = (val: string) => {
    setCustomGeminiKey(val);
    if (typeof localStorage === 'undefined') return;
    if (val.trim()) {
      localStorage.setItem('tb.userGeminiKey', val.trim());
      onToast?.(isArabic ? '✅ تم حفظ مفتاح Gemini الخاص بك!' : '✅ Custom Gemini key saved!');
    } else {
      localStorage.removeItem('tb.userGeminiKey');
      onToast?.(isArabic ? '🗑️ تم إزالة المفتاح المخصص' : '🗑️ Custom key removed');
    }
  };

  const grouped = useMemo(() => {
    const m = new Map<PreferenceCategory, typeof schema>();
    for (const f of schema) {
      const list = m.get(f.category) ?? [];
      (list as typeof schema[number][]).push(f);
      m.set(f.category, list as typeof schema);
    }
    return m;
  }, [schema]);

  const handleFieldChange = (fId: string, v: boolean | string | number) => {
    set(fId, v);
    if (profile && onSaveProfile) {
      if (fId === 'dialect' || fId === 'level' || fId === 'goal') {
        onSaveProfile({
          ...profile,
          [fId]: v as any,
        });
      }
    }
  };

  const handleExportBackup = () => {
    if (!progress) return;
    downloadProgressBackup(progress);
    onToast?.(isArabic ? '📥 تم تنزيل النسخة الاحتياطية بنجاح!' : '📥 Backup file downloaded successfully!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importUserProgressJson(content);
      if (res.success && res.progress && updateAndSaveProgress) {
        updateAndSaveProgress(() => res.progress!);
        onToast?.(
          isArabic
            ? '✅ تم استعادة تقدمك ونسختك الاحتياطية بنجاح!'
            : '✅ Progress restored successfully from backup!'
        );
      } else {
        onToast?.(isArabic ? '❌ ملف غير صالح' : `❌ ${res.error || 'Failed to restore backup'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="pref-screen" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="pref-header">
        <div className="pref-header__inner">
          <button
            type="button"
            className="pref-back"
            onClick={onBack}
            aria-label={isArabic ? 'رجوع' : 'Back'}
          >
            {isArabic ? '→' : '←'}
          </button>
          <h1>{isArabic ? 'الإعدادات والتخصيص' : 'Preferences & Tailoring'}</h1>
          <button
            type="button"
            className="pref-guide-btn"
            onClick={() => setShowGuide(true)}
            aria-label={isArabic ? 'دليل الإعدادات' : 'Preferences Guide'}
            title="Guide"
          >
            ❓
          </button>
        </div>
      </header>
      <div className="pref-body space-y-6">
        {/* Experience Customization Section */}
        <section className="pref-section" aria-label="Customization">
          <h2 className="pref-section__title">
            🎨 {isArabic ? 'تخصيص التجربة والذكاء الاصطناعي' : 'Customization & AI Key'}
          </h2>
          <div className="pref-section__fields space-y-3 p-4 rounded-2xl bg-surface border border-border">
            {/* Theme Selector */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-bold text-sm text-text block">
                  {isArabic ? 'مظهر التطبيق (Theme)' : 'App Theme'}
                </span>
                <span className="text-xs text-muted block">
                  {isArabic ? 'التبديل بين الوضع الداكن والوضع الفاتح' : 'Switch between Dark Mode and Light Mode'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    theme === 'dark' ? 'bg-primary text-on-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  🌙 {isArabic ? 'داكن' : 'Dark'}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    theme === 'light' ? 'bg-primary text-on-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  ☀️ {isArabic ? 'فاتح' : 'Light'}
                </button>
              </div>
            </div>

            {/* Custom Free Gemini Key Input */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-text block">
                  🔑 {isArabic ? 'مفتاح Gemini الخاص (اختياري)' : 'Custom Gemini API Key (Optional)'}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-success/20 text-success">
                  {isArabic ? 'مجاني ١٠٠٪' : '100% Free'}
                </span>
              </div>
              <p className="text-xs text-muted">
                {isArabic
                  ? 'أدخل مفتاحك المجاني من Google AI Studio للحصول على أولوية استجابة فورية وبدون حدود يومية.'
                  : 'Optionally supply your free Gemini key from Google AI Studio for priority unlimited access.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="password"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 p-2.5 rounded-xl bg-surface-2 border border-border text-text text-sm font-mono focus:outline-none focus:border-success"
                />
                <button
                  type="button"
                  onClick={() => handleSaveGeminiKey(customGeminiKey)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-black text-xs transition active:scale-95 shadow-md"
                >
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {Array.from(grouped.entries()).map(([cat, fields]) => (
          <section key={cat} className="pref-section">
            <h2 className="pref-section__title">
              {isArabic ? CATEGORY_LABELS_AR[cat] : CATEGORY_LABELS[cat]}
            </h2>
            <div className="pref-section__fields">
              {fields.map((f) => {
                const effectiveValue =
                  f.id === 'dialect' && profile?.dialect
                    ? profile.dialect
                    : f.id === 'level' && profile?.level
                    ? profile.level
                    : f.id === 'goal' && profile?.goal
                    ? profile.goal
                    : values[f.id];

                return (
                  <FieldRenderer
                    key={f.id}
                    field={f}
                    value={effectiveValue}
                    isArabic={isArabic}
                    onChange={(v) => handleFieldChange(f.id, v)}
                  />
                );
              })}
            </div>

            {cat === 'pedagogy' && (
              <div className="pref-dict-card">
                <div className="pref-dict-card__header">
                  <span className="pref-dict-card__badge">
                    ✦ {isArabic ? 'القاموس المعتمد' : 'Verified Lexicon'}
                  </span>
                  <span className="pref-dict-card__count">
                    {isArabic ? '+١٠,٠٠٠ كلمة' : '+10,000 Words'}
                  </span>
                </div>
                <p className="pref-dict-card__desc">
                  {isArabic
                    ? 'الكلمات مفلترة بدقة عالية وفقاً للهجة المختارة ومستواك الحالي، مع خوارزمية التكرار المتباعد (SM-2) لضمان حفظ واسترجاع الكلمات بسلاسة.'
                    : 'Words are strictly filtered to your chosen dialect and level with SM-2 Spaced Repetition to maximize retention.'}
                </p>
                <div className="pref-dict-card__tags">
                  <span className="pref-dict-card__tag">
                    {isArabic ? '🔒 عزل كامل للهجات' : '🔒 Strict Dialect Isolation'}
                  </span>
                  <span className="pref-dict-card__tag">
                    {isArabic ? '📶 ١٠٠٪ بدون إنترنت' : '📶 100% Offline Ready'}
                  </span>
                  <span className="pref-dict-card__tag">
                    {isArabic ? '⚡ محرك Anki SM-2' : '⚡ Anki-Grade SM-2'}
                  </span>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Progress & Data Vault Section */}
        {progress && (
          <section className="pref-vault-card" aria-label="Progress and Data Vault">
            <div className="pref-vault-card__header">
              <h3 className="pref-vault-card__title">
                <Database className="w-4 h-4 text-teal-400" />
                <span>{isArabic ? 'مخزن البيانات والتقدم' : 'Progress & Data Vault'}</span>
              </h3>
              <span className="pref-vault-card__badge flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>{isArabic ? 'تخزين آمن ومحمي' : 'Dual-Layer Secured'}</span>
              </span>
            </div>

            <div className="pref-vault-card__grid">
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">{progress.score || 0}</span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'نقاط الخبرة (XP)' : 'Total Score (XP)'}
                </span>
              </div>
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">🔥 {progress.streak || 0}</span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'أيام الاستمرارية' : 'Current Streak'}
                </span>
              </div>
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">⭐ {progress.bestStreak || 0}</span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'أعلى استمرارية' : 'Best Streak'}
                </span>
              </div>
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">
                  {progress.completedLessonIds?.length || 0}
                </span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'الدروس المنجزة' : 'Lessons Mastered'}
                </span>
              </div>
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">
                  {progress.completedExerciseCount || progress.completedExerciseIds?.length || 0}
                </span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'التمارين المحلولة' : 'Exercises Solved'}
                </span>
              </div>
              <div className="pref-vault-item">
                <span className="pref-vault-item__val">🛡️ {progress.streakShields ?? 2}/5</span>
                <span className="pref-vault-item__lbl">
                  {isArabic ? 'دروع الحماية' : 'Streak Shields'}
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <div className="pref-vault-actions">
              <button
                type="button"
                onClick={handleExportBackup}
                className="pref-vault-btn"
                aria-label={isArabic ? 'تصدير نسخة احتياطية' : 'Export progress backup'}
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>{isArabic ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="pref-vault-btn"
                aria-label={isArabic ? 'استعادة من نسخة احتياطية' : 'Restore from backup'}
              >
                <Upload className="w-4 h-4 text-teal-400" />
                <span>{isArabic ? 'استعادة من ملف (Restore)' : 'Restore from File'}</span>
              </button>
              {onOpenReview && (
                <button
                  type="button"
                  onClick={onOpenReview}
                  className="pref-vault-btn"
                  style={{ borderColor: 'rgba(251, 191, 36, 0.45)', color: '#fbbf24' }}
                  aria-label={isArabic ? 'تقييم التطبيق واكسب ١٠٠ نقطة' : 'Review app & earn 100 XP'}
                >
                  <span>⭐ {isArabic ? 'قيّم واكسب 100 XP 🎁' : 'Review & Earn 100 XP 🎁'}</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Creator & Socials Card */}
        <div className="pref-creator-card">
          <div className="pref-creator-card__header">
            <div className="pref-creator-card__avatar-wrap">
              <img
                src="/amr-avatar.png"
                alt="Amr Sherif"
                className="pref-creator-card__avatar"
              />
            </div>
            <div>
              <h3 className="pref-creator-card__name">Amr Sherif</h3>
              <p className="pref-creator-card__sub">
                {isArabic ? 'مبتكر جسر التفكير · الإسكندرية، مصر 🇪🇬' : 'Creator & Architect · Alexandria, Egypt 🇪🇬'}
              </p>
            </div>
          </div>
          <p className="pref-creator-card__bio">
            {isArabic
              ? 'صممت هذا التطبيق مجاناً وبدون أي تتبّع لمساعدة كل عربي على التفكير بالإنجليزية كالمتحدث الأصلي وكسر حواجز الترجمة الحرفية.'
              : 'Designed to help every Arabic speaker bridge the cognitive gap into natural English thinking, 100% free and ad-free.'}
          </p>
          <div className="pref-creator-card__socials">
            <a
              href="https://www.youtube.com/@SciAmrSherif?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="pref-creator-card__link pref-creator-card__link--yt"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>YouTube @SciAmrSherif</span>
            </a>
            <a
              href="https://www.linkedin.com/in/sciamrsherif-abdelaal/"
              target="_blank"
              rel="noopener noreferrer"
              className="pref-creator-card__link"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/AmrSherifCodes"
              target="_blank"
              rel="noopener noreferrer"
              className="pref-creator-card__link"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={profile?.language === 'arabic' ? 'arabic' : 'english'}
        initialTab="preferences"
      />
    </div>
  );
}
