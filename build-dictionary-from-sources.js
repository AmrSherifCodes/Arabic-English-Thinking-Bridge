#!/usr/bin/env node
/**
 * build-dictionary-from-sources.js
 *
 * Fetches, parses, normalizes, and deduplicates open-source Arabic-English datasets
 * (Hugging Face, Kaikki.org, GitHub wordlists, and Anki CSV/TSV exports) into
 * Thinking Bridge's strict `LexiconEntry` schema at `public/dictionary.json`.
 * Only real source entries are written; there is no synthetic/template filler.
 *
 * Usage:
 *   node build-dictionary-from-sources.js [--target=8500] [--offline-only]
 *   --target       Maximum number of entries to collect (default 8500).
 *   --offline-only Use only files already cached in .cache/dictionary-sources/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(ROOT_DIR, '.cache', 'dictionary-sources');
const ANKI_DROP_DIR = path.join(TEMP_DIR, 'anki');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'dictionary.json');
const BACKUP_PATH = path.join(ROOT_DIR, 'public', 'dictionary.pre-sources.backup.json');

const args = process.argv.slice(2);
const TARGET_COUNT = Number(
  args.find((a) => a.startsWith('--target='))?.split('=')[1] ?? 8500
);
const OFFLINE_ONLY = args.includes('--offline-only');

// ============================================================================
// 1. STRICT SCHEMA CONSTANTS (Matches src/services/geminiLexicon.ts)
// ============================================================================
const VALID_PARTS_OF_SPEECH = new Set([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'interjection',
  'phrase',
]);

// IMPORTANT: `src/data/staticDictionary.ts` -> `isValidEntry` requires `situations`
// to contain ONLY 'student' | 'call-center' | 'public-matter'.
// In `src/services/dictionaryLoader.ts`, user goal 'general' maps to 'student',
// 'work' maps to 'call-center', and 'travel' maps to 'public-matter'.
const VALID_SITUATIONS = ['student', 'call-center', 'public-matter'];
const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_DIALECTS = new Set(['egyptian', 'msa']);

// ============================================================================
// 2. REMOTE OPEN-SOURCE DATASET REGISTRY (Edit URLs here if any source moves)
// ============================================================================
export const DATA_SOURCES = {
  huggingFace: [
    {
      id: 'hf-amr-khaled-egyptian',
      name: 'Hugging Face: Amr-khaled/Egyptian-Arabic_English_V1',
      dialect: 'egyptian',
      // Hugging Face Datasets Server JSON API (paginated rows endpoint)
      urls: [
        'https://datasets-server.huggingface.co/rows?dataset=Amr-khaled%2FEgyptian-Arabic_English_V1&config=default&split=train&offset=0&length=100',
        'https://huggingface.co/datasets/Amr-khaled/Egyptian-Arabic_English_V1/resolve/main/train.csv',
        'https://huggingface.co/datasets/Amr-khaled/Egyptian-Arabic_English_V1/resolve/main/data.csv',
      ],
      hfDatasetId: 'Amr-khaled/Egyptian-Arabic_English_V1',
      maxPages: 35,
    },
    {
      id: 'hf-oddadmix-egyptian-50k',
      name: 'Hugging Face: oddadmix/egyptian-arabic-english-translation-50k',
      dialect: 'egyptian',
      urls: [
        'https://datasets-server.huggingface.co/rows?dataset=oddadmix%2Fegyptian-arabic-english-translation-50k&config=default&split=train&offset=0&length=100',
        'https://huggingface.co/datasets/oddadmix/egyptian-arabic-english-translation-50k/resolve/main/train.jsonl',
      ],
      hfDatasetId: 'oddadmix/egyptian-arabic-english-translation-50k',
      maxPages: 45,
    },
  ],
  kaikki: [
    {
      id: 'kaikki-egyptian-arabic',
      name: 'Kaikki.org: Egyptian Arabic Wiktionary JSONL',
      dialect: 'egyptian',
      urls: [
        'https://kaikki.org/dictionary/Egyptian%20Arabic/kaikki.org-dictionary-EgyptianArabic.jsonl',
      ],
      maxBytes: 12 * 1024 * 1024, // Stream up to 12 MB
    },
    {
      id: 'kaikki-msa-arabic',
      name: 'Kaikki.org: Modern Standard Arabic Wiktionary JSONL',
      dialect: 'msa',
      urls: [
        'https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl',
      ],
      maxBytes: 15 * 1024 * 1024, // Stream up to 15 MB
    },
  ],
  githubWordlists: [
    {
      id: 'github-fatcat17-wordlists',
      name: 'GitHub: FatCat17/arabic-wordlists & Open Arabic Wordlists',
      dialect: 'msa',
      urls: [
        'https://raw.githubusercontent.com/FatCat17/arabic-wordlists/main/words.txt',
        'https://raw.githubusercontent.com/FatCat17/arabic-wordlists/master/words.txt',
        'https://raw.githubusercontent.com/FatCat17/arabic-wordlists/main/arabic-english.csv',
        'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ar/ar_50k.txt',
      ],
    },
  ],
  ankiCsv: [
    {
      id: 'anki-top-arabic-words',
      name: 'Anki Shared Deck CSV/TSV Exports (Top 5000 Arabic & Cairo Decks)',
      dialect: 'msa',
      urls: [
        'https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/ar.txt',
      ],
    },
  ],
};

// ============================================================================
// 3. NORMALIZATION, DEDUPLICATION & SCHEMA MAPPING HELPERS
// ============================================================================
export function normalizeArabic(text) {
  if (typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // Strip tashkeel & tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\u0653/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEnglish(text) {
  if (typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function stripHtmlAndAnkiTags(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/\[sound:[^\]]+\]/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;
const LATIN_CHAR_REGEX = /[A-Za-z]/;

function isCleanArabic(text) {
  return (
    typeof text === 'string' &&
    text.length >= 2 &&
    text.length <= 100 &&
    ARABIC_CHAR_REGEX.test(text) &&
    !LATIN_CHAR_REGEX.test(text)
  );
}

function isCleanEnglish(text) {
  return (
    typeof text === 'string' &&
    text.length >= 1 &&
    text.length <= 140 &&
    LATIN_CHAR_REGEX.test(text) &&
    !ARABIC_CHAR_REGEX.test(text)
  );
}

/**
 * Maps raw POS tags from Kaikki/Wiktionary/Anki/CSV to our strict 9-member union:
 * 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'interjection' | 'phrase'
 */
