import type { TutorContext } from './geminiLexicon';
import { generateTutorResponse, LexiconError } from './geminiLexicon';
import { STATIC_DICTIONARY } from '../data/staticDictionary';
import { generateLocalTutorResponse, isLocalAIReady } from './localAI';
import { generateSmartConversationReply } from './smartConversation';
import { searchOfflineDictionary as localOfflineTranslate } from '../utils/dictionarySearch';

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Intelligent pedagogical response generator when cloud LLM is unavailable.
 * Never degrades to a robotic "offline" string or raw dictionary dumps.
 */
export function getOfflineAnswer(prompt: string, context?: TutorContext, reason?: string): string {
  const query = prompt.trim();

  // 1. If context specifically centers on an active word/flashcard, provide structured lesson explanation
  const dialect = context?.profile?.dialect ?? 'msa';
  const queryLower = query.toLocaleLowerCase();
  const entry =
    (context?.currentWord?.dialect === dialect ? context?.currentWord : undefined) ??
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

/**
 * Intelligent AI Router:
 * 1. Online  -> Call fast, smart cloud model (/api/gemini).
 * 2. Offline -> Call on-device Small Language Model (Gemma 3n via localAI) if already initialized.
 * 3. Fallback -> Fall back to smart pedagogical dictionary & conversational engine.
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

  // 1. ONLINE: Attempt cloud Gemini API with automatic fallback context if omitted
  if (isOnline) {
    try {
      const effectiveContext: TutorContext = context || {
        profile: {
          goal: 'general',
          language: 'english',
          dialect: 'egyptian',
          level: 'beginner'
        },
        history: []
      };
      return await generateTutorResponse(question, effectiveContext);
    } catch (err) {
      console.warn('[aiRouter] Cloud /api/gemini failed or rate-limited. Falling back to local AI:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      onError?.(errorObj);
    }
  }

  // 2. OFFLINE (or Cloud Failure): Attempt on-device Gemma 3n SLM ONLY if ready
  if (isLocalAIReady()) {
    try {
      const localReply = await generateLocalTutorResponse(question);
      return localReply;
    } catch (localErr) {
      console.warn('[aiRouter] On-device Gemma 3n failed:', localErr);
    }
  }

  // 3. Fall back to smart offline dictionary & conversational pedagogical engine (<15ms)
  return getOfflineAnswer(
    question,
    context,
    isOnline ? 'AI temporarily busy.' : 'Offline mode.'
  );
}

/**
 * Backward-compatible alias for existing components.
 */
export const askAIHelper = sendMessage;
