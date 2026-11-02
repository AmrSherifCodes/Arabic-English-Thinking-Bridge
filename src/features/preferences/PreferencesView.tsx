import React, { useMemo } from 'react';
import { CATEGORY_LABELS, CATEGORY_LABELS_AR, PreferenceCategory } from './settingsSchema';
import { usePreferences } from './usePreferences';
import { FieldRenderer } from './FieldRenderer';
import { UserProfile } from '../../types';
import './preferences.css';

interface PreferencesViewProps {
  onBack: () => void;
  profile?: UserProfile | null;
  onSaveProfile?: (profile: UserProfile) => void;
}

export function PreferencesView({ onBack, profile, onSaveProfile }: PreferencesViewProps) {
  const { values, set, reset, schema } = usePreferences();
  const isArabic = profile?.language === 'arabic';

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

  return (
    <div className="pref-screen" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="pref-header">
        <button
          className="pref-back"
          onClick={onBack}
          aria-label={isArabic ? 'رجوع' : 'Back'}
        >
          {isArabic ? '→' : '←'}
        </button>
        <h1>{isArabic ? 'الإعدادات' : 'Preferences'}</h1>
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
        <button type="button" className="pref-reset" onClick={reset}>
          {isArabic ? '↺ استعادة الإعدادات الافتراضية' : '↺ Reset to defaults'}
        </button>
      </div>
    </div>
  );
}
