// scripts/verify-progression.mjs
import { buildCefrHierarchy } from '../src/progression/courseData.ts';
import { migrateProgressionState } from '../src/progression/migration.ts';

let failures = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failures++; }
  else console.log('ok:', msg);
}

// 1. Hierarchy shape
const levels = buildCefrHierarchy('en', 'arz');
assert(levels.length === 5, 'exactly 5 CEFR levels');
for (const lvl of levels) {
  assert(lvl.phases.length === 3, `${lvl.level} has 3 phases`);
  for (const ph of lvl.phases) {
    assert(ph.modules.length >= 2 && ph.modules.length <= 3,
      `${ph.id} has 2–3 modules`);
    for (const mod of ph.modules) {
      assert(mod.units.length >= 2 && mod.units.length <= 4,
        `${mod.id} has 2–4 units`);
      for (const u of mod.units) {
        assert(u.lessons.length >= 1, `${u.id} has ≥1 lesson stub`);
      }
    }
  }
  assert(Array.isArray(lvl.canDo) && lvl.canDo.length >= 5,
    `${lvl.level} has ≥5 can-do statements`);
}

// 2. Migration from old (v1) shape — exercise migrateProgressionState directly
const oldState = {
  version: 1,
  currentStage: 'A2',
  completedLessonIds: ['a2-u1-l1', 'a2-u1-l2'],
  lessonCrowns: { 'a2-u1-l1': 3, 'a2-u1-l2': 1 },
  xp: 420,
  streak: 7,
};
const migrated = migrateProgressionState(oldState);
assert(migrated.version === 2, 'version bumped to 2');
assert(migrated.currentLevelId === 'A2', 'currentLevelId derived from currentStage=A2');
assert(migrated.currentPhaseId === 'A2.2', 'currentPhaseId derived from currentStage=A2');
assert(migrated.completedLessonIds.length === 2, 'completed lessons preserved');
assert(migrated.lessonCrowns['a2-u1-l1'] === 3, 'lesson crowns preserved');
assert(migrated.xp === 420, 'xp preserved');
assert(migrated.streak === 7, 'streak preserved');

process.exit(failures === 0 ? 0 : 1);
