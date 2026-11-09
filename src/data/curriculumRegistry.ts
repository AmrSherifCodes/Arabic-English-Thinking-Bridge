import { Phase, SourceLanguage, TargetLanguage } from '../types';
import { PHASES_DATA } from './lessons';
import { getGermanPhases } from './curriculum/germanCurriculum';
import { getJapanesePhases } from './curriculum/japaneseCurriculum';
import { getSpanishPhases } from './curriculum/spanishCurriculum';
import { getFrenchPhases } from './curriculum/frenchCurriculum';
import { getItalianPhases } from './curriculum/italianCurriculum';
import { getPortuguesePhases } from './curriculum/portugueseCurriculum';

export function getCurriculum(source: SourceLanguage = 'ar', target: TargetLanguage = 'en'): Phase[] {
  if (target === 'de') {
    return getGermanPhases(source);
  }
  if (target === 'ja') {
    return getJapanesePhases(source);
  }
  if (target === 'es') {
    return getSpanishPhases(source);
  }
  if (target === 'fr') {
    return getFrenchPhases(source);
  }
  if (target === 'it') {
    return getItalianPhases(source);
  }
  if (target === 'pt') {
    return getPortuguesePhases(source);
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

  if (target === 'ar') {
    // Foreign -> Arabic: swap sourceThought and targetSentence
    return PHASES_DATA.map(p => ({
      ...p,
      lessons: p.lessons.map(l => ({
        ...l,
        title: l.titleAr || l.title,
        titleAr: l.title,
        exercises: l.exercises.map(ex => ({
          ...ex,
          sourceThought: ex.englishTarget || ex.targetSentence,
          targetSentence: ex.arabicThought || ex.sourceThought,
        })),
      })),
    }));
  }

  // Fallback for new languages (zh, hi, ru, el) until they have specialized curricula
  if (['zh', 'hi', 'ru', 'el'].includes(target)) {
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
