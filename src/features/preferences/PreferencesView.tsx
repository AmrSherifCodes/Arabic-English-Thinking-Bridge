import React, { useState, useMemo, useRef } from 'react';
import { Youtube, Download, Upload, ShieldCheck, Database, Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { TabTutorialModal } from '../../components/TabTutorialModal';
import { CATEGORY_LABELS, CATEGORY_LABELS_AR, PreferenceCategory } from './settingsSchema';
import { usePreferences } from './usePreferences';
import { FieldRenderer } from './FieldRenderer';
import { UserProfile, UserProgress, SourceLanguage, TargetLanguage } from '../../types';
import { downloadProgressBackup, importUserProgressJson, getVaultAuditSnapshot } from '../../utils/storage';
import { API_BASE_URL } from '../../utils/api';
import { getUserGeminiKey, setUserGeminiKey } from '../../services/geminiLexicon';
import './preferences.css';

interface PreferencesViewProps {
  onBack: () => void;
  profile?: UserProfile | null;
  onSaveProfile?: (profile: UserProfile) => void;
  progress?: UserProgress;
  updateAndSaveProgress?: (updater: (prev: UserProgress) => UserProgress) => void;
  onToast?: (msg: string) => void;
  onOpenReview?: () => void;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
  onOpenLanguageSelector?: () => void;
}

export function PreferencesView({
  onBack,
  profile,
  onSaveProfile,
  progress,
  updateAndSaveProgress,
  onToast,
  onOpenReview,
  sourceLang = 'ar',
  targetLang = 'en',
  onOpenLanguageSelector,
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
    return getUserGeminiKey();
  });

  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; msg: string } | null>(null);

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
    const trimmed = val.trim();
    setCustomGeminiKey(trimmed);
    setTestResult(null);
    if (trimmed) {
      if (!setUserGeminiKey(trimmed)) {
        onToast?.(isArabic ? 'تعذر حفظ المفتاح. تحقق من إعدادات التخزين في المتصفح.' : 'Unable to save the key. Check your browser storage settings.');
        return;
      }
      onToast?.(isArabic ? '✅ تم حفظ مفتاح Gemini الخاص بك!' : '✅ Custom Gemini key saved!');
    } else {
      if (!setUserGeminiKey('')) {
        onToast?.(isArabic ? 'تعذر إزالة المفتاح من التخزين.' : 'Unable to remove the key from browser storage.');
        return;
      }
      onToast?.(isArabic ? '🗑️ تم إزالة المفتاح المخصص' : '🗑️ Custom key removed');
    }
  };

  const handleTestKey = async () => {
    const trimmed = customGeminiKey.trim();
    if (!trimmed) {
      setTestResult({
        status: 'error',
        msg: isArabic ? 'يرجى إدخال مفتاح API أولاً' : 'Please enter an API key first',
      });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': trimmed,
          'X-User-Gemini-Key': trimmed,
        },
        body: JSON.stringify({ operation: 'test-key', userApiKey: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data?.data?.status === 'verified') {
        if (!setUserGeminiKey(trimmed)) {
          setTestResult({
            status: 'error',
            msg: isArabic ? 'تعذر حفظ المفتاح في تخزين المتصفح.' : 'The key was verified but could not be saved in browser storage.',
          });
          return;
        }

        setTestResult({
          status: 'success',
          msg: isArabic
            ? '✅ المفتاح يعمل بنجاح! طلاقة كاملة وبدون حدود مجانية.'
            : '✅ Key verified successfully! Unlimited AI access active.',
        });
        onToast?.(isArabic ? '✅ تم التحقق من المفتاح بنجاح!' : '✅ Key verified successfully!');
      } else {
        throw new Error(data?.error?.message || data?.error || 'Invalid API key');
      }
    } catch {
      setTestResult({
        status: 'error',
        msg: isArabic
          ? '❌ فشل التحقق من المفتاح. تأكد من صحة المفتاح من Google AI Studio.'
          : '❌ Verification failed. Please check your key from Google AI Studio.',
      });
    } finally {
      setIsTestingKey(false);
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
    onToast?.(isArabic ? 'تم حفظ التفضيلات تلقائياً' : 'Preferences saved automatically');
  };

  const handleExportBackup = () => {
    if (!progress) return;
    try {
      downloadProgressBackup(progress);
      onToast?.(isArabic ? '✅ تم تصدير النسخة الاحتياطية بنجاح' : '✅ Progress exported successfully');
    } catch {
      onToast?.(isArabic ? '❌ فشل تصدير البيانات' : '❌ Failed to export backup');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = importUserProgressJson(text);
      if (res.success && res.progress && updateAndSaveProgress) {
        updateAndSaveProgress(() => res.progress!);
        onToast?.(isArabic ? '🎉 تم استعادة تقدمك بنجاح!' : '🎉 Progress restored successfully!');
      } else {
        onToast?.(isArabic ? '❌ الملف غير صالح أو تالف' : '❌ Invalid or corrupted backup file');
      }
    } catch {
      onToast?.(isArabic ? '❌ حدث خطأ أثناء القراءة' : '❌ Failed to read backup file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pref-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="pref-header">
        <button
          onClick={onBack}
          className="pref-header__back-btn"
          aria-label={isArabic ? 'رجوع' : 'Back'}
        >
          ←
        </button>

        <div className="pref-header__title-group">
          <h1 className="pref-header__title">{isArabic ? 'إعدادات التجربة والتفكير' : 'Preferences'}</h1>
          <span className="pref-header__badge">
            {sourceLang === 'ar' ? '🇪🇬' : '🇬🇧'} ➔ {targetLang === 'de' ? '🇩🇪 Deutsch' : targetLang === 'ja' ? '🇯🇵 日本語' : '🇬🇧 English'}
          </span>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="pref-header__guide-btn"
          aria-label={isArabic ? 'دليل الإعدادات' : 'Preferences Guide'}
        >
          ❓
        </button>
      </header>

      <div className="pref-content space-y-6">
        {/* Language Bridge Banner */}
        {onOpenLanguageSelector && (
          <section className="p-4 rounded-3xl bg-surface border border-border shadow-md flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-success block">
                {isArabic ? 'مسار التفكير النشط' : 'Active Thinking Bridge'}
              </span>
              <h3 className="text-sm font-black text-text mt-0.5">
                {sourceLang.toUpperCase()} ➔ {targetLang.toUpperCase()}
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenLanguageSelector}
              className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-text font-bold text-xs hover:border-success transition active:scale-95 shrink-0"
            >
              {isArabic ? 'تغيير اللغات 🌐' : 'Switch Languages 🌐'}
            </button>
          </section>
        )}

        {/* Theme & BYOK Key Card */}
        <section className="pref-section">
          <h2 className="pref-section__title">
            {isArabic ? 'المظهر ومفتاح الذكاء الاصطناعي (BYOK)' : 'Appearance & AI Key'}
          </h2>
          <div className="pref-section__fields space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-2 border border-border">
              <span className="font-bold text-sm text-text">
                {isArabic ? 'نمط المظهر (Theme)' : 'Theme Mode'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    theme === 'dark' ? 'bg-primary text-on-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  🌙 {isArabic ? 'داكن' : 'Dark'}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    theme === 'light' ? 'bg-primary text-on-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  ☀️ {isArabic ? 'فاتح' : 'Light'}
                </button>
              </div>
            </div>

            {/* Custom Gemini API Key (BYOK) */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-text flex items-center gap-1.5">
                  <Key size={16} className="text-primary" />
                  <span>{isArabic ? 'مفتاح Gemini الخاص بك (tb.userApiKey)' : 'Personal Gemini API Key'}</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-success/20 text-success">
                  {isArabic ? 'بلا حدود مجانية' : 'Unlimited Free'}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {isArabic
                  ? 'أدخل مفتاحك المجاني من Google AI Studio للحصول على أولوية استجابة فورية وبدون حدود يومية (يتجاوز الحد المجاني اليومي للـ IP).'
                  : 'Enter your free key from Google AI Studio for priority instant access bypassing daily IP limits.'}
              </p>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
                <input
                  type="password"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 p-2.5 rounded-xl bg-surface border border-border text-text text-sm font-mono focus:outline-none focus:border-success w-full"
                />
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSaveGeminiKey(customGeminiKey)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary text-on-primary font-black text-xs transition active:scale-95 shadow-md"
                  >
                    {isArabic ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    type="button"
                    disabled={isTestingKey || !customGeminiKey.trim()}
                    onClick={handleTestKey}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-success text-text font-bold text-xs transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {isTestingKey ? (
                      <Loader2 size={14} className="animate-spin text-primary" />
                    ) : (
                      <span>{isArabic ? 'اختبار المفتاح 🧪' : 'Test Key 🧪'}</span>
                    )}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    testResult.status === 'success'
                      ? 'bg-success/20 border-success text-success'
                      : 'bg-danger/20 border-danger text-danger'
                  }`}
                >
                  {testResult.status === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <XCircle size={16} className="shrink-0" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
              )}
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
          </div>
        </div>
      </div>

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={profile?.language ?? 'english'}
        initialTab="preferences"
      />
    </div>
  );
}
