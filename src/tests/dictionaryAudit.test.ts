import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { getTargetDictionaryAsync } from '../data/dictionaries';
import { getCurriculum } from '../data/curriculumRegistry';
import { TargetLanguage } from '../types';

const AUDIT_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'ja', 'tr', 'zh', 'ru', 'hi', 'pt', 'it', 'el', 'he', 'arz', 'apc'
];

interface AuditResult {
  lang: string;
  totalEntries: number;
  pctPhonetics: number;
  pctExamples: number;
  cefrCoverage: string;
  playableExercises: number;
  status: 'PASS' | 'FAIL';
}

describe('Comprehensive 16-Language Dictionary Audit', () => {
  const resultsTable: AuditResult[] = [];

  test('Audit and verify schema, depth, volume & progression for all 16 languages', async () => {
    for (const lang of AUDIT_LANGUAGES) {
      const dict = await getTargetDictionaryAsync(lang);

      assert.ok(dict && Array.isArray(dict), `Dictionary for ${lang} failed to load or is not an array`);
      assert.ok(dict.length > 0, `Dictionary for ${lang} has 0 entries`);

      let phoneticCount = 0;
      let exampleCount = 0;
      const cefrCounts: Record<string, number> = { A0: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };

      for (const entry of dict) {
        // Required schema validation
        assert.ok(entry.word && entry.word.trim().length > 0, `[${lang}] Entry missing target word/term`);
        assert.ok(entry.translation && entry.translation.trim().length > 0, `[${lang}] Entry missing source translation`);
        assert.ok(entry.partOfSpeech && entry.partOfSpeech.trim().length > 0, `[${lang}] Entry missing partOfSpeech`);
        assert.ok(entry.cefrLevel && entry.cefrLevel.trim().length > 0, `[${lang}] Entry missing cefrLevel`);

        if (entry.phonetic || entry.phoneticAr || entry.reading || entry.romaji || entry.pinyin || entry.transliteration) {
          phoneticCount++;
        }
        if (entry.exampleTarget || entry.exampleDe || entry.exampleSentenceGerman || entry.exampleSentenceJapanese || entry.exampleSentence) {
          exampleCount++;
        }

        const level = entry.cefrLevel || 'A1';
        cefrCounts[level] = (cefrCounts[level] || 0) + 1;
      }

      const total = dict.length;
      assert.ok(total >= 1500, `[${lang}] Dictionary has only ${total} entries, expected >= 1500`);

      assert.ok(cefrCounts['A0'] > 0, `[${lang}] 0 entries in A0`);
      assert.ok(cefrCounts['A1'] > 0, `[${lang}] 0 entries in A1`);
      assert.ok(cefrCounts['A2'] > 0, `[${lang}] 0 entries in A2`);
      const b1Plus = (cefrCounts['B1'] || 0) + (cefrCounts['B2'] || 0) + (cefrCounts['C1'] || 0);
      assert.ok(b1Plus > 0, `[${lang}] 0 entries in B1+`);

      const pctPhonetics = Math.round((phoneticCount / total) * 100);
      const pctExamples = Math.round((exampleCount / total) * 100);

      // Verify 100% phonetics and examples coverage
      assert.ok(pctPhonetics >= 100, `[${lang}] Phonetic coverage is ${pctPhonetics}%, expected 100%`);
      assert.ok(pctExamples >= 100, `[${lang}] Example sentence coverage is ${pctExamples}%, expected 100%`);

      // Verify curriculum and exercise generation (at least 60+ distinct exercises)
      const phases = getCurriculum('ar', lang as TargetLanguage);
      assert.ok(phases.length >= 3, `[${lang}] Curriculum must generate at least 3 phases, got ${phases.length}`);

      const allExercises = phases.flatMap(p => p.lessons.flatMap(l => l.exercises));
      assert.ok(allExercises.length >= 60, `[${lang}] Has only ${allExercises.length} exercises, expected >= 60`);

      for (const ex of allExercises) {
        assert.ok(ex.id, `[${lang}] Exercise missing ID`);
        assert.ok(ex.arabicThought || ex.sourceThought, `[${lang}] Exercise missing prompt`);
        assert.ok(ex.englishTarget || ex.targetSentence, `[${lang}] Exercise missing target sentence`);
        assert.ok(ex.wordChips && ex.wordChips.length >= 1, `[${lang}] Exercise missing word chips`);
        assert.ok(ex.breakdownChunks && ex.breakdownChunks.length >= 1, `[${lang}] Exercise missing breakdown chunks`);
      }

      const cefrSummary = `A0:${cefrCounts.A0||0} A1:${cefrCounts.A1||0} A2:${cefrCounts.A2||0} B1+:${(cefrCounts.B1||0)+(cefrCounts.B2||0)+(cefrCounts.C1||0)}`;

      resultsTable.push({
        lang,
        totalEntries: total,
        pctPhonetics,
        pctExamples,
        cefrCoverage: cefrSummary,
        playableExercises: allExercises.length,
        status: 'PASS',
      });
    }

    // Print summary ASCII table
    console.log('\n========================================================================================');
    console.log('                        DICTIONARY AUDIT TABLE (ALL 16 LANGUAGES)                       ');
    console.log('========================================================================================');
    console.log('| LANG | TOTAL ENTRIES | % PHONETICS | % EXAMPLES | CEFR TIER COVERAGE | EXERCISES | STATUS |');
    console.log('|------|---------------|-------------|------------|--------------------|-----------|--------|');
    for (const r of resultsTable) {
      const langCol = r.lang.padEnd(4);
      const totalCol = String(r.totalEntries).padStart(13);
      const phonCol = (r.pctPhonetics + '%').padStart(11);
      const exCol = (r.pctExamples + '%').padStart(10);
      const cefrCol = r.cefrCoverage.padEnd(18);
      const exCountCol = String(r.playableExercises).padStart(9);
      const statusCol = r.status.padEnd(6);
      console.log(`| ${langCol} | ${totalCol} | ${phonCol} | ${exCol} | ${cefrCol} | ${exCountCol} | ${statusCol} |`);
    }
    console.log('========================================================================================\n');
  });
});
