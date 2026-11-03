import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFuriganaHtml } from './JapaneseFuriganaText';

test('1. sanitizeFuriganaHtml preserves legitimate ruby tags', () => {
  const input = '<ruby>日<rt>に</rt>本<rt>ほん</rt></ruby>';
  const sanitized = sanitizeFuriganaHtml(input);
  assert.equal(sanitized, '<ruby>日<rt>に</rt>本<rt>ほん</rt></ruby>');
});

test('2. sanitizeFuriganaHtml strips malicious script and iframe tags', () => {
  const input = '<script>alert("pwned")</script><ruby>漢<rt>かん</rt></ruby><iframe src="javascript:evil()"></iframe>';
  const sanitized = sanitizeFuriganaHtml(input);
  assert.ok(!sanitized.includes('<script>'));
  assert.ok(!sanitized.includes('<iframe>'));
  assert.equal(sanitized, 'alert("pwned")<ruby>漢<rt>かん</rt></ruby>');
});

test('3. sanitizeFuriganaHtml strips inline event handler attributes from ruby tags', () => {
  const input = '<ruby onclick="alert(1)" onmouseover="steal()"><rb>字</rb><rt style="color:red">じ</rt></ruby>';
  const sanitized = sanitizeFuriganaHtml(input);
  assert.ok(!sanitized.includes('onclick'));
  assert.ok(!sanitized.includes('onmouseover'));
  assert.ok(!sanitized.includes('style'));
  assert.equal(sanitized, '<ruby><rb>字</rb><rt>じ</rt></ruby>');
});
