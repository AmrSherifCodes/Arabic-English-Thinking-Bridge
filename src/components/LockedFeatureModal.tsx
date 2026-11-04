import { KeyRound, X } from 'lucide-react';

interface LockedFeatureModalProps {
  isArabic: boolean;
  onClose: () => void;
  onOpenPreferences: () => void;
}

export function LockedFeatureModal({
  isArabic,
  onClose,
  onOpenPreferences,
}: LockedFeatureModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-feature-title"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <section className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          className="absolute end-3 top-3 rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={18} />
        </button>
        <KeyRound size={32} className="mx-auto mb-4 text-primary" aria-hidden="true" />
        <h2 id="locked-feature-title" className="mb-3 text-lg font-black text-text">
          {isArabic ? '🔑 يلزم مفتاح API.' : '🔑 API Key Required.'}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          {isArabic
            ? 'أضف مفتاح Gemini المجاني من الإعدادات لفتح ميزات الصوت والذكاء الاصطناعي النصية.'
            : 'Add your free Gemini key in Settings to unlock unlimited AI Voice and Text.'}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 rounded-xl border border-border px-4 font-bold text-muted hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {isArabic ? 'لاحقاً' : 'Not now'}
          </button>
          <button
            type="button"
            onClick={onOpenPreferences}
            className="min-h-12 flex-1 rounded-xl bg-primary px-4 font-black text-on-primary hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {isArabic ? 'فتح الإعدادات' : 'Open Settings'}
          </button>
        </div>
      </section>
    </div>
  );
}
