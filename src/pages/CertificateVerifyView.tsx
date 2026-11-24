import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, CheckCircle2, XCircle, Printer, Search, ShieldCheck } from 'lucide-react';

interface CertificateVerifyViewProps {
  initialCode?: string;
  onBack: () => void;
  isArabic?: boolean;
}

interface VerifiedCertificate {
  cert_code: string;
  student_name: string;
  track_title: string;
  org_slug: string | null;
  org_name: string | null;
  issued_at: string;
  revoked_at: string | null;
}

export function CertificateVerifyView({
  initialCode = '',
  onBack,
  isArabic = true,
}: CertificateVerifyViewProps) {
  const [codeInput, setCodeInput] = useState(initialCode.trim().toUpperCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [cert, setCert] = useState<VerifiedCertificate | null>(null);

  const verifyCode = useCallback(
    async (raw: string) => {
      const normalized = raw.trim().toUpperCase();
      if (!normalized) return;
      setLoading(true);
      setError(null);
      setCert(null);
      setValid(null);
      try {
        const res = await fetch(
          `/api/certificates/verify?code=${encodeURIComponent(normalized)}`,
          { method: 'GET', cache: 'no-store' }
        );
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          valid?: boolean;
          certificate?: VerifiedCertificate;
          error?: string;
        } | null;

        if (!res.ok || !data?.ok || !data.certificate) {
          setError(
            res.status === 404
              ? isArabic
                ? 'لم يتم العثور على شهادة بهذا الكود.'
                : 'No certificate found for this code.'
              : isArabic
              ? 'صيغة الكود غير صحيحة (مثال: TB-CERT-XXXX).'
              : 'Invalid certificate code format (e.g. TB-CERT-XXXX).'
          );
          return;
        }

        setCert(data.certificate);
        setValid(Boolean(data.valid));
        if (typeof window !== 'undefined' && window.history) {
          window.history.replaceState({}, '', `/verify/${encodeURIComponent(data.certificate.cert_code)}`);
        }
      } catch {
        setError(isArabic ? 'تعذر التحقق حالياً. تأكد من الاتصال بالإنترنت.' : 'Unable to verify right now. Check connection.');
      } finally {
        setLoading(false);
      }
    },
    [isArabic]
  );

  useEffect(() => {
    if (initialCode.trim()) {
      verifyCode(initialCode);
    }
  }, [initialCode, verifyCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(codeInput);
  };

  const verifyUrl = cert
    ? `https://tb-eg.vercel.app/verify/${encodeURIComponent(cert.cert_code)}`
    : 'https://tb-eg.vercel.app/verify';

  const formattedDate = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] print:bg-white print:text-black pb-16"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Top Bar (hidden on print) */}
      <header className="print:hidden sticky top-0 z-30 bg-[#0A0E13]/95 backdrop-blur-md border-b border-stone-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 min-h-[40px] rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold hover:bg-stone-800 cursor-pointer"
          >
            ← {isArabic ? 'العودة' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-teal-400" />
            <h1 className="text-sm font-black">
              {isArabic ? 'التحقق من الشهادات الموثّقة' : 'Verifiable Certificate Registry'}
            </h1>
          </div>
          {cert && valid && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 min-h-[40px] rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              {isArabic ? 'طباعة' : 'Print'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Search Form (hidden on print) */}
        <form
          onSubmit={handleSubmit}
          className="print:hidden p-4 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="TB-CERT-XXXXXXXX"
            dir="ltr"
            className="flex-1 px-4 py-3 rounded-2xl bg-[#0A0E13] border border-stone-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            disabled={loading || !codeInput.trim()}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search size={15} />
            {loading
              ? isArabic ? 'جاري التحقق...' : 'Verifying...'
              : isArabic ? 'تحقق من الشهادة' : 'Verify Code'}
          </button>
        </form>

        {error && (
          <div className="print:hidden p-5 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm font-bold">
            <XCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Printable Certificate Card */}
        {cert && (
          <article className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0F1722] via-[#0B1C2C] to-[#0D2829] border-2 border-teal-500/50 shadow-2xl print:bg-white print:bg-none print:border-stone-900 print:shadow-none space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-teal-500/25 print:border-stone-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 print:border-stone-400 print:text-stone-900">
                  <Award size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-300 print:text-stone-700">
                    Thinking Bridge · فكّر إنجليزي
                  </p>
                  <h2 className="text-lg sm:text-xl font-black text-white print:text-black">
                    {isArabic ? 'شهادة إتمام موثّقة' : 'Certificate of Completion'}
                  </h2>
                </div>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                  valid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 print:text-emerald-800 print:border-emerald-700'
                    : 'bg-red-500/20 text-red-300 border-red-500/40 print:text-red-800 print:border-red-700'
                }`}
              >
                {valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {valid
                  ? isArabic ? 'موثّقة وصالحة' : 'Verified & Valid'
                  : isArabic ? 'شهادة ملغاة' : 'Revoked'}
              </span>
            </div>

            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-stone-400 print:text-stone-600">
                {isArabic ? 'تُمنح هذه الشهادة إلى' : 'This certificate is proudly awarded to'}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white print:text-black tracking-tight">
                {cert.student_name}
              </p>
              <p className="text-xs text-stone-400 print:text-stone-600">
                {isArabic ? 'لإتمام المسار التدريبي بنجاح:' : 'For successfully completing the cognitive track:'}
              </p>
              <p className="text-base sm:text-lg font-extrabold text-teal-300 print:text-stone-900">
                {cert.track_title}
              </p>
              {cert.org_name && (
                <p className="text-xs font-bold text-amber-300 print:text-stone-700">
                  {isArabic ? `برعاية: ${cert.org_name}` : `Issued in partnership with ${cert.org_name}`}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-teal-500/25 print:border-stone-300">
              <div className="space-y-1 text-xs">
                <p className="text-stone-400 print:text-stone-600">
                  {isArabic ? 'كود التحقق:' : 'Verification Code:'}{' '}
                  <span className="font-mono font-black text-teal-300 print:text-black" dir="ltr">
                    {cert.cert_code}
                  </span>
                </p>
                <p className="text-stone-400 print:text-stone-600">
                  {isArabic ? 'تاريخ الإصدار:' : 'Issued On:'}{' '}
                  <span className="font-bold text-white print:text-black">{formattedDate}</span>
                </p>
                <p className="text-[11px] text-stone-500 font-mono break-all" dir="ltr">
                  {verifyUrl}
                </p>
              </div>

              {/* Inline SVG QR Code pointing to https://tb-eg.vercel.app/verify/<cert_code> */}
              <div className="p-2.5 rounded-2xl bg-white border border-stone-200 shrink-0">
                <QRCodeSVG
                  value={verifyUrl}
                  size={92}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0A0E13"
                />
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
