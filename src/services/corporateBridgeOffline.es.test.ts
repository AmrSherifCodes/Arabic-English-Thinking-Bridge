import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorporateBridgeOffline } from './corporateBridgeOffline';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

const PRESETS = [
  'العميل مأخر الداتا وبيماطل في الرد',
  'كنت في ميتنج',
  'نراجع الحسابات',
  'ضروري نخلص قبل آخر الأسبوع',
  'الميزانية مش مكفية',
];

test('ES presets: no Arabic in english and labels are Cortés/Directo/Ejecutivo', () => {
  for (const p of PRESETS) {
    const r = buildCorporateBridgeOffline(p, 'es');
    assert.ok(!ARABIC_REGEX.test(r.tones.polite.english), `polite Arabic: ${r.tones.polite.english}`);
    assert.ok(!ARABIC_REGEX.test(r.tones.assertive.english), `assertive Arabic: ${r.tones.assertive.english}`);
    assert.ok(!ARABIC_REGEX.test(r.tones.executive.english), `executive Arabic: ${r.tones.executive.english}`);
    assert.equal(r.tones.polite.label, 'Cortés');
    assert.equal(r.tones.assertive.label, 'Directo');
    assert.equal(r.tones.executive.label, 'Ejecutivo');
  }
});

test('ES generic: no Arabic and no raw input substring', () => {
  const raw = 'جملة غير معروفة';
  const r = buildCorporateBridgeOffline(raw, 'es');
  for (const t of [r.tones.polite, r.tones.assertive, r.tones.executive]) {
    assert.ok(!ARABIC_REGEX.test(t.english), `Arabic in ${t.english}`);
    assert.ok(!t.english.includes(raw), `raw input leaked: ${t.english}`);
  }
});

test('Regression: JA generic no Arabic', () => {
  const r = buildCorporateBridgeOffline('جملة غير معروفة', 'ja');
  for (const t of [r.tones.polite, r.tones.assertive, r.tones.executive]) {
    assert.ok(!ARABIC_REGEX.test(t.english), `Arabic in ${t.english}`);
  }
});