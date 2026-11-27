// Copyright (c) Amr Sherif Abdelaal. Code licensed under AGPL-3.0-or-later.
import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Github,
  Heart,
  Globe,
  Smartphone,
  QrCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  INSTAPAY_IPA,
  INSTAPAY_LINK,
  PAYPAL_URL,
  PAYPAL_QR_PATH,
  GITHUB_REPO_URL,
  getSafeInstapayLink,
  getSafePaypalLink,
} from '../config/support';
import { copyTextToClipboard } from '../utils/clipboard';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

/**
 * Voluntary InstaPay & PayPal support modal ("ادعم استمرار التطبيق").
 * Purely optional — never gates any lesson, audio, or feature.
 */
export function SupportModal({ isOpen, onClose, isArabic = true }: SupportModalProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [qrAvailable, setQrAvailable] = useState(true);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeLink = getSafeInstapayLink(INSTAPAY_LINK);
  const safePaypalLink = getSafePaypalLink(PAYPAL_URL);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    const ok = await copyTextToClipboard(INSTAPAY_IPA);
    setCopyState(ok ? 'copied' : 'failed');
    resetTimer.current = setTimeout(() => {
      setCopyState('idle');
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[70] min-h-[100dvh] flex items-start justify-center bg-black/75 backdrop-blur-sm overflow-y-auto px-3 sm:px-4 pt-safe pb-safe"
    >
      <div className="relative w-full max-w-md my-auto rounded-3xl border border-teal-500/30 bg-[#0A0E13] text-[#EEF2F5] shadow-2xl p-4 sm:p-6 space-y-4 text-start min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <h2 id="support-modal-title" className="text-base sm:text-lg font-black text-white break-words">
            {isArabic ? '☕ ادعم استمرار التطبيق' : '☕ Keep Thinking Bridge going'}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Honest Copy */}
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
          <p>
            {isArabic
              ? 'جسر التفكير مجاني 100% ومفتوح المصدر لكل الناس — من غير اشتراكات، ولا إعلانات، ولا أي درس أو ميزة مقفولة. وهيفضل كده على طول 💚'
              : 'Thinking Bridge is 100% free and open-source for everyone — no subscriptions, no ads, no locked lessons or features. Forever.'}
          </p>
          <p>
            {isArabic
              ? 'لو التطبيق فادك وحابب تساعده يكمّل، تقدر تدعم بأي مبلغ يريحك عبر InstaPay (داخل مصر) أو PayPal (من خارج مصر). الدعم ده بيغطي وقت التطوير، والاستضافة، وإضافة لغات جديدة.'
              : "If it helped you and you'd like to keep it going, you can send any amount via InstaPay (in Egypt) or PayPal (international). It covers development time, hosting, and new languages."}
          </p>
        </div>

        {/* Section 1 (Primary — Egypt): InstaPay */}
        <div className="rounded-2xl bg-white/[0.04] border border-teal-500/25 p-3.5 sm:p-4 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-teal-400 shrink-0" />
            <h3 className="text-sm font-extrabold text-teal-200">
              {isArabic ? 'داخل مصر — InstaPay' : 'Inside Egypt — InstaPay'}
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            {isArabic
              ? 'انسخ العنوان وحوّل من تطبيق InstaPay:'
              : 'Copy this address and send from the InstaPay app:'}
          </p>

          <div
            dir="ltr"
            className="rounded-xl bg-[#060A0F] border border-white/10 px-3 py-2.5 text-center font-mono text-xs sm:text-sm font-bold text-teal-200 break-all select-all"
          >
            {INSTAPAY_IPA}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full min-h-[48px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer px-4 touch-manipulation ${
              copyState === 'copied'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
            }`}
          >
            {copyState === 'copied' ? <Check size={18} /> : <Copy size={18} />}
            <span aria-live="polite">
              {copyState === 'copied'
                ? isArabic
                  ? '✅ تم النسخ!'
                  : '✅ Copied!'
                : copyState === 'failed'
                  ? isArabic
                    ? 'انسخه يدوياً من فوق 👆'
                    : 'Copy it manually above 👆'
                  : isArabic
                    ? 'نسخ عنوان InstaPay'
                    : 'Copy InstaPay address'}
            </span>
          </button>

          {safeLink && (
            <a
              href={safeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] rounded-2xl border border-teal-500/40 text-teal-200 hover:bg-teal-500/10 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 px-4 touch-manipulation"
            >
              <ExternalLink size={16} />
              <span>
                {isArabic ? 'افتح رابط InstaPay مباشرة' : 'Open InstaPay link directly'}
              </span>
            </a>
          )}
        </div>

        {/* Section 2 (International): PayPal + Local QR */}
        {safePaypalLink && (
          <div className="rounded-2xl bg-white/[0.04] border border-sky-400/25 p-3.5 sm:p-4 space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-sky-400 shrink-0" />
              <h3 className="text-sm font-extrabold text-sky-200">
                {isArabic ? 'من خارج مصر — PayPal' : 'International — PayPal'}
              </h3>
            </div>

            <a
              href={safePaypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-200 hover:bg-sky-500/25 font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 px-4 touch-manipulation"
            >
              <ExternalLink size={16} className="shrink-0" />
              <span>{isArabic ? 'ادعم عبر PayPal' : 'Support via PayPal'}</span>
            </a>

            {qrAvailable && (
              <>
                <button
                  type="button"
                  onClick={() => setShowQrOnMobile((prev) => !prev)}
                  aria-expanded={showQrOnMobile}
                  aria-controls="paypal-qr-panel"
                  className="sm:hidden w-full min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition cursor-pointer px-3 touch-manipulation"
                >
                  <QrCode size={15} className="text-sky-300 shrink-0" />
                  <span>
                    {showQrOnMobile
                      ? isArabic
                        ? 'إخفاء رمز QR'
                        : 'Hide QR code'
                      : isArabic
                        ? 'عرض رمز QR للمسح بالهاتف'
                        : 'Show QR code to scan'}
                  </span>
                  {showQrOnMobile ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                <div
                  id="paypal-qr-panel"
                  className={`flex-col items-center gap-2 pt-1 ${showQrOnMobile ? 'flex' : 'hidden sm:flex'}`}
                >
                  <div className="bg-white p-2 rounded-xl shadow-md inline-flex items-center justify-center">
                    <img
                      src={PAYPAL_QR_PATH}
                      alt={isArabic ? 'رمز QR للدعم عبر PayPal' : 'PayPal support QR code'}
                      width={144}
                      height={144}
                      onError={() => setQrAvailable(false)}
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain block"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    {isArabic
                      ? 'امسح الرمز بكاميرا هاتفك للدعم السريع عبر PayPal'
                      : 'Scan with your phone camera to support via PayPal'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Voluntary Note */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
          <Heart size={16} className="text-teal-400 shrink-0 mt-0.5" />
          <p>
            {isArabic
              ? 'الدعم اختياري تماماً — مفيش أي حاجة في التطبيق بتتقفل أو بتتفتح بيه. ومشاركتك للتطبيق مع صحابك دعم كبير برضه.'
              : 'Support is completely optional — nothing in the app is locked or unlocked by it. Sharing the app with friends helps a lot too.'}
          </p>
        </div>

        {/* Open Source GitHub Link */}
        <div className="flex justify-center pt-1">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition min-h-[44px] px-3 touch-manipulation"
          >
            <Github size={14} />
            <span>{isArabic ? 'الكود مفتوح على GitHub' : 'Source code on GitHub'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
