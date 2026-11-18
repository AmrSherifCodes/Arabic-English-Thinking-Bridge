import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateProgressionState, migrateLegacyStorageToProgression } from './migration';

test('1. migrateProgressionState maps legacy currentStage to currentLevelId and currentPhaseId', () => {
  const legacyState = {
    xp: 1500,
    streak: 14,
    leagueOptOut: false,
    completedLessonIds: ['a0-l1', 'a0-l2', 'a0-l3', 'a1-l1'],
    lessonCrowns: { 'a0-l1': 3 },
    currentStage: 'B2',
    currentUnitId: 'b2-unit-1',
    shields: 3,
    lastActiveDate: '2026-03-30',
  };

  const migrated = migrateProgressionState(legacyState);

  assert.equal(migrated.version, 2, 'Version should be upgraded to 2');
  assert.equal(migrated.xp, 1500, 'XP should be preserved');
  assert.equal(migrated.streak, 14, 'Streak should be preserved');
  assert.deepEqual(migrated.completedLessonIds, ['a0-l1', 'a0-l2', 'a0-l3', 'a1-l1'], 'Completed lessons preserved');
  assert.equal(migrated.currentStage, 'B2', 'Legacy currentStage preserved');
  assert.equal(migrated.currentLevelId, 'B2', 'Mapped currentLevelId should be B2');
  assert.equal(migrated.currentPhaseId, 'B2.1', 'Mapped currentPhaseId should be B2.1');
  assert.equal(migrated.currentModuleId, 'b2.1-m1', 'Mapped currentModuleId should be b2.1-m1');
  assert.ok(migrated.skillTree, 'Skill tree should be populated');
});

test('2. migrateLegacyStorageToProgression reads tb.progressionState from localStorage', () => {
  const entries = new Map<string, string>();
  const oldFixture = {
    xp: 800,
    streak: 5,
    completedLessonIds: ['a1-u1-l1'],
    currentStage: 'A2',
  };
  entries.set('tb.progressionState', JSON.stringify(oldFixture));

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });

  const migrated = migrateLegacyStorageToProgression();
  assert.equal(migrated.xp, 800);
  assert.equal(migrated.streak, 5);
  assert.equal(migrated.currentLevelId, 'A2');
  assert.equal(migrated.currentPhaseId, 'A2.2');
});
