import type { TutorContext } from './geminiLexicon';
import { generateTutorResponse, LexiconError } from './geminiLexicon';
import { STATIC_DICTIONARY } from '../data/staticDictionary';

function getOfflineAnswer(prompt: string, context: TutorContext, reason?: string): string {
  const entry =
    (context.currentWord?.dialect === context.profile.dialect ? context.currentWord : undefined) ??
    STATIC_DICTIONARY.find(candidate =>
      candidate.dialect === context.profile.dialect &&
      (prompt.toLocaleLowerCase().includes(candidate.arabicWord.toLocaleLowerCase()) ||
        prompt.toLocaleLowerCase().includes(candidate.englishTranslation.toLocaleLowerCase()))
    );

  const prefix = reason ? `(${reason} Showing offline dictionary match:) ` : '';

  if (entry) {
    return (
      `${prefix}${entry.arabicWord} means “${entry.englishTranslation}”. ` +
      `Example: ${entry.exampleSentenceArabic} — ${entry.exampleSentenceEnglish}`
    );
  }

  return reason
    ? `${reason} Please try again in a minute, or ask about a flashcard word.`
    : 'I need an internet connection and an API key to answer that right now. You can ask me about a word in your flashcards or static vocabulary.';
}

export async function askAIHelper(
  prompt: string,
  context: TutorContext,
  onError?: (error: Error) => void
): Promise<string> {
  const question = prompt.trim();
  if (!question || question.length > 2000) {
    throw new Error('Enter a question of 1–2000 characters.');
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const offlineErr = new Error('Browser is offline (navigator.onLine === false)');
    onError?.(offlineErr);
    return getOfflineAnswer(question, context, 'API Error: ' + offlineErr.message);
  }

  try {
    return await generateTutorResponse(question, context);
  } catch (err) {
    console.error('[aiRouter] generateTutorResponse error:', err);
    const errorObj = err instanceof Error ? err : new Error(String(err));
    onError?.(errorObj);
    return getOfflineAnswer(question, context, 'API Error: ' + (err as Error).message);
  }
}
