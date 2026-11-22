import React, { useState, useEffect, useRef } from 'react';
import { X, Youtube, Key, CheckCircle2, Lock, Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { YOUTUBE_CHANNEL_URL, YOUTUBE_CHANNEL_HANDLE } from '../config/supporterConfig';
import { recordChannelVisitUnlock, verifyCommunityPasscode } from '../services/supporterGate';
import { openSafeExternalUrl } from '../utils/safeExternalUrl';

interface SupporterGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  onToast?: (msg: string) => void;
  targetLanguageName?: string;
}

export function SupporterGateModal({
  isOpen,
  onClose,
  onUnlocked,
  onToast,
  targetLanguageName = 'الألماني'
}: SupporterGateModalProps) {
  const [visitedChannel, setVisitedChannel] = useState(false);
  const [visitTime, setVisitTime] = useState<number | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribe' | 'passcode'>('subscribe');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setVisitedChannel(false);
    setVisitTime(null);
    setPasscode('');
    setPasscodeError('');
    setIsVerifying(false);
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  const handleOpenChannel = () => {
    openSafeExternalUrl(YOUTUBE_CHANNEL_URL);
    setVisitedChannel(true);
    setVisitTime(Date.now());
    onToast?.('🔴 جاري فتح القناة... اشترك واضغط زر الفتح بالأسفل!');
  };

  const handleConfirmVisitUnlock = () => {
    // If user clicked link less than 3 seconds ago, encourage subscribing
    if (visitTime && Date.now() - visitTime < 3000) {
      onToast?.('⏳ من فضلك تأكد من الاشتراك بالقناة أولاً ثم اضغط فتح!');
    }

    recordChannelVisitUnlock();
    triggerConfetti();
    onToast?.('🎉 أهلاً بيك في عائلة جسر التفكير! تم فتح الألماني وكل اللغات.');
    onUnlocked();
    onClose();
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsVerifying(true);
    setPasscodeError('');

    try {
      const success = await verifyCommunityPasscode(passcode);
      if (success) {
        triggerConfetti();
        onToast?.('🎉 كود صح! أهلاً بيك في عائلة جسر التفكير! تم فتح الألماني وكل اللغات.');
        onUnlocked();
        onClose();
      } else {
        setPasscodeError('الكود غير صحيح. تأكد من كتابة الكود من وصف فيديوهات القناة.');
      }
    } catch {
      setPasscodeError('حدث خطأ أثناء التأكد من الكود. حاول مرة أخرى.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-safe pb-safe bg-black/85 backdrop-blur-md animate-in fade-in transition-all"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supporter-modal-title"
    >
      <div
        ref={modalRef}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-surface text-text shadow-2xl"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 px-5 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ميزة داعمي القناة — بدون أي فلوس 🎁</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-2xl text-muted hover:text-text hover:bg-surface-2 transition-colors"
            aria-label="إغلاق Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-start">
          {/* Main Title */}
          <div>
            <h2 id="supporter-modal-title" className="text-xl sm:text-2xl font-black text-text leading-tight">
              افتح كورس {targetLanguageName} وكل اللغات مجاناً باشتراكك في القناة
            </h2>
            <p className="text-xs sm:text-sm text-muted font-bold mt-1">
              بدون رسوم ولا إعلانات — فقط اشتراك بسيط يرفع المحتوى التعليمي العربي.
            </p>
          </div>

          {/* Personal Note from Amr Sherif */}
          <div className="p-4 rounded-2xl bg-surface-2 border border-border/80 space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-black text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>رسالة من د. عمرو شريف (مؤسس تطبيق جسر التفكير):</span>
            </div>
            <p className="text-xs sm:text-sm text-text/90 leading-relaxed font-medium">
              «تطبيق جسر التفكير هيفضل مجاني ١٠٠٪ للعربي والإنجليزي للأبد. اللغات التانية زي الألماني بنبنيها بمجهود كبير، ومش طالبين منك ولا جنيه — بس اشتراكك في قناتنا على يوتيوب <span dir="ltr" className="font-bold text-amber-400">{YOUTUBE_CHANNEL_HANDLE}</span> بيساعد الناس تعرف إننا موجودين ونكمل نعمل محتوى علمي وتعليمي نضيف بدون إعلانات.»
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1.5 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('subscribe')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'subscribe'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>الاشتراك بالقناة (تلقائي)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('passcode')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'passcode'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>كود القناة السري</span>
            </button>
          </div>

          {/* Tab 1: Subscribe Flow */}
          {activeTab === 'subscribe' && (
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-3">
                <button
                  type="button"
                  onClick={handleOpenChannel}
                  className="w-full py-3 px-4 rounded-xl font-black text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[48px]"
                >
                  <Youtube className="w-5 h-5" />
                  <span>١. افتح قناة {YOUTUBE_CHANNEL_HANDLE} واشترك ↗</span>
                </button>
                <p className="text-[11px] text-muted text-center font-semibold">
                  * تفتح صفحة القناة في نافذة جديدة. اشترك وارجع للتطبيق.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmVisitUnlock}
                  disabled={!visitedChannel}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                    visitedChannel
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-lg shadow-emerald-500/25 active:scale-98'
                      : 'bg-surface-2 border border-border text-muted cursor-not-allowed opacity-60'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {visitedChannel
                      ? `٢. اشتركت — افتح ${targetLanguageName} وكل اللغات الآن 🔓`
                      : '٢. افتح القناة أولاً لتفعيل زر الفتح'}
                  </span>
                </button>
                <p className="text-[11px] text-muted text-center font-medium mt-2">
                  💡 لو مشترك بالقناة بالفعل: اضغط زر القناة أعلاه، ثم ارجع واضغط فتح فوراً.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Passcode Flow */}
          {activeTab === 'passcode' && (
            <form onSubmit={handleVerifyPasscode} className="space-y-3 pt-1">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text">
                  أدخل كود القناة الموجود في وصف فيديوهات {YOUTUBE_CHANNEL_HANDLE}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="مثال: SCIAMR أو BRIDGE"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-2 text-text placeholder:text-muted/60 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-amber-500"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying || !passcode.trim()}
                    className="px-5 py-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md disabled:opacity-50 transition-all shrink-0"
                  >
                    {isVerifying ? 'جاري...' : 'تفعيل الكود 🔓'}
                  </button>
                </div>
                {passcodeError && (
                  <p className="text-xs text-rose-400 font-bold mt-1">
                    ⚠️ {passcodeError}
                  </p>
                )}
              </div>
              <p className="text-[11px] text-muted leading-relaxed font-medium">
                💡 الأكواد تُنشر دورياً في وصف فيديوهات القناة وتعليقاتها المثبتة كهدية للمتابعين.
              </p>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-border p-4 bg-surface-2/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>عربي ↔ إنجليزي مجاني ومفتوح دايماً بدون أي شروط</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-muted hover:text-text hover:bg-surface font-bold transition-colors flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>رجوع للعربي والإنجليزي</span>
          </button>
        </div>
      </div>
    </div>
  );
}
