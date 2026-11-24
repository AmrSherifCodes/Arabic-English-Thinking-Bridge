// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GUIDE_MODE_STORAGE_KEY,
  getGuidePreferences,
  saveGuidePreferences,
  setGuideMode,
  setLearnerTrack,
  getGuideModeBadge,
  getLearnerTrackMeta,
} from '../utils/guideMode';
import { transliterateArabicToLatin, hasArabicScript } from '../utils/arabicTranslit';
import { ArabicPhraseAssist } from '../components/ArabicPhraseAssist';
import { UserSetupModal } from '../components/UserSetupModal';
import { ActivateCodeModal } from '../components/ActivateCodeModal';
import { ChestModal } from '../features/gamification/ChestModal';
import { ThemeShopModal } from '../features/gamification/ThemeShopModal';
import { ProArcadeView } from '../features/gamification/ProArcadeView';
import { CreatorCard } from '../components/CreatorCard';

const ARABIC_SCRIPT_RE = /[\u0600-\u06FF]/;

function installMockBrowserEnv() {
  const store = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  };

  const docEl: { dir: string; lang: string; dataset: Record<string, string> } = {
    dir: 'rtl',
    lang: 'ar',
    dataset: {},
  };

  (globalThis as unknown as Record<string, unknown>).window = {
    localStorage: mockLocalStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: 'https://tb-eg.vercel.app/', search: '', pathname: '/app' },
    history: { replaceState: () => {}, pushState: () => {} },
  };
  (globalThis as unknown as Record<string, unknown>).localStorage = mockLocalStorage;
  (globalThis as unknown as Record<string, unknown>).document = {
    documentElement: docEl,
  };

  return { store, docEl };
}

test('1. guideMode & learnerTrack persist under tb.guideMode.v1 and switch dir to ltr for english_guided', () => {
  const { store, docEl } = installMockBrowserEnv();

  setGuideMode('english_guided');
  setLearnerTrack('school_igcse');

  const raw = store.get(GUIDE_MODE_STORAGE_KEY);
  assert.ok(raw, 'Expected tb.guideMode.v1 to be persisted');

  const prefs = getGuidePreferences();
  assert.equal(prefs.guideMode, 'english_guided');
  assert.equal(prefs.learnerTrack, 'school_igcse');
  assert.equal(docEl.dir, 'ltr');
  assert.equal(docEl.lang, 'en');

  saveGuidePreferences({ guideMode: 'standard_ar', learnerTrack: 'teacher', setupCompleted: true });
  const updated = getGuidePreferences();
  assert.equal(updated.guideMode, 'standard_ar');
  assert.equal(updated.learnerTrack, 'teacher');
  assert.equal(updated.setupCompleted, true);
  assert.equal(docEl.dir, 'rtl');
  assert.equal(docEl.lang, 'ar');

  assert.equal(getGuideModeBadge('english_guided').shortLabel, 'EN');
  assert.equal(getLearnerTrackMeta('uni_career').recommendedLevel, 'B1');
});

test('2. transliterateArabicToLatin converts curated and arbitrary Arabic phrases into Latin phonetics', () => {
  assert.equal(transliterateArabicToLatin('أنا جاهز'), 'Ana gahez');
  assert.equal(transliterateArabicToLatin('أنا موافق معاك'), "Ana mowafeq ma'ak");
  assert.equal(hasArabicScript('أنا جاهز'), true);
  assert.equal(hasArabicScript('Ana gahez'), false);

  const fallback = transliterateArabicToLatin('الكتاب جميل');
  assert.equal(ARABIC_SCRIPT_RE.test(fallback), false);
  assert.ok(fallback.toLowerCase().includes('el-'));
});

test('3. ArabicPhraseAssist renders Latin phonetic transliteration and tap-to-hear button', () => {
  const html = renderToStaticMarkup(
    React.createElement(ArabicPhraseAssist, { phrase: 'أنا جاهز' })
  );
  assert.ok(html.includes('(Ana gahez)'), 'Expected Latin phonetic transliteration');
  assert.ok(html.includes('Hear'), 'Expected tap-to-hear audio button');
  assert.equal(ARABIC_SCRIPT_RE.test(html), false);
});

test('4. UserSetupModal renders 1 clean screen with 3 language pills, Quran checkbox, and 2 action buttons in English LTR', () => {
  installMockBrowserEnv();
  const html = renderToStaticMarkup(
    React.createElement(UserSetupModal, {
      isOpen: true,
      initialGuideMode: 'english_guided',
      initialTrack: 'starter',
      onClose: () => {},
      onComplete: () => {},
    })
  );
  assert.ok(html.includes('dir="ltr"'));
  assert.ok(html.includes('Welcome to Thinking Bridge'));
  assert.ok(html.includes('🇪🇬 عربي مصري'));
  assert.ok(html.includes('📖 فصيح'));
  assert.ok(html.includes('🌍 English'));
  assert.ok(html.includes('Quick Level Test (60 seconds)'));
  assert.ok(html.includes('Start from Level 1 directly'));
  assert.ok(html.includes('Also interested in memorizing the Quran'));
});

test('5. Zero-Arabic-Leak sweep: ActivateCodeModal, ChestModal, ThemeShopModal, ProArcadeView, and CreatorCard have zero Arabic in English mode', () => {
  installMockBrowserEnv();

  const activateHtml = renderToStaticMarkup(
    React.createElement(ActivateCodeModal, { isOpen: true, onClose: () => {}, isArabic: false })
  );
  assert.equal(ARABIC_SCRIPT_RE.test(activateHtml), false, 'ActivateCodeModal leaked Arabic in English mode');

  const chestHtml = renderToStaticMarkup(
    React.createElement(ChestModal, {
      isOpen: true,
      chestId: 'chest-1',
      tier: 'golden',
      isArabic: false,
      onClose: () => {},
    })
  );
  assert.equal(ARABIC_SCRIPT_RE.test(chestHtml), false, 'ChestModal leaked Arabic in English mode');

  const shopHtml = renderToStaticMarkup(
    React.createElement(ThemeShopModal, { isOpen: true, isArabic: false, onClose: () => {} })
  );
  assert.equal(ARABIC_SCRIPT_RE.test(shopHtml), false, 'ThemeShopModal leaked Arabic in English mode');

  const arcadeHtml = renderToStaticMarkup(
    React.createElement(ProArcadeView, { isPro: true, isArabic: false, onBack: () => {} })
  );
  assert.equal(ARABIC_SCRIPT_RE.test(arcadeHtml), false, 'ProArcadeView lobby leaked Arabic in English mode');

  const creatorHtml = renderToStaticMarkup(
    React.createElement(CreatorCard, { isArabic: false })
  );
  assert.equal(ARABIC_SCRIPT_RE.test(creatorHtml), false, 'CreatorCard leaked Arabic in English mode');
});
