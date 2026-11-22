import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_APP_URL,
  SOCIAL_PRESETS,
  buildSocialShareUrls,
  truncateForPlatform,
} from './socialAutoPoster';

test('truncateForPlatform enforces X and Bluesky length caps while preserving URL', () => {
  const longText = 'Thinking Bridge V6 (v6.0.0) solves Year-1 scientific language shock! '.repeat(10).trim();
  const xPost = truncateForPlatform(longText, 'x', DEFAULT_APP_URL);
  assert.ok(xPost.length <= 280, `Expected <= 280 chars for X, got ${xPost.length}`);
  assert.ok(xPost.includes(DEFAULT_APP_URL), 'X post must preserve target URL');

  const bskyPost = truncateForPlatform(longText, 'bluesky', DEFAULT_APP_URL);
  assert.ok(bskyPost.length <= 300, `Expected <= 300 chars for Bluesky, got ${bskyPost.length}`);
  assert.ok(bskyPost.includes(DEFAULT_APP_URL), 'Bluesky post must preserve target URL');
});

test('buildSocialShareUrls emits valid HTTPS intent links for all supported social targets', () => {
  const preset = SOCIAL_PRESETS[0];
  const urls = buildSocialShareUrls(preset.text, preset.url, preset.title);

  for (const [platform, link] of Object.entries(urls)) {
    const parsed = new URL(link);
    assert.equal(parsed.protocol, 'https:', `Expected https URL for ${platform}`);
  }

  assert.match(urls.x, /^https:\/\/x\.com\/intent\/tweet\?text=/);
  assert.match(urls.linkedin, /^https:\/\/www\.linkedin\.com\/feed\//);
  assert.match(urls.whatsapp, /^https:\/\/wa\.me\/\?text=/);
  assert.match(urls.telegram, /^https:\/\/t\.me\/share\/url\?url=/);
  assert.match(urls.facebook, /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=/);
  assert.match(urls.reddit, /^https:\/\/www\.reddit\.com\/submit\?url=/);
  assert.match(urls.bluesky, /^https:\/\/bsky\.app\/intent\/compose\?text=/);
  assert.match(urls.threads, /^https:\/\/www\.threads\.net\/intent\/post\?text=/);
});
