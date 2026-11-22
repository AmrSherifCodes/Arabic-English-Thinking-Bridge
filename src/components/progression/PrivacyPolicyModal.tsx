import React from 'react';
import { Shield, Lock, CheckCircle2, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export function PrivacyPolicyModal({ isOpen, onClose, isArabic = true }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe bg-black/80 backdrop-blur-md"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#0F151C] border border-[#1E2933] p-6 space-y-4 text-start max-h-[85dvh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-teal-400 font-black text-sm">
            <Shield size={18} />
            <span>{isArabic ? 'عن التطبيق والخصوصية والشروط' : 'About, Privacy & Terms'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full text-stone-400 hover:text-white hover:bg-white/10 font-bold text-xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-stone-300 leading-relaxed font-medium">
          <p className="font-bold text-white">
            {isArabic
              ? 'تطبيق فكّر إنجليزي مصمم بالكامل بمبدأ الخصوصية أولاً (Privacy by Default). لا نجمع أي بيانات شخصية حساسة.'
              : 'Thinking Bridge is strictly Privacy-by-Default. We do not track or sell personal data.'}
          </p>

          <div className="space-y-2 p-3 rounded-2xl bg-stone-900 border border-stone-800">
            <h4 className="font-black text-teal-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{isArabic ? 'الملخص البسيط:' : 'Plain English Summary:'}</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li>{isArabic ? 'لا يتطلب التطبيق رقم هاتف أو اسم حقيقي.' : 'No real name or phone number required.'}</li>
              <li>{isArabic ? 'يتم حفظ تقدمك محلياً على جهازك مع إمكانية التصدير والمسح فوراً.' : 'Your data stays local on device with export/delete rights.'}</li>
              <li>{isArabic ? 'لا توجد أي أدوات تتبع إعلانية أو حزم طرف ثالث للتسويق.' : 'Zero third-party advertising SDKs or tracking pixels.'}</li>
              <li>{isArabic ? 'تسجيلات الصوت تُعالج محلياً ولا تُخزن على خوادم خارجية.' : 'Microphone audio is processed locally on device.'}</li>
            </ul>
          </div>

          <div className="space-y-1.5 p-3 rounded-2xl bg-stone-900/90 border border-teal-500/25">
            <p className="font-black text-teal-300 text-xs flex items-center gap-1.5">
              <Lock size={13} className="shrink-0" />
              <span dir="ltr">© 2026 Amr Sherif — All Rights Reserved</span>
            </p>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              {isArabic
                ? '© 2026 عمرو شريف — جميع الحقوق محفوظة. التطبيق متاح مجاناً للاستخدام الشخصي والتعليمي، ويُحظر إعادة توزيعه أو استغلاله تجارياً أو نسخ محتواه.'
                : 'Free for personal and educational use. Unauthorized redistribution, commercial reuse, or reverse engineering is prohibited.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
