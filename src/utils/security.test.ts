import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

test('1. index.html contains no executable inline scripts to comply with strict script-src', () => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  assert.ok(fs.existsSync(indexPath), 'index.html must exist at project root');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // JSON-LD is inert structured data, not executable inline JavaScript.
  const inlineScriptRegex = /<script(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
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
  assert.ok(cspValue.includes('https://tb-eg.vercel.app'));
  assert.ok(cspValue.includes('https://arabicenglishthinkingbridge.vercel.app'));
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
  assert.match(indexHtml, /property="og:url" content="https:\/\/tb-eg\.vercel\.app"/);
  assert.match(indexHtml, /property="og:image" content="https:\/\/tb-eg\.vercel\.app\/og-image\.jpg"/);
  assert.match(indexHtml, /name="twitter:image" content="https:\/\/tb-eg\.vercel\.app\/og-image\.jpg"/);
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

test('5. production build emits non-empty dictionary chunks in dist/assets', () => {
  const distAssetsPath = path.join(ROOT_DIR, 'dist', 'assets');
  if (!fs.existsSync(distAssetsPath)) {
    // Skip if dist/assets was not built before running unit tests
    return;
  }
  const files = fs.readdirSync(distAssetsPath);
  const dictChunks = files.filter(f => f.includes('dict-') || f.includes('curriculum-'));
  assert.ok(dictChunks.length >= 5, `Expected >= 5 dict/curriculum chunks in dist/assets, found ${dictChunks.length}: ${dictChunks.join(', ')}`);
  const totalBytes = dictChunks.reduce((sum, f) => sum + fs.statSync(path.join(distAssetsPath, f)).size, 0);
  assert.ok(totalBytes > 20 * 1024 * 1024, `Expected > 20 MB of dict chunks, got ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
});
