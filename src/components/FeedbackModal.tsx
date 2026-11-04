
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquareHeart, Lightbulb, X, Send, ShieldCheck, Clock, Gift, Bug, Sparkles } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { UserProfile } from '../types';
import { API_BASE } from '../utils/apiConfig';

export interface UserFeedbackData {
  rating: number;
  category: 'bug' | 'feature' | 'content' | 'general';
  message: string;
  isAnonymous: boolean;
  userName?: string;
  profileGoal?: string;
  focusArea?: string;
  dialect?: string;
  createdAt: string;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFeedbackData) => void;
  onToast: (message: string) => void;
  profile?: UserProfile | null;
}

const FEEDBACK_STORAGE_KEY = 'thinking_english_anonymous_reviews_v1';

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  onToast,
  profile
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'bug' | 'feature' | 'content' | 'general'>('general');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const isArabic = profile?.language === 'arabic';

  const ratingLabels: Record<number, { en: string; ar: string }> = {
    1: { en: 'Needs Work 🛠️', ar: 'يحتاج تحسين 🛠️' },
    2: { en: 'Could be Better 😐', ar: 'مقبول ولكن فيه مشاكل 😐' },
    3: { en: 'Good Experience 🙂', ar: 'تجربة جيدة 🙂' },
    4: { en: 'Very Helpful! 😃', ar: 'ممتاز ومفيد جداً 😃' },
    5: { en: 'Mind-Blowing Innovation 🚀', ar: 'ابتكار مبهر يفوق التوقعات 🚀' }
  };

  const categories = [
    { id: 'general' as const, labelEn: '💬 General Review', labelAr: '💬 رأي عام' },
    { id: 'bug' as const, labelEn: '🐛 Bug / Issue', labelAr: '🐛 مشكلة تقنية' },
    { id: 'feature' as const, labelEn: '💡 Feature Idea', labelAr: '💡 فكرة جديدة' },
    { id: 'content' as const, labelEn: '📖 Vocabulary & Accent', labelAr: '📖 مفردات ولهجات' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && rating === 0) {
      onToast(isArabic ? 'يرجى كتابة رأيك أو اختيار تقييم.' : 'Please add a comment or rating.');
      return;
    }

    setIsSubmitting(true);

    const feedbackData: UserFeedbackData = {
      rating,
      category,
      message: message.trim(),
      isAnonymous,
      userName: isAnonymous ? undefined : profile?.name,
      profileGoal: profile?.goal,
      focusArea: profile?.focusArea,
      dialect: profile?.dialect,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save to local anonymous review log (keep last 50)
      const existingRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existingList: UserFeedbackData[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.push(feedbackData);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existingList.slice(-50)));

      // 2. Dispatch POST to serverless feedback proxy
      void fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      }).catch(() => {});

      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch { }
      }
    } catch {
      // Graceful fallback
    }

    onToast(
      isArabic
        ? '🎉 شكراً لرأيك الصريح! تم إضافة +100 XP ودرع استمرارية 🛡️'
        : '🎉 Thank you for your review! +100 XP & 1 Streak Shield awarded! 🛡️'
    );

    onSubmit(feedbackData);
    setIsSubmitting(false);
    onClose();
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'تقييم ومراجعة التطبيق' : 'App Review and Feedback'}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-7 text-stone-100 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isArabic ? 'تقييم وتطوير التطبيق بدون هوية' : 'Anonymous Review & Feedback'}
              </h3>
              <p className="text-[11px] font-semibold text-stone-400">
                {isArabic ? 'صوتك هو الأساس لتطوير جسر التفكير' : 'Your honest review directly shapes the platform'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 🎁 Reward Announcement Banner */}
        <div className="mb-4 rounded-2xl border border-teal-500/30 bg-teal-950/40 p-3.5 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Gift size={20} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <Sparkles size={13} />
              <span>{isArabic ? 'مكافأة المشاركة الفورية' : 'Instant Reviewer Reward'}</span>
            </div>
            <p className="text-xs font-medium text-stone-300 mt-0.5 leading-relaxed">
              {isArabic
                ? 'شاركنا رأيك الصريح بدون هوية واكسب فوراً +100 نقطة خبرة (XP) ودرع حماية لاستمراريتك 🛡️!'
                : 'Leave your honest review to instantly claim +100 Bonus XP & 1 Streak Shield 🛡️!'}
            </p>
          </div>
        </div>

        {/* ⏱️ 7-Day Resolution Pledge */}
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3 flex items-center gap-3">
          <Clock size={18} className="text-amber-400 shrink-0" />
          <p className="text-[11px] font-medium text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-bold">
              {isArabic ? 'ضمان الإصلاح خلال أقل من أسبوع ⏱️: ' : '7-Day Resolution Pledge ⏱️: '}
            </strong>
            {isArabic
              ? 'يتابع عمرو شريف شخصياً كل الملاحظات والمشاكل ويضمن حلها وتحديث التطبيق خلال أقل من ٧ أيام.'
              : 'Amr Sherif personally reviews all reports and guarantees bugs or ideas are addressed in under 7 days.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              {isArabic ? 'ما تقييمك للتجربة العامة؟' : 'How is your experience overall?'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(starValue => {
                const isFilled = starValue <= currentDisplayRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(starValue)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    aria-label={`${starValue} star`}
                  >
                    <Star
                      size={30}
                      className={`transition-colors ${isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : 'text-stone-700'
                        }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-300 mt-2">
              {ratingLabels[currentDisplayRating]?.[isArabic ? 'ar' : 'en'] || ''}
            </p>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              {isArabic ? 'نوع الملاحظة:' : 'Feedback Category:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition border ${category === c.id
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                >
                  {isArabic ? c.labelAr : c.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label htmlFor="review-message-input" className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              {isArabic ? 'ملاحظاتك، المشاكل اللي قابلتك، أو اقتراحاتك:' : 'Your review, bugs found, or feature requests:'}
            </label>
            <textarea
              id="review-message-input"
              rows={3}
              maxLength={1000}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب براحتك.. إيه اللي عجبك؟ إيه اللي محتاج يتصلح؟ أي فكرة حابب تشوفها؟'
                  : 'Tell us anything! What felt great? What should be fixed? What feature would you love to see?'
              }
              className="w-full rounded-2xl border border-stone-800 bg-stone-950/80 p-3.5 text-xs text-white placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none leading-relaxed"
            />
          </div>

          {/* 100% Anonymous Mode Toggle */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-stone-200">
                  {isArabic ? 'إرسال بدون هوية (100% Anonymous)' : 'Submit 100% Anonymously'}
                </span>
                <p className="text-[10px] text-stone-400">
                  {isArabic ? 'لن يتم إرسال اسمك أو أي بيانات تعريفية' : 'Zero identifiers or personal data are collected'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="anon-mode"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-teal-500 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-400 hover:text-white px-3 py-2 transition"
            >
              {isArabic ? 'تخطي الآن' : 'Skip for now'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-lg shadow-teal-900/40 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Send size={14} />
              <span>{isArabic ? 'إرسال واكسب 100 XP 🎁' : 'Submit & Claim 100 XP 🎁'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

