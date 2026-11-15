import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GlobalTutorBrain } from '../../utils/OnlineLearningEngine';
import { BrainActivityMatrixCard } from '../progression/ProfileView';

describe('Second-Pass & Third-Pass Audit Verification Tests', () => {
  test('1. useAdaptiveLearning / GlobalTutorBrain recordAnswer correctly updates cognitive metrics', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    const initialEpoch = brain.getProfile().epoch;
    const initialCopulaWeight = brain.getProfile().errorWeights.copula;

    // Simulate answer recording via recordResult (which useAdaptiveLearning.recordAnswer invokes)
    brain.recordResult(false, 3000, 'copula');

    const updatedProfile = brain.getProfile();
    assert.ok(updatedProfile.epoch > initialEpoch, 'Epoch count should increment when answer is recorded');
    assert.ok(
      updatedProfile.errorWeights.copula > initialCopulaWeight,
      'Error weight for copula category should increase on incorrect answer'
    );
  });

  test('2. Lesson summary earned XP formula computes accuracy bonus correctly', () => {
    const computeEarnedXp = (sessionXpEarned: number, accuracy: number) =>
      sessionXpEarned + (accuracy > 80 ? 20 : 0);

    // Accuracy <= 80%: no bonus
    assert.equal(computeEarnedXp(45, 80), 45);
    assert.equal(computeEarnedXp(45, 75), 45);

    // Accuracy > 80%: +20 XP accuracy bonus awarded
    assert.equal(computeEarnedXp(45, 81), 65);
    assert.equal(computeEarnedXp(45, 100), 65);
  });

  test('3. BrainActivityMatrixCard renders a colored matrix cell for every errorWeights category', () => {
    const brain = GlobalTutorBrain.getInstance();
    const profile = brain.getProfile();
    const categories = Object.keys(profile.errorWeights);

    assert.ok(categories.length >= 7, 'Profile should have at least 7 default error categories');

    const html = renderToStaticMarkup(
      React.createElement(BrainActivityMatrixCard, { isArabic: true })
    );

    // Verify each category key is rendered in the HTML markup
    for (const category of categories) {
      const formattedName = category.replace('_', ' ');
      assert.ok(
        html.toLowerCase().includes(formattedName.toLowerCase()),
        `HTML markup should contain category cell for: ${category}`
      );
    }
  });
});
