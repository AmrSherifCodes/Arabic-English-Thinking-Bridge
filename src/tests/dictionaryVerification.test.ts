import { describe, test } from 'node:test';
import { ok } from 'node:assert';
import { getTargetDictionaryAsync } from '../data/dictionaries';

describe('Dictionary Profiles Verification', () => {
  const targetLanguages = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'hi', 'el'];

  targetLanguages.forEach((lang) => {
    test(`should successfully load dictionary for target language: ${lang}`, async () => {
      const dict = await getTargetDictionaryAsync(lang as any);
      ok(dict !== undefined);
      ok(Array.isArray(dict));
      if (dict.length > 0) {
        ok('word' in dict[0]);
      }
    });
  });

  const sourceDialects = ['arz', 'apc', 'afb', 'ary'];
  sourceDialects.forEach((dialect) => {
    test(`should safely resolve dialects for source: ${dialect}`, async () => {
      const dict = await getTargetDictionaryAsync(dialect as any);
      ok(dict !== undefined);
      ok(Array.isArray(dict));
    });
  });
});
