import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCefrLevelHierarchy,
  getAllHierarchicalLessons,
  isHierarchicalLevelUnlocked,
  isHierarchicalPhaseUnlocked,
  isHierarchicalModuleUnlocked,
  isHierarchicalUnitUnlocked,
  isHierarchicalLessonUnlocked,
  calculateLevelSkillNodes,
  generateCapstoneLesson,
  generatePhaseMasteryCheck,
  generatePlacementTest,
  convertHierarchyToStageNodes,
} from './cefrHierarchy';
import { createInitialProgressionState } from './engine';
import { migrateProgressionState } from './migration';
import { CefrLevelId } from './types';

test('1. CEFR 5-Tier Level Architecture produces all 5 levels (A1 -> C1)', () => {
  const hierarchy = getCefrLevelHierarchy();
  assert.equal(hierarchy.length, 5);
  const levels = hierarchy.map((l) => l.level);
  assert.deepEqual(levels, ['A1', 'A2', 'B1', 'B2', 'C1']);

  hierarchy.forEach((level) => {
    assert.equal(level.phases.length, 3, `Level ${level.level} must have exactly 3 phases`);
    assert.equal(level.canDo.length, 5, `Level ${level.level} must have 5 can-do statements`);
  });
});

test('2. Hierarchical Unlock rules: A1 and A1.1 unlocked by default', () => {
  const state = createInitialProgressionState();
  assert.equal(isHierarchicalLevelUnlocked(state, 'A1'), true);
  assert.equal(isHierarchicalPhaseUnlocked(state, 'A1.1'), true);
  assert.equal(isHierarchicalLevelUnlocked(state, 'A2'), false);
});

test('3. Level unlocks when capstone result is passed', () => {
  const state = createInitialProgressionState();
  state.capstoneResults = {
    A1: { passed: true, score: 85, dateISO: new Date().toISOString() },
  };
  assert.equal(isHierarchicalLevelUnlocked(state, 'A2'), true);
});

test('4. Skill Tree Radar calculates 4 skill branches per level', () => {
  const state = createInitialProgressionState();
  const allLessons = getAllHierarchicalLessons();
  const a1Lessons = allLessons.filter((l) => l.levelId === 'A1');

  // Complete first 5 A1 lessons
  state.completedLessonIds = a1Lessons.slice(0, 5).map((l) => l.id);

  const skills = calculateLevelSkillNodes(state, 'A1');
  assert.ok(skills.grammar.mastery >= 0);
  assert.ok(skills.vocabulary.mastery >= 0);
  assert.ok(skills.pronunciation.mastery >= 0);
  assert.ok(skills.listening.mastery >= 0);
});

test('5. Capstone, Mastery Check, and Placement Test generation', () => {
  const a1Capstone = generateCapstoneLesson('A1');
  assert.equal(a1Capstone.id, 'a1-capstone');
  assert.equal(a1Capstone.exercises.length, 20);

  const a1PhaseMastery = generatePhaseMasteryCheck('A1.1');
  assert.equal(a1PhaseMastery.id, 'a1.1-mastery');
  assert.equal(a1PhaseMastery.exercises.length, 10);

  const placement = generatePlacementTest();
  assert.equal(placement.id, 'cefr-placement-test');
  assert.equal(placement.exercises.length, 15);
});

test('6. Migration logic maps old stage to new CEFR level and phase seamlessly', () => {
  const legacyState = {
    currentStage: 'A2',
    completedLessonIds: ['lesson-1', 'lesson-2'],
    xp: 250,
  };

  const migrated = migrateProgressionState(legacyState);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.currentLevelId, 'A2');
  assert.equal(migrated.currentPhaseId, 'A2.2');
  assert.deepEqual(migrated.completedLessonIds, ['lesson-1', 'lesson-2']);
  assert.equal(migrated.xp, 250);
});

test('7. Compatibility shim converts LevelNode[] to StageNode[]', () => {
  const hierarchy = getCefrLevelHierarchy();
  const stages = convertHierarchyToStageNodes(hierarchy);
  assert.equal(stages.length, 10);
  assert.equal(stages[0].stage, 'Pre-A0');
  assert.equal(stages[9].stage, 'C1+');
});
