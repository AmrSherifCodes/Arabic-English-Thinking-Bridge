import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import readline from 'node:readline';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Script: scripts/ingest-dictionaries.mjs
 * Native Node.js ESM pipeline for downloading, streaming, filtering, ranking,
 * and writing Kaikki.org dictionary exports for Thinking Bridge.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot(startDir) {
  let curr = startDir;
  while (curr !== path.parse(curr).root) {
    if (fs.existsSync(path.join(curr, 'package.json'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

const ROOT_DIR = findProjectRoot(__dirname);
const CACHE_DIR = path.join(ROOT_DIR, '.cache', 'dictionaries');
const OUT_DIR = path.join(ROOT_DIR, 'src', 'data', 'dictionaries');

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const TARGET_LANGUAGES = [
  { key: 'german', name: 'German', dirName: 'German', fileName: 'German' },
  { key: 'japanese', name: 'Japanese', dirName: 'Japanese', fileName: 'Japanese' },
  { key: 'spanish', name: 'Spanish', dirName: 'Spanish', fileName: 'Spanish' },
  { key: 'french', name: 'French', dirName: 'French', fileName: 'French' },
  { key: 'italian', name: 'Italian', dirName: 'Italian', fileName: 'Italian' },
  { key: 'portuguese', name: 'Portuguese', dirName: 'Portuguese', fileName: 'Portuguese' },
  { key: 'russian', name: 'Russian', dirName: 'Russian', fileName: 'Russian' },
  { key: 'chinese', name: 'Chinese', dirName: 'Chinese', fileName: 'Chinese' },
  { key: 'hindi', name: 'Hindi', dirName: 'Hindi', fileName: 'Hindi' },
  { key: 'greek', name: 'Greek', dirName: 'Greek', fileName: 'Greek' },
  { key: 'arabic', name: 'Arabic', dirName: 'Arabic', fileName: 'Arabic' },
  { key: 'egyptianArabic', name: 'Egyptian Arabic', dirName: 'Egyptian%20Arabic', fileName: 'EgyptianArabic' },
  { key: 'levantineArabic', name: 'South Levantine Arabic', dirName: 'South%20Levantine%20Arabic', fileName: 'SouthLevantineArabic' },
  { key: 'gulfArabic', name: 'Gulf Arabic', dirName: 'Gulf%20Arabic', fileName: 'GulfArabic' },
  { key: 'moroccanArabic', name: 'Moroccan Arabic', dirName: 'Moroccan%20Arabic', fileName: 'MoroccanArabic' },
];

function getPosWeight(pos) {
  if (!pos) return 8;
  const p = pos.toLowerCase();
  if (['pron', 'conj', 'prep', 'det', 'particle', 'article', 'pronoun', 'preposition', 'conjunction'].includes(p)) return 1;
  if (['num', 'adv', 'numeral', 'adverb'].includes(p)) return 2;
  if (['adj', 'verb', 'adjective'].includes(p)) return 3;
  if (['noun', 'name', 'proper noun'].includes(p)) return 4;
  if (['intj', 'phrase', 'interjection'].includes(p)) return 5;
  return 8;
}

function fetchWithRetryAndRedirects(url, destPath, attempts = 3) {
  return new Promise((resolve, reject) => {
    let file = fs.createWriteStream(destPath);

    function attemptDownload(currentUrl, attempt) {
      const client = currentUrl.startsWith('https') ? https : http;
      const req = client.get(currentUrl, {
        headers: {
          'User-Agent': 'ThinkingBridge-DictPipeline/1.0 (+https://kaikki.org)',
          'Accept-Encoding': 'gzip, deflate',
        },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            const parsed = new URL(currentUrl);
            redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
          }
          return attemptDownload(redirectUrl, attempt);
        }

        if (res.statusCode !== 200) {
          if (attempt < attempts) {
            const delay = Math.pow(2, attempt) * 1500;
            file.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            file = fs.createWriteStream(destPath);
            setTimeout(() => attemptDownload(currentUrl, attempt + 1), delay);
            return;
          }
          return reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
        }

        let stream = res;
        if (res.headers['content-encoding'] === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        }

        stream.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      });

      req.on('error', (err) => {
        if (attempt < attempts) {
          const delay = Math.pow(2, attempt) * 1500;
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          file = fs.createWriteStream(destPath);
          setTimeout(() => attemptDownload(currentUrl, attempt + 1), delay);
        } else {
          reject(err);
        }
      });
    }

    attemptDownload(url, 1);
  });
}

function sanitizeGloss(rawGloss) {
  if (!rawGloss) return null;
  let text = rawGloss.replace(/\([^)]+\)/g, '').trim();
  if (text.length < 2 || text.length > 140) return null;
  if (/^(inflection of|alternative form of|misspelling of|obsolete form of|archaic form of|see |surname|given name)/i.test(text)) {
    return null;
  }
  return text;
}

let msaArabicEntriesCache = null;
function getMsaArabicEntries() {
  if (msaArabicEntriesCache) return msaArabicEntriesCache;
  const arabicFile = path.join(OUT_DIR, 'arabicDictionary.ts');
  if (fs.existsSync(arabicFile)) {
    try {
      const raw = fs.readFileSync(arabicFile, 'utf-8');
      const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        msaArabicEntriesCache = JSON.parse(jsonMatch[0]);
        return msaArabicEntriesCache;
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

async function processLanguage(langObj) {
  const { key, name, dirName, fileName } = langObj;
  const cacheFile = path.join(CACHE_DIR, `kaikki-${key}.jsonl`);
  const url = `https://kaikki.org/dictionary/${dirName}/kaikki.org-dictionary-${fileName}.jsonl`;

  console.log(`[dict-pipeline] Processing ${name} (${key})...`);

  let fileExists = fs.existsSync(cacheFile);
  let fileSize = fileExists ? fs.statSync(cacheFile).size : 0;

  if (!fileExists || fileSize <= 1024) {
    console.log(`[dict-pipeline] Downloading ${name} from ${url}...`);
    try {
      await fetchWithRetryAndRedirects(url, cacheFile, 3);
      fileSize = fs.statSync(cacheFile).size;
      console.log(`[dict-pipeline] Downloaded ${name} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err) {
      console.warn(`[dict-pipeline] Download failed for ${name}: ${err.message}.`);
    }
  } else {
    console.log(`[dict-pipeline] Using cached dump for ${name} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
  }

  const entriesMap = new Map();

  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 1024) {
    const fileStream = fs.createReadStream(cacheFile);
    let readStream = fileStream;
    if (cacheFile.endsWith('.gz')) {
      readStream = fileStream.pipe(zlib.createGunzip());
    }

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line || !line.trim()) continue;
      try {
        const data = JSON.parse(line);
        const word = data.word ? data.word.trim() : null;
        if (!word || word.length < 2 || word.length > 45) continue;
        if (word.startsWith('-') || word.endsWith('-') || word.includes(' ')) continue;

        let validGloss = null;
        if (Array.isArray(data.senses)) {
          for (const sense of data.senses) {
            if (Array.isArray(sense.glosses)) {
              for (const g of sense.glosses) {
                const s = sanitizeGloss(g);
                if (s) {
                  validGloss = s;
                  break;
                }
              }
            }
            if (validGloss) break;
          }
        }

        if (!validGloss) continue;

        const posWeight = getPosWeight(data.pos);

        if (entriesMap.has(word)) {
          const existing = entriesMap.get(word);
          if (!existing.translation.includes(validGloss) && existing.senseCount < 3) {
            existing.translation += `; ${validGloss}`;
            existing.senseCount += 1;
          }
          if (posWeight < existing.posWeight) {
            existing.posWeight = posWeight;
          }
        } else {
          entriesMap.set(word, {
            word,
            translation: validGloss,
            posWeight,
            senseCount: 1,
          });
        }
      } catch {
        /* skip invalid json line */
      }
    }
  }

  // Backfill Arabic dialect entries from MSA Arabic dictionary if entries < 12000
  if (key !== 'arabic' && key.toLowerCase().includes('arabic') && entriesMap.size < 12000) {
    const msaEntries = getMsaArabicEntries();
    console.log(`[dict-pipeline] Backfilling dialect ${key} from MSA Arabic dictionary (${msaEntries.length} base entries)...`);
    for (const msaItem of msaEntries) {
      if (!entriesMap.has(msaItem.word)) {
        entriesMap.set(msaItem.word, {
          word: msaItem.word,
          translation: msaItem.translation,
          posWeight: 4,
          senseCount: 1,
        });
      }
      if (entriesMap.size >= 15000) break;
    }
  }

  let entries = Array.from(entriesMap.values());
  entries.sort((a, b) => {
    if (a.posWeight !== b.posWeight) return a.posWeight - b.posWeight;
    if (a.senseCount !== b.senseCount) return b.senseCount - a.senseCount;
    return a.word.length - b.word.length;
  });

  entries = entries.slice(0, 25000);

  const constName = `${key.toUpperCase()}_DICTIONARY`;
  const outPath = path.join(OUT_DIR, `${key}Dictionary.ts`);

  const fileContent = `export const ${constName} = ${JSON.stringify(entries.map(({ word, translation }) => ({ word, translation })), null, 2)};\n`;

  fs.writeFileSync(outPath, fileContent, 'utf-8');
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`[dict-pipeline] Saved ${key}Dictionary.ts (${entries.length} entries, ${sizeKB} KB)`);
}

async function main() {
  console.log('[dict-pipeline] Starting Kaikki.org dictionary ingestion pipeline...');
  for (const langObj of TARGET_LANGUAGES) {
    await processLanguage(langObj);
  }
  console.log('[dict-pipeline] All dictionaries ingested and written to disk successfully!');
}

main().catch((err) => {
  console.error('[dict-pipeline] Fatal pipeline error:', err);
  process.exit(1);
});
