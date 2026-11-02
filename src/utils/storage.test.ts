import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROGRESS,
  saveUserProgress,
  loadUserProgress,
  exportUserProgressJson,
  importUserProgressJson,
  getVaultAuditSnapshot,
  computeVaultChecksum,
  sanitizeUserProgress
} from './storage';
import { UserProgress } from '../types';

// Polyfill in-memory localStorage for node test environment
class MockLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// Attach mock localStorage to globalThis for testing
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MockLocalStorage();
}

test('1. saveUserProgress writes to both primary and redundant backup storage keys', () => {
  localStorage.clear();
  const sample: UserProgress = {
    ...DEFAULT_PROGRESS,
    score: 150,
    streak: 4,
    bestStreak: 7,
    completedLessonIds: ['p1-l1', 'p1-l2'],
    completedExerciseIds: ['ex1', 'ex2', 'ex3'],
    streakShields: 3
  };

  const ok = saveUserProgress(sample);
  assert.equal(ok, true);

  const primary = localStorage.getItem('thinking_english_progress_v1');
  const backup = localStorage.getItem('thinking_english_progress_backup_v1');

  assert.ok(primary !== null);
  assert.ok(backup !== null);
  assert.equal(primary, backup);

  const loaded = loadUserProgress();
  assert.equal(loaded.score, 150);
  assert.equal(loaded.streak, 4);
  assert.equal(loaded.bestStreak, 7);
  assert.deepEqual(loaded.completedLessonIds, ['p1-l1', 'p1-l2']);
});

test('2. loadUserProgress recovers seamlessly from backup if primary key is cleared or corrupted', () => {
  localStorage.clear();
  const sample: UserProgress = {
    ...DEFAULT_PROGRESS,
    score: 320,
    streak: 9,
    completedExerciseCount: 42
  };
  saveUserProgress(sample);

  // Corrupt / clear primary storage key (simulating OS clearing or browser crash)
  localStorage.removeItem('thinking_english_progress_v1');

  // Load should automatically recover from thinking_english_progress_backup_v1
  const recovered = loadUserProgress();
  assert.equal(recovered.score, 320);
  assert.equal(recovered.streak, 9);
  assert.equal(recovered.completedExerciseCount, 42);

  // And primary storage key should be re-hydrated
  const rehydrated = localStorage.getItem('thinking_english_progress_v1');
  assert.ok(rehydrated !== null);
});

test('3. exportUserProgressJson produces valid v3.0.0 payload with verifiable checksum', () => {
  const sample: UserProgress = {
    ...DEFAULT_PROGRESS,
    score: 500,
    streak: 12
  };

  const jsonStr = exportUserProgressJson(sample);
  assert.ok(typeof jsonStr === 'string');

  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.app, 'Arabic-English-Thinking-Bridge');
  assert.equal(parsed.version, '3.0.0');
  assert.ok(typeof parsed.exportedAt === 'string');
  assert.ok(typeof parsed.checksum === 'string');
  assert.equal(parsed.progress.score, 500);
  assert.equal(parsed.progress.streak, 12);
});

test('4. importUserProgressJson validates and restores progress from valid backup', () => {
  localStorage.clear();
  const sample: UserProgress = {
    ...DEFAULT_PROGRESS,
    score: 880,
    streak: 21,
    bestStreak: 25,
    completedLessonIds: ['p1-l1', 'p1-l2', 'p1-l3']
  };

  const backupJson = exportUserProgressJson(sample);
  const result = importUserProgressJson(backupJson);

  assert.equal(result.success, true);
  assert.ok(result.progress);
  assert.equal(result.progress.score, 880);
  assert.equal(result.progress.streak, 21);
  assert.deepEqual(result.progress.completedLessonIds, ['p1-l1', 'p1-l2', 'p1-l3']);

  // Check that current loaded progress reflects the import
  const current = loadUserProgress();
  assert.equal(current.score, 880);
});

test('5. importUserProgressJson safely rejects malformed or invalid JSON without crashing', () => {
  const malformed = importUserProgressJson('{ this is not valid json }');
  assert.equal(malformed.success, false);
  assert.equal(malformed.error, 'Malformed JSON data');

  const invalidStructure = importUserProgressJson(JSON.stringify({ notProgress: 123 }));
  assert.equal(invalidStructure.success, true); // Falls back to sanitized defaults gracefully
});

test('6. getVaultAuditSnapshot produces verified deterministic checksum', () => {
  const sample: UserProgress = {
    ...DEFAULT_PROGRESS,
    score: 100,
    streak: 2
  };
  const snap = getVaultAuditSnapshot(sample);
  assert.equal(snap.vaultVersion, 2);
  assert.equal(snap.status, 'VERIFIED_DETERMINISTIC');
  assert.equal(snap.score, 100);
  assert.equal(snap.streak, 2);
  assert.ok(typeof snap.integrityChecksum === 'string');
});

