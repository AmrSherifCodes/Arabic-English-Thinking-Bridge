import React, { Component, ErrorInfo, ReactNode } from 'react';
import i18next from 'i18next';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // If it's a dynamic chunk loading error, a full window reload is required to fetch updated bundle
    const isChunkError =
      this.state.error?.name === 'ChunkLoadError' ||
      (this.state.error?.message &&
        (this.state.error.message.includes('Failed to fetch dynamically imported module') ||
          this.state.error.message.includes('Importing a module script failed') ||
          this.state.error.message.includes('Loading chunk') ||
          this.state.error.message.includes('Failed to load module script')));

    if (isChunkError && typeof window !== 'undefined') {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: undefined, showDetails: false });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isArabic =
        typeof document !== 'undefined' &&
        (document.documentElement.lang.startsWith('ar') || document.documentElement.dir === 'rtl');

      return (
        <div
          className="min-h-[100dvh] bg-gradient-to-br from-[#0A0E13] via-[#0F151C] to-[#102b2b] text-[#EEF2F5] flex flex-col items-center justify-center p-6 pt-safe pb-safe text-center space-y-6 font-sans"
          dir={isArabic ? 'rtl' : 'ltr'}
          role="alert"
          aria-live="assertive"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-black text-4xl shadow-2xl animate-pulse">
            🧠
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isArabic ? 'حدث خطأ غير متوقع في التطبيق' : 'An unexpected error occurred'}
            </h1>
            <p className="text-xs text-stone-400">
              {isArabic
                ? 'حافظنا على تقدمك المحلي آمنًا. يمكنك إعادة المحاولة أو تحميل التطبيق مجدداً.'
                : 'Your local progress remains safe. Try recovering or reloading the app.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-2xl bg-surface border border-border hover:bg-surface-2 text-text font-bold text-xs transition"
            >
              {isArabic ? 'إعادة المحاولة' : 'Try again'}
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-stone-950 font-black text-xs transition shadow-xl active:scale-95"
            >
              {isArabic ? 'إعادة تحميل التطبيق' : 'Reload app'}
            </button>
          </div>

          {this.state.error && (
            <div className="max-w-md w-full pt-4">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] text-stone-500 hover:text-stone-300 underline transition"
              >
                {this.state.showDetails
                  ? isArabic
                    ? 'إخفاء التفاصيل الفنية'
                    : 'Hide technical details'
                  : isArabic
                  ? 'عرض التفاصيل الفنية'
                  : 'Show technical details'}
              </button>
              {this.state.showDetails && (
                <pre className="mt-3 p-3 bg-stone-950/80 border border-stone-800 text-stone-300 text-[10px] text-left overflow-x-auto rounded-xl font-mono leading-relaxed max-h-40">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
