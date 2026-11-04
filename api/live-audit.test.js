import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import healthHandler from './health.js';
import feedbackHandler, { getCorsOrigin } from './feedback.ts';
import reviewHandler from './review.ts';
import { agentTools } from './agent.js';

test('1. SEO & Canonical URLs: index.html and public files do not reference amrsherif.localhost.cc', () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const downloadHtml = fs.readFileSync(path.join(process.cwd(), 'public/download.html'), 'utf8');

  assert.ok(!indexHtml.includes('amrsherif.localhost.cc'), 'index.html must not contain amrsherif.localhost.cc');
  assert.ok(!downloadHtml.includes('amrsherif.localhost.cc'), 'download.html must not contain amrsherif.localhost.cc');

  assert.ok(indexHtml.includes('https://tb-eg.vercel.app'), 'index.html canonical domain must be https://tb-eg.vercel.app');
});

test('2. Privacy Standard: Public client files contain no hardcoded personal phone numbers', () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const downloadHtml = fs.readFileSync(path.join(process.cwd(), 'public/download.html'), 'utf8');
  const themeInitJs = fs.readFileSync(path.join(process.cwd(), 'public/theme-init.js'), 'utf8');

  const phonePattern = /201272718167/;
  assert.ok(!phonePattern.test(indexHtml), 'index.html must not expose phone number 201272718167');
  assert.ok(!phonePattern.test(downloadHtml), 'download.html must not expose phone number 201272718167');
  assert.ok(!phonePattern.test(themeInitJs), 'theme-init.js must not expose phone number 201272718167');
});

test('3. API Health: /api/health handler returns dynamic package version v3.2.1', async () => {
  let statusCode = 0;
  let jsonBody = null;

  const req = { method: 'GET' };
  const res = {
    setHeader() {},
    set statusCode(code) { statusCode = code; },
    end(data) {
      jsonBody = JSON.parse(data);
    }
  };

  await healthHandler(req, res);
  assert.equal(statusCode, 200);
  assert.equal(jsonBody.status, 'healthy');
  assert.equal(jsonBody.version, 'v3.2.1');
});

test('4. CORS Allowlist: feedback and review endpoints resolve specific origins, avoiding wildcard with credentials', () => {
  assert.equal(getCorsOrigin('https://tb-eg.vercel.app'), 'https://tb-eg.vercel.app');
  assert.equal(getCorsOrigin('http://localhost:5173'), 'http://localhost:5173');
  assert.equal(getCorsOrigin('https://malicious-site.com'), 'https://tb-eg.vercel.app');
});

test('5. Webhook Error Metadata: feedback and review handlers report webhookFailed status when unconfigured', async () => {
  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.DISCORD_FEEDBACK_WEBHOOK;
  delete process.env.DISCORD_REVIEWS_WEBHOOK;

  let feedbackBody = null;
  const reqFeedback = {
    method: 'POST',
    body: { rating: 5, message: 'Testing webhook failure metadata' }
  };
  const resFeedback = {
    setHeader() {},
    status() { return this; },
    json(body) { feedbackBody = body; return this; }
  };

  await feedbackHandler(reqFeedback, resFeedback);
  assert.equal(feedbackBody?.success, true);
  assert.equal(feedbackBody?.webhookFailed, true);

  let reviewBody = null;
  const reqReview = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.12' },
    body: { text: 'Testing review webhook failure metadata', rating: 5 }
  };
  const resReview = {
    setHeader() {},
    status() { return this; },
    json(body) { reviewBody = body; return this; }
  };

  await reviewHandler(reqReview, resReview);
  assert.equal(reviewBody?.ok, true);
  assert.equal(reviewBody?.webhookFailed, true);
});

test('6. Agent Tool Reliability: agentTools.knowledge_retriever returns non-null results for all calls', async () => {
  const resultDefault = await agentTools.knowledge_retriever.execute({});
  assert.ok(resultDefault, 'result must not be null');
  assert.ok(resultDefault.identifiedPattern);
  assert.ok(resultDefault.pedagogicalRule);

  const resultNullArgs = await agentTools.knowledge_retriever.execute(null);
  assert.ok(resultNullArgs, 'result must not be null when null is passed');
  assert.ok(resultNullArgs.identifiedPattern);
});

test('7. PWA & Static Assets: Manifest, sitemap, og-image, and download page files exist in public folder', () => {
  const manifestExists = fs.existsSync(path.join(process.cwd(), 'public/manifest.webmanifest'));
  const sitemapExists = fs.existsSync(path.join(process.cwd(), 'public/sitemap.xml'));
  const ogImageExists = fs.existsSync(path.join(process.cwd(), 'public/og-image.jpg'));
  const downloadHtmlExists = fs.existsSync(path.join(process.cwd(), 'public/download.html'));

  assert.ok(manifestExists, 'manifest.webmanifest must exist');
  assert.ok(sitemapExists, 'sitemap.xml must exist');
  assert.ok(ogImageExists, 'og-image.jpg must exist');
  assert.ok(downloadHtmlExists, 'download.html must exist');

  const ogStat = fs.statSync(path.join(process.cwd(), 'public/og-image.jpg'));
  assert.ok(ogStat.size < 500000, `og-image.jpg size (${ogStat.size} bytes) must be compressed under 500 KB`);
});

test('8. Live Deployment Health: fetches live https://tb-eg.vercel.app/api/health and verifies version v3.2.1', { skip: !process.env.LIVE_AUDIT }, async () => {
  const resp = await fetch('https://tb-eg.vercel.app/api/health');
  assert.equal(resp.status, 200);
  const data = await resp.json();
  assert.equal(data.version, 'v3.2.1');
});
