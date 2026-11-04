import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

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
          className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0F151C] to-[#102b2b] text-[#EEF2F5] flex flex-col items-center justify-center p-6 text-center space-y-6 font-sans"
          dir={isArabic ? 'rtl' : 'ltr'}
          role="alert"
          aria-live="assertive"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-black text-4xl shadow-2xl animate-pulse">
            🧠
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isArabic ? 'حدث خطأ ما. يرجى تحديث الصفحة.' : 'Something went wrong. Please refresh.'}
            </h1>
          </div>

          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-stone-950 font-black text-xs transition shadow-xl active:scale-95"
          >
            {isArabic ? 'تحديث الصفحة' : 'Reload'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
