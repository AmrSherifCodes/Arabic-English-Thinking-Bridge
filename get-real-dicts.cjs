const fs = require('fs');
const path = require('path');

async function downloadDict(lang, url) {
  console.log(`Downloading real ${lang} dictionary from FreeDict...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    
    const lines = text.split('\n');
    let currentWord = '';
    const entries = [];
    
    for (const line of lines) {
      if (line.startsWith(' ')) { // Indented lines are translations
        if (currentWord && entries.length < 5000) {
          const translation = line.trim();
          if (translation) entries.push({ word: currentWord, translation });
        }
      } else {
        currentWord = line.trim();
      }
    }
    
    const outFile = path.join('src', 'data', 'dictionaries', `${lang}Dictionary.ts`);
    const fileContent = `export const ${lang.toUpperCase()}_DICTIONARY = ${JSON.stringify(entries, null, 2)};`;
    fs.writeFileSync(outFile, fileContent);
    console.log(`? Success! Saved ${entries.length} REAL words to ${lang}Dictionary.ts`);
  } catch (err) {
    console.error(`? Failed to download ${lang}:`, err.message);
  }
}

downloadDict('german', 'https://raw.githubusercontent.com/freedict/fd-dictionaries/master/deu-eng/deu-eng.dict');
downloadDict('japanese', 'https://raw.githubusercontent.com/freedict/fd-dictionaries/master/jpn-eng/jpn-eng.dict');
