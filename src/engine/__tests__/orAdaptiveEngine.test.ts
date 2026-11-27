// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import assert from 'node:assert/strict';
import {
  ALL_SKILL_DIMENSIONS,
  DIAGNOSTIC_ITEMS,
  MAX_PLACEMENT_ITEMS,
  STOP_SIGMA_THRESHOLD,
  calibrateCurriculumGraph,
  computeItemUtility,
  createInitialPlacementSession,
  detectL1WeaknessFromAnswer,
  finalizePlacement,
  fisherInformation,
  fsrsRetrievability,
  getDefaultAdaptiveProfile,
  getTargetedL1MicroDrill,
  irt2plProbability,
  mapLessonsToCurriculumNodes,
  optimizeSessionItems,
  recordExerciseOutcome,
  selectNextDiagnosticItem,
  shouldStopPlacement,
  thetaToCefrBand,
  updatePlacementPosterior,
  type CurriculumNode,
  type LearningCandidateItem,
} from '../orAdaptiveEngine';

// Works seamlessly under both `npm test` (tsx --test / node:test) and `npx vitest run`
type TestRunnerFn = (name: string, fn: () => void | Promise<void>) => unknown;
const runner = process.env.VITEST ? await import('vitest') : await import('node:test');
const describe: TestRunnerFn = runner.describe as TestRunnerFn;
const it: TestRunnerFn = runner.it as TestRunnerFn;

