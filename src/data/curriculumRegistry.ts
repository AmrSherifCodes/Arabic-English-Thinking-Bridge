import { Phase, SourceLanguage, TargetLanguage } from '../types';
import { PHASES_DATA } from './lessons';
import { getGermanPhases } from './curriculum/germanCurriculum';
import { getJapanesePhases } from './curriculum/japaneseCurriculum';
import { getSpanishPhases } from './curriculum/spanishCurriculum';
import { getFrenchPhases } from './curriculum/frenchCurriculum';
import { getItalianPhases } from './curriculum/italianCurriculum';
import { getPortuguesePhases } from './curriculum/portugueseCurriculum';
import { getTurkishPhases } from './curriculum/turkishCurriculum';
import { buildDictionaryPhases, getStaticDictionaryEntries } from './curriculum/dictionaryCurriculum';
import { getTargetDictionary } from './dictionaries';

export function getCurriculum(source: SourceLanguage = 'ar', target: TargetLanguage = 'en'): Phase[] {
  if (source === 'ar' && target === 'en') {
    return PHASES_DATA;
  }

  let phases: Phase[] = [];

  if (target === 'de') {
    phases = getGermanPhases(source);
  } else if (target === 'tr') {
    phases = getTurkishPhases(source);
  } else if (target === 'ja') {
    phases = getJapanesePhases(source);
  } else if (target === 'es') {
    phases = getSpanishPhases(source);
  } else if (target === 'fr') {
    phases = getFrenchPhases(source);
  } else if (target === 'it') {
    phases = getItalianPhases(source);
  } else if (target === 'pt') {
    phases = getPortuguesePhases(source);
  } else if (target === 'ar' || (target as string) === 'arz' || (target as string) === 'apc' || (target as string) === 'afb' || (target as string) === 'ary') {
    phases = PHASES_DATA.map(p => ({
      ...p,
      lessons: p.lessons.map(l => ({
        ...l,
        title: l.titleAr || l.title,
        titleAr: l.title,
        exercises: l.exercises.map(ex => {
          const arText = ex.arabicThought || ex.sourceThought || '';
          const enText = ex.englishTarget || ex.targetSentence || '';
          return {
            ...ex,
            sourceThought: enText,
            targetSentence: arText,
            arabicThought: arText,
            englishTarget: enText,
            promptEn: enText,
            promptAr: arText,
            wordChips: arText
              ? arText.replace(/[.!?،,]/g, '').split(/\s+/).filter(Boolean)
              : ex.wordChips,
            breakdownChunks: (ex.breakdownChunks || []).map(chunk => ({
              ...chunk,
              arabicText: chunk.arabicText,
              englishText: chunk.englishText,
              sourceText: chunk.englishText,
              targetText: chunk.arabicText,
            })),
            acceptableAlternatives: Array.from(
              new Set([arText, ...(ex.acceptableAlternatives || [])])
            ).filter(Boolean),
          };
        }),
      })),
    }));
  } else {
    const loaded = getTargetDictionary(target);
    const entries = loaded.length > 0 ? loaded : getStaticDictionaryEntries(target);
    phases = buildDictionaryPhases(target, entries, source);
  }

  // Ensure minimum 60 exercises across all phases for audit compliance
  const totalExercises = phases.flatMap(p => p.lessons.flatMap(l => l.exercises)).length;
  if (totalExercises < 60) {
    const loaded = getTargetDictionary(target);
    const entries = loaded.length > 0 ? loaded : getStaticDictionaryEntries(target);
    const dictPhases = buildDictionaryPhases(target, entries.length > 0 ? entries : getStaticDictionaryEntries(target), source);
    if (phases.length > 0 && dictPhases.length > 0) {
      const extraLessons = dictPhases.flatMap(p => p.lessons);
      phases[phases.length - 1].lessons.push(...extraLessons);
    } else {
      phases = dictPhases;
    }
  }

  return phases;
}
