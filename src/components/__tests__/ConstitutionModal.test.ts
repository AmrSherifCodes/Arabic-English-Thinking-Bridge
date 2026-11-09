import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { ConstitutionModal } from '../ConstitutionModal';

test('ConstitutionModal renders content based on isArabic prop', () => {
  // Test English rendering
  const englishHtml = renderToStaticMarkup(
    React.createElement(ConstitutionModal, { isOpen: true, onClose: () => {}, isArabic: false })
  );
  assert.ok(englishHtml.includes('Channel Constitution'), 'English content should be present');

  // Test Arabic rendering
  const arabicHtml = renderToStaticMarkup(
    React.createElement(ConstitutionModal, { isOpen: true, onClose: () => {}, isArabic: true })
  );
  assert.ok(arabicHtml.includes('دستور القناة'), 'Arabic content should be present');
});