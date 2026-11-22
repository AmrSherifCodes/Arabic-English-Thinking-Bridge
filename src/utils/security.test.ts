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
  const dictChunks = files.filter(f => f.includes('dict-') || f.includes('curriculumRegistry'));
  assert.ok(dictChunks.length >= 5, `Expected >= 5 dict/curriculum chunks in dist/assets, found ${dictChunks.length}: ${dictChunks.join(', ')}`);
  const totalBytes = dictChunks.reduce((sum, f) => sum + fs.statSync(path.join(distAssetsPath, f)).size, 0);
  assert.ok(totalBytes > 20 * 1024 * 1024, `Expected > 20 MB of dict chunks, got ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
});

test('6. index.html meta CSP equals vercel.json Content-Security-Policy header value byte-for-byte', () => {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const globalHeaderRule = vercelConfig.headers?.find((h: any) => h.source === '/(.*)');
  assert.ok(globalHeaderRule, 'vercel.json must have global /(.*) header rule');
  const cspHeader = globalHeaderRule.headers?.find((h: any) => h.key === 'Content-Security-Policy');
  assert.ok(cspHeader, 'vercel.json must have Content-Security-Policy header');
  const vercelCspValue = cspHeader.value;

  const indexPath = path.join(ROOT_DIR, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const metaCspMatch = indexHtml.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]+)"/i);
  assert.ok(metaCspMatch, 'index.html must contain a <meta http-equiv="Content-Security-Policy"> tag');
  const indexMetaCspValue = metaCspMatch[1];

  assert.equal(
    indexMetaCspValue,
    vercelCspValue,
    'index.html meta CSP content must match vercel.json Content-Security-Policy header byte-for-byte'
  );
});

test('7. vercel.json enforces strict CSP directives, security headers, and zero external PayPal scripts', () => {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));
  const globalHeaderRule = vercelConfig.headers?.find((h: any) => h.source === '/(.*)');
  assert.ok(globalHeaderRule);

  const headersMap = new Map<string, string>(
    (globalHeaderRule.headers || []).map((h: any) => [h.key, h.value]),
  );

  assert.equal(headersMap.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headersMap.get('X-Frame-Options'), 'DENY');
  assert.equal(headersMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  const perms = headersMap.get('Permissions-Policy') || '';
  assert.ok(perms.includes('microphone=(self)'), 'Permissions-Policy must allow microphone=(self)');
  assert.ok(perms.includes('camera=()'), 'Permissions-Policy must block camera=()');

  const csp = headersMap.get('Content-Security-Policy') || '';
  assert.ok(csp.includes("default-src 'self';"), 'CSP must lock default-src to self');
  assert.ok(csp.includes("script-src 'self';"), 'CSP must lock script-src to self');
  assert.ok(!csp.includes("'unsafe-eval'"), 'CSP must forbid unsafe-eval');
  assert.ok(csp.includes("object-src 'none';"), 'CSP must include object-src none');
  assert.ok(csp.includes("base-uri 'self';"), 'CSP must include base-uri self');
  assert.ok(csp.includes("frame-ancestors 'none';"), 'CSP must include frame-ancestors none');

  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.equal(indexHtml.includes('paypal.com/sdk/js'), false);
  assert.equal(indexHtml.includes('paypalobjects.com'), false);
});

test('8. Android native config and ProGuard rules enforce production hardening', () => {
  const manifest = fs.readFileSync(
    path.join(ROOT_DIR, 'android/app/src/main/AndroidManifest.xml'),
    'utf8',
  );
  assert.ok(manifest.includes('android:allowBackup="false"'));
  assert.ok(manifest.includes('android:usesCleartextTraffic="false"'));

  const capConfig = fs.readFileSync(path.join(ROOT_DIR, 'capacitor.config.ts'), 'utf8');
  assert.ok(capConfig.includes('webContentsDebuggingEnabled: isLiveReload'));

  const gradle = fs.readFileSync(path.join(ROOT_DIR, 'android/app/build.gradle'), 'utf8');
  assert.ok(gradle.includes('minifyEnabled true'));
  assert.ok(gradle.includes('shrinkResources true'));

  const proguard = fs.readFileSync(path.join(ROOT_DIR, 'android/app/proguard-rules.pro'), 'utf8');
  assert.ok(proguard.includes('com.getcapacitor.community.tts.**'));
  assert.ok(proguard.includes('com.capacitorjs.plugins.**'));
});

test('9. src/ and public/theme-init.js contain zero dangerouslySetInnerHTML, eval, new Function, or theme-init innerHTML', () => {
  const srcRoot = path.join(ROOT_DIR, 'src');
  const violations: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        /\.(ts|tsx|js|mjs)$/.test(entry.name) &&
        !/\.(test|spec)\./.test(entry.name)
      ) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/dangerouslySetInnerHTML\s*[=:]/.test(content)) {
          violations.push(`${path.relative(ROOT_DIR, fullPath)}: dangerouslySetInnerHTML`);
        }
        if (/\beval\s*\(/.test(content)) {
          violations.push(`${path.relative(ROOT_DIR, fullPath)}: eval(`);
        }
        if (/new\s+Function\s*\(/.test(content)) {
          violations.push(`${path.relative(ROOT_DIR, fullPath)}: new Function(`);
        }
      }
    }
  }

  walk(srcRoot);
  const themeInit = fs.readFileSync(path.join(ROOT_DIR, 'public/theme-init.js'), 'utf8');
  if (themeInit.includes('innerHTML')) {
    violations.push('public/theme-init.js: innerHTML');
  }

  assert.deepEqual(violations, [], `Security violations found:\n${violations.join('\n')}`);
});