describe('OR Adaptive Engine — 2PL-IRT & Fisher Information CAT', () => {
  it('computes 2PL probability and Fisher Information accurately', () => {
    const pAtMatch = irt2plProbability(0.5, 1.5, 0.5);
    assert.ok(Math.abs(pAtMatch - 0.5) < 1e-9);

    const infoAtMatch = fisherInformation(0.5, 2.0, 0.5);
    // I = a^2 * 0.5 * 0.5 = 4 * 0.25 = 1.0
    assert.ok(Math.abs(infoAtMatch - 1.0) < 1e-9);

    const pHigh = irt2plProbability(2.0, 1.5, -1.0);
    assert.ok(pHigh > 0.98);
  });

  it('maps theta bounds to exact CEFR bands', () => {
    assert.equal(thetaToCefrBand(-2.5), 'Pre-A0');
    assert.equal(thetaToCefrBand(-1.5), 'A0');
    assert.equal(thetaToCefrBand(-0.5), 'A1');
    assert.equal(thetaToCefrBand(0.0), 'A2');
    assert.equal(thetaToCefrBand(0.8), 'B1');
    assert.equal(thetaToCefrBand(1.7), 'B2');
    assert.equal(thetaToCefrBand(2.5), 'C1');
  });

  it('Beginner (all wrong) converges to Pre-A0/A0 and starts at Level 1', () => {
    let session = createInitialPlacementSession(0);

    while (!shouldStopPlacement(session)) {
      const next = selectNextDiagnosticItem(session);
      assert.ok(next, 'Should always find a next diagnostic item');
      session = updatePlacementPosterior(session, next, false, 6500);
    }

    const result = finalizePlacement(session);
    assert.ok(
      result.band === 'Pre-A0' || result.band === 'A0',
      `Expected Pre-A0 or A0 for all-wrong beginner, got ${result.band} (theta=${result.theta})`
    );
    assert.ok(result.itemsAnswered <= MAX_PLACEMENT_ITEMS);
    // All 4 core skill dimensions must be covered
    for (const dim of ALL_SKILL_DIMENSIONS) {
      assert.ok(session.coveredSkills.includes(dim), `Missing skill dimension ${dim}`);
    }

    const sampleNodes = mapLessonsToCurriculumNodes(
      Array.from({ length: 10 }, (_, idx) => ({ id: `a1-lesson-${idx + 1}`, levelId: 'A1' as const })),
      'A1'
    );
    const calibrated = calibrateCurriculumGraph(result.theta, sampleNodes, []);
    assert.equal(calibrated.activeNodeId, 'a1-lesson-1', 'Beginner should start at Level 1');
    assert.equal(calibrated.masteredViaPlacementIds.length, 0, 'Beginner should not fast-forward lessons');
  });

  it('Intermediate (mixed) converges to A2/B1 and auto-fast-forwards A0-A1 nodes', () => {
    let session = createInitialPlacementSession(0);

    // Simulated true ability ~ +0.45: answers correctly when item difficulty <= 0.45
    while (!shouldStopPlacement(session)) {
      const next = selectNextDiagnosticItem(session);
      assert.ok(next);
      const isCorrect = next.difficulty <= 0.45;
      session = updatePlacementPosterior(session, next, isCorrect, isCorrect ? 3800 : 7500);
    }

    const result = finalizePlacement(session);
    assert.ok(
      result.band === 'A2' || result.band === 'B1',
      `Expected A2 or B1 for intermediate learner, got ${result.band} (theta=${result.theta})`
    );
    assert.ok(result.itemsAnswered <= MAX_PLACEMENT_ITEMS);

    // Curriculum spanning A0 (-1.6) through B2 (+1.8)
    const nodes: CurriculumNode[] = [
      { id: 'a0-1', index: 1, difficulty: -1.8, prerequisiteIds: [] },
      { id: 'a0-2', index: 2, difficulty: -1.3, prerequisiteIds: ['a0-1'] },
      { id: 'a1-1', index: 3, difficulty: -0.9, prerequisiteIds: ['a0-2'] },
      { id: 'a1-2', index: 4, difficulty: -0.5, prerequisiteIds: ['a1-1'] },
      { id: 'a2-1', index: 5, difficulty: -0.1, prerequisiteIds: ['a1-2'] },
      { id: 'b1-1', index: 6, difficulty: 0.7, prerequisiteIds: ['a2-1'] },
      { id: 'b2-1', index: 7, difficulty: 1.8, prerequisiteIds: ['b1-1'] },
    ];

    const calibrated = calibrateCurriculumGraph(result.theta, nodes, []);
    assert.ok(
      calibrated.masteredViaPlacementIds.includes('a0-1') &&
        calibrated.masteredViaPlacementIds.includes('a0-2'),
      'A0 nodes should be auto-mastered via placement'
    );
    assert.ok(
      calibrated.masteredViaPlacementIds.includes('a1-1'),
      'Foundational A1 node should be auto-mastered via placement'
    );
    assert.ok(
      calibrated.lockedIds.includes('b2-1'),
      'High difficulty B2 node above theta + 1.2 with unmet prereqs should remain locked'
    );
    assert.ok(
      calibrated.activeNodeId === 'a1-2' || calibrated.activeNodeId === 'a2-1',
      `Active ZPD beacon should land on A1/A2 frontier, got ${calibrated.activeNodeId}`
    );
  });

  it('Advanced (all fast correct) converges to B2/C1 in <= 7 items', () => {
    let session = createInitialPlacementSession(0);

    while (!shouldStopPlacement(session)) {
      const next = selectNextDiagnosticItem(session);
      assert.ok(next);
      // Fast accurate tap (1800ms)
      session = updatePlacementPosterior(session, next, true, 1800);
    }

    const result = finalizePlacement(session);
    assert.ok(
      result.itemsAnswered <= MAX_PLACEMENT_ITEMS,
      `Expected <= 7 items, took ${result.itemsAnswered}`
    );
    assert.ok(
      result.band === 'B2' || result.band === 'C1',
      `Expected B2 or C1 for fast all-correct advanced learner, got ${result.band} (theta=${result.theta}, sigma=${result.sigma})`
    );
    // Verify early stopping condition holds if stopped before 7
    if (result.itemsAnswered < MAX_PLACEMENT_ITEMS) {
      assert.ok(result.sigma < STOP_SIGMA_THRESHOLD);
    }
  });

  it('response latency weighting damps slow hesitant guesses vs fast confident answers', () => {
    const item = DIAGNOSTIC_ITEMS.find((d) => d.id === 'diag-l1-a2-1')!;
    const base = createInitialPlacementSession(0);

    const fast = updatePlacementPosterior(base, item, true, 1800);
    const slow = updatePlacementPosterior(base, item, true, 16000);

    assert.ok(
      fast.theta > slow.theta,
      `Fast correct (${fast.theta}) should shift theta higher than slow hesitant guess (${slow.theta})`
    );
  });
});

