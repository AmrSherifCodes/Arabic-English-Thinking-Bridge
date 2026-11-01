import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_SCHEMA, PreferenceField } from './settingsSchema';

const STORAGE_KEY = 'tb.preferences.v1';
type Value = boolean | string | number;
export type PreferenceMap = Record<string, Value>;

function defaults(): PreferenceMap {
  return Object.fromEntries(SETTINGS_SCHEMA.map((f) => [f.id, f.default]));
}

function load(): PreferenceMap {
  const d = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const field of SETTINGS_SCHEMA) {
      const v = parsed[field.id];
      if (v !== undefined && typeof v === typeof field.default) d[field.id] = v as Value;
    }
    return d;
  } catch { return d; }
}

export function usePreferences() {
  const [values, setValues] = useState<PreferenceMap>(load);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch { /* quota */ }
  }, [values]);

  const set = useCallback((id: string, value: Value) =>
    setValues((prev) => ({ ...prev, [id]: value })), []);
  const reset = useCallback(() => setValues(defaults()), []);

  return { values, set, reset, schema: SETTINGS_SCHEMA as readonly PreferenceField[] };
}

