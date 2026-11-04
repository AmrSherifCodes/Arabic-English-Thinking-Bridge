import assert from 'node:assert/strict';
import {
  LOCALIZED_A0_LESSONS,
  LOCALIZED_A1_A2_LESSONS,
  buildCourseStructure,
  type LocalizedLessonDefinition,
  type LocalizedTarget,
} from '../src/progression/courseData';

const LANGUAGES: LocalizedTarget[] = ['de', 'es', 'ja', 'fr', 'zh', 'hi', 'ru', 'pt', 'it'];
const LEVELS = ['A0', 'A1', 'A2'] as const;
const ENGLISH_ONLY_TERMS = /\b(?:architect|student)\b/i;
const PUNCTUATION = /[.,!?;:'"“”‘’()[\]{}،؛؟。、「」『』・]/gu;

function normalize(value: string, language: LocalizedTarget): string {
  const withoutPunctuation = value.replace(PUNCTUATION, '');
  return language === 'ja' || language === 'zh'
    ? withoutPunctuation.replace(/\s+/g, '')
    : withoutPunctuation.trim().replace(/\s+/g, ' ');
}

function validateLesson(
  language: LocalizedTarget,
  level: (typeof LEVELS)[number],
  lesson: LocalizedLessonDefinition,
): void {
  const fail = (message: string): never => {
    throw new Error(`[${language}/${level}] Lesson ${lesson.id}: ${message}`);
  };

  if (!lesson.targetSentence.trim()) fail('targetSentence is empty.');
  if (!lesson.promptAr.trim()) fail('promptAr is empty.');
  if (ENGLISH_ONLY_TERMS.test(lesson.targetSentence)) {
    fail(`targetSentence contains English-only term: ${lesson.targetSentence}`);
  }
  if (!Array.isArray(lesson.wordChips) || lesson.wordChips.length === 0) {
    fail('wordChips is empty.');
  }

  const reconstructed = normalize(
    lesson.wordChips.join(language === 'ja' || language === 'zh' ? '' : ' '),
    language,
  );
  const target = normalize(lesson.targetSentence, language);
  if (reconstructed !== target) {
    fail(`wordChips reconstruct "${reconstructed}", expected "${target}".`);
  }
}

let lessonCount = 0;
for (const language of LANGUAGES) {
  const advancedLessons = LOCALIZED_A1_A2_LESSONS[language];
  if (!advancedLessons) {
    throw new Error(`[${language}] No localized A1/A2 lesson data was provided.`);
  }

  const lessonsByLevel = {
    A0: LOCALIZED_A0_LESSONS[language],
    A1: advancedLessons.A1,
    A2: advancedLessons.A2,
  };

  for (const level of LEVELS) {
    const lessons = lessonsByLevel[level];
    if (lessons.length === 0) {
      throw new Error(`[${language}/${level}] No localized lessons were provided.`);
    }

    for (const lesson of lessons) {
      validateLesson(language, level, lesson);
      lessonCount += 1;
    }
  }

  const routedStages = buildCourseStructure(language);
  for (const level of LEVELS) {
    const routedSentence = routedStages
      .find((stage) => stage.stage === level)
      ?.units[0]?.lessons[0]?.exercises[0]?.targetSentence;
    const expectedSentence = lessonsByLevel[level][0]?.targetSentence;
    if (!expectedSentence || routedSentence !== expectedSentence) {
      throw new Error(
        `[${language}/${level}] Router returned "${routedSentence ?? ''}", expected localized sentence "${expectedSentence ?? ''}".`,
      );
    }
  }
}

console.log(`Localized curriculum verification passed: ${lessonCount} lessons across all ${LANGUAGES.length} target languages.`);
