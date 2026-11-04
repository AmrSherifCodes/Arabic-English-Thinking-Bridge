/**
 * src/progression/profileMatcherEngine.ts
 *
 * THINKING BRIDGE — MULTI-LANGUAGE PROFILE COMBINATORICS & RANKING ENGINE
 */

import { assignCEFRLevels, type CEFRLevel } from './cefrSorter';

export type LanguageCode =
  | 'en'  // English
  | 'ar'  // Arabic (MSA)
  | 'arz' // Egyptian Arabic
  | 'apc' // Levantine Arabic
  | 'afb' // Gulf Arabic
  | 'ary' // Moroccan Darija
  | 'de'  // German
  | 'ja'  // Japanese
  | 'es'  // Spanish
  | 'fr'  // French
  | 'it'  // Italian
  | 'pt'  // Portuguese
  | 'ru'  // Russian
  | 'zh'  // Chinese (Mandarin)
  | 'hi'  // Hindi
  | 'el'; // Greek

export type SyntaxOrder = 'SVO' | 'SOV' | 'VSO' | 'FREE';
export type ScriptFamily = 'Latin' | 'Arabic' | 'Cyrillic' | 'HanKana' | 'Hanzi' | 'Devanagari' | 'Greek';
export type LanguageFamily =
  | 'Germanic'
  | 'Romance'
  | 'Semitic'
  | 'Slavic'
  | 'Japonic'
  | 'SinoTibetan'
  | 'IndoAryan'
  | 'Hellenic';

export type FocusArea =
  | 'general'
  | 'corporate'
  | 'travel'
  | 'conversation'
  | 'academic'
  | 'dialect-immersion';

export type LearningStyle =
  | 'thinking-bridge'
  | 'voice-first'
  | 'cognate-sprint'
  | 'script-mastery'
  | 'spaced-recall';

export interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  family: LanguageFamily;
  script: ScriptFamily;
  rtl: boolean;
  primarySyntax: SyntaxOrder;
  secondarySyntax: SyntaxOrder;
  morphologicalComplexity: number;
  baseHoursToB2: number;
  macroLanguage?: LanguageCode;
}

export const LANGUAGE_METADATA: Record<LanguageCode, LanguageMetadata> = {
  en: { code: 'en', name: 'English', nativeName: 'English', family: 'Germanic', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'SVO', morphologicalComplexity: 2, baseHoursToB2: 600 },
  ar: { code: 'ar', name: 'Arabic (MSA)', nativeName: 'العربية الفصحى', family: 'Semitic', script: 'Arabic', rtl: true, primarySyntax: 'VSO', secondarySyntax: 'SVO', morphologicalComplexity: 5, baseHoursToB2: 2200 },
  arz: { code: 'arz', name: 'Egyptian Arabic', nativeName: 'مصري', family: 'Semitic', script: 'Arabic', rtl: true, primarySyntax: 'SVO', secondarySyntax: 'VSO', morphologicalComplexity: 4, baseHoursToB2: 1800, macroLanguage: 'ar' },
  apc: { code: 'apc', name: 'Levantine Arabic', nativeName: 'شامي', family: 'Semitic', script: 'Arabic', rtl: true, primarySyntax: 'SVO', secondarySyntax: 'VSO', morphologicalComplexity: 4, baseHoursToB2: 1800, macroLanguage: 'ar' },
  afb: { code: 'afb', name: 'Gulf Arabic', nativeName: 'خليجي', family: 'Semitic', script: 'Arabic', rtl: true, primarySyntax: 'SVO', secondarySyntax: 'VSO', morphologicalComplexity: 4, baseHoursToB2: 1850, macroLanguage: 'ar' },
  ary: { code: 'ary', name: 'Moroccan Arabic (Darija)', nativeName: 'الدارجة المغربية', family: 'Semitic', script: 'Arabic', rtl: true, primarySyntax: 'SVO', secondarySyntax: 'VSO', morphologicalComplexity: 4, baseHoursToB2: 1950, macroLanguage: 'ar' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', family: 'Germanic', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'SOV', morphologicalComplexity: 4, baseHoursToB2: 750 },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', family: 'Japonic', script: 'HanKana', rtl: false, primarySyntax: 'SOV', secondarySyntax: 'SOV', morphologicalComplexity: 4, baseHoursToB2: 2200 },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', family: 'Romance', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'FREE', morphologicalComplexity: 3, baseHoursToB2: 600 },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', family: 'Romance', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'SVO', morphologicalComplexity: 3, baseHoursToB2: 600 },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', family: 'Romance', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'FREE', morphologicalComplexity: 3, baseHoursToB2: 600 },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', family: 'Romance', script: 'Latin', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'SVO', morphologicalComplexity: 3, baseHoursToB2: 600 },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', family: 'Slavic', script: 'Cyrillic', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'FREE', morphologicalComplexity: 5, baseHoursToB2: 1100 },
  zh: { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', family: 'SinoTibetan', script: 'Hanzi', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'SOV', morphologicalComplexity: 1, baseHoursToB2: 2200 },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', family: 'IndoAryan', script: 'Devanagari', rtl: false, primarySyntax: 'SOV', secondarySyntax: 'SOV', morphologicalComplexity: 4, baseHoursToB2: 1100 },
  el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', family: 'Hellenic', script: 'Greek', rtl: false, primarySyntax: 'SVO', secondarySyntax: 'FREE', morphologicalComplexity: 4, baseHoursToB2: 1100 },
};