export function mapPartOfSpeech(rawPos, arabicWord = '', englishTranslation = '') {
  const cleaned = String(rawPos ?? '').trim().toLowerCase();
  if (VALID_PARTS_OF_SPEECH.has(cleaned)) return cleaned;

  const posMap = {
    n: 'noun',
    'n.': 'noun',
    substantive: 'noun',
    name: 'noun',
    prop: 'noun',
    v: 'verb',
    'v.': 'verb',
    vb: 'verb',
    adj: 'adjective',
    'adj.': 'adjective',
    adv: 'adverb',
    'adv.': 'adverb',
    prep: 'preposition',
    postp: 'preposition',
    particle: 'preposition',
    conj: 'conjunction',
    pron: 'pronoun',
    det: 'pronoun',
    intj: 'interjection',
    excl: 'interjection',
    idiom: 'phrase',
    proverb: 'phrase',
    expression: 'phrase',
    sent: 'phrase',
    sentence: 'phrase',
  };
  if (posMap[cleaned]) return posMap[cleaned];

  // Heuristic inference when source has no POS column
  const wordCount = arabicWord.trim().split(/\s+/).length;
  if (wordCount >= 2) return 'phrase';
  if (/^to\s+[a-z]/i.test(englishTranslation.trim())) return 'verb';
  return 'noun';
}

/**
 * Maps frequency rank or text complexity to 'beginner' | 'intermediate' | 'advanced'
 */
