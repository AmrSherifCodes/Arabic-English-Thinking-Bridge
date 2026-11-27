export type MascotMood =
  | 'welcome'
  | 'pointSettings'
  | 'thinking'
  | 'excited'
  | 'celebrate'
  | 'cheer'
  | 'encourage'
  | 'study'
  | 'proud'
  | 'sleepy';

export interface MascotAsset {
  src: string;
  altEn: string;
  altAr: string;
  trigger: string;
}

export const MASCOT_ASSETS: Record<MascotMood, MascotAsset> = {
  welcome: {
    src: '/assets/mascot/amr-welcome.webp',
    altEn: 'Amr waving hello',
    altAr: 'عمرو يرحب بك',
    trigger: 'First-launch onboarding & home greeting',
  },
  pointSettings: {
    src: '/assets/mascot/amr-point-settings.webp',
    altEn: 'Amr pointing to Settings',
    altAr: 'عمرو يشير إلى الإعدادات',
    trigger: 'Onboarding pointer to Settings customization',
  },
  thinking: {
    src: '/assets/mascot/amr-thinking.webp',
    altEn: 'Amr thinking',
    altAr: 'عمرو يفكر',
    trigger: 'Hint or loading state',
  },
  excited: {
    src: '/assets/mascot/amr-excited.webp',
    altEn: 'Amr excited about a new word',
    altAr: 'عمرو متحمس لكلمة جديدة',
    trigger: 'New-word pop-up flying into Word Bank',
  },
  celebrate: {
    src: '/assets/mascot/amr-celebrate.webp',
    altEn: 'Amr celebrating a combo',
    altAr: 'عمرو يحتفل بسلسلة الإجابات',
    trigger: 'Combo multiplier (x2, x3, x5) & streak',
  },
  cheer: {
    src: '/assets/mascot/amr-cheer.webp',
    altEn: 'Amr cheering with confetti',
    altAr: 'عمرو يحتفل بالمكافأة',
    trigger: 'Milestone chest reward',
  },
  encourage: {
    src: '/assets/mascot/amr-encourage.webp',
    altEn: 'Amr giving gentle encouragement',
    altAr: 'عمرو يشجعك على المحاولة',
    trigger: 'Wrong-answer retry prompt',
  },
  study: {
    src: '/assets/mascot/amr-study.webp',
    altEn: 'Amr taking study notes',
    altAr: 'عمرو يدوّن الملاحظات',
    trigger: 'Active drill & Word Bank study mode',
  },
  proud: {
    src: '/assets/mascot/amr-proud.webp',
    altEn: 'Amr giving a proud thumbs-up',
    altAr: 'عمرو فخور بإتمام الدرس',
    trigger: 'Lesson complete summary',
  },
  sleepy: {
    src: '/assets/mascot/amr-sleepy.webp',
    altEn: 'Amr resting',
    altAr: 'عمرو في وضع الاستراحة',
    trigger: 'Idle state or break reminder',
  },
};
