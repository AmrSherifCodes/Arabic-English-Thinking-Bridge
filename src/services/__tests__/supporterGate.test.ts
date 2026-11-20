import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCoreFreePair,
  getLanguageLevelAccess,
  getSupporterEntitlement,
  saveSupporterEntitlement,
  verifyCommunityPasscode,
  recordChannelVisitUnlock,
  DEFAULT_ENTITLEMENT,
  SupporterEntitlement
} from '../supporterGate';

test('supporterGate: isCoreFreePair correctly identifies free pairs', () => {
  assert.equal(isCoreFreePair('ar', 'en'), true);
  assert.equal(isCoreFreePair('arz', 'en'), true);
  assert.equal(isCoreFreePair('ar-EG', 'en'), true);
  assert.equal(isCoreFreePair('en', 'ar'), true);

  // Non-core pairs must be false
  assert.equal(isCoreFreePair('ar', 'de'), false);
  assert.equal(isCoreFreePair('ar', 'tr'), false);
  assert.equal(isCoreFreePair('en', 'de'), false);
  assert.equal(isCoreFreePair('ar', 'ja'), false);
});

test('supporterGate: getLanguageLevelAccess returns correct access status', () => {
  const lockedEntitlement: SupporterEntitlement = { ...DEFAULT_ENTITLEMENT, isUnlocked: false };
  const unlockedEntitlement: SupporterEntitlement = {
    ...DEFAULT_ENTITLEMENT,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    method: 'community_passcode'
  };

  // ar -> en is free_forever across all levels
  for (let level = 1; level <= 10; level++) {
    assert.equal(getLanguageLevelAccess('ar', 'en', level, lockedEntitlement), 'free_forever');
  }

  // ar -> de when locked: level 1 is free_preview, levels 2-10 are locked_supporter_required
  assert.equal(getLanguageLevelAccess('ar', 'de', 1, lockedEntitlement), 'free_preview');
  assert.equal(getLanguageLevelAccess('ar', 'de', 2, lockedEntitlement), 'locked_supporter_required');
  assert.equal(getLanguageLevelAccess('ar', 'de', 10, lockedEntitlement), 'locked_supporter_required');

  // ar -> de when unlocked: all levels are unlocked_supporter
  assert.equal(getLanguageLevelAccess('ar', 'de', 1, unlockedEntitlement), 'unlocked_supporter');
  assert.equal(getLanguageLevelAccess('ar', 'de', 2, unlockedEntitlement), 'unlocked_supporter');

  // ar -> tr when locked: all levels locked
  assert.equal(getLanguageLevelAccess('ar', 'tr', 1, lockedEntitlement), 'locked_supporter_required');
});

test('supporterGate: verifyCommunityPasscode unlocks on valid code', async () => {
  // Test valid community codes (SCIAMR, BRIDGE, RAHMAH, AMANAH)
  const valid1 = await verifyCommunityPasscode('SCIAMR');
  assert.equal(valid1, true);
  const entitlement1 = getSupporterEntitlement();
  assert.equal(entitlement1.isUnlocked, true);
  assert.equal(entitlement1.method, 'community_passcode');

  const valid2 = await verifyCommunityPasscode('  bridge ');
  assert.equal(valid2, true);

  // Test invalid passcode
  const invalid = await verifyCommunityPasscode('INVALID_CODE_123');
  assert.equal(invalid, false);
});

test('supporterGate: recordChannelVisitUnlock correctly persists unlock', () => {
  const result = recordChannelVisitUnlock();
  assert.equal(result.isUnlocked, true);
  assert.equal(result.method, 'youtube_channel_visit');

  const persisted = getSupporterEntitlement();
  assert.equal(persisted.isUnlocked, true);
  assert.equal(persisted.method, 'youtube_channel_visit');
});
