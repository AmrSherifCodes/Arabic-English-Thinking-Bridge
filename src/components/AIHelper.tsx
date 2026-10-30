import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { UserProfile } from '../hooks/useUserProfile';
import { useRealConversation } from '../hooks/useRealConversation';
import type { LexiconEntry, TutorContext } from '../services/geminiLexicon';
import { checkGeminiService } from '../services/geminiLexicon';
import { askAIHelper } from '../services/aiRouter';
import { BouncyButton } from './BouncyButton';

export interface AIHelperRequest {
  id: number;
  prompt: string;
  currentWord: LexiconEntry;
}

interface AIHelperProps {
  profile: UserProfile;
  request?: AIHelperRequest | null;
}

export function AIHelper({ profile, request }: AIHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine
  );
  const [hasGeminiBackend, setHasGeminiBackend] = useState(false);
  const [currentWord, setCurrentWord] = useState<LexiconEntry | undefined>();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { messages, history, addMessage } = useRealConversation();
  const cloudAvailable = isOnline && hasGeminiBackend;

  useEffect(() => {
    let active = true;
    const updateConnection = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (!online) {
        setHasGeminiBackend(false);
        return;
      }
      void checkGeminiService()
        .then(configured => {
          if (active) setHasGeminiBackend(configured);
        })
        .catch(() => {
          if (active) setHasGeminiBackend(false);
        });
    };
    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      active = false;
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    if (!request) return;
    setCurrentWord(request.currentWord);
    setInput(request.prompt);
    setError(null);
    setIsOpen(true);
  }, [request?.id]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setInput('');
    setError(null);
    addMessage('user', question);
    setIsSending(true);

    try {
      const context: TutorContext = { profile, currentWord, history };
      const answer = await askAIHelper(question, context);
      addMessage('assistant', answer);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The tutor could not answer right now. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[999] flex justify-end px-4">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.section
              key="ai-chat"
              role="dialog"
              aria-label="AI language tutor"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] min-h-64 w-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900"
            >
              <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
                <div className="flex min-w-0 items-center gap-2">
                  <Sparkles size={19} className="shrink-0 text-olive-600 dark:text-olive-300" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold">Language Tutor</h2>
                    <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${cloudAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                        {cloudAvailable ? 'Gemini tutor' : 'Dictionary fallback'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close tutor"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </header>

              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.length === 0 && (
                  <p className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    Ask a specific question about {profile.language} vocabulary or grammar.
                  </p>
                )}
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'ml-auto bg-olive-700 text-white'
                        : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100'
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
                {isSending && (
                  <div className="rounded-2xl bg-stone-100 px-3 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {cloudAvailable ? 'Thinking…' : 'Looking in the offline dictionary…'}
                  </div>
                )}
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
                    {error}
                  </p>
                )}
              </div>

              <form
                onSubmit={event => void sendMessage(event)}
                className="flex items-center gap-2 border-t border-stone-200 p-3 dark:border-stone-700"
              >
                <label className="sr-only" htmlFor="ai-tutor-message">
                  Message the language tutor
                </label>
                <input
                  id="ai-tutor-message"
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  maxLength={2000}
                  placeholder="Ask a language question…"
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-600/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
                <BouncyButton
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim() || isSending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-olive-700 text-white hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} aria-hidden="true" />
                </BouncyButton>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        <BouncyButton
          type="button"
          aria-label={isOpen ? 'Close AI tutor' : 'Open AI tutor'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(open => !open)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-700 text-white shadow-xl ring-1 ring-white/30 hover:bg-olive-800"
        >
          {isOpen ? <X size={23} /> : <Sparkles size={23} />}
        </BouncyButton>
      </div>
    </div>
  );
}
