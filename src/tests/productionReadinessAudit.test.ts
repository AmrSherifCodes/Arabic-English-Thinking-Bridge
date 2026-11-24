import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getDeckCardKeys, getCardData } from '../features/flashcards/deckUtils';
import { DEFAULT_PROGRESS } from '../utils/storage';
import { migrateProgressionState } from '../progression/migration';
import { normalizeTtsLang } from '../utils/offlineTts';
import type { UserProfile } from '../types';

const ROOT = process.cwd();

describe('Production Readiness & Human-Use Audit Regressions (v6.0.0 V6 Edition)', () => {
  it('1. Egyptian-dialect users receive valid flashcard keys and card data for German and Turkish decks', () => {
    const egyptianProfile: UserProfile = {
      language: 'arabic',
      dialect: 'egyptian',
      level: 'beginner',
      goal: 'general',
    };

    const germanKeys = getDeckCardKeys('phase-1', DEFAULT_PROGRESS, [], egyptianProfile, 'arz', 'de');
    assert.ok(germanKeys.length > 0, 'German phase-1 deck must not be empty for Egyptian dialect users');
    const firstGermanCard = getCardData(germanKeys[0], DEFAULT_PROGRESS, [], egyptianProfile, 'arz', 'de');
    assert.ok(firstGermanCard, 'German flashcard data must resolve for Egyptian dialect users');
    assert.ok(firstGermanCard.en.length > 0, 'German flashcard must have target text');

    const turkishKeys = getDeckCardKeys('phase-1', DEFAULT_PROGRESS, [], egyptianProfile, 'arz', 'tr');
    assert.ok(turkishKeys.length > 0, 'Turkish phase-1 deck must not be empty for Egyptian dialect users');
    const firstTurkishCard = getCardData(turkishKeys[0], DEFAULT_PROGRESS, [], egyptianProfile, 'arz', 'tr');
    assert.ok(firstTurkishCard, 'Turkish flashcard data must resolve for Egyptian dialect users');
  });

  it('2. migrateProgressionState safely sanitizes corrupted or legacy v4.3/v4.4.1 state', () => {
    const corrupted: any = {
      xp: Number.NaN,
      overallLevel: -5,
      streak: 'broken',
      streakShields: null,
      dailyCardsCap: 0,
      currentStage: 'INVALID_STAGE',
      completedLessonIds: 'not-an-array',
      quests: 'corrupted',
      skills: null,
      lessonCrowns: [],
      srsItems: 'bad',
    };

    const migrated = migrateProgressionState(corrupted);
    assert.equal(Number.isFinite(migrated.xp), true);
    assert.ok(migrated.overallLevel >= 1);
    assert.equal(migrated.streak, 0);
    assert.equal(migrated.currentStage, 'A0');
    assert.ok(Array.isArray(migrated.completedLessonIds));
    assert.ok(Array.isArray(migrated.quests));
    assert.equal(typeof migrated.skills, 'object');
    assert.ok(migrated.skills !== null);
  });

  it('3. normalizeTtsLang enforces strict BCP-47 locales for de, en, ar, tr', () => {
    assert.equal(normalizeTtsLang('de'), 'de-DE');
    assert.equal(normalizeTtsLang('en'), 'en-US');
    assert.equal(normalizeTtsLang('ar'), 'ar-EG');
    assert.equal(normalizeTtsLang('arz'), 'ar-EG');
    assert.equal(normalizeTtsLang('tr'), 'tr-TR');
  });

  it('4. All APK download links and manifests align cleanly on v9.0.0/ThinkingBridge-v9.0.0.apk (versionCode 6001)', () => {
    const filesToCheck = [
      'index.html',
      'public/download.html',
      'src/components/LandingPage.tsx',
      'src/components/AndroidLandingPage.tsx',
      'src/components/LandingView.tsx',
      'src/features/menu/ChoiceMenu.tsx',
      'src/App.tsx',
    ];

    for (const relPath of filesToCheck) {
      const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      const matches = content.match(/releases\/download\/[^\s"'`<>]+\.apk/g) || [];
      assert.ok(matches.length > 0, `Expected APK release URL in ${relPath}`);
      for (const match of matches) {
        assert.equal(
          match,
          'releases/download/v9.0.0/ThinkingBridge-v9.0.0.apk',
          `Outdated APK URL "${match}" found in ${relPath}`
        );
      }
      assert.equal(
        content.includes('106 MB'),
        false,
        `Stale 106 MB size label found in ${relPath}`
      );
    }

    const verifiedSha256 = '1c784627ea76bc14adad4f9744621a9e1395c03a8a9386ba12a7c81fc56a91d3';
    for (const relPath of [
      'index.html',
      'public/download.html',
      'src/components/LandingPage.tsx',
      'src/components/AndroidLandingPage.tsx',
    ]) {
      const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      assert.ok(
        content.toLowerCase().includes(verifiedSha256),
        `Expected verified SHA-256 checksum in ${relPath}`
      );
      assert.ok(
        content.includes('releases/tag/v9.0.0'),
        `Expected GitHub v9.0.0 release tag link in ${relPath}`
      );
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert.equal(pkg.version, '9.0.0', 'package.json version must be 9.0.0');

    const gradleContent = fs.readFileSync(path.join(ROOT, 'android/app/build.gradle'), 'utf8');
    assert.ok(gradleContent.includes('versionCode 6001'), 'build.gradle must specify versionCode 6001');
    assert.ok(gradleContent.includes('versionName "9.0.0"'), 'build.gradle must specify versionName "9.0.0"');

    const qrPath = path.join(ROOT, 'public/paypal-qr.png');
    assert.ok(fs.existsSync(qrPath), 'public/paypal-qr.png must exist');
    assert.ok(fs.statSync(qrPath).size > 1000, 'public/paypal-qr.png must be non-empty');
  });

  it('5. LanguageSelectorModal labels unfinished languages with 🚧 جاري البناء يومياً', () => {
    const modalSrc = fs.readFileSync(
      path.join(ROOT, 'src/components/LanguageSelectorModal.tsx'),
      'utf8'
    );
    assert.ok(modalSrc.includes('🚧 جاري البناء يومياً'));
    assert.equal(modalSrc.includes('🚧 قريباً'), false);
  });

  it('6. .vercelignore excludes native directories, media artifacts, and test files', () => {
    const vercelIgnore = fs.readFileSync(path.join(ROOT, '.vercelignore'), 'utf8');
    for (const required of ['android/', 'src-tauri/', '*.apk', '*.aab', '*.mp4', '*.wav', '**/*.test.*']) {
      assert.ok(vercelIgnore.includes(required), `.vercelignore must exclude ${required}`);
    }
  });
});
