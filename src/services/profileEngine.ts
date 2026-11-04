export type ProfileCefrLevel = 'A0' | 'A1' | 'A2';

export interface UserProfileConfig {
  sourceLang: string;
  targetLang: string;
  goal: string;
  cefrLevel: ProfileCefrLevel;
  domainFocus: string | null;
}

export function generateSmartProfile(
  source: string,
  target: string,
  goal: string,
  level: ProfileCefrLevel
): UserProfileConfig {
  const domainFocus =
    goal === 'tech' || goal === 'corporate'
      ? 'tech'
      : goal === 'travel'
        ? 'travel'
        : null;
  const config: UserProfileConfig = {
    sourceLang: source,
    targetLang: target,
    goal,
    cefrLevel: level,
    domainFocus,
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tb.activeProfileConfig', JSON.stringify(config));
  }

  return config;
}
