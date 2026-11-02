export type PreferenceType = 'toggle' | 'select' | 'slider' | 'text';
export type PreferenceCategory = 'audio' | 'pedagogy' | 'system' | 'advanced';

export interface PreferenceOption {
  label: string;
  labelAr?: string;
  value: string | number;
}

interface Base {
  id: string;
  category: PreferenceCategory;
  labelKey: string;
  labelAr?: string;
  descriptionKey?: string;
}

export interface ToggleField extends Base {
  type: 'toggle';
  default: boolean;
}

export interface SelectField extends Base {
  type: 'select';
  default: string | number;
  options: PreferenceOption[];
}

export interface SliderField extends Base {
  type: 'slider';
  default: number;
  min: number;
  max: number;
  step: number;
}

export interface TextField extends Base {
  type: 'text';
  default: string;
  placeholder?: string;
  secret?: boolean;
}

export type PreferenceField = ToggleField | SelectField | SliderField | TextField;

export const SETTINGS_SCHEMA: readonly PreferenceField[] = [
  {
    id: 'englishVoice',
    type: 'select',
    category: 'audio',
    labelKey: 'English Voice',
    labelAr: 'الصوت الإنجليزي',
    default: 'en-US-AvaNeural',
    options: [
      { label: 'US English — Ava (Neural)', labelAr: 'إنجليزية أمريكية — آفا (طبيعي)', value: 'en-US-AvaNeural' },
      { label: 'British English — Sonia (Neural)', labelAr: 'إنجليزية بريطانية — سونيا (طبيعي)', value: 'en-GB-SoniaNeural' },
    ],
  },
  {
    id: 'voiceModel',
    type: 'select',
    category: 'audio',
    labelKey: 'Arabic Voice (Egyptian)',
    labelAr: 'الصوت العربي (المصري)',
    default: 'ar-EG-SalmaNeural',
    options: [
      { label: 'Egyptian Arabic — Salma (Neural)', labelAr: 'عربي مصري — سلمى (طبيعي)', value: 'ar-EG-SalmaNeural' },
      { label: 'Saudi Arabic — Hamed (Neural)', labelAr: 'عربي سعودي — حامد (طبيعي)', value: 'ar-SA-HamedNeural' },
    ],
  },
  {
    id: 'speechRate',
    type: 'slider',
    category: 'audio',
    labelKey: 'Speaking Speed',
    labelAr: 'سرعة النطق',
    default: 1.0,
    min: 0.7,
    max: 1.5,
    step: 0.1,
  },
  {
    id: 'autoListen',
    type: 'toggle',
    category: 'audio',
    labelKey: 'Auto-Listen after AI speaks',
    labelAr: 'الاستماع التلقائي بعد حديث المعلم',
    default: true,
  },
  {
    id: 'dialect',
    type: 'select',
    category: 'pedagogy',
    labelKey: 'Target Dialect',
    labelAr: 'اللهجة المستهدفة في القاموس',
    default: 'egyptian',
    options: [
      { label: 'Egyptian Arabic (Ammiya)', labelAr: 'العامية المصرية (Ammiya)', value: 'egyptian' },
      { label: 'Modern Standard Arabic (Fusha)', labelAr: 'العربية الفصحى (Fusha)', value: 'msa' },
    ],
  },
  {
    id: 'level',
    type: 'select',
    category: 'pedagogy',
    labelKey: 'Proficiency Level',
    labelAr: 'مستوى صعوبة الكلمات',
    default: 'beginner',
    options: [
      { label: 'Beginner (A1–A2)', labelAr: 'مبتدئ (A1–A2)', value: 'beginner' },
      { label: 'Intermediate (B1–B2)', labelAr: 'متوسط (B1–B2)', value: 'intermediate' },
      { label: 'Advanced (C1)', labelAr: 'متقدم (C1)', value: 'advanced' },
    ],
  },
  {
    id: 'goal',
    type: 'select',
    category: 'pedagogy',
    labelKey: 'Vocabulary Situation / Context',
    labelAr: 'سياق الكلمات والمواقف اليومية',
    default: 'general',
    options: [
      { label: 'General / Academic (Student)', labelAr: 'عام وأكاديمي (مواقف الطلاب)', value: 'general' },
      { label: 'Work (Call Center & Business)', labelAr: 'العمل (كول سنتر وشركات)', value: 'work' },
      { label: 'Travel (Public Matters & Streets)', labelAr: 'السفر (معاملات ومواقف عامة)', value: 'travel' },
    ],
  },
  {
    id: 'hapticsEnabled',
    type: 'toggle',
    category: 'system',
    labelKey: 'Haptic Feedback',
    labelAr: 'الاهتزاز التفاعلي (الهابتكس)',
    default: true,
  },
  {
    id: 'theme',
    type: 'select',
    category: 'system',
    labelKey: 'Theme',
    labelAr: 'المظهر',
    default: 'system',
    options: [
      { label: 'System', labelAr: 'النظام الافتراضي', value: 'system' },
      { label: 'Light', labelAr: 'فاتح', value: 'light' },
      { label: 'Dark', labelAr: 'داكن', value: 'dark' },
    ],
  },
];

export const CATEGORY_LABELS: Record<PreferenceCategory, string> = {
  audio: 'Audio & Voice',
  pedagogy: 'Dictionary & Curriculum',
  system: 'System',
  advanced: 'Advanced',
};

export const CATEGORY_LABELS_AR: Record<PreferenceCategory, string> = {
  audio: 'الصوت والمحادثة',
  pedagogy: 'القاموس والمسار اللغوي (+10,000 كلمة)',
  system: 'إعدادات النظام',
  advanced: 'متقدم',
};
