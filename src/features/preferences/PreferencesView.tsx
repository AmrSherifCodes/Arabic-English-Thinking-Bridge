import React, { useState, useMemo, useRef } from 'react';
import { Youtube, Download, Upload, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
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
  const { values, set, reset, schema } = usePreferences();
  const isArabic = profile?.language === 'arabic';

  const vaultAudit = useMemo(() => {
    return progress ? getVaultAuditSnapshot(progress) : null;
  }, [progress]);

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
          <h1>{isArabic ? 'الإعدادات' : 'Preferences'}</h1>
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
      <div className="pref-body">
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
            <a
              href="https://www.patreon.com/c/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="pref-creator-card__link"
            >
              Patreon
            </a>
            <a
              href="https://x.com/SciAmrSherif"
              target="_blank"
              rel="noopener noreferrer"
              className="pref-creator-card__link"
            >
              X
            </a>
            <a
              href="mailto:amrsherifbusiness@gmail.com"
              className="pref-creator-card__link"
            >
              Email
            </a>
          </div>
        </div>

        <button type="button" className="pref-reset" onClick={reset}>
          {isArabic ? '↺ استعادة الإعدادات الافتراضية' : '↺ Reset to defaults'}
        </button>
      </div>

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={isArabic ? 'arabic' : 'english'}
        initialTab="preferences"
      />
    </div>
  );
}
