export type LearnerTrackId =
  | 'street_starter'
  | 'kg_primary'
  | 'prep_stage'
  | 'thanawiya_igcse'
  | 'uni_career';

export type SupportedLang = 'ar' | 'en' | 'de' | 'tr';

export interface LearnerProfile {
  sourceLanguage: 'ar';
  targetLanguage: 'en' | 'de' | 'tr';
  track: LearnerTrackId;
  schoolSystem?: 'thanawiya' | 'igcse' | 'american';
  fontScale: number;
  autoPlayAudio: boolean;
  xp: number;
  unlockedLevel: number;
}

export const LEARNER_TRACKS: Array<{
  id: LearnerTrackId;
  titleAr: string;
  subtitleAr: string;
  fontScale: number;
  autoPlayAudio: boolean;
}> = [
  {
    id: 'street_starter',
    titleAr: '🌱 من تحت الصفر / للناس كلها',
    subtitleAr: 'نطق وصوتيات أولاً بدون أي مصطلحات نحوية معقدة',
    fontScale: 1.1,
    autoPlayAudio: true,
  },
  {
    id: 'kg_primary',
    titleAr: '🎒 كي جي وابتدائي (٤ - ١١ سنة)',
    subtitleAr: 'حروف وأصوات بسيطة وكلمات البيت والمدرسة',
    fontScale: 1.15,
    autoPlayAudio: true,
  },
  {
    id: 'prep_stage',
    titleAr: '📘 إعدادي (١٢ - ١٤ سنة)',
    subtitleAr: 'تكوين جمل واضحة والأفعال اليومية',
    fontScale: 1.05,
    autoPlayAudio: true,
  },
  {
    id: 'thanawiya_igcse',
    titleAr: '🎓 ثانوي عام / IGCSE / دبلومة أمريكية',
    subtitleAr: 'روابط الأفكار والأزمنة وصياغة المقالات',
    fontScale: 1.0,
    autoPlayAudio: false,
  },
  {
    id: 'uni_career',
    titleAr: '🚀 جامعة، شغل، وسفر (+١٨ سنة)',
    subtitleAr: 'تواصل عملي ومصطلحات تخصصية وطلاقة متقدمة',
    fontScale: 1.0,
    autoPlayAudio: false,
  },
];

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  sourceLanguage: 'ar',
  targetLanguage: 'en',
  track: 'street_starter',
  fontScale: 1.1,
  autoPlayAudio: true,
  xp: 0,
  unlockedLevel: 1,
};
