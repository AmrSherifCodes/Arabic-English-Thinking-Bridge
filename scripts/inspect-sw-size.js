import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('dist/sw.js', 'utf8');
const match = content.match(/precacheAndRoute\(\[([\s\S]*?)\]/);
if (match) {
  const raw = match[1];
  const urls = Array.from(raw.matchAll(/url:\s*"([^"]+)"/g)).map(m => m[1]);
  let totalBytes = 0;
  const items = [];
  for (const url of urls) {
    const filePath = path.join('dist', url);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      totalBytes += size;
      items.push({ url, size: (size / 1024).toFixed(2) + ' KB' });
    } else {
      items.push({ url, size: 'MISSING' });
    }
  }
  items.sort((a, b) => (parseFloat(b.size) || 0) - (parseFloat(a.size) || 0));
  console.log('Top 15 largest precached files:');
  console.log(items.slice(0, 15));
  console.log('Total precached size:', (totalBytes / 1024 / 1024).toFixed(2), 'MB');
}
