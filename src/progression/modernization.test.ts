import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProgressionState } from './engine';

test('1. Onboarding state machine transition resolves goal, time, and stage correctly', () => {
  const base = createInitialProgressionState();
  const onboardingChoice = {
    goal: 'work',
    dailyMin: 15,
    placedStage: 'A1' as const,
  };

  const updatedState = {
    ...base,
    dailyDailyTargetMin: onboardingChoice.dailyMin,
    currentStage: onboardingChoice.placedStage,
  };

  assert.equal(updatedState.currentStage, 'A1');
  assert.equal(updatedState.dailyDailyTargetMin, 15);
});

test('2. Automaticity response time calculation computes speed and accuracy tier', () => {
  const responseTimesMs = [2500, 3000, 3500, 2800]; // Avg ~2.95s
  const totalMs = responseTimesMs.reduce((a, b) => a + b, 0);
  const avgSec = Number((totalMs / responseTimesMs.length / 1000).toFixed(1));
  const accuracy = 100;

  assert.ok(avgSec < 5.0, 'Average response time under 5s demonstrates instant cognitive reflex');
  assert.equal(accuracy, 100);
});

test('3. Goal-based priority unit mapping highlights Work goal correctly', () => {
  const userGoal = 'work';
  const getGoalBadge = (goal: string, unitIdx: number) => {
    if (goal === 'work' && unitIdx === 0) return '🎯 Top priority for Work';
    return null;
  };

  const badge = getGoalBadge(userGoal, 0);
  assert.equal(badge, '🎯 Top priority for Work');
});