export const DIALECT_DICTIONARY_QUALITY: Record<string, 'native' | 'msa-backfilled'> = {
  ar: 'native',
  arz: 'msa-backfilled',
  apc: 'msa-backfilled',
  afb: 'msa-backfilled',
  ary: 'msa-backfilled',
};

const ARABIC_DIALECT_COGNATES: Record<string, number> = {
  'ar-arz': 0.72, 'arz-ar': 0.72,
  'ar-apc': 0.68, 'apc-ar': 0.68,
  'ar-afb': 0.66, 'afb-ar': 0.66,
  'ar-ary': 0.52, 'ary-ar': 0.52,
  'arz-apc': 0.70, 'apc-arz': 0.70,
  'arz-afb': 0.62, 'afb-arz': 0.62,
  'arz-ary': 0.48, 'ary-arz': 0.48,
  'apc-afb': 0.74, 'afb-apc': 0.74,
  'apc-ary': 0.50, 'ary-apc': 0.50,
  'afb-ary': 0.46, 'ary-afb': 0.46,
};

export interface LearningProfileConfig {
  id: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  focusArea: FocusArea;
  recommendedStyle: LearningStyle;
  startingStage: CEFRLevel;
  typologicalDistance: number;
  cognateOverlap: number;
  requiresScriptBridge: boolean;
  syntaxBridgeFormula: string;
  estimatedHours: number;
}

export interface UserLearningPreferences {
  nativeLang: LanguageCode;
  knownLanguages?: Partial<Record<LanguageCode, number>>;
  desiredTargetLangs?: LanguageCode[];
  preferredFocusArea: FocusArea;
  preferredStyle: LearningStyle;
  currentStage: CEFRLevel;
  dailyMinutes: number;
  challengeAppetite: number;
  allowLadderingBridge?: boolean;
}

export interface ScoredProfileResult {
  profile: LearningProfileConfig;
  totalScore: number;
  breakdown: {
    languagePairMatch: number;
    typologicalBridgeFit: number;
    focusAreaAlignment: number;
    cognitivePaceFit: number;
    modalityAlignment: number;
  };
  reasoning: string;
}

