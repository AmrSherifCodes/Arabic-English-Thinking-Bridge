import type { TutorContext, LexiconEntry } from './geminiLexicon';
import { generateTutorResponse } from './geminiLexicon';
import { STATIC_DICTIONARY } from '../data/staticDictionary';
import { generateLocalTutorResponse, isLocalAIReady } from './localAI';
import { generateSmartConversationReply } from './smartConversation';
import { isOnline } from '../utils/connectivity';
import { UserProfile } from '../types';

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Intelligent pedagogical response generator when cloud LLM is unavailable.
 * Never degrades to a robotic "offline" string or raw dictionary dumps.
 */
export function getOfflineAnswer(prompt: string, context?: TutorContext, reason?: string): string {
  const query = prompt.trim();
  const profile = context?.profile as UserProfile | undefined;
  const currentWord = context?.currentWord as LexiconEntry | undefined;

  // 1. If context specifically centers on an active word/flashcard, provide structured lesson explanation
  const dialect = profile?.dialect ?? 'egyptian';
  const queryLower = query.toLocaleLowerCase();
  const entry =
    (currentWord?.dialect === dialect ? currentWord : undefined) ??
    STATIC_DICTIONARY.find(candidate =>
      candidate.dialect === dialect &&
      (queryLower.includes(candidate.arabicWord.toLocaleLowerCase()) ||
        queryLower.includes(candidate.englishTranslation.toLocaleLowerCase()))
    ) ??
    STATIC_DICTIONARY.find(candidate =>
      queryLower.includes(candidate.arabicWord.toLocaleLowerCase()) ||
      queryLower.includes(candidate.englishTranslation.toLocaleLowerCase())
    );

  if (entry) {
    return (
      `Word bridge: "${entry.arabicWord}" connects to "${entry.englishTranslation}".\n\n` +
      `💡 In Arabic: ${entry.exampleSentenceArabic}\n` +
      `🎯 In English: ${entry.exampleSentenceEnglish}\n\n` +
      `Notice how the sentence is structured without translating word-for-word in your head!`
    );
  }

  // 2. Generate intelligent bilingual conversational tutor reply with L1 error correction
  return generateSmartConversationReply(query);
}

export async function getPedagogicalAIResponse(
  prompt: string,
  context?: TutorContext
): Promise<{ text: string; mode: 'cloud' | 'local' | 'fallback' }> {
  // Offline-first gate: never wait on a doomed network request.
  if (isOnline()) {
    try {
      const text = await generateTutorResponse(prompt, context || {});
      return { text, mode: 'cloud' };
    } catch {
      // Fall through to the local engine.
    }
  }

  if (isLocalAIReady()) {
    try {
      const localText = await generateLocalTutorResponse(prompt);
      return { text: localText, mode: 'local' };
    } catch {}
  }

  const fallbackText = getOfflineAnswer(prompt, context);
  return { text: fallbackText, mode: 'fallback' };
}

export async function askAIHelper(prompt: string, context?: TutorContext): Promise<string> {
  const res = await getPedagogicalAIResponse(prompt, context);
  return res.text;
}
