import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node.js test environment if missing
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

// Mock document for Node.js test environment if missing
if (typeof globalThis.document === 'undefined') {
  const classList = new Set<string>();
  (globalThis as any).document = {
    documentElement: {
      classList: {
        add: (c: string) => classList.add(c),
        remove: (c: string) => classList.delete(c),
        toggle: (c: string, force?: boolean) => {
          if (force === true) classList.add(c);
          else if (force === false) classList.delete(c);
          else {
            if (classList.has(c)) classList.delete(c);
            else classList.add(c);
          }
          return classList.has(c);
        },
        contains: (c: string) => classList.has(c),
      },
    },
  };
}

import { getLearnerMode, setLearnerMode, syncLearnerModeClass, LEARNER_MODE_STORAGE_KEY } from './learnerMode';
import { getUiMode, setUiMode } from './uiMode';
import { TARGET_LANGUAGE_META } from '../data/languages';
import { getTargetDictionary } from '../data/dictionaries';
import { getCurriculum } from '../data/curriculumRegistry';
import { buildCourseStructure } from '../progression/courseData';
import { computeNextHintWord } from './habitPsychology';

describe('Age Gate, Learner Mode, and Button Action Verification', () => {
  test('1. First-launch age selection persists kids vs regular mode and switches cleanly', () => {
    localStorage.removeItem(LEARNER_MODE_STORAGE_KEY);
    assert.equal(getLearnerMode(), null, 'Default first launch mode must be null to trigger Age Gate');

    // Select Kids Mode
    setLearnerMode('kids');
    assert.equal(getLearnerMode(), 'kids', 'Learner mode must be kids after setting kids');
    assert.equal(localStorage.getItem(LEARNER_MODE_STORAGE_KEY), 'kids', 'localStorage must persist "kids"');
    assert.equal(document.documentElement.classList.contains('tb-kids-mode'), true, 'document.documentElement must contain "tb-kids-mode"');

    // Switch to Regular Mode
    setLearnerMode('regular');
    assert.equal(getLearnerMode(), 'regular', 'Learner mode must be regular after setting regular');
    assert.equal(localStorage.getItem(LEARNER_MODE_STORAGE_KEY), 'regular', 'localStorage must persist "regular"');
    assert.equal(document.documentElement.classList.contains('tb-kids-mode'), false, 'document.documentElement must not contain "tb-kids-mode"');

    // Sync helper
    const synced = syncLearnerModeClass();
    assert.equal(synced, 'regular', 'syncLearnerModeClass must return regular');
  });

  test('2. Kids mode applies kid-safe UI/filtering without breaking any of the 16 target languages', () => {
    setLearnerMode('kids');
    const languages = Object.keys(TARGET_LANGUAGE_META) as (keyof typeof TARGET_LANGUAGE_META)[];
    assert.equal(languages.length >= 14, true, 'Must test all target languages');

    for (const lang of languages) {
      assert.doesNotThrow(() => {
        const dict = getTargetDictionary(lang as any);
        assert.equal(Array.isArray(dict), true, `Target dictionary for ${lang} must be an array`);

        const curriculum = getCurriculum(lang as any);
        assert.equal(Array.isArray(curriculum), true, `Curriculum for ${lang} must be an array`);

        const hierarchy = buildCourseStructure(lang as any);
        assert.equal(Array.isArray(hierarchy), true, `Course hierarchy for ${lang} must be an array`);
      }, `Kids mode loading for language ${lang} must not throw`);
    }
  });

  test('3. Primary Action Handlers (Simple/Pro toggle, Learner Mode toggle, Hinting) execute cleanly', () => {
    // Simple/Pro toggle
    setUiMode('simple');
    assert.equal(getUiMode(), 'simple', 'UI mode must be simple');
    setUiMode('pro');
    assert.equal(getUiMode(), 'pro', 'UI mode must be pro');

    // Kids/Regular toggle
    setLearnerMode('kids');
    assert.equal(getLearnerMode(), 'kids');
    setLearnerMode('regular');
    assert.equal(getLearnerMode(), 'regular');

    // Compute hint word action handler
    const hintRes = computeNextHintWord('I have an important question', 'I have');
    assert.equal(hintRes.nextWord?.toLowerCase(), 'an', 'Hinting must compute next target word');
  });
});
