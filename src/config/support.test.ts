// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  INSTAPAY_IPA,
  INSTAPAY_LINK,
  PAYPAL_URL,
  PAYPAL_QR_PATH,
  GITHUB_REPO_URL,
  getSafeInstapayLink,
  getSafePaypalLink,
} from './support';
import { copyTextToClipboard } from '../utils/clipboard';

test('support config exports valid defaults', () => {
  assert.equal(
    GITHUB_REPO_URL,
    'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge',
  );
  assert.equal(typeof INSTAPAY_IPA, 'string');
  assert.ok(INSTAPAY_IPA.trim().length > 0);
  assert.ok(INSTAPAY_IPA.includes('@'));
  assert.equal(typeof INSTAPAY_LINK, 'string');
  assert.equal(PAYPAL_URL, 'https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ');
  assert.equal(PAYPAL_QR_PATH, '/paypal-qr.png');
  const qrAssetPath = path.join(process.cwd(), 'public', 'paypal-qr.png');
  assert.ok(fs.existsSync(qrAssetPath), 'public/paypal-qr.png must exist');
  assert.ok(fs.statSync(qrAssetPath).size > 1000, 'public/paypal-qr.png must be non-empty');
});

test('getSafeInstapayLink validates official HTTPS InstaPay URLs only', () => {
  assert.equal(getSafeInstapayLink(''), null);
  assert.equal(getSafeInstapayLink('   '), null);

  const validIpn = getSafeInstapayLink('https://ipn.eg/S/abc/instapay/xyz');
  assert.ok(validIpn && validIpn.startsWith('https://ipn.eg/'));

  const validInstapay = getSafeInstapayLink('https://instapay.eg/pay/test');
  assert.ok(validInstapay && validInstapay.startsWith('https://instapay.eg/'));

  assert.equal(getSafeInstapayLink('http://ipn.eg/x'), null);
  assert.equal(getSafeInstapayLink('javascript:alert(1)'), null);
  assert.equal(getSafeInstapayLink('https://evil.com/x'), null);
  assert.equal(getSafeInstapayLink('https://ipn.eg.evil.com/x'), null);
  assert.equal(getSafeInstapayLink('https://user:pass@ipn.eg/x'), null);
  assert.equal(getSafeInstapayLink('https://ipn.eg:8443/x'), null);
  assert.equal(getSafeInstapayLink('not a url'), null);
});

test('getSafePaypalLink validates official HTTPS PayPal NCP payment URLs only', () => {
  assert.equal(getSafePaypalLink(), PAYPAL_URL);
  assert.equal(
    getSafePaypalLink('https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ'),
    'https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ',
  );
  assert.equal(
    getSafePaypalLink('https://paypal.com/ncp/payment/ABC123_def-456'),
    'https://paypal.com/ncp/payment/ABC123_def-456',
  );
  assert.equal(
    getSafePaypalLink('https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ/'),
    'https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ/',
  );

  assert.equal(getSafePaypalLink(''), null);
  assert.equal(getSafePaypalLink('   '), null);
  assert.equal(getSafePaypalLink('not a url'), null);
  assert.equal(getSafePaypalLink('http://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('javascript:alert(1)'), null);
  assert.equal(getSafePaypalLink('https://evil.com/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com.evil.com/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('https://evil.paypal.com/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com/signin'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com/ncp/payment/'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com/ncp/payment/../../evil'), null);
  assert.equal(getSafePaypalLink('https://user:pass@www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com:8443/ncp/payment/TXQB2CWGRV5ZQ'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ?cmd=x'), null);
  assert.equal(getSafePaypalLink('https://www.paypal.com/ncp/payment/TXQB2CWGRV5ZQ#frag'), null);
});

test('copyTextToClipboard resolves to false gracefully without document', async () => {
  const result = await copyTextToClipboard('x');
  assert.equal(result, false);
});
