import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

test('1. index.html contains ZERO inline script blocks to comply with strict script-src', () => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  assert.ok(fs.existsSync(indexPath), 'index.html must exist at project root');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Regex matching any <script> tag that does NOT have a src attribute
  const inlineScriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  const inlineMatches = [];
  let match;
  while ((match = inlineScriptRegex.exec(indexHtml)) !== null) {
    const content = match[1].trim();
    if (content.length > 0) {
      inlineMatches.push(content);
    }
  }

  assert.equal(
    inlineMatches.length,
    0,
    `Found ${inlineMatches.length} inline script(s) in index.html:\n${inlineMatches.join('\n---\n')}`
  );
});

test('2. index.html loads /theme-init.js via external blocking script in head before the app bundle', () => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Verify external script tag exists in <head>
  const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/i);
  assert.ok(headMatch, 'index.html must have a <head> section');
  const headContent = headMatch[1];

  assert.ok(
    /<script\s+src="\/theme-init\.js"><\/script>/i.test(headContent),
    'index.html head must contain <script src="/theme-init.js"></script>'
  );

  // Verify theme-init.js comes before main.tsx / app bundle
  const themeInitIndex = indexHtml.indexOf('/theme-init.js');
  const mainTsxIndex = indexHtml.indexOf('/src/main.tsx');
  assert.ok(themeInitIndex !== -1, 'theme-init.js must be referenced in index.html');
  assert.ok(mainTsxIndex !== -1, 'main.tsx must be referenced in index.html');
  assert.ok(
    themeInitIndex < mainTsxIndex,
    'theme-init.js must be loaded before /src/main.tsx to prevent theme flash'
  );
});

test('3. public/theme-init.js exists and implements tb.theme and prefers-color-scheme detection', () => {
  const themeInitPath = path.join(ROOT_DIR, 'public', 'theme-init.js');
  assert.ok(fs.existsSync(themeInitPath), 'public/theme-init.js must exist');
  const content = fs.readFileSync(themeInitPath, 'utf8');

  assert.ok(content.includes('tb.theme'), 'theme-init.js must check localStorage key tb.theme');
  assert.ok(content.includes('prefers-color-scheme: dark'), 'theme-init.js must check prefers-color-scheme: dark');
  assert.ok(content.includes('document.documentElement.classList.add'), 'theme-init.js must toggle dark class');
});

test('4. vercel.json and index.html CSP disallow unsafe-inline in script-src', () => {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  const globalHeaderRule = vercelConfig.headers?.find((h: any) => h.source === '/(.*)');
  assert.ok(globalHeaderRule, 'vercel.json must have global /(.*) header rule');

  const cspHeader = globalHeaderRule.headers?.find((h: any) => h.key === 'Content-Security-Policy');
  assert.ok(cspHeader, 'vercel.json must have Content-Security-Policy header');

  const cspValue = cspHeader.value;
  const scriptSrcMatch = cspValue.match(/script-src\s+([^;]+)/i);
  assert.ok(scriptSrcMatch, 'CSP must contain script-src directive');
  const scriptSrcDirectives = scriptSrcMatch[1];

  assert.ok(
    !scriptSrcDirectives.includes("'unsafe-inline'"),
    `vercel.json script-src must not contain 'unsafe-inline'. Current: ${scriptSrcDirectives}`
  );

  // Check index.html meta tag CSP
  const indexPath = path.join(ROOT_DIR, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const metaCspMatch = indexHtml.match(/content="([^"]*default-src[^"]*)"/i);
  if (metaCspMatch) {
    const metaCsp = metaCspMatch[1];
    const metaScriptSrc = metaCsp.match(/script-src\s+([^;]+)/i);
    if (metaScriptSrc) {
      assert.ok(
        !metaScriptSrc[1].includes("'unsafe-inline'"),
        `index.html meta tag script-src must not contain 'unsafe-inline'. Current: ${metaScriptSrc[1]}`
      );
    }
  }
});
