import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Send, X } from 'lucide-react';
import {
  buildDiagnosticPayload,
  dismissErrorPrompt,
  ERROR_LOG_UPDATED_EVENT,
  hasUndismissedErrors,
  loadErrorLog,
  recordLocalError,
  SanitizedErrorEntry,
  sendApprovedErrorReport,
} from '../utils/errorLogger';

interface ErrorConsentPanelProps {
  entries: SanitizedErrorEntry[];
  isArabic?: boolean;
  onDismiss: () => void;
  onSent?: () => void;
  compact?: boolean;
}

function ErrorConsentPanel({
  entries,
  isArabic = true,
  onDismiss,
  onSent,
  compact = false,
}: ErrorConsentPanelProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

  const previewJson = showPreview ? JSON.stringify(buildDiagnosticPayload(entries), null, 2) : '';

  const handleApproveAndSend = async () => {
    setSending(true);
    setStatusMsg(null);
    const result = await sendApprovedErrorReport({ entries });
    setSending(false);
    if (result.ok) {
      setSentOk(true);
      setStatusMsg(
        isArabic
          ? '✅ تم إرسال تقرير العطل بنجاح ومسح السجل المحلي. شكراً لمساعدتك!'
          : '✅ Error log sent and local queue cleared. Thank you!'
      );
      onSent?.();
    } else if (result.error === 'RATE_LIMITED') {
      setStatusMsg(
        isArabic
          ? '⏳ تم الوصول للحد الأقصى للتقارير مؤقتاً. حاول بعد 15 دقيقة.'
          : '⏳ Report limit reached. Please try again in 15 minutes.'
      );
    } else {
      setStatusMsg(
        isArabic
          ? '⚠️ تعذر الإرسال حالياً (تأكد من الاتصال بالإنترنت). تم الاحتفاظ بالسجل محلياً.'
          : '⚠️ Unable to send right now (check connection). Log remains saved locally.'
      );
    }
  };

  return (
    <div
      className={`rounded-2xl border text-start space-y-3 ${
        compact
          ? 'p-3.5 bg-[#0D141C]/95 border-amber-500/40 shadow-2xl'
          : 'p-4 bg-stone-950/90 border-amber-500/35'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
            <AlertTriangle size={16} />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-black text-white leading-relaxed">
              حدث خطأ تقني — هل توافق على إرسال تقرير العطل للمطور لإصلاحه؟
            </p>
            <p className="text-[11px] text-stone-300 leading-relaxed" dir="ltr">
              A technical glitch occurred — Approve sending error log to developer?
            </p>
            <p className="text-[10px] text-stone-400">
              {isArabic
                ? `التقرير خالٍ تماماً من أي بيانات شخصية (${entries.length} سجل محلي).`
                : `Zero personal data included (${entries.length} local log${entries.length === 1 ? '' : 's'}).`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={isArabic ? 'إغلاق' : 'Dismiss'}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowPreview((prev) => !prev)}
        className="min-h-[48px] text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 cursor-pointer"
      >
        {showPreview ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        <span>
          {showPreview
            ? isArabic
              ? 'إخفاء تفاصيل التقرير'
              : 'Hide Report Preview'
            : isArabic
              ? 'معاينة تفاصيل التقرير قبل الإرسال'
              : 'Preview Report Before Sending'}
        </span>
      </button>

      {showPreview && (
        <pre
          dir="ltr"
          className="max-h-44 overflow-auto rounded-xl bg-black/80 border border-stone-800 p-2.5 text-[10px] font-mono text-emerald-300 whitespace-pre-wrap break-words"
        >
          {previewJson}
        </pre>
      )}

      {statusMsg && (
        <p className={`text-[11px] font-bold ${sentOk ? 'text-emerald-300' : 'text-amber-300'}`}>
          {statusMsg}
        </p>
      )}

      {!sentOk && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sending}
            onClick={handleApproveAndSend}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
          >
            <Send size={13} />
            <span>
              {sending
                ? isArabic ? 'جاري الإرسال...' : 'Sending...'
                : isArabic ? 'موافق وإرسال التقرير' : 'Approve & Send'}
            </span>
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={onDismiss}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer transition"
          >
            {isArabic ? 'تجاهل' : 'Dismiss'}
          </button>
        </div>
      )}
    </div>
  );
}

export function ErrorReportPrompt({ isArabic = true }: { isArabic?: boolean }) {
  const [entries, setEntries] = useState<SanitizedErrorEntry[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      const list = loadErrorLog();
      setEntries(list);
      setVisible(hasUndismissedErrors());
    };
    sync();
    window.addEventListener(ERROR_LOG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ERROR_LOG_UPDATED_EVENT, sync);
  }, []);

  if (!visible || entries.length === 0) return null;

  const latestId = entries[entries.length - 1]?.id || '';

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isArabic ? 'تقرير خطأ تقني' : 'Technical Error Report'}
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] inset-x-3 sm:inset-x-auto sm:end-4 sm:w-[400px] z-[60]"
    >
      <ErrorConsentPanel
        entries={entries}
        isArabic={isArabic}
        compact
        onDismiss={() => {
          dismissErrorPrompt(latestId);
          setVisible(false);
        }}
        onSent={() => {
          window.setTimeout(() => setVisible(false), 1600);
        }}
      />
    </div>
  );
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  isArabic?: boolean;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  dismissedReport: boolean;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      dismissedReport: false,
    };
  }

  static getDerivedStateFromError(): Partial<GlobalErrorBoundaryState> {
    return { hasError: true, dismissedReport: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    recordLocalError({
      source: 'react',
      message: error?.message || 'React render error',
      stack: error?.stack || info?.componentStack || '',
    });
  }

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      this.setState({ hasError: false });
    }
  };

  private handleRecover = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isArabic = this.props.isArabic ?? true;
    const entries = loadErrorLog();

    return (
      <main
        className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center p-4 pt-safe pb-safe"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-6 shadow-2xl space-y-5 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-300 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-black text-white">
              {isArabic ? 'توقف مؤقت بسيط' : 'Quick Recovery'}
            </h1>
            <p className="text-xs text-stone-300 leading-relaxed">
              {isArabic
                ? 'تقدمك وبياناتك محفوظة بأمان على جهازك. يمكنك إعادة تحميل التطبيق فوراً.'
                : 'Your progress is safely saved on this device. You can reload right away.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-black flex items-center gap-2 cursor-pointer transition"
            >
              <RefreshCw size={15} />
              <span>{isArabic ? 'إعادة التحميل الآن' : 'Reload App'}</span>
            </button>
            <button
              type="button"
              onClick={this.handleRecover}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer transition"
            >
              {isArabic ? 'محاولة المتابعة' : 'Try Again'}
            </button>
          </div>

          {!this.state.dismissedReport && entries.length > 0 && (
            <ErrorConsentPanel
              entries={entries}
              isArabic={isArabic}
              onDismiss={() => {
                const latestId = entries[entries.length - 1]?.id || '';
                dismissErrorPrompt(latestId);
                this.setState({ dismissedReport: true });
              }}
            />
          )}
        </div>
      </main>
    );
  }
}
