const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/index.css',
  'src/components/android-landing-page.css',
  'src/components/LandingPage.css',
  'src/features/corporate/corporate.css'
];

for (const file of cssFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/100vh/g, '100dvh');
    fs.writeFileSync(fullPath, content);
  }
}
