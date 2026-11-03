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

  // Fallback for new languages (es, fr, zh, hi, ru, pt, it) until they have specialized curricula
  if (['es', 'fr', 'zh', 'hi', 'ru', 'pt', 'it'].includes(target)) {
     // Return a generic mapped structure to prevent crashing
     return PHASES_DATA.map(p => ({
      ...p,
      lessons: p.lessons.map(l => ({
        ...l,
        title: `${l.title} (AI Generative)`,
        exercises: l.exercises.map(ex => ({
          ...ex,
          sourceThought: source === 'en' ? ex.englishTarget : ex.arabicThought,
          targetSentence: ex.englishTarget, // AI will map this in Voice/Flashcards
        }))
      }))
    }));
  }

  // Default: Arabic -> English (canonical PHASES_DATA)
  return PHASES_DATA;
}