describe('OR Adaptive Engine — Multi-Objective Knapsack, DAG & FSRS', () => {
  const makeCandidates = (): LearningCandidateItem[] => [
    // 8 new words (one with unmet prerequisite)
    { id: 'new-1', skill: 'vocab', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.95, estTimeSec: 12 },
    { id: 'new-2', skill: 'syntax', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.9, estTimeSec: 14 },
    { id: 'new-3', skill: 'listening', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.85, estTimeSec: 15 },
    { id: 'new-4', skill: 'vocab', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.8, estTimeSec: 12 },
    { id: 'new-5', skill: 'syntax', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.75, estTimeSec: 15 },
    { id: 'new-6', skill: 'listening', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.7, estTimeSec: 16 },
    { id: 'new-7', skill: 'vocab', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.99, estTimeSec: 10, prerequisiteIds: ['unmet-node'] },
    { id: 'new-8', skill: 'vocab', isNew: true, stabilityDays: 1, elapsedDays: 0, frequency: 0.65, estTimeSec: 14 },
    // 6 review items
    { id: 'rev-1', skill: 'vocab', isNew: false, stabilityDays: 5, elapsedDays: 2, frequency: 0.9, estTimeSec: 10 },
    { id: 'rev-2', skill: 'syntax', isNew: false, stabilityDays: 4, elapsedDays: 3, frequency: 0.85, estTimeSec: 11 },
    { id: 'rev-3', skill: 'listening', isNew: false, stabilityDays: 6, elapsedDays: 2, frequency: 0.8, estTimeSec: 10 },
    { id: 'rev-4', skill: 'l1_transfer', isNew: false, stabilityDays: 3, elapsedDays: 4, frequency: 0.9, estTimeSec: 12 },
    { id: 'rev-5', skill: 'vocab', isNew: false, stabilityDays: 10, elapsedDays: 1, frequency: 0.7, estTimeSec: 10 },
    // 2 L1 contrast drills (for Pro mode)
    { id: 'l1-1', skill: 'l1_transfer', isNew: false, isL1Contrast: true, stabilityDays: 2, elapsedDays: 3, frequency: 0.95, estTimeSec: 15 },
    { id: 'l1-2', skill: 'l1_transfer', isNew: false, isL1Contrast: true, stabilityDays: 2, elapsedDays: 2, frequency: 0.9, estTimeSec: 15 },
  ];

  const skills = { vocab: 0.6, syntax: 0.4, listening: 0.5, l1_transfer: 0.3 };

  it('strictly enforces Easy / Standard / Pro cognitive load caps and DAG prerequisites', () => {
    const candidates = makeCandidates();

    const easyPlan = optimizeSessionItems(candidates, { uiMode: 'simple', skills });
    assert.ok(easyPlan.newItems.length <= 2, 'Easy mode max 2 brand-new words');
    assert.ok(easyPlan.reviewItems.length <= 3, 'Easy mode max 3 confidence-building reviews');
    assert.equal(easyPlan.l1ContrastItems.length, 0);
    assert.ok(!easyPlan.orderedItems.some((i) => i.id === 'new-7'), 'DAG prerequisite must block new-7');

    const stdPlan = optimizeSessionItems(candidates, { uiMode: 'standard', skills });
    assert.ok(stdPlan.newItems.length <= 4, 'Standard mode max 4 new words');
    assert.ok(stdPlan.reviewItems.length <= 4, 'Standard mode max 4 reviews');
    assert.ok(!stdPlan.orderedItems.some((i) => i.id === 'new-7'), 'DAG prerequisite must block new-7');

    const proPlan = optimizeSessionItems(candidates, {
      uiMode: 'pro',
      skills,
      completedPrerequisiteIds: ['unmet-node'],
    });
    assert.ok(proPlan.newItems.length <= 6, 'Pro mode max 6 new words');
    assert.ok(proPlan.l1ContrastItems.length > 0, 'Pro mode includes L1-interference contrast drills');
    assert.ok(
      proPlan.newItems.some((i) => i.id === 'new-7'),
      'Once DAG prerequisite is satisfied, high-utility new-7 is unlocked and selected'
    );
  });

  it('computes FSRS retrievability and utility per second monotonically', () => {
    const rFresh = fsrsRetrievability(1, 10, false);
    const rStale = fsrsRetrievability(15, 10, false);
    assert.ok(rFresh > rStale);

    const lowGapUtility = computeItemUtility(
      { id: 'u1', skill: 'vocab', isNew: false, stabilityDays: 5, elapsedDays: 5, frequency: 0.8, estTimeSec: 10 },
      { vocab: 0.9, syntax: 0.5, listening: 0.5, l1_transfer: 0.5 }
    );
    const highGapUtility = computeItemUtility(
      { id: 'u1', skill: 'vocab', isNew: false, stabilityDays: 5, elapsedDays: 5, frequency: 0.8, estTimeSec: 10 },
      { vocab: 0.1, syntax: 0.5, listening: 0.5, l1_transfer: 0.5 }
    );
    assert.ok(highGapUtility > lowGapUtility, 'Larger skill gap must yield higher utility');
  });

  it('closed-loop re-optimization updates theta, stability, and detects L1 micro-drills', () => {
    const initial = getDefaultAdaptiveProfile();
    const afterCorrect = recordExerciseOutcome(initial, {
      itemId: 'ex-1',
      skill: 'syntax',
      correct: true,
      latencyMs: 3000,
      itemDifficulty: -1.5,
    });
    assert.ok(afterCorrect.theta > initial.theta);
    assert.ok(afterCorrect.itemStabilities['ex-1'] > 1.0);

    const pattern = detectL1WeaknessFromAnswer('I happy today', 'I am happy today');
    assert.equal(pattern, 'copula_omission');
    const drill = getTargetedL1MicroDrill(pattern!);
    assert.equal(drill.weakSpotTag, 'copula_omission');
    assert.ok(drill.targetSentence.includes('am'));
  });
});
