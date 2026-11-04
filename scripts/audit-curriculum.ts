import { PHASES_DATA } from '../src/data/lessons';

const TOKEN_PATTERN = /[a-z0-9]+(?:['’][a-z0-9]+)*/gi;
const EXPECTED_LEVELS = ['A0', 'A1', 'A2'];
const errors: string[] = [];

function tokens(value: string): string[] {
  return value.toLowerCase().match(TOKEN_PATTERN) ?? [];
}

function fail(level: string, lessonId: string, exerciseIndex: number, message: string): void {
  errors.push(`[${level}] Lesson ${lessonId}, exercise index ${exerciseIndex}: ${message}`);
}

function auditExercise(
  level: string,
  lessonId: string,
  exerciseIndex: number,
  exercise: (typeof PHASES_DATA)[number]['lessons'][number]['exercises'][number]
): void {
  const promptAr = exercise.arabicThought || exercise.sourceThought || '';
  const targetSentence = exercise.targetSentence || exercise.englishTarget || '';

  if (!promptAr.trim()) {
    fail(level, lessonId, exerciseIndex, 'promptAr is empty.');
  }
  if (!targetSentence.trim()) {
    fail(level, lessonId, exerciseIndex, 'targetSentence is empty.');
  }

  const targetTokens = tokens(targetSentence);
  const chips = Array.isArray(exercise.wordChips) ? exercise.wordChips : [];
  if (chips.length === 0) {
    fail(level, lessonId, exerciseIndex, 'wordChips is empty.');
  }

  const availableTokens = chips.flatMap(tokens);
  const availableCounts = new Map<string, number>();
  for (const token of availableTokens) {
    availableCounts.set(token, (availableCounts.get(token) ?? 0) + 1);
  }

  const missingTokens = targetTokens.filter((token) => {
    const count = availableCounts.get(token) ?? 0;
    if (count === 0) return true;
    availableCounts.set(token, count - 1);
    return false;
  });
  if (missingTokens.length > 0) {
    fail(level, lessonId, exerciseIndex, `wordChips cannot form targetSentence; missing: ${missingTokens.join(', ')}.`);
  }

  const breakdownChunks = Array.isArray(exercise.breakdownChunks) ? exercise.breakdownChunks : [];
  if (breakdownChunks.length === 0) {
    fail(level, lessonId, exerciseIndex, 'breakdownChunks is empty.');
  }

  const breakdownTokens = breakdownChunks.flatMap((chunk) => tokens(chunk.englishText));
  if (breakdownTokens.length !== targetTokens.length) {
    fail(
      level,
      lessonId,
      exerciseIndex,
      `breakdownChunks contain ${breakdownTokens.length} words but targetSentence contains ${targetTokens.length}.`
    );
  }
  if (breakdownTokens.some((token, index) => token !== targetTokens[index])) {
    fail(level, lessonId, exerciseIndex, 'breakdownChunks do not reproduce targetSentence in order.');
  }

}

let lessonCount = 0;
let exerciseCount = 0;
const seenLessonIds = new Set<string>();
const seenLessonNumbers = new Set<number>();

for (const phase of PHASES_DATA) {
  for (const lesson of phase.lessons) {
    lessonCount += 1;
    if (seenLessonIds.has(lesson.id)) {
      fail(phase.level, lesson.id, 0, 'lesson ID is duplicated.');
    }
    if (seenLessonNumbers.has(lesson.number)) {
      fail(phase.level, lesson.id, 0, `lesson number ${lesson.number} is duplicated.`);
    }
    seenLessonIds.add(lesson.id);
    seenLessonNumbers.add(lesson.number);

    const expectedLevel = EXPECTED_LEVELS[Math.floor((lesson.number - 1) / 9)];
    if (!expectedLevel) {
      fail(phase.level, lesson.id, 0, `lesson number ${lesson.number} has no A0/A1/A2 mapping.`);
      continue;
    }

    if (lesson.phaseLevel !== expectedLevel) {
      fail(expectedLevel, lesson.id, 0, `lesson phaseLevel is ${lesson.phaseLevel}, expected ${expectedLevel}.`);
    }

    for (const [exerciseIndex, exercise] of lesson.exercises.entries()) {
      auditExercise(expectedLevel, lesson.id, exerciseIndex, exercise);
      exerciseCount += 1;
    }
  }
}

if (lessonCount !== 27 || exerciseCount !== 81) {
  errors.push(`Curriculum must contain 27 lessons and 81 exercises; found ${lessonCount} lessons and ${exerciseCount} exercises.`);
}

if (errors.length > 0) {
  throw new Error(`Curriculum audit failed:\n${errors.join('\n')}`);
}

console.log(`Curriculum audit passed: ${lessonCount} lessons and ${exerciseCount} exercises across A0, A1, and A2.`);
