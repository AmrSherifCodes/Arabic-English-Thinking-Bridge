import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LESSONS } from '../data/lessons';
import {
  getLessonRelevanceScore,
  isPriorityLessonForProfile,
  getProfileTrackInfo,
  getAdaptiveRecommendation,
  mixRetentionIntoDueQueue
} from './adaptiveCurriculum';
import { DEFAULT_PROGRESS } from './storage';
import type { UserProfile } from '../types';

test('adaptiveCurriculum prioritizes chemistry & academic lessons', () => {
  const chemProfile: UserProfile = {
    name: 'Amr',
    goal: 'academic',
    learningStyle: 'visual',
    focusArea: 'chemistry',
    language: 'english',
    dialect: 'egyptian',
    level: 'intermediate'
  };

  const passiveVoiceLesson = ALL_LESSONS.find(l => l.number === 16)!;
  const copulaLesson = ALL_LESSONS.find(l => l.number === 1)!;
  const generalTravelLesson = ALL_LESSONS.find(l => l.number === 8)!;

  const passiveScore = getLessonRelevanceScore(passiveVoiceLesson, chemProfile);
  const copulaScore = getLessonRelevanceScore(copulaLesson, chemProfile);
  const travelScore = getLessonRelevanceScore(generalTravelLesson, chemProfile);

  assert.ok(passiveScore >= 10, `Expected passive voice score >= 10, got ${passiveScore}`);
  assert.ok(copulaScore >= 9, `Expected copula score >= 9, got ${copulaScore}`);
  assert.ok(passiveScore > travelScore, 'Expected passive voice to outrank travel prepositions for chemistry');
  assert.equal(isPriorityLessonForProfile(passiveVoiceLesson, chemProfile), true);

  const trackInfo = getProfileTrackInfo(chemProfile);
  assert.equal(trackInfo.icon, '⚗️');
  assert.match(trackInfo.titleEn, /Chemistry/i);
});

test('adaptiveCurriculum prioritizes travel questions & locations', () => {
  const travelProfile: UserProfile = {
    name: 'Tourist',
    goal: 'travel',
    learningStyle: 'audio',
    focusArea: 'daily-speech',
    language: 'english',
    dialect: 'egyptian',
    level: 'beginner'
  };

  const questionsLesson = ALL_LESSONS.find(l => l.number === 5)!;
  const prepositionsLesson = ALL_LESSONS.find(l => l.number === 8)!;
  const subjunctiveLesson = ALL_LESSONS.find(l => l.number === 21)!;

  const qScore = getLessonRelevanceScore(questionsLesson, travelProfile);
  const prepScore = getLessonRelevanceScore(prepositionsLesson, travelProfile);
  const subjScore = getLessonRelevanceScore(subjunctiveLesson, travelProfile);

  assert.ok(qScore >= 9, `Expected questions score >= 9, got ${qScore}`);
  assert.ok(prepScore >= 10, `Expected prepositions score >= 10, got ${prepScore}`);
  assert.ok(prepScore > subjScore, 'Expected prepositions to outrank formal subjunctive for travel');

  const rec = getAdaptiveRecommendation(DEFAULT_PROGRESS, travelProfile);
  assert.ok(rec.lessonIndex >= 0);
  assert.ok(rec.tag.length > 0);
});

test('adaptiveCurriculum prioritizes deep dive lessons (hedging, connectors, idioms)', () => {
  const academicProfile: UserProfile = {
    name: 'Researcher',
    goal: 'academic',
    focusArea: 'chemistry',
    language: 'english',
    dialect: 'egyptian',
    level: 'advanced'
  };

  const hedgingLesson = ALL_LESSONS.find(l => l.number === 27)!;
  const connectorsLesson = ALL_LESSONS.find(l => l.number === 26)!;
  const idiomsLesson = ALL_LESSONS.find(l => l.number === 25)!;

  assert.ok(getLessonRelevanceScore(hedgingLesson, academicProfile) >= 10);
  assert.ok(getLessonRelevanceScore(connectorsLesson, academicProfile) >= 10);

  const dailyProfile: UserProfile = {
    name: 'Speaker',
    goal: 'general',
    focusArea: 'daily-speech',
    language: 'english',
    dialect: 'egyptian',
    level: 'intermediate'
  };
  assert.ok(getLessonRelevanceScore(idiomsLesson, dailyProfile) >= 10);
});

test('mixRetentionIntoDueQueue samples completed exercises and injects into review queue', () => {
  const progressWithCompleted = {
    ...DEFAULT_PROGRESS,
    completedLessonIds: ['p1-l1', 'p1-l2'],
    completedExerciseIds: ['ex-1-1-1', 'ex-1-1-2', 'ex-1-1-3', 'ex-1-2-1']
  };

  const emptyQueue: string[] = [];
  const mixed = mixRetentionIntoDueQueue(emptyQueue, progressWithCompleted, 2);
  assert.equal(mixed.length, 2, 'Should inject 2 retention exercises when queue is empty');
  assert.ok(mixed.every(id => id.startsWith('ex-1-')));

  const existingQueue = ['card-a', 'card-b', 'card-c'];
  const mixedExisting = mixRetentionIntoDueQueue(existingQueue, progressWithCompleted, 2);
  assert.equal(mixedExisting.length, 5, 'Should mix 2 retention exercises into existing 3 cards');
  assert.ok(mixedExisting.includes('card-a'));
  assert.ok(mixedExisting.includes('card-b'));
  assert.ok(mixedExisting.includes('card-c'));
});

test('adaptiveCurriculum factors age into lesson priority', () => {
  const youngProfile: UserProfile = {
    name: 'Young Learner',
    goal: 'general',
    age: 10,
    level: 'kids',
    language: 'english',
    dialect: 'egyptian'
  };

  const adultProfile: UserProfile = {
    name: 'Adult Learner',
    goal: 'general',
    age: 30,
    level: 'career',
    language: 'english',
    dialect: 'egyptian'
  };

  const foundationalLesson = ALL_LESSONS.find(l => l.number === 1)!;
  const reportedSpeechLesson = ALL_LESSONS.find(l => l.number === 18)!;

  const youngFoundational = getLessonRelevanceScore(foundationalLesson, youngProfile);
  const adultFoundational = getLessonRelevanceScore(foundationalLesson, adultProfile);
  const adultReported = getLessonRelevanceScore(reportedSpeechLesson, adultProfile);

  assert.ok(youngFoundational > adultFoundational, 'Younger profile should have higher priority for foundational lesson 1');
  assert.ok(adultReported > youngFoundational - 5, 'Adult profile factors higher register workplace/reported speech structure');
});

test('getUserAgeGroup safely handles null, string, number, and missing age inputs', async () => {
  const { getUserAgeGroup } = await import('./adaptiveCurriculum');

  assert.equal(getUserAgeGroup(null), 'adult');
  assert.equal(getUserAgeGroup(undefined), 'adult');
  assert.equal(getUserAgeGroup({ age: 10 } as any), 'child');
  assert.equal(getUserAgeGroup({ age: '15' } as any), 'teen');
  assert.equal(getUserAgeGroup({ age: '25' } as any), 'adult');
  assert.equal(getUserAgeGroup({ age: 'invalid' as any, ageBand: '4-11' } as any), 'child');
});




