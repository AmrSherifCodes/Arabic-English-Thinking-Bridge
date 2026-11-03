import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (
        (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) &&
        !filePath.includes('tokens.css') &&
        !filePath.includes('index.css') &&
        !filePath.includes('.test.') &&
        !filePath.includes('App.legacy.tsx')
      ) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

test('1. Verify design tokens file tokens.css exists and defines required CSS variables', () => {
  const tokensPath = path.resolve('src/styles/tokens.css');
  assert.ok(fs.existsSync(tokensPath), 'tokens.css must exist');
  const content = fs.readFileSync(tokensPath, 'utf8');
  assert.ok(content.includes('--color-bg'), 'tokens.css must define --color-bg');
  assert.ok(content.includes('--color-surface'), 'tokens.css must define --color-surface');
  assert.ok(content.includes('--color-primary'), 'tokens.css must define --color-primary');
  assert.ok(content.includes('--color-success'), 'tokens.css must define --color-success');
});
