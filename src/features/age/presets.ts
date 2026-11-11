export type AgePresetKey = 'kids' | 'teens' | 'adults' | 'seniors';

export interface AgePreset {
  id: AgePresetKey;
  labelAr: string;
  labelEn: string;
  emoji: string;
  ageBand: string;
  fontScale: number;
  cssVars: Record<string, string>;
}

export const AGE_PRESETS: Record<AgePresetKey, AgePreset> = {
  kids: {
    id: 'kids',
    labelAr: 'أطفال (٤-١١)',
    labelEn: 'Kids (4-11)',
    emoji: '🧒',
    ageBand: '4-11',
    fontScale: 1.15,
    cssVars: {
      '--radius-sm': '16px',
      '--radius-md': '24px',
      '--radius-lg': '32px',
    },
  },
  teens: {
    id: 'teens',
    labelAr: 'يافعين (١٢-١٨)',
    labelEn: 'Teens (12-18)',
    emoji: '🎒',
    ageBand: '12-18',
    fontScale: 1.0,
    cssVars: {
      '--radius-sm': '12px',
      '--radius-md': '20px',
      '--radius-lg': '28px',
    },
  },
  adults: {
    id: 'adults',
    labelAr: 'كبار (١٨-٥٠)',
    labelEn: 'Adults (18-50)',
    emoji: '🚀',
    ageBand: '18-50',
    fontScale: 1.0,
    cssVars: {
      '--radius-sm': '12px',
      '--radius-md': '20px',
      '--radius-lg': '28px',
    },
  },
  seniors: {
    id: 'seniors',
    labelAr: 'كبار السن (+٥٠)',
    labelEn: 'Seniors (50+)',
    emoji: '🏛',
    ageBand: '50+',
    fontScale: 1.05,
    cssVars: {
      '--radius-sm': '14px',
      '--radius-md': '22px',
      '--radius-lg': '30px',
    },
  },
};

/**
 * Applies the CSS variables associated with an age preset to document root.
 * Utilizes existing CSS variables in tokens.css without creating a new theme system.
 */
export function applyAgePreset(presetKey: AgePresetKey): void {
  const preset = AGE_PRESETS[presetKey];
  if (!preset || typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(preset.cssVars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}
