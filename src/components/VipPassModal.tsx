import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  ExternalLink,
  HelpCircle,
  Lock,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  getUserGeminiKey,
  hasUserGeminiKey,
  setUserGeminiKey
} from '../services/geminiLexicon';

interface VipPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (active: boolean) => void;
}

const GOOGLE_AI_STUDIO_URL = 'https://aistudio.google.com/app/apikey';

export function VipPassModal({ isOpen, onClose, onStatusChange }: VipPassModalProps) {
  const [codeInput, setCodeInput] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(() => hasUserGeminiKey());
  const [showHowTo, setShowHowTo] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const saved = getUserGeminiKey();
    setCodeInput(saved);
    setHasSavedKey(Boolean(saved));
    setFeedback(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePasteCode = async () => {
    setFeedback(null);
    try {
      if (!navigator.clipboard?.readText) {
        setFeedback({
          type: 'err',
          text: 'المتصفح مش سامح باللصق التلقائي — اضغط مطولاً جوه المربع واختار "لصق" (Paste).'
        });
        return;
      }
      const clipText = (await navigator.clipboard.readText()).trim();
      if (!clipText) {
        setFeedback({
          type: 'err',
          text: 'الحافظة فاضية! انسخ الكود الأول من صفحة جوجل وبعدين اضغط لصق.'
        });
        return;
      }
      setCodeInput(clipText);
      setFeedback({
        type: 'ok',
        text: 'تم لصق الكود بنجاح! اضغط على "تفعيل المساعد ✨" دلوقتي.'
      });
    } catch {
      setFeedback({
        type: 'err',
        text: 'اضغط مطولاً جوه مربع الكتابة واختار "لصق" (Paste).'
      });
    }
  };

  const handleActivate = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = codeInput.trim();
    if (!cleaned) {
      setFeedback({
        type: 'err',
        text: 'من فضلك الصق الكود المجاني الأول قبل التفعيل.'
      });
      return;
    }
    if (cleaned.length < 20) {
      setFeedback({
        type: 'err',
        text: 'الكود ده قصير أوي — اتأكد إنك نسخت الكود كامل من صفحة جوجل (بيبدأ غالباً بـ AIza).'
      });
      return;
    }

    setUserGeminiKey(cleaned);
    setHasSavedKey(true);
    onStatusChange?.(true);
    setFeedback({
      type: 'ok',
      text: 'مبروك! تم تفعيل المساعد الذكي المتقدم بنجاح 🎉'
    });
    window.setTimeout(() => {
      onClose();
    }, 650);
  };

  const handleClearKey = () => {
    setUserGeminiKey('');
    setCodeInput('');
    setHasSavedKey(false);
    onStatusChange?.(false);
    setFeedback({
      type: 'ok',
      text: 'تم مسح الكود من جهازك، وهنرجع للوضع العادي.'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-pass-title"
          dir="rtl"
          className="fixed inset-0 z-[1050] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs overflow-y-auto"
          onMouseDown={event => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/40 bg-white text-right shadow-2xl dark:border-amber-500/30 dark:bg-stone-900"
          >
            {/* VIP Pass Header */}
            <div className="relative bg-gradient-to-l from-amber-500 via-orange-500 to-emerald-600 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wide backdrop-blur-xs">
                    <Sparkles size={13} aria-hidden="true" />
                    بطاقة VIP الذكية · مجاناً 100%
                  </span>
                  <h2 id="vip-pass-title" className="ar mt-1.5 text-xl font-extrabold">
                    🌟 افتح المساعد الذكي المتقدم
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/15 text-white transition hover:bg-black/30"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Friendly Egyptian Arabic Explanation */}
              <div className="ar space-y-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                <p>
                  عشان المساعد يجاوبك على أي سؤال في أي وقت (بدون أي حدود)، محتاجين نربط التطبيق بـ{' '}
                  <strong>&quot;كود مجاني&quot;</strong> من جوجل.
                </p>
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-bold text-emerald-800 dark:text-emerald-300">
                  ✅ الكود ده مجاني 100%، ومش محتاج فيزا ولا أي بيانات دفع.
                </p>
              </div>

              {/* Step 1: Big Direct Button to Google AI Studio */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-700 dark:bg-stone-800/60">
                <a
                  href={GOOGLE_AI_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ar flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>اضغط هنا عشان تجيب الكود المجاني</span>
                  <ExternalLink size={17} aria-hidden="true" />
                </a>
                <p className="ar mt-2 text-center text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  (هيفتحلك صفحة جوجل، دوس على الزرار الأزرق{' '}
                  <strong dir="ltr" className="font-mono text-blue-600 dark:text-blue-400">
                    &quot;Create API key&quot;
                  </strong>{' '}
                  وانسخ الكود)
                </p>
              </div>

              {/* Accordion: "إزاي أعمل ده؟" with Visual Guide */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setShowHowTo(prev => !prev)}
                  aria-expanded={showHowTo}
                  className="ar flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/50"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle size={15} className="text-amber-600 dark:text-amber-400" />
                    إزاي أعمل ده؟ (شرح بسيط في ٣ خطوات)
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showHowTo ? 'rotate-180' : ''}`}
                  />
                </button>
                {showHowTo && (
                  <div className="ar space-y-3 border-t border-stone-200 px-3.5 py-3 text-xs leading-relaxed text-stone-700 dark:border-stone-700 dark:text-stone-300">
                    <ol className="list-decimal space-y-1.5 pr-4">
                      <li>
                        افتح الرابط فوق وسجّل دخول بحساب جوجل العادي بتاعك (الجيميل).
                      </li>
                      <li>
                        دوس على الزرار الأزرق{' '}
                        <strong dir="ltr" className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
                          + Create API key
                        </strong>{' '}
                        في صفحة جوجل.
                      </li>
                      <li>
                        انسخ الكود اللي هيظهرلك، وارجع هنا دوس على زرار{' '}
                        <strong>&quot;📋 لصق الكود&quot;</strong> تحت!
                      </li>
                    </ol>

                    {/* Mini Visual Diagram of Google AI Studio Button */}
                    <div
                      dir="ltr"
                      aria-label="Google AI Studio preview"
                      className="rounded-xl border border-stone-300 bg-stone-900 p-3 text-left text-white shadow-inner dark:border-stone-600"
                    >
                      <div className="flex items-center justify-between border-b border-stone-700 pb-2 text-[11px] text-stone-300">
                        <span className="font-semibold">Google AI Studio · API Keys</span>
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                          100% Free Tier
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className=" inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white ring-2 ring-amber-400">
                          + Create API key
                        </span>
                        <span dir="rtl" className="ar text-[11px] font-bold text-amber-300">
                          👈 دوس على الزرار ده هناك
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Input + Magic Paste Button */}
              <form onSubmit={handleActivate} className="space-y-3">
                <div>
                  <label
                    htmlFor="vip-gemini-key-input"
                    className="ar mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200"
                  >
                    الصق الكود هنا:
                  </label>
                  <div className="flex items-stretch gap-2">
                    <input
                      id="vip-gemini-key-input"
                      dir="ltr"
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      value={codeInput}
                      onChange={event => setCodeInput(event.target.value)}
                      placeholder="AIzaSy..."
                      className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-mono text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => void handlePasteCode()}
                      className="ar inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-500/25 dark:text-amber-200"
                    >
                      <ClipboardPaste size={15} aria-hidden="true" />
                      <span>📋 لصق الكود</span>
                    </button>
                  </div>
                </div>

                {feedback && (
                  <p
                    role="status"
                    className={`ar rounded-xl px-3 py-2 text-xs font-semibold ${
                      feedback.type === 'ok'
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="ar flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700"
                  >
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>تفعيل المساعد ✨</span>
                  </button>
                  {hasSavedKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      title="مسح الكود المحفوظ"
                      className="ar inline-flex min-h-12 items-center gap-1 rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span>مسح</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Privacy Reassurance Footer */}
              <p className="ar flex items-center justify-center gap-1.5 border-t border-stone-200/80 pt-3 text-center text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                <Lock size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  الكود ده بيتحفظ على جهازك أنت بس. إحنا مش بنشوفه ولا بنخزنه على السيرفر.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
