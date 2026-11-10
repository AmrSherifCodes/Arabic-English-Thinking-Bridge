import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_SCHEMA, PreferenceField } from './settingsSchema';
import type { LanguageCode, FocusArea, LearningStyle } from '../../progression/profileMatcherEngine';
import type { CEFRLevel } from '../../progression/cefrSorter';

export type PedagogicalStage =
  | 'kg_kids'
  | 'elementary'
  | 'prep_school'
  | 'high_school'
  | 'university'
  | 'everyday_street';

export type HighSchoolTrack = 'thanawiya' | 'igcse' | 'american';

export function computePedagogicalStage(age: number, isStudent: boolean): PedagogicalStage {
  if (age <= 6) return 'kg_kids';
  if (age <= 11) return 'elementary';
  if (age <= 14) return 'prep_school';
  if (age <= 18) return 'high_school';
  if (isStudent) return 'university';
  return 'everyday_street';
}

const STORAGE_KEY = 'tb.preferences.v1';
type Value = boolean | string | number | object;
export type PreferenceMap = Record<string, Value>;

export interface ExtendedPreferences {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  knownLanguages: Partial<Record<LanguageCode, number>>;
  challengeAppetite: number; // 0..1
  dailyMinutes: number;
  preferredStyle: LearningStyle;
  focusArea: FocusArea;
  currentStage: CEFRLevel;
  isStudent: boolean;
  age: number;
  computedStage: PedagogicalStage;
  highSchoolTrack?: HighSchoolTrack;
}

const DEFAULT_EXTENDED_PREFS: ExtendedPreferences = {
  sourceLang: 'ar',
  targetLang: 'en',
  knownLanguages: { ar: 1.0 },
  challengeAppetite: 0.5,
  dailyMinutes: 15,
  preferredStyle: 'thinking-bridge',
  focusArea: 'general',
  currentStage: 'A1',
  isStudent: false,
  age: 22,
  computedStage: 'everyday_street',
  highSchoolTrack: 'thanawiya',
};

function defaults(): PreferenceMap {
  const d = Object.fromEntries(SETTINGS_SCHEMA.map((f) => [f.id, f.default]));
  return { ...d, ...DEFAULT_EXTENDED_PREFS };
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
    // Migration of multi-language extended preferences
    if (typeof parsed.sourceLang === 'string') d.sourceLang = parsed.sourceLang;
    if (typeof parsed.targetLang === 'string') d.targetLang = parsed.targetLang;
    if (typeof parsed.challengeAppetite === 'number') d.challengeAppetite = parsed.challengeAppetite;
    if (typeof parsed.dailyMinutes === 'number') d.dailyMinutes = parsed.dailyMinutes;
    if (typeof parsed.preferredStyle === 'string') d.preferredStyle = parsed.preferredStyle;
    if (typeof parsed.focusArea === 'string') d.focusArea = parsed.focusArea;
    if (typeof parsed.currentStage === 'string') d.currentStage = parsed.currentStage;
    if (typeof parsed.isStudent === 'boolean') d.isStudent = parsed.isStudent;
    if (typeof parsed.age === 'number') d.age = parsed.age;
    if (typeof parsed.highSchoolTrack === 'string') d.highSchoolTrack = parsed.highSchoolTrack;
    const computed = computePedagogicalStage(
      typeof d.age === 'number' ? d.age : 22,
      d.isStudent === true
    );
    d.computedStage = computed;
    if (parsed.knownLanguages && typeof parsed.knownLanguages === 'object') {
      d.knownLanguages = parsed.knownLanguages as Value;
    }
    return d;
  } catch {
    return d;
  }
}

export function usePreferences() {
  const [values, setValues] = useState<PreferenceMap>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      if (values.sourceLang && typeof values.sourceLang === 'string') {
        localStorage.setItem('tb.sourceLang', values.sourceLang);
      }
      if (values.targetLang && typeof values.targetLang === 'string') {
        localStorage.setItem('tb.targetLang', values.targetLang);
      }
    } catch {
      /* quota */
    }
  }, [values]);

  const set = useCallback((id: string, value: Value) =>
    setValues((prev) => ({ ...prev, [id]: value })), []);
  const reset = useCallback(() => setValues(defaults()), []);

  return { values, set, reset, schema: SETTINGS_SCHEMA as readonly PreferenceField[] };
}
