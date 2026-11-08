import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorporateBridgeOffline } from './corporateBridgeOffline';

const ARABIC_REGEX = /[\u0600-\u06FF]/;

test('1. Generic Japanese fallback contains NO Arabic characters in output tones', () => {
  const result = buildCorporateBridgeOffline('نص عربي عشوائي غير معروف تماما للخدمة', 'ja');
  assert.ok(result);
  assert.equal(result.originalThought, 'نص عربي عشوائي غير معروف تماما للخدمة');

  assert.ok(!ARABIC_REGEX.test(result.tones.polite.english), `Polite tone contained Arabic: ${result.tones.polite.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.assertive.english), `Assertive tone contained Arabic: ${result.tones.assertive.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.executive.english), `Executive tone contained Arabic: ${result.tones.executive.english}`);

  assert.equal(result.tones.polite.label, '丁寧 (Polite)');
  assert.equal(result.tones.assertive.label, '明確 (Assertive)');
  assert.equal(result.tones.executive.label, '簡潔 (Executive)');
});

test('2. Generic German fallback contains NO Arabic characters in output tones', () => {
  const result = buildCorporateBridgeOffline('نص عربي عشوائي غير معروف تماما للخدمة', 'de');
  assert.ok(result);

  assert.ok(!ARABIC_REGEX.test(result.tones.polite.english), `Polite tone contained Arabic: ${result.tones.polite.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.assertive.english), `Assertive tone contained Arabic: ${result.tones.assertive.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.executive.english), `Executive tone contained Arabic: ${result.tones.executive.english}`);

  assert.equal(result.tones.polite.label, 'Höflich (Polite)');
  assert.equal(result.tones.assertive.label, 'Bestimmt (Assertive)');
  assert.equal(result.tones.executive.label, 'Direkt & Knapp (Executive)');
});

test('3. Generic English fallback contains NO Arabic characters in output tones', () => {
  const result = buildCorporateBridgeOffline('نص عربي عشوائي غير معروف تماما للخدمة', 'en');
  assert.ok(result);

  assert.ok(!ARABIC_REGEX.test(result.tones.polite.english), `Polite tone contained Arabic: ${result.tones.polite.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.assertive.english), `Assertive tone contained Arabic: ${result.tones.assertive.english}`);
  assert.ok(!ARABIC_REGEX.test(result.tones.executive.english), `Executive tone contained Arabic: ${result.tones.executive.english}`);

  assert.equal(result.tones.polite.label, 'Polite');
  assert.equal(result.tones.assertive.label, 'Assertive');
  assert.equal(result.tones.executive.label, 'Executive');
});

test('4. Preset inputs return target-specific tone labels and clean Japanese/German/English outputs', () => {
  const presetThought = 'العميل مأخر الداتا وبيماطل في الرد';

  // English
  const enRes = buildCorporateBridgeOffline(presetThought, 'en');
  assert.equal(enRes.tones.polite.label, 'Polite');
  assert.equal(enRes.tones.assertive.label, 'Assertive');
  assert.equal(enRes.tones.executive.label, 'Executive');
  assert.ok(!ARABIC_REGEX.test(enRes.tones.polite.english));

  // German
  const deRes = buildCorporateBridgeOffline(presetThought, 'de');
  assert.equal(deRes.tones.polite.label, 'Höflich');
  assert.equal(deRes.tones.assertive.label, 'Bestimmt');
  assert.equal(deRes.tones.executive.label, 'Direkt & Knapp');
  assert.ok(!ARABIC_REGEX.test(deRes.tones.polite.english));

  // Japanese
  const jaRes = buildCorporateBridgeOffline(presetThought, 'ja');
  assert.equal(jaRes.tones.polite.label, '丁寧 (Polite)');
  assert.equal(jaRes.tones.assertive.label, '明確 (Assertive)');
  assert.equal(jaRes.tones.executive.label, '簡潔 (Executive)');
  assert.ok(!ARABIC_REGEX.test(jaRes.tones.polite.english));
  assert.ok(!ARABIC_REGEX.test(jaRes.tones.assertive.english));
  assert.ok(!ARABIC_REGEX.test(jaRes.tones.executive.english));
});

const NONSENSE = 'نص عربي عشوائي غير معروف تماما للخدمة';

for (const lang of ['ja', 'de', 'en'] as const) {
  test(`quality: ${lang} generic fallback rejects leaked 'half is Arabic' and uses 'this matter'`, () => {
    const result = buildCorporateBridgeOffline(NONSENSE, lang);
    for (const tone of [result.tones.polite, result.tones.assertive, result.tones.executive]) {
      assert.ok(!tone.english.includes('half is Arabic'), `${lang} leaked garbage: ${tone.english}`);
      assert.ok(tone.english.includes('this matter'), `${lang} missing fallback: ${tone.english}`);
    }
  });
}
