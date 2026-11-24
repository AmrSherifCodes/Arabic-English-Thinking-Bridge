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
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 pt-safe pb-safe bg-black/80 backdrop-blur-md animate-in fade-in"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-code-modal-title"
    >
      <div
        className="tb-card-surface relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-5 py-3.5 border-b flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
              }}
            >
              {isPro ? <Crown className="w-3.5 h-3.5 shrink-0" /> : <Sparkles className="w-3.5 h-3.5 shrink-0" />}
              <span>{getTierBadgeLabel(entitlement.tier, isArabic)}</span>
            </span>
            {entitlement.cohortCode && (
              <span
                dir="ltr"
                className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border break-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  borderColor: 'var(--border)',
                }}
              >
                {entitlement.cohortCode}
              </span>
            )}
            {isPro && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--ink)',
                  borderColor: 'var(--accent)',
                }}
              >
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
            className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-2xl border transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--ink-muted)',
            }}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-start">
          <div>
            <h2
              id="activate-code-modal-title"
              className="text-xl font-black leading-tight flex items-center gap-2"
              style={{ color: 'var(--ink)' }}
            >
              <KeyRound className="w-5 h-5 shrink-0" style={{ color: 'var(--gold)' }} />
              <span>
                {isArabic ? 'تفعيل كود Pro أو الأكاديمية' : 'Activate Pro / Academy Code'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-medium mt-1 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? 'ادفع بسهولة عبر InstaPay أو كاش في السنتر وادخل كود التفعيل لفتح الميزات المتقدمة فوراً.'
                : 'Pay via InstaPay or cash at your partner center, then enter your single-use voucher code.'}
            </p>
          </div>

          {/* Egypt Pricing Ladder + Free First-Session Student Code Badge */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black" style={{ color: 'var(--ink)' }}>
                {isArabic ? 'باقات مصر (بدون فيزا أو دولار):' : 'Egypt Pricing Ladder (EGP · Zero Foreign Cards):'}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  borderColor: 'var(--accent)',
                }}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isArabic ? 'كود مجاني لأول حصة للطلاب (ALAQSA-FREE)' : 'Free First-Session Student Code (ALAQSA-FREE)'}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2">
              <div
                className="p-2.5 rounded-2xl border text-center space-y-0.5"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'شهري (30 يوم)' : 'Monthly (30d)'}
                </span>
                <span className="text-base font-black block" style={{ color: 'var(--ink)' }}>
                  {isArabic ? '50 ج.م' : '50 EGP'}
                </span>
                <span className="text-[11px] font-bold block" style={{ color: 'var(--accent)' }}>
                  {isArabic ? '/ شهر' : '/ month'}
                </span>
              </div>
              <div
                className="p-2.5 rounded-2xl border-2 text-center space-y-0.5"
                style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)' }}
              >
                <span className="text-[11px] font-bold block" style={{ color: 'var(--accent)' }}>
                  {isArabic ? 'الموسم (90 يوم)' : '3-Month Season'}
                </span>
                <span className="text-base font-black block" style={{ color: 'var(--ink)' }}>
                  {isArabic ? '120 ج.م' : '120 EGP'}
                </span>
                <span className="text-[11px] font-bold block" style={{ color: 'var(--ink)' }}>
                  {isArabic ? 'وفّر 20%' : 'Save 20%'}
                </span>
              </div>
              <div
                className="p-2.5 rounded-2xl border-2 text-center space-y-0.5"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)' }}
              >
                <span className="text-[11px] font-black block" style={{ color: 'var(--gold)' }}>
                  {isArabic ? 'مؤسّس مدى الحياة' : 'Founding Lifetime'}
                </span>
                <span className="text-base font-black block" style={{ color: 'var(--ink)' }}>
                  {isArabic ? '299 ج.م' : '299 EGP'}
                </span>
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'مرة واحدة ♾️' : 'One-time ♾️'}
                </span>
              </div>
            </div>
          </div>

          {/* Code Redemption Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 p-4 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <div className="space-y-1.5">
              <label htmlFor="tb-voucher-code" className="block text-xs font-bold" style={{ color: 'var(--ink)' }}>
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
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border text-sm font-mono font-bold uppercase tracking-wider focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tb-student-name" className="block text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                {isArabic ? 'الاسم (اختياري — لطلاب الأكاديمية):' : 'Student name (optional — for Academy cohorts):'}
              </label>
              <input
                id="tb-student-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isArabic ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                maxLength={64}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/40 rounded-xl px-3 py-2">
                ⚠️ {errorMsg}
              </p>
            )}

            {successMsg && (
              <p role="status" className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-3 py-2">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isRedeeming || !code.trim()}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--gold-ink)',
              }}
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
          <div
            className="p-4 rounded-2xl border space-y-3"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--accent)' }}
          >
            <div className="flex items-center gap-2 text-xs font-black" style={{ color: 'var(--accent)' }}>
              <Landmark className="w-4 h-4 shrink-0" />
              <span>
                {isArabic
                  ? 'كيف تحصل على الكود في مصر؟ (بدون فيزا أو دولار)'
                  : 'How to get a code in Egypt (Zero foreign cards)'}
              </span>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>
                  {isArabic ? 'عنوان إنستاباي (InstaPay)' : 'InstaPay Address'}
                </span>
                <span dir="ltr" className="text-xs sm:text-sm font-mono font-black block break-all" style={{ color: 'var(--accent)' }}>
                  {INSTAPAY_HANDLE}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyInstaPay}
                className="min-h-[48px] px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                {copiedInstaPay ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedInstaPay ? (isArabic ? 'تم النسخ' : 'Copied') : isArabic ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>

            <ol className="text-xs space-y-1.5 list-decimal list-inside leading-relaxed" style={{ color: 'var(--ink)' }}>
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

            <div className="flex items-center gap-2 pt-1 text-xs font-bold" style={{ color: 'var(--gold)' }}>
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
        <div
          className="border-t px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 text-xs"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent)' }}>
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
