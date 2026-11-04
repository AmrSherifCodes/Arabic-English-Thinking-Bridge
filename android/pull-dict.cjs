const fs = require('fs');
const path = require('path');

// Figure out project root regardless of where we're launched from
let projectRoot = __dirname;
if (path.basename(projectRoot).toLowerCase() === 'android') {
  projectRoot = path.resolve(projectRoot, '..');
}

const dictDir = path.join(projectRoot, 'src', 'data', 'dictionaries');
if (!fs.existsSync(dictDir)) {
  console.error(`? Dictionary directory not found: ${dictDir}`);
  console.error(`   Make sure you are in the project root or android folder.`);
  process.exit(1);
}

const LANG_MAP = {
  german: 'de', japanese: 'ja', spanish: 'es', french: 'fr',
  italian: 'it', portuguese: 'pt', russian: 'ru',
  chinese: 'zh-CN', hindi: 'hi', greek: 'el'
};

const langName = process.argv[2];
if (!langName || !LANG_MAP[langName]) {
  console.error('Usage: node pull-dict.cjs <' + Object.keys(LANG_MAP).join('|') + '>');
  process.exit(1);
}
const langCode = LANG_MAP[langName];

const WORD_LIST_URL = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt';

async function translateText(text, targetLang, retries = 2) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data[0] || !data[0][0]) throw new Error('Bad response');
    return data[0][0][0];
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 700));
      return translateText(text, targetLang, retries - 1);
    }
    console.warn(`[${langName}] ?? Failed "${text}" — using original`);
    return text;
  }
}

async function run() {
  console.log(`[${langName}] Downloading top 10,000 English words...`);
  const res = await fetch(WORD_LIST_URL);
  const text = await res.text();
  const words = text.split('\n').map(w => w.trim()).filter(Boolean).slice(0, 10000);
  console.log(`[${langName}] Got ${words.length} words. Translating to ${langCode}...`);

  const entries = [];
  for (let i = 0; i < words.length; i += 10) {
    const batch = words.slice(i, i + 10);
    const promises = batch.map(async (word) => {
      const translation = await translateText(word, langCode);
      return { word, translation };
    });
    const results = await Promise.all(promises);
    entries.push(...results);

    if (i % 1000 === 0) console.log(`[${langName}] ${i}/${words.length} done`);
    await new Promise(r => setTimeout(r, 100));
  }

  const outFile = path.join(dictDir, `${langName}Dictionary.ts`);
  const varName = `${langName.toUpperCase()}_DICTIONARY`;
  fs.writeFileSync(outFile, `export const ${varName} = ${JSON.stringify(entries, null, 2)};`);
  console.log(`? [${langName}] Saved ${entries.length} REAL words ? ${outFile}`);
}

run();
