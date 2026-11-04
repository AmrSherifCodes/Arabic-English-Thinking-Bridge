import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ICONS_DIR = path.join(ROOT_DIR, 'src-tauri', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const files = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.icns',
  'icon.ico'
];

// Tauri v2 template icons from create-tauri-app
const baseUrl = 'https://raw.githubusercontent.com/tauri-apps/create-tauri-app/main/packages/cli/fragments/fragment-base/src-tauri/icons/';

files.forEach(file => {
  https.get(`${baseUrl}${file}`, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${file}: HTTP ${res.statusCode}`);
      res.resume();
      return;
    }
    const filePath = path.join(ICONS_DIR, file);
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file}`);
    });
  }).on('error', (err) => console.error('Error downloading', file, err.message));
});