import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LESSONS } from '../data/lessons';
import {
  getLessonRelevanceScore,
  isPriorityLessonForProfile,
  getProfileTrackInfo,
  getAdaptiveRecommendation
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

