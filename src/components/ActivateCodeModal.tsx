import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Crown,
  Landmark,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INSTAPAY_HANDLE, EntitlementTier } from '../types/entitlement';
import { useEntitlement } from '../hooks/useEntitlement';

interface ActivateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
  onToast?: (msg: string) => void;
}

function getTierBadgeLabel(tier: EntitlementTier, isArabic: boolean): string {
  switch (tier) {
    case 'pro':
      return isArabic ? 'باقة Pro مفعّلة' : 'Pro Active';
    case 'academy_student':
      return isArabic ? 'طالب أكاديمية مفعّل' : 'Academy Student Active';
    case 'academy_teacher':
      return isArabic ? 'معلم أكاديمية مفعّل' : 'Academy Teacher Active';
    default:
      return isArabic ? 'الباقة المجانية للأبد' : 'Free Forever Plan';
  }
}

export function ActivateCodeModal({
  isOpen,
  onClose,
  isArabic = true,
  onToast,
}: ActivateCodeModalProps) {
  const { entitlement, isPro, isRedeeming, remainingDays, redeemCode } = useEntitlement();
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedInstaPay, setCopiedInstaPay] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setErrorMsg('');
    setSuccessMsg('');
    setCopiedInstaPay(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyInstaPay = async () => {
    try {
      await navigator.clipboard.writeText(INSTAPAY_HANDLE);
      setCopiedInstaPay(true);
      onToast?.(
        isArabic
          ? `✅ تم نسخ عنوان InstaPay: ${INSTAPAY_HANDLE}`
          : `✅ Copied InstaPay handle: ${INSTAPAY_HANDLE}`
      );
      window.setTimeout(() => setCopiedInstaPay(false), 2500);
    } catch {
      onToast?.(INSTAPAY_HANDLE);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isRedeeming) return;

    setErrorMsg('');
    setSuccessMsg('');

    const result = await redeemCode(code, displayName);
    if (result.ok && result.entitlement) {
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti errors
      }
      const label = getTierBadgeLabel(result.entitlement.tier, isArabic);
      const msg = isArabic
        ? `🎉 تم التفعيل بنجاح! (${label})`
        : `🎉 Activated successfully! (${label})`;
      setSuccessMsg(msg);
      onToast?.(msg);
      setCode('');
    } else {
      setErrorMsg(
        isArabic
          ? result.messageAr || 'الكود غير صحيح أو مستخدم بالفعل.'
          : result.messageEn || 'Invalid or already used code.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-safe pb-safe bg-black/85 backdrop-blur-md animate-in fade-in"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-code-modal-title"
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0A0E13] text-[#EEF2F5] shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-teal-500/15 to-amber-500/15 px-5 py-4 border-b border-amber-500/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isPro ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{getTierBadgeLabel(entitlement.tier, isArabic)}</span>
            </span>
            {entitlement.cohortCode && (
              <span
                dir="ltr"
                className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 truncate"
              >
                {entitlement.cohortCode}
              </span>
            )}
            {isPro && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                {remainingDays !== null
                  ? isArabic
                    ? `متبقي ${remainingDays} يوم`
                    : `${remainingDays}d left`
                  : isArabic
                  ? 'مدى الحياة ♾️'
                  : 'Lifetime ♾️'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-2xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label={isArabic ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-start">
          <div>
            <h2
              id="activate-code-modal-title"
              className="text-xl font-black text-white leading-tight flex items-center gap-2"
            >
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                {isArabic ? 'تفعيل كود Pro أو الأكاديمية' : 'Activate Pro / Academy Code'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
              {isArabic
                ? 'ادفع بسهولة عبر InstaPay أو كاش في السنتر وادخل كود التفعيل لفتح الميزات المتقدمة فوراً.'
                : 'Pay via InstaPay or cash at your partner center, then enter your single-use voucher code.'}
            </p>
          </div>

          {/* Egypt Pricing Ladder + Free First-Session Student Code Badge */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-300">
                {isArabic ? 'باقات مصر (بدون فيزا أو دولار):' : 'Egypt Pricing Ladder (EGP · Zero Foreign Cards):'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isArabic ? 'كود مجاني لأول حصة للطلاب (ALAQSA-FREE)' : 'Free First-Session Student Code (ALAQSA-FREE)'}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 block">
                  {isArabic ? 'شهري (30 يوم)' : 'Monthly (30d)'}
                </span>
                <span className="text-base font-black text-white block">
                  {isArabic ? '50 ج.م' : '50 EGP'}
                </span>
                <span className="text-[10px] text-teal-300 font-semibold block">
                  {isArabic ? '/ شهر' : '/ month'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-teal-950/50 border border-teal-500/40 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-teal-300 block">
                  {isArabic ? 'الموسم (90 يوم)' : '3-Month Season'}
                </span>
                <span className="text-base font-black text-white block">
                  {isArabic ? '120 ج.م' : '120 EGP'}
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold block">
                  {isArabic ? 'وفّر 20%' : 'Save 20%'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-center space-y-0.5">
                <span className="text-[10px] font-black text-amber-300 block">
                  {isArabic ? 'مؤسّس مدى الحياة' : 'Founding Lifetime'}
                </span>
                <span className="text-base font-black text-amber-200 block">
                  {isArabic ? '299 ج.م' : '299 EGP'}
                </span>
                <span className="text-[10px] text-amber-300/90 font-semibold block">
                  {isArabic ? 'مرة واحدة ♾️' : 'One-time ♾️'}
                </span>
              </div>
            </div>
          </div>

          {/* Code Redemption Form */}
          <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
            <div className="space-y-1.5">
              <label htmlFor="tb-voucher-code" className="block text-xs font-bold text-stone-200">
                {isArabic ? 'كود التفعيل (شهري / موسم / مدى الحياة / كود الطلاب):' : 'Activation code (Monthly / Season / Lifetime / Student):'}
              </label>
              <input
                id="tb-voucher-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="TB-MO-XXXX  /  TB-LIFE-XXXX  /  ALAQSA-FREE"
                autoComplete="off"
                spellCheck={false}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-[#0A0E13] text-white placeholder:text-stone-500 text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tb-student-name" className="block text-xs font-bold text-stone-300">
                {isArabic ? 'الاسم (اختياري — لطلاب الأكاديمية):' : 'Student name (optional — for Academy cohorts):'}
              </label>
              <input
                id="tb-student-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isArabic ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                maxLength={64}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-700/80 bg-[#0A0E13] text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                ⚠️ {errorMsg}
              </p>
            )}

            {successMsg && (
              <p role="status" className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isRedeeming || !code.trim()}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRedeeming
                ? isArabic
                  ? 'جاري التحقق من الكود...'
                  : 'Verifying code...'
                : isArabic
                ? 'تفعيل الكود الآن 🔓'
                : 'Activate Code Now 🔓'}
            </button>
          </form>

          {/* Egypt-Friendly InstaPay & Local Center Payment Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 to-stone-900 border border-teal-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-teal-300">
              <Landmark className="w-4 h-4 shrink-0" />
              <span>
                {isArabic
                  ? 'كيف تحصل على الكود في مصر؟ (بدون فيزا أو دولار)'
                  : 'How to get a code in Egypt (Zero foreign cards)'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0A0E13] border border-teal-500/30">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  InstaPay Address
                </span>
                <span dir="ltr" className="text-xs sm:text-sm font-mono font-black text-teal-300 block truncate">
                  {INSTAPAY_HANDLE}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyInstaPay}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition"
              >
                {copiedInstaPay ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInstaPay ? (isArabic ? 'تم النسخ' : 'Copied') : isArabic ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>

            <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                {isArabic
                  ? 'حوّل عبر InstaPay على العنوان أعلاه أو ادفع كاش في السنتر الشريك (مثل سنتر الأقصى التعليمي).'
                  : 'Pay via InstaPay above or cash at a partner center (e.g. Al-Aqsa Educational Center).'}
              </li>
              <li>
                {isArabic
                  ? 'استلم كود التفعيل الفوري (مثال: TB-PRO-XXXX أو ALAQSA-XXXX).'
                  : 'Receive your instant single-use code (e.g. TB-PRO-XXXX or ALAQSA-XXXX).'}
              </li>
              <li>
                {isArabic
                  ? 'ادخل الكود هنا مرة واحدة — وبعدها يشتغل التطبيق بالكامل بدون إنترنت.'
                  : 'Enter the code above once — afterwards your Pro access works 100% offline.'}
              </li>
            </ol>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300/90 font-bold">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>
                {isArabic
                  ? 'للسناتر والأكاديميات: أكواد طلاب + لوحة متابعة للمعلم وأولياء الأمور.'
                  : 'For centers & academies: student vouchers + Teacher & Parent cohort dashboard.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-stone-800 px-5 py-3.5 bg-stone-950/80 flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {isArabic
                ? 'المسار الأساسي (عربي ← إنجليزي) مجاني ١٠٠٪ للأبد'
                : 'Core Arabic → English loop stays 100% free forever'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