export function computeCognateOverlap(src: LanguageMetadata, tgt: LanguageMetadata): number {
  if (src.code === tgt.code) return 1.0;

  const pairKey = `${src.code}-${tgt.code}`;
  if (ARABIC_DIALECT_COGNATES[pairKey] !== undefined) {
    return ARABIC_DIALECT_COGNATES[pairKey];
  }

  if ((src.macroLanguage || src.code) === (tgt.macroLanguage || tgt.code)) {
    return 0.60;
  }

  if (src.family === tgt.family) {
    return src.family === 'Romance' ? 0.68 : 0.48;
  }

  const families = new Set([src.family, tgt.family]);
  if (families.has('Germanic') && families.has('Romance')) return 0.38;
  if (families.has('Romance') && families.has('Hellenic')) return 0.24;
  if (families.has('Semitic') && families.has('Romance')) return 0.14;
  if (families.has('Semitic') && families.has('IndoAryan')) return 0.18;
  if (families.has('Japonic') && families.has('SinoTibetan')) return 0.42;

  return 0.06;
}

export function computeTypologicalDistance(src: LanguageMetadata, tgt: LanguageMetadata): number {
  if (src.code === tgt.code) return 0;

  const lexicalDist = 1 - computeCognateOverlap(src, tgt);

  let scriptDist = 0;
  if (src.script !== tgt.script) {
    scriptDist = src.rtl !== tgt.rtl ? 1.0 : 0.75;
    if (
      (src.script === 'HanKana' && tgt.script === 'Hanzi') ||
      (src.script === 'Hanzi' && tgt.script === 'HanKana')
    ) {
      scriptDist = 0.35;
    }
  }

  let syntaxDist = 0;
  if (src.primarySyntax !== tgt.primarySyntax) {
    syntaxDist =
      src.secondarySyntax === tgt.primarySyntax || tgt.secondarySyntax === src.primarySyntax
        ? 0.45
        : 0.9;
  }

  const morphDist = Math.abs(src.morphologicalComplexity - tgt.morphologicalComplexity) / 4;

  const raw = 0.4 * lexicalDist + 0.25 * scriptDist + 0.2 * syntaxDist + 0.15 * morphDist;
  return Number(Math.min(1, Math.max(0, raw)).toFixed(3));
}

function inferOptimalLearningStyle(
  src: LanguageMetadata,
  tgt: LanguageMetadata,
  focusArea: FocusArea,
  distance: number,
  cognates: number
): LearningStyle {
  if (focusArea === 'conversation' || focusArea === 'dialect-immersion') {
    return 'voice-first';
  }
  if (src.script !== tgt.script && distance > 0.65) {
    return 'script-mastery';
  }
  if (cognates >= 0.38) {
    return 'cognate-sprint';
  }
  if (src.primarySyntax !== tgt.primarySyntax || src.rtl !== tgt.rtl) {
    return 'thinking-bridge';
  }
  return 'spaced-recall';
}

export function generateAllLanguageProfiles(
  defaultFocusArea: FocusArea = 'general',
  defaultStage: CEFRLevel = 'A1',
  expandAllFocusAreas = false
): LearningProfileConfig[] {
  const codes = Object.keys(LANGUAGE_METADATA) as LanguageCode[];
  const focusAreas: FocusArea[] = expandAllFocusAreas
    ? ['general', 'corporate', 'travel', 'conversation', 'academic', 'dialect-immersion']
    : [defaultFocusArea];

  const profiles: LearningProfileConfig[] = [];

  for (const srcCode of codes) {
    for (const tgtCode of codes) {
      if (srcCode === tgtCode) continue;

      const src = LANGUAGE_METADATA[srcCode];
      const tgt = LANGUAGE_METADATA[tgtCode];
      const distance = computeTypologicalDistance(src, tgt);
      const cognates = computeCognateOverlap(src, tgt);
      const requiresScriptBridge = src.script !== tgt.script;
      const syntaxBridgeFormula = `${src.primarySyntax}${src.rtl ? ' (RTL)' : ''} → ${tgt.primarySyntax}${tgt.rtl ? ' (RTL)' : ''}`;

      const estimatedHours = Math.round(tgt.baseHoursToB2 * (0.4 + 0.6 * distance));

      for (const focusArea of focusAreas) {
        const recommendedStyle = inferOptimalLearningStyle(src, tgt, focusArea, distance, cognates);
        profiles.push({
          id: `${srcCode}-to-${tgtCode}-${focusArea}`,
          sourceLang: srcCode,
          targetLang: tgtCode,
          focusArea,
          recommendedStyle,
          startingStage: defaultStage,
          typologicalDistance: distance,
          cognateOverlap: Number(cognates.toFixed(3)),
          requiresScriptBridge,
          syntaxBridgeFormula,
          estimatedHours,
        });
      }
    }
  }

  return profiles;
}

