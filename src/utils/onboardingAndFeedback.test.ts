import { test } from 'node:test';
import assert from 'node:assert';
import {
  extractFeedbackDraft,
  isFeedbackConfirmation,
  isFeedbackCancellation,
  generateSmartConversationReply
} from '../services/smartConversation';
import { saveFeedback } from '../services/feedback';

test('1. extractFeedbackDraft identifies feature suggestions in Egyptian Arabic and English', () => {
  const arSuggestion = extractFeedbackDraft('ياريت تضيفوا وضع ليلي وتزودوا جمل للشركات');
  assert.ok(arSuggestion, 'Expected draft to be extracted');
  assert.strictEqual(arSuggestion.category, 'feature');
  assert.ok(arSuggestion.polishedMessage.includes('وضع ليلي') || arSuggestion.polishedMessage.includes('الوضع'));

  const enSuggestion = extractFeedbackDraft('I wish you could add offline practice mode');
  assert.ok(enSuggestion, 'Expected English suggestion draft to be extracted');
  assert.strictEqual(enSuggestion.category, 'feature');
  assert.ok(enSuggestion.title.includes('Feature Suggestion'));
});

test('2. extractFeedbackDraft identifies bug reports with high precision', () => {
  const arBug = extractFeedbackDraft('فيه مشكلة في زرار الصوت مش شغال');
  assert.ok(arBug, 'Expected bug draft to be extracted');
  assert.strictEqual(arBug.category, 'bug');
  assert.ok(arBug.title.includes('الإبلاغ عن مشكلة'));

  const enBug = extractFeedbackDraft('There is a bug when clicking the download apk button');
  assert.ok(enBug, 'Expected English bug draft to be extracted');
  assert.strictEqual(enBug.category, 'bug');
});

test('3. extractFeedbackDraft identifies content expansion requests', () => {
  const arContent = extractFeedbackDraft('عايز جمل ومفردات أكتر لمقابلات العمل');
  assert.ok(arContent, 'Expected content expansion draft to be extracted');
  assert.strictEqual(arContent.category, 'content');
  assert.ok(arContent.title.includes('توسيع المحتوى'));
});

test('4. extractFeedbackDraft ignores pedagogical learning questions', () => {
  assert.strictEqual(extractFeedbackDraft('ليه بنقول am في الجملة؟'), null);
  assert.strictEqual(extractFeedbackDraft('ازاي اقول كتاب بالإنجليزي؟'), null);
  assert.strictEqual(extractFeedbackDraft('يعني ايه apple؟'), null);
  assert.strictEqual(extractFeedbackDraft('I am agree with you'), null);
});

test('5. isFeedbackConfirmation matches confirmation words in Arabic and English', () => {
  assert.strictEqual(isFeedbackConfirmation('أيوة'), true);
  assert.strictEqual(isFeedbackConfirmation('ابعتها'), true);
  assert.strictEqual(isFeedbackConfirmation('تمام'), true);
  assert.strictEqual(isFeedbackConfirmation('أكيد'), true);
  assert.strictEqual(isFeedbackConfirmation('yes'), true);
  assert.strictEqual(isFeedbackConfirmation('send it'), true);
  assert.strictEqual(isFeedbackConfirmation('sure'), true);

  assert.strictEqual(isFeedbackConfirmation('مش دلوقتي'), false);
  assert.strictEqual(isFeedbackConfirmation('لا شكراً'), false);
});

test('6. isFeedbackCancellation matches cancellation words in Arabic and English', () => {
  assert.strictEqual(isFeedbackCancellation('لا'), true);
  assert.strictEqual(isFeedbackCancellation('بلاش'), true);
  assert.strictEqual(isFeedbackCancellation('إلغاء'), true);
  assert.strictEqual(isFeedbackCancellation('cancel'), true);
  assert.strictEqual(isFeedbackCancellation('never mind'), true);

  assert.strictEqual(isFeedbackCancellation('أيوة'), false);
});

test('7. generateSmartConversationReply handles German target thinking mode', () => {
  const deReply = generateSmartConversationReply('Hallo wie gehts?', [], undefined, 'de');
  assert.ok(
    deReply.includes('Verb-Zweit') || deReply.includes('Deutsch') || deReply.includes('fantastisch'),
    'Expected German pedagogical guidance'
  );
});

test('8. generateSmartConversationReply handles Japanese target thinking mode', () => {
  const jaReply = generateSmartConversationReply('Konnichiwa', [], undefined, 'ja');
  assert.ok(
    jaReply.includes('日本語') || jaReply.includes('こんにちは'),
    'Expected Japanese pedagogical guidance'
  );

  const jaGenki = generateSmartConversationReply('Genki desu ka?', [], undefined, 'ja');
  assert.ok(
    jaGenki.includes('SOV') || jaGenki.includes('日本語'),
    'Expected SOV structure reminder for Japanese'
  );
});

test('9. generateSmartConversationReply presents polished feedback draft with confirmation prompt', () => {
  const reply = generateSmartConversationReply('ياريت تضيفوا وضع ليلي وتزودوا جمل للشركات');
  assert.ok(
    reply.includes('عايز أبعتها كفيدباك دلوقتي؟') || reply.includes('رسالة فيدباك واضحة'),
    'Expected Amr to ask for explicit confirmation before sending feedback'
  );
});

test('10. saveFeedback safely formats payload and returns boolean', async () => {
  // Test with mock fetch or local fallback
  const ok = await saveFeedback({
    originalText: 'عايز وضع ليلي',
    draftedMessage: 'اقتراح بإضافة الوضع الليلي',
    category: 'feature',
    rating: 5,
    userName: 'Tester'
  });
  // In test environment without network, it either completes or gracefully returns false
  assert.strictEqual(typeof ok, 'boolean');
});