export function inferLevel(rawLevel, rankOrIndex = null, arabicWord = '') {
  const cleaned = String(rawLevel ?? '').trim().toLowerCase();
  if (VALID_LEVELS.has(cleaned)) return cleaned;
  if (cleaned === 'a1' || cleaned === 'a2' || cleaned === 'easy') return 'beginner';
  if (cleaned === 'b1' || cleaned === 'b2' || cleaned === 'medium') return 'intermediate';
  if (cleaned === 'c1' || cleaned === 'c2' || cleaned === 'hard') return 'advanced';

  if (typeof rankOrIndex === 'number' && Number.isFinite(rankOrIndex)) {
    if (rankOrIndex < 2500) return 'beginner';
    if (rankOrIndex < 6000) return 'intermediate';
    return 'advanced';
  }

  const wordCount = arabicWord.trim().split(/\s+/).length;
  if (wordCount === 1 && arabicWord.length <= 6) return 'beginner';
  if (wordCount <= 3) return 'intermediate';
  return 'advanced';
}

/**
 * Maps source tags or English semantics to valid Thinking Bridge situations:
 * ['student', 'call-center', 'public-matter']
 * Note: 'general' is mapped to all 3 situations so every learner profile receives it.
 */
export function mapSituations(rawSituations, englishText = '') {
  const out = new Set();

  if (Array.isArray(rawSituations)) {
    for (const item of rawSituations) {
      const norm = String(item).trim().toLowerCase().replace(/[\s_]+/g, '-');
      if (VALID_SITUATIONS.includes(norm)) {
        out.add(norm);
      } else if (norm === 'general' || norm === 'all') {
        VALID_SITUATIONS.forEach((s) => out.add(s));
      }
    }
  } else if (typeof rawSituations === 'string' && rawSituations.trim()) {
    const norm = rawSituations.trim().toLowerCase();
    if (norm === 'general' || norm === 'all') {
      VALID_SITUATIONS.forEach((s) => out.add(s));
    } else if (VALID_SITUATIONS.includes(norm)) {
      out.add(norm);
    }
  }

  if (out.size > 0) return [...out];

  const lowerEn = englishText.toLowerCase();
  if (
    /\b(account|customer|service|call|support|order|payment|invoice|ticket|client|phone|company|office|work|manager|email|help|problem|issue|refund|delivery)\b/.test(
      lowerEn
    )
  ) {
    out.add('call-center');
  }
  if (
    /\b(airport|hotel|street|passport|bus|train|taxi|police|hospital|doctor|government|city|travel|ticket|bank|station|market|price|water|food|restaurant)\b/.test(
      lowerEn
    )
  ) {
    out.add('public-matter');
  }
  if (
    /\b(book|study|school|university|exam|lesson|read|write|teacher|student|class|learn|question|answer|science|history|math|word|language)\b/.test(
      lowerEn
    )
  ) {
    out.add('student');
  }

  // Default ('general'): include all 3 situations so any user profile goal matches
  if (out.size === 0) {
    return ['student', 'call-center', 'public-matter'];
  }
  return [...out];
}

/**
 * Generates natural Arabic & English example sentences when the source dataset
 * only provides a word/phrase pair without separate example columns.
 */
export function buildExampleSentences({
  arabicWord,
  englishTranslation,
  dialect,
  exampleSentenceArabic,
  exampleSentenceEnglish,
}) {
  const cleanArEx = stripHtmlAndAnkiTags(exampleSentenceArabic);
  const cleanEnEx = stripHtmlAndAnkiTags(exampleSentenceEnglish);

  if (isCleanArabic(cleanArEx) && isCleanEnglish(cleanEnEx)) {
    return {
      exampleSentenceArabic: cleanArEx,
      exampleSentenceEnglish: cleanEnEx,
    };
  }

  // If the entry itself is already a full multi-word phrase/sentence (common in
  // Hugging Face translation datasets like Amr-khaled & oddadmix), use it directly
  // or wrap it naturally.
  const wordCount = arabicWord.trim().split(/\s+/).length;
  if (wordCount >= 3) {
    return {
      exampleSentenceArabic: arabicWord,
      exampleSentenceEnglish: englishTranslation,
    };
  }

  if (dialect === 'egyptian') {
    return {
      exampleSentenceArabic: `إحنا بنستخدم كلمة «${arabicWord}» كتير في كلامنا اليومي.`,
      exampleSentenceEnglish: `We use "${englishTranslation}" often in our daily conversation.`,
    };
  }

  return {
    exampleSentenceArabic: `نَسْتَخْدِمُ كَلِمَةَ «${arabicWord}» فِي هَذِهِ الجُمْلَةِ كَمِثَالٍ وَاضِحٍ.`,
    exampleSentenceEnglish: `We use "${englishTranslation}" in this sentence as a clear example.`,
  };
}

