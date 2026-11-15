import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  GlobalTutorBrain,
  runLocalTrainingStep,
  updateCognitiveProfile,
  getDifficultyKnob,
} from './OnlineLearningEngine';

describe('OnlineLearningEngine (PyTorch-Style Cognitive Model)', () => {
  test('initializes default profile correctly', () => {
    const brain = GlobalTutorBrain.getInstance();
    const profile = brain.getProfile();

    assert.equal(typeof profile.avgReactionTime, 'number');
    assert.ok(['Easy', 'Medium', 'Hard'].includes(profile.difficultyLevel));
    assert.ok(profile.hiddenDifficultyMetric >= 0 && profile.hiddenDifficultyMetric <= 1);
    assert.equal(typeof profile.loss, 'number');
  });

  test('updates difficulty knob based on response time and accuracy', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    // Fast and correct answers should increase hidden metric
    for (let i = 0; i < 5; i++) {
      updateCognitiveProfile(1500, true, 'copula');
    }

    const updated = brain.getProfile();
    assert.ok(updated.hiddenDifficultyMetric > 0.5);
    assert.equal(getDifficultyKnob(), 'Hard');
  });

  test('lowers difficulty knob when user struggles with errors', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    // Consecutive errors should lower difficulty metric
    for (let i = 0; i < 6; i++) {
      updateCognitiveProfile(8000, false, 'word_order');
    }

    const updated = brain.getProfile();
    assert.ok(updated.hiddenDifficultyMetric < 0.35);
    assert.equal(getDifficultyKnob(), 'Easy');
  });

  test('runLocalTrainingStep updates neural weights and loss gradient', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    const initialNodes = brain.getBrainMatrixNodes();
    const initialCopulaWeight = initialNodes.find((n) => n.id === 'syntax_copula')?.weight ?? 0.5;

    const result = runLocalTrainingStep('answer_exercise', true, 'syntax_copula', 2000);

    assert.ok(result.epoch > 0);
    assert.equal(typeof result.loss, 'number');

    const updatedNodes = brain.getBrainMatrixNodes();
    const newCopulaWeight = updatedNodes.find((n) => n.id === 'syntax_copula')?.weight ?? 0.5;

    // Weight should increase on correct answer
    assert.ok(newCopulaWeight > initialCopulaWeight);
  });

  test('recordResult handles consecutive errors and scales difficulty to Easy', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    brain.recordResult(false, 4000, 'copula');
    brain.recordResult(false, 4000, 'copula');

    assert.equal(brain.getDifficultyLevel(), 'Easy');
  });

  test('recordResult scales difficulty to Hard on consecutive fast correct answers', () => {
    const brain = GlobalTutorBrain.getInstance();
    brain.resetProfile();

    brain.recordResult(true, 2000, 'copula');
    brain.recordResult(true, 2000, 'copula');
    brain.recordResult(true, 2000, 'copula');

    assert.equal(brain.getDifficultyLevel(), 'Hard');
  });
});

