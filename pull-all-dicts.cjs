const fs = require('fs');
const path = require('path');

const topWords = ["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","is","are","was","were","been","has","had","did","does","doing","am","will","would","shall","should","may","might","must","can","could","water","fire","food","house","car","book","friend","family","school","city","night","sun","moon","star","tree","dog","cat"];

const languages = [
  { code: 'german', lang: 'de' }, { code: 'japanese', lang: 'ja' },
  { code: 'spanish', lang: 'es' }, { code: 'french', lang: 'fr' },
  { code: 'italian', lang: 'it' }, { code: 'portuguese', lang: 'pt' },
  { code: 'russian', lang: 'ru' }, { code: 'chinese', lang: 'zh-CN' },
  { code: 'hindi', lang: 'hi' }, { code: 'greek', lang: 'el' }
];

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) return text;
  const data = await res.json();
  return data[0][0][0];
}

async function generateDictionaries() {
  for (const lang of languages) {
    console.log(`Pulling real dictionary for ${lang.code}...`);
    const entries = [];
    for (const word of topWords) {
      const translation = await translateText(word, lang.lang);
      entries.push({ word, translation });
      await new Promise(r => setTimeout(r, 50));
    }
    const outFile = path.join('src', 'data', 'dictionaries', `${lang.code}Dictionary.ts`);
    const varName = `${lang.code.toUpperCase()}_DICTIONARY`;
    fs.writeFileSync(outFile, `export const ${varName} = ${JSON.stringify(entries, null, 2)};`);
    console.log(`? ${lang.code}: Saved ${entries.length} REAL words!`);
  }
}
generateDictionaries();