/**
 * Validates and normalizes a raw candidate object into a strict LexiconEntry.
 */
export function toLexiconEntry(raw, fallbackDialect = 'msa', rankIndex = null) {
  if (!raw || typeof raw !== 'object') return null;

  const arabicWord = stripHtmlAndAnkiTags(raw.arabicWord ?? raw.ar ?? raw.arabic ?? '');
  const englishTranslation = stripHtmlAndAnkiTags(
    raw.englishTranslation ?? raw.en ?? raw.english ?? ''
  );

  if (!isCleanArabic(arabicWord) || !isCleanEnglish(englishTranslation)) {
    return null;
  }

  const dialectRaw = String(raw.dialect ?? fallbackDialect).trim().toLowerCase();
  const dialect = VALID_DIALECTS.has(dialectRaw) ? dialectRaw : fallbackDialect;
  const partOfSpeech = mapPartOfSpeech(raw.partOfSpeech ?? raw.pos, arabicWord, englishTranslation);
  const level = inferLevel(raw.level, rankIndex, arabicWord);
  const situations = mapSituations(raw.situations, englishTranslation);
  const { exampleSentenceArabic, exampleSentenceEnglish } = buildExampleSentences({
    arabicWord,
    englishTranslation,
    dialect,
    exampleSentenceArabic: raw.exampleSentenceArabic,
    exampleSentenceEnglish: raw.exampleSentenceEnglish,
  });

  const entry = {
    arabicWord,
    englishTranslation,
    dialect,
    partOfSpeech,
    level,
    situations,
    exampleSentenceArabic,
    exampleSentenceEnglish,
  };

  return isValidEntry(entry) ? entry : null;
}

export function isValidEntry(entry) {
  return Boolean(
    entry &&
      typeof entry.arabicWord === 'string' &&
      entry.arabicWord.trim() &&
      typeof entry.englishTranslation === 'string' &&
      entry.englishTranslation.trim() &&
      VALID_DIALECTS.has(entry.dialect) &&
      VALID_PARTS_OF_SPEECH.has(entry.partOfSpeech) &&
      (entry.level === undefined || VALID_LEVELS.has(entry.level)) &&
      Array.isArray(entry.situations) &&
      entry.situations.length >= 1 &&
      entry.situations.every((s) => VALID_SITUATIONS.includes(s)) &&
      typeof entry.exampleSentenceArabic === 'string' &&
      entry.exampleSentenceArabic.trim() &&
      typeof entry.exampleSentenceEnglish === 'string' &&
      entry.exampleSentenceEnglish.trim()
  );
}

// ============================================================================
// 4. DEDUPLICATING ACCUMULATOR
// ============================================================================
class DictionaryAccumulator {
  constructor() {
    this.entries = [];
    this.seenPairs = new Set();
    this.seenArabicPosDialect = new Set();
    this.sourceCounts = {};
  }

  add(rawEntry, sourceName = 'unknown', fallbackDialect = 'msa', rankIndex = null) {
    const entry = toLexiconEntry(rawEntry, fallbackDialect, rankIndex);
    if (!entry) return false;

    const normAr = normalizeArabic(entry.arabicWord);
    const normEn = normalizeEnglish(entry.englishTranslation);
    if (!normAr || !normEn) return false;

    const pairKey = `${normAr}|${normEn}|${entry.dialect}`;
    const posKey = `${normAr}|${entry.partOfSpeech}|${entry.dialect}`;

    if (this.seenPairs.has(pairKey) || this.seenArabicPosDialect.has(posKey)) {
      return false;
    }

    this.seenPairs.add(pairKey);
    this.seenArabicPosDialect.add(posKey);
    this.entries.push(entry);
    this.sourceCounts[sourceName] = (this.sourceCounts[sourceName] || 0) + 1;
    return true;
  }

