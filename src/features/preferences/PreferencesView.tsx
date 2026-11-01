import { useMemo } from 'react';
import { CATEGORY_LABELS, PreferenceCategory } from './settingsSchema';
import { usePreferences } from './usePreferences';
import { FieldRenderer } from './FieldRenderer';
import './preferences.css';

export function PreferencesView({ onBack }: { onBack: () => void }) {
  const { values, set, reset, schema } = usePreferences();

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
    <div className="pref-screen">
      <header className="pref-header">
        <button className="pref-back" onClick={onBack} aria-label="Back">←</button>
        <h1>Preferences</h1>
      </header>
      <div className="pref-body">
        {Array.from(grouped.entries()).map(([cat, fields]) => (
          <section key={cat} className="pref-section">
            <h2 className="pref-section__title">{CATEGORY_LABELS[cat]}</h2>
            <div className="pref-section__fields">
              {fields.map((f) => (
                <FieldRenderer key={f.id} field={f} value={values[f.id]}
                  onChange={(v) => set(f.id, v)} />
              ))}
            </div>
          </section>
        ))}
        <button className="pref-reset" onClick={reset}>Reset to defaults</button>
      </div>
    </div>
  );
}

