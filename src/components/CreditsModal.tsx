import { X, ShieldCheck, Heart, Scale } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto ar"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 text-stone-900 dark:text-stone-100 shadow-2xl transition-all my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4 shrink-0">
          <div>
            <h2 id="credits-modal-title" className="text-lg font-black text-stone-900 dark:text-white">
              الخصوصية، التقدير والتراخيص
            </h2>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Privacy, Credits &amp; Open Source Licenses
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs font-medium leading-relaxed pr-1 text-right">
          {/* Creator & Alexandria */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
            <p className="font-bold text-stone-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <span>🌊</span>
              <span>صُنع بكل إخلاص في الإسكندرية، مصر</span>
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              تطبيق <strong>فكّر إنجليزي (Thinking English)</strong> تم بناؤه وتطويره بواسطة <strong>عمرو شريف (Amr Sherif)</strong> — مجاني 100% وخالٍ تماماً من أي إعلانات أو اشتراكات.
            </p>
          </div>

          {/* Privacy statement */}
          <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-500/20">
            <p className="font-bold text-teal-900 dark:text-teal-200 text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck size={16} />
              <span>الخصوصية وأمان البيانات (100% Private)</span>
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              التطبيق لا يتطلب إنشاء أي حسابات، ولا يحتوي على ملفات تتبع أو تحليلات سرية. كل تقدمك وسجل بطاقاتك وملاحظاتك مخزنة بأمان على جهازك أنت فقط (Local Storage).
            </p>
          </div>

          {/* Licenses & Attribution */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
            <p className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-1.5">
              <Scale size={16} />
              <span>المحتوى والتراخيص مفتوحة المصدر</span>
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              📚 جميع الدروس والمناهج الأصلية منشورة ومخصصة للملكية العامة <strong>CC0 1.0 Public Domain</strong>.
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              📖 بيانات القواميس والمفردات تتضمن مساهمات من ويكيبيديا وقاموس <strong>Wiktionary</strong> (عبر Kaikki.org) مرخصة تحت CC BY-SA 4.0، ومجموعة بيانات oddadmix/egyptian-arabic-english-50k على Hugging Face (ترخيص Apache-2.0).
            </p>
          </div>

          {/* Inspiration */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
            <p className="font-bold text-stone-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <Heart size={16} className="text-rose-500" />
              <span>شكر وتقدير للمنهج الإدراكي</span>
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              الأسلوب الإدراكي والمقارنة الهيكلية مستلهم بامتنان من الأستاذ <strong>Mihalis Eleftheriou</strong> ومشروع <em>The Thinking Method (Language Transfer)</em> — كمشروع مجتمعي مستقل تماماً.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
