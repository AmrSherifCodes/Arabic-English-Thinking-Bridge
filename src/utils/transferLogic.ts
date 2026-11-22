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
    .replace(/\bcan't\b/g, 'can not')
    .replace(/\bcannot\b/g, 'can not')
    .replace(/\bshan't\b/g, 'shall not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    .replace(/'d\b/g, ' would')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"!؟،؛«»]/g, ' ')
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
 * Normalizes CJK (Japanese Kana/Kanji) by removing spaces and CJK punctuation
 */
export function normalizeCjk(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '')
    .replace(/[、。・「」『』（）！？]/g, '')
    .trim();
}

/**
 * Checks if a user's answer matches the primary target or any acceptable alternative
 */
export function checkAnswerMatch(userInput: string, exercise: Exercise): { isCorrect: boolean; matchedTarget?: string } {
  const normInput = normalizeSentence(userInput);
  const strippedInput = stripApostrophes(userInput);
  const cjkInput = normalizeCjk(userInput);
  if (!normInput && !cjkInput) return { isCorrect: false };

  const allValid = [
    exercise.targetSentence,
    exercise.englishTarget,
    exercise.romajiTarget,
    ...(exercise.acceptableAlternatives || [])
  ].filter(Boolean) as string[];

  for (const candidate of allValid) {
    if (normInput === normalizeSentence(candidate) || strippedInput === stripApostrophes(candidate)) {
      return { isCorrect: true, matchedTarget: candidate };
    }
    if (cjkInput && cjkInput === normalizeCjk(candidate)) {
      return { isCorrect: true, matchedTarget: candidate };
    }
    // German umlaut equivalence (ae <-> ä, oe <-> ö, ue <-> ü, ss <-> ß)
    const normCandidate = normalizeSentence(candidate);
    const deCleanInput = normInput.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/ss/g, 'ß');
    const deCleanCandidate = normCandidate.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/ss/g, 'ß');
    if (deCleanInput === deCleanCandidate) {
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

/**
 * Deterministic, 100% offline L1 Cognitive Interference Coach that diagnoses why a
 * learner made a structural or literal-translation error in English, German, or Turkish.
 */
export function diagnoseL1TransferHint(
  userInput: string,
  targetSentence: string,
  targetLang: string = 'en',
  isArabic: boolean = true
): string | null {
  const normUser = normalizeSentence(userInput);
  const normTarget = normalizeSentence(targetSentence);
  if (!normUser || !normTarget || normUser === normTarget) return null;

  const userWords = normUser.split(' ').filter(Boolean);
  const targetWords = normTarget.split(' ').filter(Boolean);

  if (targetLang === 'en') {
    const prepTraps: Array<{ wrong: RegExp; right: RegExp; ar: string; en: string }> = [
      {
        wrong: /\bafraid from\b/,
        right: /\bafraid of\b/,
        ar: 'حرف الجر الصح مع afraid هو "of" مش "from" (الترجمة الحرفية من "خايف من" بتلخبط).',
        en: 'Use "afraid of" instead of "afraid from" (avoid translating Arabic "من" literally).',
      },
      {
        wrong: /\bmarried (from|with)\b/,
        right: /\bmarried to\b/,
        ar: 'بنقول "married to" مش "married from/with" (متزوج من).',
        en: 'Use "married to" rather than "married from/with".',
      },
      {
        wrong: /\bgood in\b/,
        right: /\bgood at\b/,
        ar: 'مع المهارات والمواد بنقول "good at" مش "good in".',
        en: 'With skills and subjects, English uses "good at" rather than "good in".',
      },
      {
        wrong: /\bdepends from\b/,
        right: /\bdepends on\b/,
        ar: 'الفعل depend بياخد "on" دايماً (depends on)، مش "from".',
        en: '"Depend" always pairs with "on" ("depends on"), never "from".',
      },
    ];

    for (const trap of prepTraps) {
      if (trap.right.test(normTarget) && trap.wrong.test(normUser)) {
        return isArabic ? trap.ar : trap.en;
      }
    }

    if (/\blisten to\b/.test(normTarget) && userWords.includes('listen') && !/\blisten to\b/.test(normUser)) {
      return isArabic
        ? 'الفعل "listen" لازم ييجي بعده "to" قبل المفعول (listen to)، مش زي العربي "أسمع كذا".'
        : '"Listen" requires "to" before its object ("listen to"), unlike Arabic.';
    }

    const copulas = ['am', 'is', 'are', 'was', 'were'];
    const targetHasCopula = targetWords.some((w) => copulas.includes(w));
    const userHasCopula = userWords.some((w) => copulas.includes(w));
    if (targetHasCopula && !userHasCopula) {
      return isArabic
        ? 'في العربي الجملة الاسمية مفهيش فعل ربط ("أنا طالب")، لكن في الإنجليزي لازم وجود (am / is / are / was / were).'
        : 'Arabic nominal sentences omit "to be", but English always requires a linking verb (am / is / are / was / were).';
    }

    const targetHasArticle = targetWords.some((w) => w === 'a' || w === 'an');
    const userHasArticle = userWords.some((w) => w === 'a' || w === 'an');
    if (targetHasArticle && !userHasArticle) {
      return isArabic
        ? 'العربي مفيهوش أداة نكرة مستقلة، لكن في الإنجليزي الاسم المفرد المعدود لازم قبله "a" أو "an".'
        : 'Arabic has no standalone indefinite article; singular countable English nouns need "a" or "an".';
    }

    const auxiliaries = ['do', 'does', 'did'];
    const targetHasAux = targetWords.some((w) => auxiliaries.includes(w));
    const userHasAux = userWords.some((w) => auxiliaries.includes(w));
    if (targetHasAux && !userHasAux) {
      return isArabic
        ? 'في النفي والسؤال بالإنجليزي بنحتاج فعل مساعد (do / does / did) بدل الترجمة المباشرة بـ "لا" أو "هل".'
        : 'English questions and negatives require a helper verb (do / does / did) instead of direct Arabic "لا / هل".';
    }

    const sameMultiset =
      userWords.length === targetWords.length &&
      [...userWords].sort().join('\u0001') === [...targetWords].sort().join('\u0001');
    if (sameMultiset) {
      return isArabic
        ? 'كلماتك صح لكن الترتيب مختلف! الإنجليزي بيمشي بترتيب: الفاعل ← الفعل ← المفعول، والصفة تيجي قبل الاسم.'
        : 'All your words match, just reorder them: English uses Subject → Verb → Object and places adjectives before nouns.';
    }
    return null;
  }

  if (targetLang === 'de') {
    const sameMultiset =
      userWords.length === targetWords.length &&
      [...userWords].sort().join('\u0001') === [...targetWords].sort().join('\u0001');
    if (sameMultiset || userWords.some((w) => targetWords.includes(w))) {
      return isArabic
        ? 'انتبه لقاعدة V2: الفعل المُصرّف يأتي دائماً في المركز الثاني في الجملة الألمانية الخبرية.'
        : 'Remember German V2 word order: the conjugated verb always sits in the second position.';
    }
    return null;
  }

  if (targetLang === 'tr') {
    const sameMultiset =
      userWords.length === targetWords.length &&
      [...userWords].sort().join('\u0001') === [...targetWords].sort().join('\u0001');
    if (sameMultiset || userWords.some((w) => targetWords.includes(w))) {
      return isArabic
        ? 'في التركية (SOV): الفعل يأتي دائماً في نهاية الجملة بعد الفاعل والمفعول.'
        : 'In Turkish (SOV), the verb always comes at the very end of the sentence.';
    }
    return null;
  }

  return null;
}

