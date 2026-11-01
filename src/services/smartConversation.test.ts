import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSmartConversationReply } from './smartConversation';

test('smartConversation handles greetings warmly and naturally', () => {
  const reply = generateSmartConversationReply('Hello Amr, how are you?');
  assert.ok(reply.length > 10, 'Expected non-empty reply');
  assert.ok(/how|doing|feeling|day/i.test(reply), 'Expected follow-up question or warm greeting');
});

test('smartConversation corrects L1 transfer "I am agree"', () => {
  const reply = generateSmartConversationReply('I am agree with that statement');
  assert.ok(reply.includes('I agree'), 'Expected correction to "I agree"');
});

test('smartConversation corrects L1 copula omission "I student"', () => {
  const reply = generateSmartConversationReply('I student at university');
  assert.ok(reply.includes('am a student') || reply.includes('linking verb'), 'Expected copula correction');
});

test('smartConversation corrects L1 article missing "I have car"', () => {
  const reply = generateSmartConversationReply('I have car and it is red');
  assert.ok(reply.includes('a car') || reply.includes('article'), 'Expected indefinite article correction');
});

test('smartConversation corrects preposition transfer "afraid from"', () => {
  const reply = generateSmartConversationReply('He is afraid from exams');
  assert.ok(reply.includes('afraid of'), 'Expected "afraid of" correction');
});

test('smartConversation corrects collocation "do a mistake"', () => {
  const reply = generateSmartConversationReply('Sorry I did a mistake');
  assert.ok(reply.includes('make a mistake'), 'Expected "make a mistake" correction');
});

test('smartConversation corrects electrical "open the light"', () => {
  const reply = generateSmartConversationReply('Please open the light');
  assert.ok(reply.includes('turn on the light'), 'Expected "turn on the light" correction');
});

test('smartConversation answers Egyptian "ازاي اقول" query via dictionary bridge', () => {
  const reply = generateSmartConversationReply('ازاي اقول كتاب');
  assert.ok(reply.includes('book') || reply.includes('Book'), 'Expected "book" in reply');
});

test('smartConversation explains "ليه بنقول am" clearly for Arabic speaker', () => {
  const reply = generateSmartConversationReply('ليه بنقول am في الجملة؟');
  assert.ok(reply.includes('فعل') && reply.includes('الكينونة'), 'Expected pedagogical explanation of copula');
});

test('smartConversation bridges Arabic greeting to English', () => {
  const reply = generateSmartConversationReply('ازيك يا عمرو عامل ايه');
  assert.ok(reply.includes('How are you doing today'), 'Expected bilingual bridge prompt');
});