export function scoreAndSortProfiles(
  profiles: LearningProfileConfig[],
  prefs: UserLearningPreferences,
  limit = 100
): ScoredProfileResult[] {
  const knownMap: Record<string, number> = {
    [prefs.nativeLang]: 1.0,
    ...(prefs.knownLanguages || {}),
  };

  const desiredSet =
    prefs.desiredTargetLangs && prefs.desiredTargetLangs.length > 0
      ? new Set(prefs.desiredTargetLangs)
      : null;

  const safeMinutes = Math.max(1, Number(prefs.dailyMinutes) || 15);

  const scored: ScoredProfileResult[] = profiles.map((profile) => {
    const srcMeta = LANGUAGE_METADATA[profile.sourceLang];
    const tgtMeta = LANGUAGE_METADATA[profile.targetLang];

    let srcScore = 0;
    if (profile.sourceLang === prefs.nativeLang) {
      srcScore = 100;
    } else if (knownMap[profile.sourceLang] !== undefined && prefs.allowLadderingBridge !== false) {
      srcScore = Math.round(knownMap[profile.sourceLang] * 88);
    } else if (
      srcMeta?.macroLanguage &&
      srcMeta.macroLanguage === LANGUAGE_METADATA[prefs.nativeLang]?.macroLanguage
    ) {
      srcScore = 72;
    } else {
      srcScore = 10;
    }

    let tgtScore = 100;
    if (desiredSet) {
      if (desiredSet.has(profile.targetLang)) {
        tgtScore = 100;
      } else if (tgtMeta?.macroLanguage && desiredSet.has(tgtMeta.macroLanguage)) {
        tgtScore = 82;
      } else {
        tgtScore = 15;
      }
    }
    if ((knownMap[profile.targetLang] || 0) >= 0.9) {
      tgtScore = 5;
    }

    const languagePairMatch = Math.min(100, Math.max(0, Math.round(0.55 * srcScore + 0.45 * tgtScore)));

    const desiredDistance = Math.min(1, Math.max(0, Number(prefs.challengeAppetite) || 0.5));
    const distanceAlignment = 1 - Math.abs(profile.typologicalDistance - desiredDistance);
    const ladderingBonus =
      profile.sourceLang !== prefs.nativeLang && profile.cognateOverlap >= 0.35 ? 15 : 0;
    const typologicalBridgeFit = Math.min(
      100,
      Math.max(0, Math.round((0.65 * distanceAlignment + 0.35 * profile.cognateOverlap) * 100 + ladderingBonus))
    );

    let focusAreaAlignment = 60;
    if (profile.focusArea === prefs.preferredFocusArea) {
      focusAreaAlignment = 100;
    } else if (
      (prefs.preferredFocusArea === 'dialect-immersion' && tgtMeta?.macroLanguage === 'ar') ||
      (prefs.preferredFocusArea === 'conversation' && profile.focusArea === 'travel')
    ) {
      focusAreaAlignment = 85;
    }

    const sixMonthHours = (safeMinutes * 180) / 60;
    const paceRatio = Math.min(1.5, sixMonthHours / Math.max(150, profile.estimatedHours * 0.25));
    const cognitivePaceFit = Math.min(100, Math.max(25, Math.round(paceRatio * 75)));

    let modalityAlignment = 65;
    if (profile.recommendedStyle === prefs.preferredStyle) {
      modalityAlignment = 100;
    } else if (
      prefs.preferredStyle === 'thinking-bridge' &&
      srcMeta?.primarySyntax !== tgtMeta?.primarySyntax
    ) {
      modalityAlignment = 92;
    } else if (prefs.preferredStyle === 'script-mastery' && profile.requiresScriptBridge) {
      modalityAlignment = 95;
    }

    const totalScore = Number(
      Math.min(
        100,
        Math.max(
          0,
          0.35 * languagePairMatch +
            0.25 * typologicalBridgeFit +
            0.15 * focusAreaAlignment +
            0.15 * cognitivePaceFit +
            0.10 * modalityAlignment
        )
      ).toFixed(2)
    );

    const reasoning = `${srcMeta?.name || profile.sourceLang} → ${tgtMeta?.name || profile.targetLang} (${profile.syntaxBridgeFormula}, ${Math.round(
      profile.cognateOverlap * 100
    )}% lexical overlap, ~${profile.estimatedHours}h to B2 via ${profile.recommendedStyle})`;

    return {
      profile: {
        ...profile,
        startingStage: prefs.currentStage,
      },
      totalScore,
      breakdown: {
        languagePairMatch,
        typologicalBridgeFit,
        focusAreaAlignment,
        cognitivePaceFit,
        modalityAlignment,
      },
      reasoning,
    };
  });

  return scored
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}

