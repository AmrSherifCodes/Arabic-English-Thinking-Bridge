import React, { useMemo } from 'react';
import { CATEGORY_LABELS, CATEGORY_LABELS_AR, PreferenceCategory } from './settingsSchema';
import { usePreferences } from './usePreferences';
import { FieldRenderer } from './FieldRenderer';
import { UserProfile } from '../../types';
import './preferences.css';

interface PreferencesViewProps {
  onBack: () => void;
  profile?: UserProfile | null;
}

export function PreferencesView({ onBack, profile }: PreferencesViewProps) {
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
              {fields.map((f) => (
                <FieldRenderer
                  key={f.id}
                  field={f}
                  value={values[f.id]}
                  isArabic={isArabic}
                  onChange={(v) => set(f.id, v)}
                />
              ))}
            </div>
          </section>
        ))}
        <button type="button" className="pref-reset" onClick={reset}>
          {isArabic ? '↺ استعادة الإعدادات الافتراضية' : '↺ Reset to defaults'}
        </button>
      </div>
    </div>
  );
}
