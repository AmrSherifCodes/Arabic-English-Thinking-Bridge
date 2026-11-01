import type { TutorContext } from './geminiLexicon';
import { generateTutorResponse, LexiconError } from './geminiLexicon';
import { STATIC_DICTIONARY } from '../data/staticDictionary';
import { generateLocalTutorResponse } from './localAI';
import { localOfflineTranslate } from '../App';

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Fallback to static dictionary entries and local translated pairs.
 */
export function getOfflineAnswer(prompt: string, context?: TutorContext, reason?: string): string {
  const query = prompt.trim();
  const from = isArabic(query) ? 'ar' : 'en';

  // 1. Try localOfflineTranslate from App prebuilt dictionary & cards
  try {
    const directHit = localOfflineTranslate(query, from);
    if (directHit) {
      const prefix = reason ? `(${reason}) ` : '';
      return `${prefix}${query} = ${directHit}`;
    }
  } catch {
    // Ignore and proceed to static dictionary search
  }

  // 2. Search STATIC_DICTIONARY for relevant matching concept
  const dialect = context?.profile?.dialect ?? 'msa';
  const entry =
    (context?.currentWord?.dialect === dialect ? context?.currentWord : undefined) ??
    STATIC_DICTIONARY.find(candidate =>
      candidate.dialect === dialect &&
      (query.toLocaleLowerCase().includes(candidate.arabicWord.toLocaleLowerCase()) ||
        query.toLocaleLowerCase().includes(candidate.englishTranslation.toLocaleLowerCase()))
    );

  const prefix = reason ? `(${reason} Showing offline dictionary match:) ` : '';

  if (entry) {
    return (
      `${prefix}${entry.arabicWord} means “${entry.englishTranslation}”. ` +
      `Example: ${entry.exampleSentenceArabic} — ${entry.exampleSentenceEnglish}`
    );
  }

  return reason
    ? `${reason} Please try asking about a flashcard word or vocabulary phrase.`
    : 'I am in offline mode. You can ask me about a word in your flashcards or vocabulary list.';
}

/**
 * Intelligent AI Router:
 * 1. Online  -> Call fast, smart cloud model (/api/gemini).
 * 2. Offline -> Call on-device Small Language Model (Gemma 3n via localAI).
 * 3. Fallback -> Fall back to local offline dictionary if local SLM fails or is unsupported.
 */
export async function sendMessage(
  prompt: string,
  context?: TutorContext,
  onError?: (error: Error) => void
): Promise<string> {
  const question = prompt.trim();
  if (!question || question.length > 2000) {
    throw new Error('Enter a question of 1–2000 characters.');
  }

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // 1. ONLINE: Attempt cloud Gemini API
  if (isOnline) {
    try {
      if (context) {
        return await generateTutorResponse(question, context);
      }
    } catch (err) {
      console.warn('[aiRouter] Cloud /api/gemini failed or rate-limited. Falling back to local AI:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      onError?.(errorObj);

      // If rate-limited or unavailable, fall through to on-device Gemma 3n
    }
  }

  // 2. OFFLINE (or Cloud Failure): Attempt on-device Gemma 3n SLM
  try {
    const localReply = await generateLocalTutorResponse(question);
    return localReply;
  } catch (localErr) {
    console.warn('[aiRouter] On-device Gemma 3n failed or unavailable, falling back to dictionary:', localErr);
    // 3. Fall back to offline dictionary
    return getOfflineAnswer(
      question,
      context,
      isOnline ? 'AI temporarily busy.' : 'Offline mode.'
    );
  }
}

/**
 * Backward-compatible alias for existing components.
 */
export const askAIHelper = sendMessage;
