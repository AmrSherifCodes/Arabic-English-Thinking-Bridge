import type { TutorContext } from './geminiLexicon';
import { generateTutorResponse } from './geminiLexicon';
import { STATIC_DICTIONARY } from '../data/staticDictionary';

function getOfflineAnswer(prompt: string, context: TutorContext): string {
  const entry =
    context.currentWord ??
    STATIC_DICTIONARY.find(candidate =>
      (candidate.dialect ?? 'msa') === context.profile.dialect &&
      (prompt.toLocaleLowerCase().includes(candidate.arabicWord.toLocaleLowerCase()) ||
        prompt.toLocaleLowerCase().includes(candidate.englishTranslation.toLocaleLowerCase()))
    );

  if (entry) {
    return (
      `${entry.arabicWord} means “${entry.englishTranslation}”. ` +
      `Example: ${entry.exampleSentenceArabic} — ${entry.exampleSentenceEnglish}`
    );
  }

  return 'I need an internet connection and an API key to answer that right now. You can ask me about a word in your flashcards or static vocabulary.';
}

export async function askAIHelper(
  prompt: string,
  context: TutorContext
): Promise<string> {
  const question = prompt.trim();
  if (!question || question.length > 2000) {
    throw new Error('Enter a question of 1–2000 characters.');
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getOfflineAnswer(question, context);
  }

  try {
    return await generateTutorResponse(question, context);
  } catch {
    return getOfflineAnswer(question, context);
  }
}
