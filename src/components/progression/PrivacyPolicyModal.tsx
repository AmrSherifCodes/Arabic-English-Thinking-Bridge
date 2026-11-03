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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#0F151C] border border-[#1E2933] p-6 space-y-4 text-start max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-teal-400 font-black text-sm">
            <Shield size={18} />
            <span>{isArabic ? 'سياسة الخصوصية وتأمين البيانات' : 'Privacy Policy & Plain Summary'}</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white font-bold text-xs">
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

          <p className="text-[11px] text-stone-400">
            Copyright (c) 2024-Present Amr Sherif Abdelaal. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
