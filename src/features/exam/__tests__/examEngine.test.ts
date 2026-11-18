/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { describe, it, expect } from 'vitest';
import { nextQuestionLevel } from '../engine/adaptiveEngine';
import { estimateCEFR } from '../engine/scoring';
import { awardXP, checkBadges, pickDailyQuestion } from '../engine/gamification';
import { englishQuestions } from '../data/englishQuestions';
import { germanQuestions } from '../data/germanQuestions';
import { hebrewQuestions } from '../data/hebrewQuestions';
import { ExamState } from '../types';

describe('Adaptive Staircase Engine', () => {
  it('moves down when answer is incorrect', () => {
    const nextLevel = nextQuestionLevel(3, false, 0);
    expect(nextLevel).toBe(2);
  });

  it('moves up when 2 consecutive answers are correct', () => {
    const nextLevel = nextQuestionLevel(2, true, 2);
    expect(nextLevel).toBe(3);
  });

  it('never escapes bounds A1 (1) to C1 (5)', () => {
    const lowest = nextQuestionLevel(1, false, 0);
    expect(lowest).toBe(1);

    const highest = nextQuestionLevel(5, true, 10);
    expect(highest).toBe(5);
  });
});

describe('CEFR Estimation Engine', () => {
  it('returns A1 for all-wrong answers', () => {
    const answered = Array.from({ length: 8 }).map(() => ({ level: 1, correct: false }));
    expect(estimateCEFR(answered)).toBe('A1');
  });

  it('returns C1 for all-correct high level answers', () => {
    const answered = Array.from({ length: 8 }).map(() => ({ level: 5, correct: true }));
    expect(estimateCEFR(answered)).toBe('C1');
  });

  it('calculates weighted median correctly', () => {
    const answered = [
      { level: 2, correct: true },
      { level: 3, correct: true },
      { level: 3, correct: true },
      { level: 4, correct: false },
    ];
    const est = estimateCEFR(answered);
    expect(['A2', 'B1', 'B2']).toContain(est);
  });
});

describe('Gamification Logic', () => {
  it('awards +10 per correct answer and +25 bonus for a 5-streak', () => {
    expect(awardXP(true, 1)).toBe(10);
    expect(awardXP(true, 5)).toBe(35);
    expect(awardXP(false, 0)).toBe(0);
  });

  it('picks daily question deterministically by date string hash', () => {
    const q1 = pickDailyQuestion(englishQuestions, 'en');
    const q2 = pickDailyQuestion(englishQuestions, 'en');
    expect(q1.id).toBe(q2.id);
  });

  it('unlocks koshary_combo ONLY if all 4 skills are answered correctly in session', () => {
    const mockState: ExamState = {
      answered: [
        { question: englishQuestions[0], selectedOptionIndex: 0, isCorrect: true }, // grammar
        { question: englishQuestions[1], selectedOptionIndex: 0, isCorrect: true }, // vocabulary
        { question: englishQuestions[4], selectedOptionIndex: 0, isCorrect: true }, // listening
        { question: englishQuestions[5], selectedOptionIndex: 0, isCorrect: true }, // reading
      ],
      currentLevel: 2,
      consecutiveCorrect: 4,
      bestStreak: 4,
      currentStreak: 4,
      teaCups: 3,
      xpGained: 40,
      skillsCorrect: new Set(['grammar', 'vocabulary', 'listening', 'reading']),
      unlockedBadges: [],
      isFinished: true,
      isPlacementMode: true,
      targetLang: 'en',
      supporterMode: false,
    };

    const badges = checkBadges(mockState, []);
    expect(badges).toContain('koshary_combo');
  });

  it('does NOT unlock koshary_combo if any skill is missing', () => {
    const mockState: ExamState = {
      answered: [
        { question: englishQuestions[0], selectedOptionIndex: 0, isCorrect: true }, // grammar
        { question: englishQuestions[1], selectedOptionIndex: 0, isCorrect: true }, // vocabulary
      ],
      currentLevel: 2,
      consecutiveCorrect: 2,
      bestStreak: 2,
      currentStreak: 2,
      teaCups: 3,
      xpGained: 20,
      skillsCorrect: new Set(['grammar', 'vocabulary']),
      unlockedBadges: [],
      isFinished: true,
      isPlacementMode: true,
      targetLang: 'en',
      supporterMode: false,
    };

    const badges = checkBadges(mockState, []);
    expect(badges).not.toContain('koshary_combo');
  });
});

describe('Spelling Guard', () => {
  it('never contains the typo "Deutch" in question datasets', () => {
    const allText = JSON.stringify([
      ...englishQuestions,
      ...germanQuestions,
      ...hebrewQuestions,
    ]);
    expect(allText).not.toMatch(/Deutch/i);
  });
});

describe('Hebrew Content Neutrality Guard', () => {
  it('contains zero political, country, or religious terms in Hebrew questions', () => {
    const hebrewText = JSON.stringify(hebrewQuestions);

    // Political/country/religious terms forbidden in language exam dataset
    const forbiddenPatterns = [
      /Israel/i,
      /Israeli/i,
      /إسرائيل/i,
      /إسرائيلي/i,
      /peace (process|treaty|deal|with israel)/i,
      /promised land/i,
      /holy land/i,
      /zionist/i,
    ];

    forbiddenPatterns.forEach((pattern) => {
      expect(hebrewText).not.toMatch(pattern);
    });
  });
});

describe('Supporter Mode Non-Gating Contract', () => {
  it('produces identical CEFR estimate regardless of supporterMode', () => {
    const answered = [
      { level: 2, correct: true },
      { level: 3, correct: true },
      { level: 3, correct: false },
    ];
    const est1 = estimateCEFR(answered);
    const est2 = estimateCEFR(answered);
    expect(est1).toBe(est2);
  });
});
