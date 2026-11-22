// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_EXTERNAL_HOSTS,
  getSafeExternalUrl,
  isAllowedExternalHost,
  openSafeExternalUrl,
} from './safeExternalUrl';

describe('safeExternalUrl allowlist & opener safety', () => {
  test('exports the exact expected external host allowlist', () => {
    assert.deepEqual([...ALLOWED_EXTERNAL_HOSTS], [
      'ipn.eg',
      'instapay.eg',
      'paypal.com',
      'github.com',
      'youtube.com',
    ]);
  });

  test('isAllowedExternalHost allows exact domains and valid subdomains only', () => {
    assert.equal(isAllowedExternalHost('ipn.eg'), true);
    assert.equal(isAllowedExternalHost('instapay.eg'), true);
    assert.equal(isAllowedExternalHost('www.paypal.com'), true);
    assert.equal(isAllowedExternalHost('github.com'), true);
    assert.equal(isAllowedExternalHost('www.youtube.com'), true);
    assert.equal(isAllowedExternalHost('YOUTUBE.COM.'), true);

    assert.equal(isAllowedExternalHost(''), false);
    assert.equal(isAllowedExternalHost('evil.com'), false);
    assert.equal(isAllowedExternalHost('evil-paypal.com'), false);
    assert.equal(isAllowedExternalHost('paypal.com.evil.com'), false);
    assert.equal(isAllowedExternalHost('ipn.eg.attacker.io'), false);
  });

  test('getSafeExternalUrl enforces HTTPS, no credentials/ports, and allowlisted host', () => {
    assert.equal(
      getSafeExternalUrl('https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ'),
      'https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ',
    );
    assert.equal(
      getSafeExternalUrl('https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge'),
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge',
    );
    assert.equal(
      getSafeExternalUrl('https://www.youtube.com/@SciAmrSherif'),
      'https://www.youtube.com/@SciAmrSherif',
    );
    assert.equal(
      getSafeExternalUrl('https://ipn.eg/S/amrsherifabdelaal/instapay/1c8JpA'),
      'https://ipn.eg/S/amrsherifabdelaal/instapay/1c8JpA',
    );

    assert.equal(getSafeExternalUrl(''), null);
    assert.equal(getSafeExternalUrl('   '), null);
    assert.equal(getSafeExternalUrl('not-a-url'), null);
    assert.equal(getSafeExternalUrl('http://github.com/AmrSherifCodes'), null);
    assert.equal(getSafeExternalUrl('javascript:alert(1)'), null);
    assert.equal(getSafeExternalUrl('data:text/html,<script>alert(1)</script>'), null);
    assert.equal(getSafeExternalUrl('file:///etc/passwd'), null);
    assert.equal(getSafeExternalUrl('https://user:pass@github.com/foo'), null);
    assert.equal(getSafeExternalUrl('https://github.com:8443/foo'), null);
    assert.equal(getSafeExternalUrl('https://evil.com/phish'), null);
    assert.equal(getSafeExternalUrl('https://paypal.com.evil.com/ncp/payment/123'), null);
  });

  test('openSafeExternalUrl uses window.open with noopener,noreferrer and blocks disallowed URLs', () => {
    const calls: Array<{ url: string; target?: string; features?: string }> = [];
    const originalWindow = (globalThis as any).window;
    const ref: { opened: { opener: unknown } | null } = { opened: null };

    (globalThis as any).window = {
      open: (url: string, target?: string, features?: string) => {
        calls.push({ url, target, features });
        ref.opened = { opener: 'should-be-cleared' };
        return ref.opened;
      },
    };

    try {
      assert.equal(openSafeExternalUrl('https://evil.example/payload'), false);
      assert.equal(openSafeExternalUrl('javascript:alert(1)'), false);
      assert.equal(calls.length, 0);

      assert.equal(openSafeExternalUrl('https://www.youtube.com/@SciAmrSherif'), true);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, 'https://www.youtube.com/@SciAmrSherif');
      assert.equal(calls[0].target, '_blank');
      assert.equal(calls[0].features, 'noopener,noreferrer');
      assert.equal(ref.opened?.opener, null);
    } finally {
      if (originalWindow === undefined) {
        delete (globalThis as any).window;
      } else {
        (globalThis as any).window = originalWindow;
      }
    }
  });
});
