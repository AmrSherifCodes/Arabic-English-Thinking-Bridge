/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { ExamQuestion, ExamState, TargetLang } from '../types';

export function awardXP(isCorrect: boolean, currentStreak: number): number {
  if (!isCorrect) return 0;
  let xp = 10;
  if (currentStreak > 0 && currentStreak % 5 === 0) {
    xp += 25; // Streak bonus
  }
  return xp;
}

export function pickDailyQuestion(pool: ExamQuestion[], lang: TargetLang): ExamQuestion {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const filtered = pool.filter((q) => q.lang === lang && (q.cefr === 'A2' || q.cefr === 'B1'));
  const candidatePool = filtered.length > 0 ? filtered : pool.filter((q) => q.lang === lang);

  let hash = 0;
  const seedString = `${today}-${lang}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
  }
  return candidatePool[hash % candidatePool.length];
}

export function checkBadges(state: ExamState, existingBadges: string[]): string[] {
  const unlocked = new Set<string>(existingBadges);

  if (state.answered.length > 0) {
    unlocked.add('first_exam');
  }

  if (state.bestStreak >= 5) {
    unlocked.add('streak_5');
  }

  if (state.bestStreak >= 10) {
    unlocked.add('streak_10');
  }

  if (state.targetLang === 'de' && state.isFinished) {
    unlocked.add('deutsch_rookie');
  }

  if (state.targetLang === 'he' && state.isFinished) {
    unlocked.add('hebrew_rookie');
  }

  // Night owl badge (tested after 10 PM)
  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour < 4) {
    unlocked.add('night_owl');
  }

  // Perfect grammar (all grammar questions answered correctly in session, min 3)
  const grammarQuestions = state.answered.filter((a) => a.question.skill === 'grammar');
  if (grammarQuestions.length >= 3 && grammarQuestions.every((a) => a.isCorrect)) {
    unlocked.add('perfect_grammar');
  }

  // Koshary combo: correct answers across all 4 skills (grammar, vocabulary, reading, listening) in one session
  const correctSkills = new Set(
    state.answered.filter((a) => a.isCorrect).map((a) => a.question.skill)
  );
  if (
    correctSkills.has('grammar') &&
    correctSkills.has('vocabulary') &&
    correctSkills.has('reading') &&
    correctSkills.has('listening')
  ) {
    unlocked.add('koshary_combo');
  }

  return Array.from(unlocked);
}
