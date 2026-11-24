// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const QURAN_OUT_DIR = path.join(ROOT_DIR, 'public', 'data', 'quran');
const FONTS_OUT_DIR = path.join(ROOT_DIR, 'public', 'fonts');
const FONTS_CSS_PATH = path.join(ROOT_DIR, 'src', 'styles', 'fonts.css');

async function fetchJsonWithRetry(url, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const json = await res.json();
      if (!json || json.code !== 200 || !json.data || !Array.isArray(json.data.surahs)) {
        throw new Error(`Invalid payload structure from ${url}`);
      }
      return json.data.surahs;
    } catch (err) {
      lastErr = err;
      console.warn(`Attempt ${attempt}/${retries} failed for ${url}:`, err.message);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    }
  }
  throw lastErr;
}

async function bundleOfflineQuran() {
  console.log('Fetching 114-surah Quran editions (quran-uthmani, ar.muyassar, en.sahih)...');
  const [uthmaniSurahs, muyassarSurahs, sahihSurahs] = await Promise.all([
    fetchJsonWithRetry('https://api.alquran.cloud/v1/quran/quran-uthmani'),
    fetchJsonWithRetry('https://api.alquran.cloud/v1/quran/ar.muyassar'),
    fetchJsonWithRetry('https://api.alquran.cloud/v1/quran/en.sahih'),
  ]);

  if (uthmaniSurahs.length !== 114 || muyassarSurahs.length !== 114 || sahihSurahs.length !== 114) {
    throw new Error(
      `Expected 114 surahs, got uthmani=${uthmaniSurahs.length}, muyassar=${muyassarSurahs.length}, sahih=${sahihSurahs.length}`
    );
  }

  fs.mkdirSync(QURAN_OUT_DIR, { recursive: true });

  const muyassarMap = new Map(muyassarSurahs.map((s) => [s.number, s]));
  const sahihMap = new Map(sahihSurahs.map((s) => [s.number, s]));

  let totalAyahs = 0;

  for (const surah of uthmaniSurahs) {
    const num = surah.number;
    const mSurah = muyassarMap.get(num);
    const eSurah = sahihMap.get(num);

    if (!mSurah || !eSurah) {
      throw new Error(`Missing paired edition for surah ${num}`);
    }

    const mByAyah = new Map((mSurah.ayahs || []).map((a) => [a.numberInSurah, (a.text || '').trim()]));
    const eByAyah = new Map((eSurah.ayahs || []).map((a) => [a.numberInSurah, (a.text || '').trim()]));

    const ayahs = (surah.ayahs || []).map((a) => {
      const globalNum = a.number;
      const inSurah = a.numberInSurah;
      const textUthmani = (a.text || '').trim();
      if (!textUthmani || !Number.isInteger(globalNum) || globalNum < 1 || globalNum > 6236) {
        throw new Error(`Invalid ayah data in surah ${num}, ayah ${inSurah}`);
      }
      return {
        number: globalNum,
        numberInSurah: inSurah,
        juz: a.juz || 1,
        page: a.page || 1,
        textUthmani,
        audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.husary/${globalNum}.mp3`,
        audioFallbackUrl: `https://cdn.islamic.network/quran/audio/64/ar.husary/${globalNum}.mp3`,
        tafsirMuyassar: mByAyah.get(inSurah) || '',
        translationEn: eByAyah.get(inSurah) || '',
        transliterationEn: '',
      };
    });

    if (ayahs.length === 0) {
      throw new Error(`Surah ${num} has 0 ayahs`);
    }

    totalAyahs += ayahs.length;

    const outPayload = {
      number: num,
      name: surah.name || '',
      englishName: surah.englishName || '',
      englishNameTranslation: surah.englishNameTranslation || '',
      revelationType: surah.revelationType || 'Meccan',
      numberOfAyahs: surah.numberOfAyahs || ayahs.length,
      ayahs,
    };

    fs.writeFileSync(path.join(QURAN_OUT_DIR, `${num}.json`), JSON.stringify(outPayload));
  }

  if (totalAyahs !== 6236) {
    throw new Error(`Integrity check failed: expected 6236 total ayahs, got ${totalAyahs}`);
  }

  fs.writeFileSync(
    path.join(QURAN_OUT_DIR, 'manifest.json'),
    JSON.stringify(
      {
        version: 1,
        surahCount: 114,
        ayahCount: totalAyahs,
        offlineReady: true,
        source: 'api.alquran.cloud/v1',
        editions: ['quran-uthmani', 'ar.muyassar', 'en.sahih'],
      },
      null,
      2
    )
  );

  console.log(`Bundled 114 surahs (${totalAyahs} ayahs) into ${QURAN_OUT_DIR}`);
}

async function bundleLocalFonts() {
  console.log('Fetching Google Fonts CSS & local WOFF2 files (IBM Plex Sans Arabic, Readex Pro, Plus Jakarta Sans, Amiri)...');
  const cssUrl =
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap';

  const res = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch font CSS: HTTP ${res.status}`);
  }

  const rawCss = await res.text();
  fs.mkdirSync(FONTS_OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(FONTS_CSS_PATH), { recursive: true });

  // Only keep arabic & latin subsets to keep APK lean while crisp offline
  const blockRegex = /\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/gi;
  const keptBlocks = [];
  const urlToLocalName = new Map();
  let fileIdx = 0;

  let match;
  while ((match = blockRegex.exec(rawCss)) !== null) {
    const subset = match[1].toLowerCase();
    const block = match[2];
    if (subset !== 'arabic' && subset !== 'latin') {
      continue;
    }

    const urlMatch = block.match(/url\((https:\/\/[^)]+\.woff2)\)/i);
    if (!urlMatch) continue;
    const remoteUrl = urlMatch[1];

    const familyMatch = block.match(/font-family:\s*'([^']+)'/i);
    const weightMatch = block.match(/font-weight:\s*(\d+)/i);
    const slug = (familyMatch?.[1] || 'font').toLowerCase().replace(/\s+/g, '-');
    const weight = weightMatch?.[1] || '400';

    let localFile = urlToLocalName.get(remoteUrl);
    if (!localFile) {
      fileIdx += 1;
      localFile = `${slug}-${subset}-${weight}-${fileIdx}.woff2`;
      urlToLocalName.set(remoteUrl, localFile);

      const fontRes = await fetch(remoteUrl, { signal: AbortSignal.timeout(30000) });
      if (!fontRes.ok) {
        throw new Error(`Failed to download font ${remoteUrl}: HTTP ${fontRes.status}`);
      }
      const buf = Buffer.from(await fontRes.arrayBuffer());
      fs.writeFileSync(path.join(FONTS_OUT_DIR, localFile), buf);
    }

    const localizedBlock = block.replace(remoteUrl, `/fonts/${localFile}`);
    keptBlocks.push(`/* ${subset} */\n${localizedBlock}`);
  }

  if (keptBlocks.length === 0) {
    throw new Error('No @font-face blocks matched arabic/latin subsets');
  }

  const header = `/* Auto-generated offline-ready font faces (IBM Plex Sans Arabic, Readex Pro, Plus Jakarta Sans, Amiri) */\n`;
  fs.writeFileSync(FONTS_CSS_PATH, header + keptBlocks.join('\n\n') + '\n');
  console.log(`Bundled ${urlToLocalName.size} local WOFF2 files into ${FONTS_OUT_DIR} and wrote ${FONTS_CSS_PATH}`);
}

await bundleOfflineQuran();
await bundleLocalFonts();
