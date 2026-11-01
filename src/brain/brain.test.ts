import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SEED_CONCEPTS,
  classifyError,
  createInitialLearnerState,
  updateSrs,
  selectNext,
  LearnerState
} from './index';

test('SEED_CONCEPTS contains at least 10 concepts and all required core nodes', () => {
  assert.ok(SEED_CONCEPTS.length >= 10, 'Expected at least 10 concepts');

  const copula = SEED_CONCEPTS.find((c) => c.id === 'copula.present');
  assert.ok(copula, 'copula.present must exist');
  assert.equal(copula.cefr_band, 'A1+');

  const indefinite = SEED_CONCEPTS.find((c) => c.id === 'articles.indefinite');
  assert.ok(indefinite, 'articles.indefinite must exist');
  assert.equal(indefinite.cefr_band, 'A1+');

  const passive = SEED_CONCEPTS.find((c) => c.id === 'passive.present_simple');
  assert.ok(passive, 'passive.present_simple must exist');
  assert.equal(passive.cefr_band, 'B2');
  assert.ok(passive.tracks.includes('academic'), 'passive must include academic track');
  assert.ok(passive.tracks.includes('sustainability'), 'passive must include sustainability track');

  const inversion = SEED_CONCEPTS.find((c) => c.id === 'inversion.negative');
  assert.ok(inversion, 'inversion.negative must exist');
  assert.equal(inversion.cefr_band, 'C1');
});

test('classifyError detects copula omission correctly', () => {
  // "I student" for "I am a student"
  const err1 = classifyError('I student', 'I am a student');
  assert.equal(err1, 'copula_omitted');

  // "He doctor" for "He is a doctor"
  const err2 = classifyError('He doctor', 'He is a doctor');
  assert.equal(err2, 'copula_omitted');

  // "The report written" for "The report was written"
  const err3 = classifyError('The report written', 'The report was written');
  assert.equal(err3, 'copula_omitted');
});

test('classifyError detects missing articles and spurious articles', () => {
  // Indefinite article missing
  const err1 = classifyError('I have car', 'I have a car');
  assert.equal(err1, 'article_missing');

  // Spurious "the" on abstract/generic noun
  const err2 = classifyError('The education is important for everyone', 'Education is important for everyone');
  assert.equal(err2, 'article_spurious');
});

test('classifyError detects pronoun dropping and preposition transfer', () => {
  // Pronoun dropped
  const err1 = classifyError('Go to work every day', 'I go to work every day');
  assert.equal(err1, 'pronoun_dropped');

  // Preposition transfer (afraid from)
  const err2 = classifyError('He is afraid from the dark', 'He is afraid of the dark');
  assert.equal(err2, 'preposition_transfer');
});

test('classifyError detects irregular plural and VSO word order', () => {
  // Irregular plural regularized
  const err1 = classifyError('I saw childs in the park', 'I saw children in the park');
  assert.equal(err1, 'plural_irregular');

  // VSO order
  const err2 = classifyError('Read the student the report', 'The student read the report');
  assert.equal(err2, 'word_order_vso');
});

test('classifyError returns null on correct answers or unknown variations', () => {
  const perfect = classifyError('I am a student', 'I am a student');
  assert.equal(perfect, null);

  const punctuationPadded = classifyError('I am a student!', 'I am a student.');
  assert.equal(punctuationPadded, null);

  const unknown = classifyError('Banana airplane spaceship', 'I am a student');
  // Copula is missing so it flags copula_omitted or null for random tokens
  assert.ok(unknown === 'copula_omitted' || unknown === null);
});

test('updateSrs applies success and failure calculations deterministically', () => {
  const initial = createInitialLearnerState('copula.present');
  assert.equal(initial.ease, 2.5);
  assert.equal(initial.interval, 0);
  assert.equal(initial.mastery, 0.0);

  // Success 1
  const s1 = updateSrs(initial, true, null, 1000000);
  assert.equal(s1.ease, 2.6);
  assert.equal(s1.interval, 1);
  assert.equal(s1.mastery, 0.15);

  // Success 2
  const s2 = updateSrs(s1, true, null, 1000000);
  assert.equal(s2.ease, 2.7);
  assert.equal(s2.interval, 3); // 1 * 2.7 = 2.7 -> round to 3
  assert.equal(s2.mastery, 0.3);

  // Failure
  const f1 = updateSrs(s2, false, 'copula_omitted', 1000000);
  assert.equal(f1.ease, 2.5); // 2.7 - 0.2
  assert.equal(f1.interval, 1); // resets to 1
  assert.equal(f1.mastery, 0.15); // 0.3 - 0.15
  assert.equal(f1.error_signature.copula_omitted, 1);

  // Minimum ease threshold clamp (1.3)
  let lowState = { ...f1, ease: 1.35 };
  lowState = updateSrs(lowState, false, null, 1000000);
  assert.equal(lowState.ease, 1.3);
});

test('selectNext selects due reviews first, prioritizing highest risk and active track', () => {
  const now = 5000000;

  const states: Record<string, LearnerState> = {
    'copula.present': {
      concept_id: 'copula.present',
      mastery: 0.8,
      ease: 2.5,
      interval: 2,
      next_due: 4000000, // Due!
      error_signature: {
        copula_omitted: 0,
        article_missing: 0,
        article_spurious: 0,
        aspect_confused: 0,
        pronoun_dropped: 0,
        word_order_vso: 0,
        plural_irregular: 0,
        preposition_transfer: 0
      }
    },
    'articles.indefinite': {
      concept_id: 'articles.indefinite',
      mastery: 0.5,
      ease: 1.5, // Lower ease -> higher risk!
      interval: 1,
      next_due: 4500000, // Due!
      error_signature: {
        copula_omitted: 0,
        article_missing: 2,
        article_spurious: 0,
        aspect_confused: 0,
        pronoun_dropped: 0,
        word_order_vso: 0,
        plural_irregular: 0,
        preposition_transfer: 0
      }
    }
  };

  const selected = selectNext(SEED_CONCEPTS, states, { activeTrack: 'general', now });
  assert.ok(selected);
  // articles.indefinite has lower ease (1.5) with high transfer weight (0.9), higher risk than copula (ease 2.5)
  assert.equal(selected.id, 'articles.indefinite');
});

test('selectNext serves the frontier when no reviews are due', () => {
  const now = 5000000;

  // copula is mastered (>= 0.7), next_due is in the future
  const states: Record<string, LearnerState> = {
    'copula.present': {
      concept_id: 'copula.present',
      mastery: 0.75,
      ease: 2.6,
      interval: 10,
      next_due: 90000000, // Not due
      error_signature: {
        copula_omitted: 0,
        article_missing: 0,
        article_spurious: 0,
        aspect_confused: 0,
        pronoun_dropped: 0,
        word_order_vso: 0,
        plural_irregular: 0,
        preposition_transfer: 0
      }
    }
  };

  const selected = selectNext(SEED_CONCEPTS, states, { activeTrack: 'general', now });
  assert.ok(selected);
  // articles.indefinite requires copula.present (which is 0.75 >= 0.7), and is unmastered
  assert.equal(selected.id, 'articles.indefinite');
});
