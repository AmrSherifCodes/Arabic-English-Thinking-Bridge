import fs from 'fs';

const content = fs.readFileSync('dist/sw.js', 'utf8');
const match = content.match(/precacheAndRoute\(\[([\s\S]*?)\]/);
if (match) {
  const raw = match[1];
  const urls = Array.from(raw.matchAll(/url:\s*"([^"]+)"/g)).map(m => m[1]);
  console.log('Total precached entries:', urls.length);
  console.log('Sample precached URLs:', urls.slice(0, 15));
  const ignoredMatches = urls.filter(u => u.includes('dict-') || u.includes('wasm') || u.includes('curriculum-core') || u.includes('app-data'));
  console.log('Matching ignored items in precache:', ignoredMatches);
} else {
  console.log('Could not find precacheAndRoute in dist/sw.js');
}
