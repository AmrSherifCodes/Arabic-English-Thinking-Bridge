import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    try {
      // Clear transient session keys while preserving learning progress
      sessionStorage.clear();
    } catch {
      // Ignore storage errors in restricted contexts
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          dir="rtl"
          role="alert"
          aria-live="assertive"
          className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8f9fa] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans"
        >
          <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-3xl">
              <span>⚠️</span>
            </div>

            <div className="space-y-2">
              <h1 className="ar text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                حدث خطأ ما. يرجى تحديث الصفحة
              </h1>
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                Oops, something went wrong. Please refresh the page.
              </p>
              <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 leading-relaxed pt-1">
                واجه التطبيق مشكلة تقنية بسيطة. بياناتك وتقدمك محفوظان بأمان في جهازك.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left text-xs bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 border border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 overflow-x-auto max-h-32">
                <summary className="cursor-pointer font-semibold text-stone-700 dark:text-stone-300">
                  تفاصيل الخطأ التقني (Error Details)
                </summary>
                <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔄</span>
                <span>إعادة تحميل التطبيق (Reload App)</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                مسح الجلسة المؤقتة والمحاولة ثانية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

