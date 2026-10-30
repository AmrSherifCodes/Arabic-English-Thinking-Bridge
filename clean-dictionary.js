import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DICTIONARY_PATH = path.join(ROOT_DIR, 'public', 'dictionary.json');
const BACKUP_PATH = path.join(ROOT_DIR, 'public', 'dictionary.backup.json');
const VALID_PARTS_OF_SPEECH = new Set([
  'noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction',
  'pronoun', 'interjection', 'phrase',
]);
const VALID_SITUATIONS = new Set(['student', 'call-center', 'public-matter']);
const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_DIALECTS = new Set(['egyptian', 'msa']);

function normalizeArabic(text) {
  return text.normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\u0653/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEnglish(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeSituation(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[\s_]+/g, '-')
    : '';
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;

  const partOfSpeech = typeof entry.partOfSpeech === 'string'
    ? entry.partOfSpeech.trim().toLowerCase()
    : '';
  const level = typeof entry.level === 'string' ? entry.level.trim().toLowerCase() : undefined;
  const dialect = typeof entry.dialect === 'string' ? entry.dialect.trim().toLowerCase() : 'msa';
  const situations = Array.isArray(entry.situations)
    ? [...new Set(entry.situations.map(normalizeSituation))]
    : [];
  const normalized = {
    arabicWord: typeof entry.arabicWord === 'string' ? entry.arabicWord.trim() : '',
    englishTranslation: typeof entry.englishTranslation === 'string' ? entry.englishTranslation.trim() : '',
    partOfSpeech,
    dialect,
    ...(level === undefined ? {} : { level }),
    situations,
    exampleSentenceArabic: typeof entry.exampleSentenceArabic === 'string' ? entry.exampleSentenceArabic.trim() : '',
    exampleSentenceEnglish: typeof entry.exampleSentenceEnglish === 'string' ? entry.exampleSentenceEnglish.trim() : '',
  };

  const valid = normalized.arabicWord &&
    normalized.englishTranslation &&
    VALID_PARTS_OF_SPEECH.has(partOfSpeech) &&
    VALID_DIALECTS.has(dialect) &&
    (level === undefined || VALID_LEVELS.has(level)) &&
    situations.length > 0 &&
    situations.every((situation) => VALID_SITUATIONS.has(situation)) &&
    normalized.exampleSentenceArabic &&
    normalized.exampleSentenceEnglish;
  return valid ? normalized : null;
}

function cleanDictionary() {
  if (!fs.existsSync(DICTIONARY_PATH)) {
    throw new Error('public/dictionary.json does not exist yet.');
  }

  const rawData = fs.readFileSync(DICTIONARY_PATH, 'utf8');
  const entries = JSON.parse(rawData);
  if (!Array.isArray(entries)) {
    throw new Error('The root of public/dictionary.json must be a JSON array.');
  }

  const seenPairs = new Set();
  const seenArabicParts = new Set();
  const cleanedEntries = [];
  let invalidCount = 0;
  let duplicateCount = 0;

  for (const entry of entries) {
    const normalized = normalizeEntry(entry);
    if (!normalized) {
      invalidCount++;
      continue;
    }

    const arabic = normalizeArabic(normalized.arabicWord);
    const pairKey = `${arabic}|${normalizeEnglish(normalized.englishTranslation)}|${normalized.dialect}`;
    const arabicPartKey = `${arabic}|${normalized.partOfSpeech}|${normalized.dialect}`;
    if (seenPairs.has(pairKey) || seenArabicParts.has(arabicPartKey)) {
      duplicateCount++;
      continue;
    }

    seenPairs.add(pairKey);
    seenArabicParts.add(arabicPartKey);
    cleanedEntries.push(normalized);
  }

  const backupCreated = !fs.existsSync(BACKUP_PATH);
  if (backupCreated) {
    fs.copyFileSync(DICTIONARY_PATH, BACKUP_PATH, fs.constants.COPYFILE_EXCL);
  }

  const temporaryPath = `${DICTIONARY_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(cleanedEntries, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, DICTIONARY_PATH);

  const posStats = {};
  const levelStats = {};
  const situationStats = {};
  for (const entry of cleanedEntries) {
    posStats[entry.partOfSpeech] = (posStats[entry.partOfSpeech] || 0) + 1;
    const level = entry.level || 'unassigned';
    levelStats[level] = (levelStats[level] || 0) + 1;
    for (const situation of entry.situations) {
      situationStats[situation] = (situationStats[situation] || 0) + 1;
    }
  }

  console.log(`Initial entries: ${entries.length}`);
  console.log(`Invalid entries removed: ${invalidCount}`);
  console.log(`Duplicates removed: ${duplicateCount}`);
  console.log(`Clean total: ${cleanedEntries.length}/8000`);
  console.log(`Backup: ${path.relative(ROOT_DIR, BACKUP_PATH)}${backupCreated ? '' : ' (existing backup preserved)'}`);
  console.log('Counts by level:');
  console.table(levelStats);
  console.log('Counts by part of speech:');
  console.table(posStats);
  console.log('Counts by situation:');
  console.table(situationStats);
}

try {
  cleanDictionary();
} catch (error) {
  console.error(`Dictionary cleanup failed: ${error.message}`);
  process.exitCode = 1;
}
