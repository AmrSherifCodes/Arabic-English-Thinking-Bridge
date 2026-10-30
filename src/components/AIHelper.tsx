import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { UserProfile } from '../hooks/useUserProfile';
import { useRealConversation } from '../hooks/useRealConversation';
import type { LexiconEntry, TutorContext } from '../services/geminiLexicon';
import {
  checkGeminiService,
  GEMINI_KEY_CHANGED_EVENT,
  hasUserGeminiKey
} from '../services/geminiLexicon';
import { askAIHelper } from '../services/aiRouter';
import { isArabicUI, uiText } from '../utils/i18n';
import { BouncyButton } from './BouncyButton';
import { VipPassModal } from './VipPassModal';

export const OPEN_VIP_PASS_EVENT = 'tb:open-vip-pass';

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
  const [showVipModal, setShowVipModal] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(() => hasUserGeminiKey());
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine
  );
  const [hasGeminiBackend, setHasGeminiBackend] = useState(false);
  const [currentWord, setCurrentWord] = useState<LexiconEntry | undefined>();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { messages, history, addMessage } = useRealConversation();
  const cloudAvailable = isOnline && (hasPersonalKey || hasGeminiBackend);
  const rtl = isArabicUI(profile.language);
  const t = (en: string, ar: string) => uiText(profile.language, en, ar);

  useEffect(() => {
    let active = true;
    const updateConnection = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setHasPersonalKey(hasUserGeminiKey());
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
    const handleOpenVip = () => setShowVipModal(true);

    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    window.addEventListener(GEMINI_KEY_CHANGED_EVENT, updateConnection);
    window.addEventListener(OPEN_VIP_PASS_EVENT, handleOpenVip);
    return () => {
      active = false;
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      window.removeEventListener(GEMINI_KEY_CHANGED_EVENT, updateConnection);
      window.removeEventListener(OPEN_VIP_PASS_EVENT, handleOpenVip);
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
          : t(
            'The tutor could not answer right now. Please try again.',
            'تعذر على المساعد الذكي الرد حالياً. يرجى المحاولة مرة أخرى.'
          )
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
              dir={rtl ? 'rtl' : 'ltr'}
              role="dialog"
              aria-label={t('AI language tutor', 'المعلم اللغوي الذكي')}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] min-h-64 w-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900"
            >
              <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-700">
                <div className="flex min-w-0 items-center gap-2">
                  <Sparkles size={19} className="shrink-0 text-olive-600 dark:text-olive-300" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold">{t('Language Tutor', 'المعلم اللغوي الذكي')}</h2>
                    <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${cloudAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {hasPersonalKey
                        ? '🌟 المساعد الذكي (VIP مفعل)'
                        : cloudAvailable
                        ? t('Gemini tutor', 'معلم Gemini الذكي')
                        : t('Offline Mode · Dictionary fallback', 'وضع بدون إنترنت · القاموس المحلي')}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {hasPersonalKey && (
                    <button
                      type="button"
                      onClick={() => setShowVipModal(true)}
                      className="ar rounded-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-500/25 dark:text-amber-300"
                    >
                      🌟 كود VIP
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={t('Close tutor', 'إغلاق المعلم الذكي')}
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              </header>

              {!hasPersonalKey && (
                <div className="border-b border-amber-400/30 bg-gradient-to-l from-amber-500/10 via-orange-500/10 to-emerald-500/10 px-3.5 py-2.5">
                  <button
                    type="button"
                    dir="rtl"
                    onClick={() => setShowVipModal(true)}
                    className="ar flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:from-amber-600 hover:to-orange-700"
                  >
                    <span>افتح المساعد الذكي (مجاني) 🚀</span>
                  </button>
                </div>
              )}

              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.length === 0 && (
                  <p className="rounded-2xl bg-stone-100 p-3 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {t(
                      'Ask a specific question about Arabic vocabulary or grammar.',
                      'اطرح أي سؤال محدد حول مفردات أو قواعد اللغة الإنجليزية.'
                    )}
                  </p>
                )}
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${message.role === 'user'
                        ? 'ml-auto bg-olive-700 text-white'
                        : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100'
                      }`}
                  >
                    {message.text}
                  </div>
                ))}
                {isSending && (
                  <div className="rounded-2xl bg-stone-100 px-3 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {cloudAvailable
                      ? t('Thinking…', 'جاري التفكير…')
                      : t('Looking in the offline dictionary…', 'جاري البحث في القاموس المحلي…')}
                  </div>
                )}
              </div>

              <form
                onSubmit={event => void sendMessage(event)}
                className="flex flex-col gap-1.5 border-t border-stone-200 p-3 dark:border-stone-700"
              >
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="ai-tutor-message">
                    {t('Message the language tutor', 'أرسل رسالة للمعلم الذكي')}
                  </label>
                  <input
                    id="ai-tutor-message"
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    maxLength={2000}
                    placeholder={t('Ask a language question…', 'اسأل سؤالاً لغوياً…')}
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-600/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                  />
                  <BouncyButton
                    type="submit"
                    aria-label={t('Send message', 'إرسال')}
                    disabled={!input.trim() || isSending}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-olive-700 text-white hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={18} aria-hidden="true" />
                  </BouncyButton>
                </div>
                {error && (
                  <p role="alert" className="break-words px-1 text-xs font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        <BouncyButton
          type="button"
          aria-label={
            isOpen
              ? t('Close AI tutor', 'إغلاق المعلم الذكي')
              : t('Open AI tutor', 'فتح المعلم الذكي')
          }
          aria-expanded={isOpen}
          onClick={() => setIsOpen(open => !open)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-700 text-white shadow-xl ring-1 ring-white/30 hover:bg-olive-800"
        >
          {isOpen ? <X size={23} /> : <Sparkles size={23} />}
        </BouncyButton>
      </div>
      <div className="pointer-events-auto">
        <VipPassModal
          isOpen={showVipModal}
          onClose={() => setShowVipModal(false)}
          onStatusChange={active => setHasPersonalKey(active)}
        />
      </div>
    </div>
  );
}