export interface BridgedLexiconEntry {
  word: string;
  translation: string;
  pivotGloss: string;
  cefr: CEFRLevel;
}

function normalizePivotKey(gloss: string): string[] {
  if (!gloss) return [];
  return gloss
    .toLowerCase()
    .split(/[;,]/)
    .map((s) =>
      s
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/^to\s+/, '')
        .trim()
    )
    .filter((s) => s.length >= 2 && s.length <= 40);
}

export function buildLanguagePairLexicon(
  sourceLang: string,
  targetLang: string,
  sourceRawDict: { word?: string; translation?: string }[] = [],
  targetRawDict: { word?: string; translation?: string }[] = []
): BridgedLexiconEntry[] {
  if (!targetRawDict || targetRawDict.length === 0) {
    console.warn(`[PivotBridge] Target dictionary empty for language: ${targetLang}`);
    return [];
  }

  if (sourceLang === 'en' || !sourceRawDict || sourceRawDict.length === 0) {
    const assigned = assignCEFRLevels(targetRawDict.map(e => ({ word: e.word || '', translation: e.translation || '' })));
    return assigned.map((entry) => ({
      word: entry.word,
      translation: entry.translation,
      pivotGloss: entry.translation,
      cefr: entry.cefr,
    }));
  }

  if (targetLang === 'en') {
    const inverted = sourceRawDict.map((entry) => ({
      word: (entry.translation || '').split(';')[0].trim(),
      translation: entry.word || '',
    }));
    const assigned = assignCEFRLevels(inverted);
    return assigned.map((entry) => ({
      word: entry.word,
      translation: entry.translation,
      pivotGloss: entry.word,
      cefr: entry.cefr,
    }));
  }

  const pivotToSourceWord = new Map<string, string>();
  for (const srcEntry of sourceRawDict) {
    const keys = normalizePivotKey(srcEntry.translation || '');
    for (const k of keys) {
      if (!pivotToSourceWord.has(k)) {
        pivotToSourceWord.set(k, srcEntry.word || '');
      }
    }
  }

  const targetWithCefr = assignCEFRLevels(targetRawDict.map(e => ({ word: e.word || '', translation: e.translation || '' })));
  const bridged: BridgedLexiconEntry[] = [];

  for (const tgtEntry of targetWithCefr) {
    const keys = normalizePivotKey(tgtEntry.translation);
    let matchedSourceWord = '';
    let matchedPivot = '';

    for (const k of keys) {
      const candidate = pivotToSourceWord.get(k);
      if (candidate) {
        matchedSourceWord = candidate;
        matchedPivot = k;
        break;
      }
    }

    if (matchedSourceWord) {
      bridged.push({
        word: tgtEntry.word,
        translation: matchedSourceWord,
        pivotGloss: matchedPivot,
        cefr: tgtEntry.cefr,
      });
    }
  }

  if (bridged.length < 50) {
    console.warn(
      `[PivotBridge] Low bridged lexicon entries (${bridged.length}) for pair: ${sourceLang} -> ${targetLang}`
    );
  }

  return bridged;
}
