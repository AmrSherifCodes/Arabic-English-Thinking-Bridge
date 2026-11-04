import { useCallback, useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ArrowLeft, BookOpen, Bug, Lightbulb, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { getUserGeminiKey } from '../services/geminiLexicon';
import { consumeDailyApiQuota } from '../utils/apiQuota';

interface FeedbackEntry {
  id?: string;
  createdAt: string;
  rating: number;
  category: 'bug' | 'feature' | 'content' | 'general';
  message: string;
  userName?: string;
  focusArea?: string;
  dialect?: string;
}

interface AdminFeedbackViewProps {
  onBack: () => void;
  isArabic?: boolean;
}

const FEEDBACK_STORAGE_KEY = 'thinking_english_anonymous_reviews_v1';

function isFeedbackEntry(value: unknown): value is FeedbackEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.createdAt === 'string' &&
    typeof entry.rating === 'number' &&
    (entry.category === 'bug' || entry.category === 'feature' ||
      entry.category === 'content' || entry.category === 'general') &&
    typeof entry.message === 'string';
}

export function AdminFeedbackView({ onBack, isArabic = true }: AdminFeedbackViewProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const loadFeedbacks = useCallback(() => {
    setError('');
    try {
      const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!saved) {
        setFeedbacks([]);
        return;
      }
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isFeedbackEntry)) {
        throw new Error('The saved feedback has an unexpected format.');
      }
      setFeedbacks(parsed.map((entry, index) => ({ ...entry, id: `${entry.createdAt}-${index}` })).reverse());
    } catch (loadError) {
      console.error('Could not load feedback stored on this device.', loadError);
      setError(isArabic ? 'تعذر قراءة الملاحظات المحلية.' : 'Could not read feedback stored on this device.');
    }
  }, [isArabic]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const summarizeFeedbackWithAI = async () => {
    const userKey = getUserGeminiKey();
    if (!userKey) {
      setSummary(isArabic
        ? 'أضف مفتاح Gemini الخاص بك من الإعدادات لتلخيص الملاحظات.'
        : 'Add your Gemini API key in Settings to summarize feedback.');
      return;
    }
    if (feedbacks.length === 0) {
      setSummary(isArabic ? 'لا توجد ملاحظات لتلخيصها.' : 'There is no feedback to summarize.');
      return;
    }
    if (!consumeDailyApiQuota()) {
      setSummary(isArabic
        ? 'وصلت إلى حد الذكاء الاصطناعي اليومي. يتجدد غداً.'
        : 'Daily AI limit reached. Resets tomorrow.');
      return;
    }

    setSummarizing(true);
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey: userKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize these locally stored feedback entries into exactly three concise bullet points. Do not infer personal information:\n${JSON.stringify(feedbacks.slice(0, 20).map(({ category, message, rating }) => ({ category, message, rating })))}`,
        config: { maxOutputTokens: 250, temperature: 0.7 },
      });
      setSummary(response.text?.trim() || (isArabic ? 'لم يتم إنشاء ملخص.' : 'No summary generated.'));
    } catch (summaryError) {
      console.error('Could not summarize locally stored feedback.', summaryError);
      setError(summaryError instanceof Error ? summaryError.message : 'Could not summarize feedback.');
    } finally {
      setSummarizing(false);
    }
  };

  const categories = {
    bug: feedbacks.filter((entry) => entry.category === 'bug'),
    content: feedbacks.filter((entry) => entry.category === 'content'),
    feature: feedbacks.filter((entry) => entry.category === 'feature' || entry.category === 'general'),
  };
  const renderFeedback = (entries: FeedbackEntry[]) => entries.length === 0
    ? <p className="p-3 text-center text-xs italic text-stone-500">{isArabic ? 'لا توجد ملاحظات' : 'No feedback'}</p>
    : entries.map((entry) => (
      <article key={entry.id || entry.createdAt} className="space-y-1 rounded-2xl border border-stone-800 bg-stone-950 p-3">
        <span className="block text-[10px] font-bold text-stone-400">
          {[entry.userName, entry.focusArea, entry.dialect, new Date(entry.createdAt).toLocaleDateString()].filter(Boolean).join(' · ')}
        </span>
        <p className="text-xs font-medium text-stone-200">{entry.message}</p>
      </article>
    ));

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 bg-stone-950 p-4 text-start text-stone-100 sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} aria-label={isArabic ? 'رجوع' : 'Back'} className="rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-stone-300 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">{isArabic ? 'ملاحظات هذا الجهاز' : 'Feedback on this device'}</h1>
            <p className="text-xs font-bold text-stone-400">{feedbacks.length} {isArabic ? 'ملاحظة محلية' : 'local entries'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadFeedbacks} aria-label={isArabic ? 'تحديث' : 'Refresh'} className="rounded-xl border border-stone-800 bg-stone-900 p-2.5 text-teal-400 hover:bg-stone-800">
            <RefreshCw size={16} />
          </button>
          {feedbacks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(FEEDBACK_STORAGE_KEY);
                  setFeedbacks([]);
                  setSummary(null);
                } catch {
                  /* noop */
                }
              }}
              aria-label={isArabic ? 'مسح السجل' : 'Clear Logs'}
              className="rounded-xl border border-red-500/30 bg-red-950/30 p-2.5 text-red-400 hover:bg-red-900/40"
              title={isArabic ? 'مسح السجل' : 'Clear Logs'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      <p className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs text-amber-200">
        {isArabic ? 'الملاحظات محفوظة على هذا الجهاز فقط ولا تتم مزامنتها.' : 'Feedback is stored only on this device and is not synced.'}
      </p>
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</p>}

      <section className="space-y-3 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-black text-amber-400"><Sparkles size={18} />{isArabic ? 'ملخص الملاحظات' : 'Feedback Summary'}</h2>
          <button type="button" onClick={() => void summarizeFeedbackWithAI()} disabled={summarizing} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-stone-950 disabled:opacity-50">
            {summarizing ? (isArabic ? 'جارٍ التلخيص…' : 'Summarizing…') : (isArabic ? '✨ تلخيص' : '✨ Summarize')}
          </button>
        </div>
        {summary && <p className="whitespace-pre-line rounded-2xl border border-amber-500/20 bg-stone-950/80 p-3.5 text-xs font-medium leading-relaxed text-stone-200">{summary}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {([
          ['bug', isArabic ? 'أخطاء تقنية' : 'Bugs', Bug, 'text-red-400'],
          ['content', isArabic ? 'محتوى وترجمة' : 'Content & Translation', BookOpen, 'text-teal-400'],
          ['feature', isArabic ? 'اقتراحات وميزات' : 'Feature Requests', Lightbulb, 'text-amber-400'],
        ] as const).map(([key, title, Icon, color]) => (
          <div key={key} className="space-y-3 rounded-3xl border border-stone-800 bg-stone-900 p-4">
            <h2 className={`flex items-center gap-2 border-b border-stone-800 pb-2 text-xs font-black ${color}`}>
              <Icon size={16} />{title}<span className="ms-auto">{categories[key].length}</span>
            </h2>
            <div className="space-y-2.5">{renderFeedback(categories[key])}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
