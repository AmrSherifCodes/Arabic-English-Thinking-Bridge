export type PreferenceType = 'toggle' | 'select' | 'slider' | 'text';
export type PreferenceCategory = 'audio' | 'pedagogy' | 'system' | 'advanced';

export interface PreferenceOption { label: string; value: string | number; }

interface Base { id: string; category: PreferenceCategory; labelKey: string; descriptionKey?: string; }
export interface ToggleField extends Base { type: 'toggle'; default: boolean; }
export interface SelectField extends Base { type: 'select'; default: string | number; options: PreferenceOption[]; }
export interface SliderField extends Base { type: 'slider'; default: number; min: number; max: number; step: number; }
export interface TextField   extends Base { type: 'text';   default: string; placeholder?: string; secret?: boolean; }
export type PreferenceField = ToggleField | SelectField | SliderField | TextField;

export const SETTINGS_SCHEMA: readonly PreferenceField[] = [
  { id: 'voiceModel', type: 'select', category: 'audio', labelKey: 'AI Voice Language', default: 'ar-EG-SalmaNeural', options: [
    { label: 'Egyptian Arabic — Salma (Neural)', value: 'ar-EG-SalmaNeural' },
    { label: 'US English — Ava (Neural)',        value: 'en-US-AvaNeural' },
    { label: 'British English — Sonia (Neural)', value: 'en-GB-SoniaNeural' },
  ]},
  { id: 'speechRate',    type: 'slider', category: 'audio', labelKey: 'Speaking Speed',       default: 1.0, min: 0.7, max: 1.5, step: 0.1 },
  { id: 'autoListen',    type: 'toggle', category: 'audio', labelKey: 'Auto-Listen after AI speaks', default: true },
  { id: 'hapticsEnabled',type: 'toggle', category: 'system',labelKey: 'Haptic Feedback',       default: true },
  { id: 'theme',         type: 'select', category: 'system',labelKey: 'Theme', default: 'system', options: [
    { label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' },
  ]},
];

export const CATEGORY_LABELS: Record<PreferenceCategory, string> = {
  audio: 'Audio & Voice',
  pedagogy: 'Learning',
  system: 'System',
  advanced: 'Advanced',
};

