import { Exercise } from '../types';

/**
 * Normalizes English learner input for comparison:
 * - Lowercases
 * - Standardizes curly apostrophes
 * - Expands common contractions so both contracted and full forms match seamlessly
 * - Strips punctuation and extra whitespace
 */
export function normalizeSentence(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bshan't\b/g, 'shall not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    .replace(/'d\b/g, ' would')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips apostrophes for loose comparison
 */
export function stripApostrophes(str: string): string {
  return normalizeSentence(str).replace(/'/g, '');
}

/**
 * Checks if a user's answer matches the primary target or any acceptable alternative
 */
export function checkAnswerMatch(userInput: string, exercise: Exercise): { isCorrect: boolean; matchedTarget?: string } {
  const normInput = normalizeSentence(userInput);
  const strippedInput = stripApostrophes(userInput);
  if (!normInput) return { isCorrect: false };

  const allValid = [exercise.englishTarget, ...(exercise.acceptableAlternatives || [])];
  for (const candidate of allValid) {
    if (normInput === normalizeSentence(candidate) || strippedInput === stripApostrophes(candidate)) {
      return { isCorrect: true, matchedTarget: candidate };
    }
  }

  return { isCorrect: false };
}

/**
 * Diagnoses the specific Arabic-speaker cognitive interference habit
 * when the learner's construction does not match the target.
 */
export function diagnoseArabicInterference(userInput: string, exercise: Exercise): string {
  const normInput = normalizeSentence(userInput);
  const inputWords = normInput.split(' ').map(w => w.replace(/'/g, '')).filter(Boolean);
  const targetWords = normalizeSentence(exercise.englishTarget).split(' ').map(w => w.replace(/'/g, ''));

  if (exercise.specificMisconceptions && exercise.specificMisconceptions.length > 0) {
    for (const misc of exercise.specificMisconceptions) {
      try {
        const regex = new RegExp(misc.pattern, 'i');
        if (regex.test(userInput) || regex.test(normInput)) {
          return misc.diagnosis;
        }
      } catch {
        if (normInput.includes(normalizeSentence(misc.pattern))) {
          return misc.diagnosis;
        }
      }
    }
  }

  const copulas = ['is', 'are', 'am', 'was', 'were', 'hes', 'shes', 'theyre', 'weve', 'im', 'youre'];
  const targetHasCopula = targetWords.some(w => copulas.includes(w));
  const inputHasCopula = inputWords.some(w => copulas.includes(w));
  if (targetHasCopula && !inputHasCopula) {
    return 'Remember, English always needs a verb even when Arabic uses a nominal sentence (الجملة الاسمية). Which form of "to be" links the subject to the rest of the thought?';
  }

  const auxiliaries = ['do', 'does', 'did', 'dont', 'doesnt', 'didnt'];
  const targetHasAux = targetWords.some(w => auxiliaries.includes(w));
  const inputHasAux = inputWords.some(w => auxiliaries.includes(w));
  if (targetHasAux && !inputHasAux) {
    return 'Arabic negates with "لا" and asks questions with "هل" directly. English needs a helper verb (do / does / did) to carry the negative or question.';
  }

  const targetHasIndefinite = targetWords.some(w => w === 'a' || w === 'an');
  const inputHasIndefinite = inputWords.some(w => w === 'a' || w === 'an');
  if (targetHasIndefinite && !inputHasIndefinite) {
    return 'Arabic has no separate indefinite article for "a / an". In English, a singular countable noun needs "a" or "an" in front of it.';
  }

  return exercise.habitHint || 'Not quite yet. Compare your sentence with the Arabic thought: is every piece of meaning in the order Subject → Verb → Object?';
}

export function calculateUpdatedStreak(lastActiveDate: string, currentStreak: number, todayStr: string): number {
  if (!lastActiveDate) return 1;
  if (lastActiveDate === todayStr) return currentStreak || 1;

  const lastDate = new Date(lastActiveDate);
  const today = new Date(todayStr);
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return (currentStreak || 0) + 1;
  if (diffDays > 1) return 1;
  return currentStreak;
}

export function calculatePhaseCompletion(phaseLessonIds: string[], completedLessonIds: string[]): number {
  if (!phaseLessonIds || phaseLessonIds.length === 0) return 0;
  const count = phaseLessonIds.filter(id => completedLessonIds.includes(id)).length;
  return Math.round((count / phaseLessonIds.length) * 100);
}
