import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSentence,
  checkAnswerMatch,
  diagnoseArabicInterference,
  calculateUpdatedStreak,
  calculatePhaseCompletion
} from './transferLogic';
import { calculateLevelInfo, evaluateBadges, feedbackMessage } from './fx';
import { scoreEnglishVoice } from './audio';
import { Exercise, UserProgress } from '../types';

const mockExercise: Exercise = {
  id: 'ex-1-1',
  arabicThought: 'هو مهندس',
  englishTarget: 'He is an engineer',
  acceptableAlternatives: ["He's an engineer"],
  wordChips: ['He', 'is', 'an', 'engineer', 'a', 'doctor'],
  breakdownChunks: [
    { arabicText: 'هو', englishText: 'He', role: 'subject', explanation: 'Subject pronoun' },
    { arabicText: '— (محذوف)', englishText: 'is', role: 'verb', explanation: 'Copula required in English' },
    { arabicText: 'مهندس', englishText: 'an engineer', role: 'object', explanation: 'Indefinite singular noun requires an' }
  ],
  habitHint: 'Remember that English cannot leave the linking verb implicit.'
};

test('normalizeSentence cleans punctuation, apostrophes, and spacing', () => {
  assert.equal(normalizeSentence("He’s an engineer!"), "he's an engineer");
  assert.equal(normalizeSentence("  He   is an engineer. "), "he is an engineer");
  assert.equal(normalizeSentence("What? Really..."), "what really");
});

test('checkAnswerMatch accepts canonical target and valid contractions', () => {
  const matchTarget = checkAnswerMatch('He is an engineer', mockExercise);
  assert.equal(matchTarget.isCorrect, true);

  const matchAlt = checkAnswerMatch("He's an engineer", mockExercise);
  assert.equal(matchAlt.isCorrect, true);

  const wrong = checkAnswerMatch('He engineer', mockExercise);
  assert.equal(wrong.isCorrect, false);
});

test('diagnoseArabicInterference catches missing copula', () => {
  const diagnosis = diagnoseArabicInterference('He an engineer', mockExercise);
  assert.match(diagnosis, /nominal sentence|الجملة الاسمية|to be|linking verb/i);
});

test('diagnoseArabicInterference catches missing indefinite article', () => {
  const diagnosis = diagnoseArabicInterference('He is engineer', mockExercise);
  assert.match(diagnosis, /tanween|article|indefinite|a or an/i);
});

test('calculateUpdatedStreak handles same-day and consecutive days', () => {
  assert.equal(calculateUpdatedStreak('2026-10-27', 3, '2026-10-28'), 4);
  assert.equal(calculateUpdatedStreak('2026-10-28', 4, '2026-10-28'), 4);
  assert.equal(calculateUpdatedStreak('2026-10-20', 10, '2026-10-28'), 1);
});

test('calculatePhaseCompletion computes correct percentage', () => {
  assert.equal(calculatePhaseCompletion(['l1', 'l2', 'l3', 'l4'], ['l1', 'l2']), 50);
  assert.equal(calculatePhaseCompletion(['l1'], []), 0);
  assert.equal(calculatePhaseCompletion(['l1', 'l2'], ['l1', 'l2']), 100);
});

test('calculateLevelInfo maps score bands to the 5 level names', () => {
  assert.equal(calculateLevelInfo(0).levelName, 'Silent Copula');
  assert.equal(calculateLevelInfo(59).levelName, 'Silent Copula');
  assert.equal(calculateLevelInfo(60).levelName, 'Block Builder');
  assert.equal(calculateLevelInfo(120).levelName, 'Sentence Smith');
  assert.equal(calculateLevelInfo(180).levelName, 'Flow Master');
  assert.equal(calculateLevelInfo(240).levelName, 'Register Pro');
  assert.equal(calculateLevelInfo(999).levelName, 'Register Pro');
});

test('evaluateBadges and feedbackMessage compute badge unlocks and summary text', () => {
  const progress: UserProgress = {
    completedExerciseIds: ['ex-1-1-1'],
    completedLessonIds: ['p1-l1', 'p1-l2'],
    score: 85,
    streak: 5,
    bestStreak: 6,
    soundOn: true,
    askedMentor: true,
    lastActiveDate: '2026-10-28',
    weakSpotCounts: { 'copula-omission': 4, 'article-interference': 2 },
    savedNotes: []
  };

  const badges = evaluateBadges(progress, ['p1-l1', 'p1-l2'], 24);
  const unlockedIds = badges.filter(b => b.unlocked).map(b => b.id);
  assert.deepEqual(unlockedIds, ['first-win', 'streak-5', 'phase-1-done', 'asked-mentor']);

  const msg = feedbackMessage(5, 'Loved the visual chunks!', progress, 24);
  assert.match(msg, /Rating: 5\/5/);
  assert.match(msg, /Lessons done: 2\/24 · Score: 85/);
  assert.match(msg, /Hardest: copula-omission, article-interference/);
});

test('scoreEnglishVoice ranks natural US voices highest', () => {
  const naturalUs = scoreEnglishVoice({ name: 'Microsoft Aria Online (Natural)', lang: 'en-US' });
  const basicGb = scoreEnglishVoice({ name: 'Generic Male', lang: 'en-GB' });
  assert.ok(naturalUs > basicGb);
  assert.equal(naturalUs, 50 + 20 + 10);
});