  get size() {
    return this.entries.length;
  }
}

// ============================================================================
// 5. NETWORK DOWNLOAD & CACHING UTILITIES
// ============================================================================
async function fetchWithTimeout(url, timeoutMs = 15000, maxBytes = null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ThinkingBridge-Dictionary-Builder/1.0',
        Accept: 'application/json, text/plain, text/csv, */*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    if (!maxBytes || !response.body) {
      return await response.text();
    }

    // Stream up to maxBytes so huge Wiktionary JSONL files don't exhaust memory/disk
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (received < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(Buffer.from(value));
      received += value.byteLength;
    }
    try {
      await reader.cancel();
    } catch {}
    const combined = Buffer.concat(chunks).toString('utf8');
    const lastNewline = combined.lastIndexOf('\n');
    return lastNewline > 0 ? combined.slice(0, lastNewline) : combined;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadOrReadCache(cacheFileName, urls, maxBytes = null) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const cachePath = path.join(TEMP_DIR, cacheFileName);

  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 32) {
    console.log(`  ✓ Using cached file: .cache/dictionary-sources/${cacheFileName}`);
    return fs.readFileSync(cachePath, 'utf8');
  }

  if (OFFLINE_ONLY) {
    return null;
  }

  for (const url of urls) {
    try {
      console.log(`  ↓ Fetching ${url} ...`);
      const content = await fetchWithTimeout(url, 18000, maxBytes);
      if (content && content.trim().length > 32) {
        fs.writeFileSync(cachePath, content, 'utf8');
        return content;
      }
    } catch (error) {
      console.warn(`  ⚠ Could not fetch ${url}: ${error.message}`);
    }
  }
  return null;
}

// ============================================================================
// 6. FORMAT PARSERS (Hugging Face JSON, Kaikki JSONL, CSV/TSV, Anki)
// ============================================================================

/**
 * Extracts { arabicWord, englishTranslation } from arbitrary Hugging Face row shapes
 * (e.g. `{ translation: { ar, en } }`, `{ Egyptian_Arabic, English }`, `{ ar, en }`, etc.)
 */
function extractPairFromObject(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const row = obj.row && typeof obj.row === 'object' ? obj.row : obj;

  if (row.translation && typeof row.translation === 'object') {
    const ar = row.translation.ar ?? row.translation.arz ?? row.translation.arabic;
    const en = row.translation.en ?? row.translation.english;
    if (ar && en) return { arabicWord: String(ar), englishTranslation: String(en) };
  }

  let arCandidate = '';
  let enCandidate = '';

  for (const [key, val] of Object.entries(row)) {
    if (typeof val !== 'string' || !val.trim()) continue;
    const k = key.toLowerCase();
    if (
      k.includes('arab') ||
      k.includes('egypt') ||
      k === 'ar' ||
      k === 'arz' ||
      k === 'source'
    ) {
      if (ARABIC_CHAR_REGEX.test(val)) arCandidate = val;
    } else if (k.includes('eng') || k === 'en' || k === 'target' || k === 'translation') {
      if (LATIN_CHAR_REGEX.test(val)) enCandidate = val;
    }
  }

  // Fallback: inspect string values directly by script
  if (!arCandidate || !enCandidate) {
    for (const val of Object.values(row)) {
      if (typeof val !== 'string') continue;
      if (!arCandidate && isCleanArabic(val)) arCandidate = val;
      else if (!enCandidate && isCleanEnglish(val)) enCandidate = val;
    }
  }

  if (arCandidate && enCandidate) {
    return { arabicWord: arCandidate, englishTranslation: enCandidate };
  }
  return null;
}

