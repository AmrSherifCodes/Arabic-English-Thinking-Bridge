const fs = require('fs');
const path = require('path');

// Download top 5000 English words
const WORD_LIST_URL = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt';
const languages = [
  { code: 'german', lang: 'de' }, { code: 'japanese', lang: 'ja' },
  { code: 'spanish', lang: 'es' }, { code: 'french', lang: 'fr' },
  { code: 'italian', lang: 'it' }, { code: 'portuguese', lang: 'pt' },
  { code: 'russian', lang: 'ru' }, { code: 'chinese', lang: 'zh-CN' },
  { code: 'hindi', lang: 'hi' }, { code: 'greek', lang: 'el' }
];

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return data[0][0][0];
  } catch { return text; }
}

async function run() {
  console.log('Downloading top 5,000 English words...');
  const res = await fetch(WORD_LIST_URL);
  const text = await res.text();
  const words = text.split('\n').map(w => w.trim()).filter(Boolean).slice(0, 5000);
  console.log(`Got ${words.length} words. Translating to 10 languages...`);

  for (const lang of languages) {
    console.log(`\nTranslating to ${lang.code}...`);
    const entries = [];
    
    // Process in batches of 10 to prevent rate limiting
    for (let i = 0; i < words.length; i += 10) {
      const batch = words.slice(i, i + 10);
      const promises = batch.map(async (word) => {
        const translation = await translateText(word, lang.lang);
        return { word, translation };
      });
      
      const results = await Promise.all(promises);
      entries.push(...results);
      
      if (i % 500 === 0) console.log(`  ${i}/${words.length} translated...`);
      await new Promise(r => setTimeout(r, 100)); // small delay
    }
    
    const outFile = path.join('src', 'data', 'dictionaries', `${lang.code}Dictionary.ts`);
    const varName = `${lang.code.toUpperCase()}_DICTIONARY`;
    fs.writeFileSync(outFile, `export const ${varName} = ${JSON.stringify(entries, null, 2)};`);
    console.log(`? ${lang.code}: Saved ${entries.length} REAL words!`);
  }
}
run();
