import { Phase, SourceLanguage, TargetLanguage } from '../types';
import { PHASES_DATA } from './lessons';
import { getGermanPhases } from './curriculum/germanCurriculum';
import { getJapanesePhases } from './curriculum/japaneseCurriculum';

export function getCurriculum(source: SourceLanguage = 'ar', target: TargetLanguage = 'en'): Phase[] {
  if (target === 'de') {
    return getGermanPhases(source);
  }
  if (target === 'ja') {
    return getJapanesePhases(source);
  }
  if (source === 'en' && target === 'en') {
    // English-to-English advanced immersion: adapt PHASES_DATA
    return PHASES_DATA.map(p => ({
      ...p,
      lessons: p.lessons.map(l => ({
        ...l,
        exercises: l.exercises.map(ex => ({
          ...ex,
          sourceThought: ex.arabicThought,
          targetSentence: ex.englishTarget
        }))
      }))
    }));
  }

  // Default: Arabic -> English (canonical PHASES_DATA)
  return PHASES_DATA;
}