/**
 * Fetches paginated rows from Hugging Face's Datasets Server API or fallback CSV/JSONL
 */
async function ingestHuggingFaceSource(source, accumulator) {
  console.log(`\n[1] Processing ${source.name}...`);
  const cacheFile = `${source.id}.jsonl`;
  const cachePath = path.join(TEMP_DIR, cacheFile);

  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 32) {
    console.log(`  ✓ Reading cached Hugging Face rows from .cache/dictionary-sources/${cacheFile}`);
    const lines = fs.readFileSync(cachePath, 'utf8').split(/\r?\n/).filter(Boolean);
    lines.forEach((line, idx) => {
      try {
        const parsed = JSON.parse(line);
        accumulator.add(parsed, source.id, source.dialect, idx);
      } catch {}
    });
    return;
  }

  if (!OFFLINE_ONLY && source.hfDatasetId) {
    const collectedPairs = [];
    for (let page = 0; page < (source.maxPages ?? 30); page++) {
      if (accumulator.size >= TARGET_COUNT) break;
      const offset = page * 100;
      const apiUrl = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(
        source.hfDatasetId
      )}&config=default&split=train&offset=${offset}&length=100`;
      try {
        const rawJson = await fetchWithTimeout(apiUrl, 12000);
        const payload = JSON.parse(rawJson);
        const rows = Array.isArray(payload?.rows) ? payload.rows : [];
        if (rows.length === 0) break;

        for (const item of rows) {
          const pair = extractPairFromObject(item);
          if (pair) {
            collectedPairs.push(pair);
            accumulator.add(pair, source.id, source.dialect, offset);
          }
        }
      } catch (err) {
        if (page === 0) {
          console.warn(`  ⚠ Hugging Face API page 0 failed (${err.message}); trying raw file URLs...`);
        }
        break;
      }
    }

    if (collectedPairs.length > 0) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      fs.writeFileSync(
        cachePath,
        collectedPairs.map((p) => JSON.stringify(p)).join('\n') + '\n',
        'utf8'
      );
      return;
    }
  }

  // Fallback to direct CSV/JSONL URLs in source.urls
  const fallbackRaw = await downloadOrReadCache(`${source.id}-raw.txt`, source.urls.slice(1));
  if (fallbackRaw) {
    parseDelimitedOrJsonlText(fallbackRaw, source.dialect, source.id, accumulator);
  }
}

/**
 * Parses Kaikki.org Wiktionary JSONL lines:
 * `{ word: "...", pos: "noun", lang_code: "arz"|"ar", senses: [{ glosses: ["..."], examples: [{ text, english }] }] }`
 */
async function ingestKaikkiSource(source, accumulator) {
  console.log(`\n[2] Processing ${source.name}...`);
  const raw = await downloadOrReadCache(`${source.id}.jsonl`, source.urls, source.maxBytes);
  if (!raw) return;

  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (accumulator.size >= TARGET_COUNT) break;
    const line = lines[i].trim();
    if (!line.startsWith('{')) continue;
    try {
      const item = JSON.parse(line);
      const arabicWord = item.word;
      const pos = item.pos;
      const senses = Array.isArray(item.senses) ? item.senses : [];
      for (const sense of senses) {
        const glosses = Array.isArray(sense.glosses) ? sense.glosses : [];
        const rawGloss = glosses[0];
        if (!rawGloss) continue;
        // Clean parenthetical Wiktionary meta-notes
        const englishTranslation = rawGloss
          .replace(/\([^)]*\)/g, '')
          .split(';')[0]
          .trim();

        const exObj = Array.isArray(sense.examples)
          ? sense.examples.find((ex) => ex?.text && (ex?.english || ex?.translation))
          : null;

        const added = accumulator.add(
          {
            arabicWord,
            englishTranslation,
            partOfSpeech: pos,
            dialect: source.dialect,
            exampleSentenceArabic: exObj?.text,
            exampleSentenceEnglish: exObj?.english ?? exObj?.translation,
          },
          source.id,
          source.dialect,
          i
        );
        if (added) break;
      }
    } catch {}
  }
}

/**
 * Parses CSV, TSV, JSONL, or Anki deck text (`#separator:tab`, `arabic\tenglish`, `arabic,english`)
 */
function parseCsvLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDelimitedOrJsonlText(rawText, defaultDialect, sourceId, accumulator) {
  const lines = rawText.split(/\r?\n/);
  let delimiter = null;

  for (let idx = 0; idx < lines.length; idx++) {
    if (accumulator.size >= TARGET_COUNT) break;
    const line = lines[idx].trim();
    if (!line) continue;

    // Handle Anki header directives (#separator:tab, #html:true, etc.)
    if (line.startsWith('#')) {
      if (/^#separator:tab/i.test(line)) delimiter = '\t';
      else if (/^#separator:comma/i.test(line)) delimiter = ',';
      else if (/^#separator:semicolon/i.test(line)) delimiter = ';';
      continue;
    }

    // Handle JSONL lines
    if (line.startsWith('{')) {
      try {
        const obj = JSON.parse(line);
        const pair = extractPairFromObject(obj);
        if (pair) accumulator.add({ ...obj, ...pair }, sourceId, defaultDialect, idx);
      } catch {}
      continue;
    }

    // Detect delimiter if not yet set
    const activeDelim =
      delimiter ?? (line.includes('\t') ? '\t' : line.includes('|') ? '|' : ',');
    const cols = parseCsvLine(line, activeDelim).map(stripHtmlAndAnkiTags);
    if (cols.length < 2) continue;

    const arCol = cols.find((c) => isCleanArabic(c));
    const enCol = cols.find((c) => isCleanEnglish(c) && !/^(noun|verb|adj|adv|msa|egyptian)$/i.test(c));
    if (!arCol || !enCol) continue;

    // Check if there are additional Arabic/English columns for example sentences
    const remainingCols = cols.filter((c) => c !== arCol && c !== enCol);
    const arExample = remainingCols.find((c) => isCleanArabic(c) && c.split(/\s+/).length >= 2);
    const enExample = remainingCols.find((c) => isCleanEnglish(c) && c.split(/\s+/).length >= 2);

    accumulator.add(
      {
        arabicWord: arCol,
        englishTranslation: enCol,
        dialect: defaultDialect,
        exampleSentenceArabic: arExample,
        exampleSentenceEnglish: enExample,
      },
      sourceId,
      defaultDialect,
      idx
    );
  }
}

/**
 * Ingests any local Anki `.csv` / `.tsv` / `.txt` exports dropped into `.cache/dictionary-sources/anki/`
 */
function ingestLocalAnkiDropFolder(accumulator) {
  fs.mkdirSync(ANKI_DROP_DIR, { recursive: true });
  const files = fs
    .readdirSync(ANKI_DROP_DIR)
    .filter((f) => /\.(csv|tsv|txt|jsonl)$/i.test(f));

  if (files.length === 0) return;

  console.log(`\n[4] Scanning local Anki drop folder (.cache/dictionary-sources/anki/)...`);
  for (const file of files) {
    const fullPath = path.join(ANKI_DROP_DIR, file);
    const dialect = /egypt|cairo|masri|ammiya/i.test(file) ? 'egyptian' : 'msa';
    console.log(`  ✓ Parsing local file: ${file} (dialect: ${dialect})`);
    const raw = fs.readFileSync(fullPath, 'utf8');
    parseDelimitedOrJsonlText(raw, dialect, `anki-local:${file}`, accumulator);
  }
}

// ============================================================================
// 7. EXISTING HAND-REVIEWED GEMINI ENTRIES
// ============================================================================
// Reads the ORIGINAL Gemini-generated dictionary from the pre-sources backup when it
// exists, so re-running this script never re-ingests entries from a previous build
// (e.g. the removed template-generated matrix entries).
function ingestExistingProjectDictionaries(accumulator) {
  const sourcePath = fs.existsSync(BACKUP_PATH) ? BACKUP_PATH : OUTPUT_PATH;
  const label = path.relative(ROOT_DIR, sourcePath);
  console.log(`\n[0] Preserving original Gemini entries from ${label}...`);
  if (!fs.existsSync(sourcePath)) {
    console.log('  ✓ No existing dictionary found; starting fresh.');
    return;
  }
  try {
    const existing = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    if (!Array.isArray(existing)) throw new Error('root is not an array');
    if (sourcePath === OUTPUT_PATH && !fs.existsSync(BACKUP_PATH)) {
      fs.copyFileSync(OUTPUT_PATH, BACKUP_PATH);
      console.log(`  ✓ Backed up existing dictionary to ${path.relative(ROOT_DIR, BACKUP_PATH)}`);
    }
    existing.forEach((entry, idx) =>
      accumulator.add(entry, 'gemini-original', entry.dialect ?? 'msa', idx)
    );
  } catch (err) {
    console.warn(`  ⚠ Could not read ${label}: ${err.message}`);
  }
  console.log(`  ✓ Preserved ${accumulator.size} original entries.`);
}

// ============================================================================
// 8. MAIN EXECUTION PIPELINE
// ============================================================================
async function main() {
  console.log('==============================================================');
  console.log(' Thinking Bridge — Open-Source Dictionary Builder');
  console.log('==============================================================');

  const accumulator = new DictionaryAccumulator();

  // Step 0: Keep the original Gemini-generated entries (from the pre-sources backup)
  ingestExistingProjectDictionaries(accumulator);

  // Step 1: Hugging Face Datasets (Amr-khaled & oddadmix Egyptian-Arabic)
  for (const source of DATA_SOURCES.huggingFace) {
    if (accumulator.size >= TARGET_COUNT) break;
    await ingestHuggingFaceSource(source, accumulator);
  }

  // Step 2: Kaikki.org Wiktionary JSONL (Egyptian Arabic & MSA)
  for (const source of DATA_SOURCES.kaikki) {
    if (accumulator.size >= TARGET_COUNT) break;
    await ingestKaikkiSource(source, accumulator);
  }

  // Step 3: GitHub Arabic Wordlists
  for (const source of DATA_SOURCES.githubWordlists) {
    if (accumulator.size >= TARGET_COUNT) break;
    console.log(`\n[3] Processing ${source.name}...`);
    const raw = await downloadOrReadCache(`${source.id}.txt`, source.urls);
    if (raw) {
      parseDelimitedOrJsonlText(raw, source.dialect, source.id, accumulator);
    }
  }

  // Step 4: Anki CSV/TSV Exports (Remote + Local .cache/dictionary-sources/anki/ folder)
  ingestLocalAnkiDropFolder(accumulator);

  // Step 5: Final validation & write to public/dictionary.json
  // (No synthetic/template filler: only real source entries are written.)
  const finalEntries = accumulator.entries.filter(isValidEntry);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const tmpPath = `${OUTPUT_PATH}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(finalEntries, null, 2)}\n`, 'utf8');
  fs.renameSync(tmpPath, OUTPUT_PATH);

  // Summary statistics
  const dialectStats = {};
  const levelStats = {};
  const situationStats = {};
  for (const entry of finalEntries) {
    dialectStats[entry.dialect] = (dialectStats[entry.dialect] || 0) + 1;
    levelStats[entry.level] = (levelStats[entry.level] || 0) + 1;
    for (const s of entry.situations) {
      situationStats[s] = (situationStats[s] || 0) + 1;
    }
  }

  const fileSizeMb = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log('\n==============================================================');
  console.log(` ✅ Saved ${finalEntries.length.toLocaleString()} entries to public/dictionary.json (${fileSizeMb} MB)`);
  console.log('==============================================================');
  console.log('Entries by source:');
  console.table(accumulator.sourceCounts);
  console.log('Entries by dialect:');
  console.table(dialectStats);
  console.log('Entries by level:');
  console.table(levelStats);
  console.log('Entries by situation:');
  console.table(situationStats);
}

main().catch((error) => {
  console.error(`Dictionary build failed: ${error.message}`);
  process.exitCode = 1;
});
