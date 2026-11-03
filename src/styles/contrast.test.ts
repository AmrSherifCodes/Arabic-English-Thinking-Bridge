import test from 'node:test';
import assert from 'node:assert/strict';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);
  return (max + 0.05) / (min + 0.05);
}

const DARK_TOKENS = {
  bg: '#0B1324',
  surface: '#14213D',
  surface2: '#1D2F55',
  border: '#2B3F66',
  text: '#FFFFFF',
  textSoft: '#E5E5E5',
  muted: '#A9B4C8',
  primary: '#FCA311',
  onPrimary: '#14213D',
  success: '#2DD4BF',
  danger: '#FF6B6B',
};

const LIGHT_TOKENS = {
  bg: '#FFFFFF',
  surface: '#F4F6FA',
  surface2: '#E5E5E5',
  border: '#D5D9E2',
  text: '#14213D',
  textSoft: '#2B3B5E',
  muted: '#5B6784',
  primary: '#FCA311',
  onPrimary: '#14213D',
  success: '#0F766E',
  danger: '#C62828',
};

test('1. Dark theme text/background contrast ratios meet WCAG AA (>= 4.5:1)', () => {
  const textVsSurface = contrastRatio(DARK_TOKENS.text, DARK_TOKENS.surface);
  assert.ok(textVsSurface >= 4.5, `Dark text vs surface contrast ${textVsSurface.toFixed(2)} must be >= 4.5`);

  const softVsSurface = contrastRatio(DARK_TOKENS.textSoft, DARK_TOKENS.surface);
  assert.ok(softVsSurface >= 4.5, `Dark textSoft vs surface contrast ${softVsSurface.toFixed(2)} must be >= 4.5`);

  const mutedVsSurface = contrastRatio(DARK_TOKENS.muted, DARK_TOKENS.surface);
  assert.ok(mutedVsSurface >= 4.5, `Dark muted vs surface contrast ${mutedVsSurface.toFixed(2)} must be >= 4.5`);

  const onPrimaryVsPrimary = contrastRatio(DARK_TOKENS.onPrimary, DARK_TOKENS.primary);
  assert.ok(onPrimaryVsPrimary >= 4.5, `Dark onPrimary vs primary contrast ${onPrimaryVsPrimary.toFixed(2)} must be >= 4.5`);

  const successVsSurface = contrastRatio(DARK_TOKENS.success, DARK_TOKENS.surface);
  assert.ok(successVsSurface >= 4.5, `Dark success vs surface contrast ${successVsSurface.toFixed(2)} must be >= 4.5`);
});

test('2. Light theme text/background contrast ratios meet WCAG AA (>= 4.5:1)', () => {
  const textVsSurface = contrastRatio(LIGHT_TOKENS.text, LIGHT_TOKENS.surface);
  assert.ok(textVsSurface >= 4.5, `Light text vs surface contrast ${textVsSurface.toFixed(2)} must be >= 4.5`);

  const softVsSurface = contrastRatio(LIGHT_TOKENS.textSoft, LIGHT_TOKENS.surface);
  assert.ok(softVsSurface >= 4.5, `Light textSoft vs surface contrast ${softVsSurface.toFixed(2)} must be >= 4.5`);

  const mutedVsSurface = contrastRatio(LIGHT_TOKENS.muted, LIGHT_TOKENS.surface);
  assert.ok(mutedVsSurface >= 4.5, `Light muted vs surface contrast ${mutedVsSurface.toFixed(2)} must be >= 4.5`);

  const onPrimaryVsPrimary = contrastRatio(LIGHT_TOKENS.onPrimary, LIGHT_TOKENS.primary);
  assert.ok(onPrimaryVsPrimary >= 4.5, `Light onPrimary vs primary contrast ${onPrimaryVsPrimary.toFixed(2)} must be >= 4.5`);

  const successVsSurface = contrastRatio(LIGHT_TOKENS.success, LIGHT_TOKENS.surface);
  assert.ok(successVsSurface >= 4.5, `Light success vs surface contrast ${successVsSurface.toFixed(2)} must be >= 4.5`);
});
