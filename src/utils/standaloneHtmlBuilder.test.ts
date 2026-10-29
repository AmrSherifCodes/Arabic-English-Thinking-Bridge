import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStandaloneHtmlString,
  COPYRIGHT_HEADER,
  PROVENANCE_MD_CONTENT
} from './standaloneHtmlBuilder';
import { TEACHER_WHATSAPP } from './fx';

test('standalone HTML starts with the exact Amr Sherif copyright header on line 1', () => {
  const html = buildStandaloneHtmlString();
  const firstLine = html.split('\n')[0].trim();
  assert.equal(firstLine, COPYRIGHT_HEADER);
  assert.equal(firstLine, '<!-- Copyright (c) 2026 Amr Sherif. All rights reserved. -->');
});

test('standalone HTML and fx config contain no hardcoded personal phone number', () => {
  const html = buildStandaloneHtmlString();
  assert.equal(TEACHER_WHATSAPP, '');
  assert.equal(html.includes('201111452785'), false);
  assert.ok(html.includes('const CONFIG = {'));
});

test('standalone HTML escapes single quotes in esc() and uses data-* event delegation', () => {
  const html = buildStandaloneHtmlString();
  assert.ok(html.includes('"\'":"&#39;"'));
  assert.ok(html.includes('data-ar-word='));
  assert.ok(html.includes('data-speak='));
  assert.ok(html.includes('data-chip='));
  // Ensure old vulnerable inline handlers are gone
  assert.equal(html.includes('onclick="tapArWord('), false);
  assert.equal(html.includes('ondblclick="dblArWord('), false);
});

test('standalone HTML includes MyMemory.net privacy disclosure and Thinking English™ trademark', () => {
  const html = buildStandaloneHtmlString();
  assert.ok(html.includes('Thinking English™'));
  assert.ok(
    html.includes('Translations are sent to MyMemory.net. Don’t paste anything private.')
  );
});

test('standalone HTML includes the Kuffiyeh & olive-knot stationery background variables', () => {
  const html = buildStandaloneHtmlString();
  assert.ok(html.includes('--kuffiyeh-line:rgba(67,90,45,0.055)'));
  assert.ok(html.includes('--sand-bg:#faf6ee'));
  assert.ok(html.includes('--sand-bg:#141310'));
});

test('PROVENANCE.md includes Amr Sherif authorship, Alexandria Egypt, and constitution commit hash', () => {
  assert.ok(PROVENANCE_MD_CONTENT.includes('**Amr Sherif** — Alexandria, Egypt'));
  assert.ok(PROVENANCE_MD_CONTENT.includes('b824f249efc369b5788005df6fb7be7a9c563feb'));
  assert.ok(PROVENANCE_MD_CONTENT.includes('Thinking English™'));
});
