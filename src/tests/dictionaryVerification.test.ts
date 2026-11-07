import { describe, it, expect } from 'vitest';
import { getTargetDictionaryAsync } from '../data/dictionaries';

describe('Dictionary Profiles Verification', () => {
  const targetLanguages = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'hi', 'el'];

  targetLanguages.forEach((lang) => {
    it(`should successfully load dictionary for target language: ${lang}`, async () => {
      const dict = await getTargetDictionaryAsync(lang as any);
      expect(dict).toBeDefined();
      expect(Array.isArray(dict)).toBe(true);
      if (dict.length > 0) {
        expect(dict[0]).toHaveProperty('word');
      }
    });
  });

  const sourceDialects = ['arz', 'apc', 'afb', 'ary'];
  sourceDialects.forEach((dialect) => {
    it(`should safely resolve dialetcs for source: ${dialect}`, async () => {
      const dict = await getTargetDictionaryAsync(dialect as any);
      expect(dict).toBeDefined();
      expect(Array.isArray(dict)).toBe(true);
    });
  });
});
