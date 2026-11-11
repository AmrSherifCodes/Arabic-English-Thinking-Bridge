import React, { useState } from 'react';
import { Star, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  isArabic?: boolean;
}

export function ReviewModal({ isOpen, onClose, onToast, isArabic = true }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      onToast(isArabic ? 'يرجى كتابة رأيك بوضوح (3 أحرف على الأقل).' : 'Please write at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    const reviewData = {
      rating,
      name: name.trim() || undefined,
      text: text.trim(),
      recommend,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save locally
      const existing = localStorage.getItem('tb.reviews.local');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(reviewData);
      localStorage.setItem('tb.reviews.local', JSON.stringify(list.slice(0, 50)));

      // 2. Post to Vercel API
      let webhookDelivered = false;
      const resp = await fetch(`${API_BASE}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const resData = (await resp.json().catch(() => ({}))) as { ok?: boolean; error?: string; webhookFailed?: boolean };

      if (resp.status === 400) {
        onToast(isArabic ? '❌ لم يتم قبول المراجعة: يرجى كتابة نص بين 3 و 500 حرف.' : `❌ Review rejected: ${resData.error || 'Please enter 3-500 characters'}`);
        return;
      }

      if (resp.ok && resData.ok && !resData.webhookFailed) {
        webhookDelivered = true;
      }

      if (webhookDelivered) {
        onToast(isArabic ? '🌟 شكراً لتقييمك! تم إرسال مراجعتك بنجاح' : '🌟 Thank you! Your review was submitted to live team.');
      } else {
        onToast(isArabic ? '📡 تم حفظ التقييم محلياً بنجاح وستتم المزامنة لاحقاً 💾' : '📡 Saved locally. Will sync when online 💾');
      }
    } catch {
      onToast(isArabic ? 'تم حفظ التقييم محلياً وسيتم المزامنة لاحقاً 📡' : 'Saved locally. Will sync when online.');
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
      dir={isArabic ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl p-5 text-text space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-black">
              {isArabic ? 'تقييم تطبيق جسر التفكير' : 'Rate Thinking Bridge'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="text-center p-3 rounded-2xl bg-surface-2 border border-border">
            <p className="text-xs font-bold text-muted mb-2">
              {isArabic ? 'ما تقييمك للتطبيق؟' : 'Overall rating'}
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    size={28}
                    className={star <= displayRating ? 'text-amber-400 fill-amber-400' : 'text-muted'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-muted mb-1">
              {isArabic ? 'اسمك (اختياري):' : 'Your Name (optional):'}
            </label>
            <input
              type="text"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isArabic ? 'مثال: أحمد مصطفى' : 'e.g. Alex'}
              className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-muted mb-1">
              {isArabic ? 'رأيك وملاحظاتك:' : 'Your Review:'}
            </label>
            <textarea
              rows={3}
              maxLength={400}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isArabic
                  ? 'اكتب تجربتك مع جسر التفكير.. ما الذي أعجبك وما الذي تحب تحسينه؟'
                  : 'Tell us how Thinking Bridge helped you think in target languages...'
              }
              className="w-full p-3 rounded-xl bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-[10px] text-muted text-end mt-1">{text.length}/400</p>
          </div>

          {/* Recommend Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
            <span className="text-xs font-bold">
              {isArabic ? 'هل توصي بالتطبيق لأصدقائك؟' : 'Would you recommend this app?'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  recommend ? 'bg-emerald-500 text-white' : 'bg-surface border border-border text-muted'
                }`}
              >
                <ThumbsUp size={14} />
                <span>{isArabic ? 'نعم' : 'Yes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  !recommend ? 'bg-red-500 text-white' : 'bg-surface border border-border text-muted'
                }`}
              >
                <ThumbsDown size={14} />
                <span>{isArabic ? 'لا' : 'No'}</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || text.trim().length < 10}
            className="btn-shiny w-full py-2.5 rounded-xl bg-primary text-on-primary font-black text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Send size={14} />
            <span>{isArabic ? 'إرسال التقييم' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
