import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../src/data');
const files: string[] = [];

function walk(dir: string) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.test.ts')) {
      files.push(full);
    }
  }
}
walk(dataDir);

let issues = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Check for Trailing placeholder numbers in sentences (arabicThought, targetSentence) ending with a number before quote
  const numberRegex = /(arabicThought|targetSentence|englishTarget)\s*:\s*['"](.*?)(\d+)['"]/g;
  let match;
  while ((match = numberRegex.exec(content)) !== null) {
      console.log(`[Warning] Trailing number found in ${path.basename(file)}: ${match[0]}`);
      issues++;
      // remove the trailing number
      content = content.replace(match[0], match[0].replace(new RegExp(match[3] + '[\'"]$'), '\'').replace(new RegExp(match[3] + '\"$'), '"'));
  }

  // Check for Bier
  if (content.includes('Bier')) {
      console.log(`[Warning] Culturally inappropriate word 'Bier' found in ${path.basename(file)}`);
      issues++;
      content = content.replace(/Bier/g, 'Kaffee');
  }

  // Check for duplicate arabicThoughts
  const thoughts = Array.from(content.matchAll(/arabicThought\s*:\s*['"](.*?)['"]/g)).map(m => m[1]);
  const seen = new Set();
  for (const t of thoughts) {
      if (seen.has(t)) {
          console.log(`[Warning] Duplicate sentence in ${path.basename(file)}: ${t}`);
          issues++;
      }
      seen.add(t);
  }

  if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`[Fixed] Issues in ${path.basename(file)}`);
  }
}
console.log(`Total issues: ${issues}`);
