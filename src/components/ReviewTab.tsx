import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, PlusCircle, MessageSquare } from 'lucide-react';
import { ReviewModal } from './ReviewModal';

interface ReviewItem {
  id: string;
  name?: string;
  rating: number;
  text: string;
  recommend: boolean;
  createdAt: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'عمرو شريف',
    rating: 5,
    text: 'التطبيق مدهش بجد! طريقة تحويل الهيكل والربط بين الألمانية والعربية الفصحى خلتني أفهم القاعدة بدون ترجمة في دماغي.',
    recommend: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    name: 'سارة خالد',
    rating: 5,
    text: 'أفضل تطبيق لتعلم اللغة اليابانية! التمارين سريعة والتصحيح الصوتي ممتاز.',
    recommend: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    name: 'Mohamed Ali',
    rating: 5,
    text: 'Direct thinking method is revolutionary. No dictionary lookup delay anymore!',
    recommend: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

interface ReviewTabProps {
  onToast: (msg: string) => void;
  isArabic?: boolean;
}

export function ReviewTab({ onToast, isArabic = true }: ReviewTabProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [filter, setFilter] = useState<'all' | '5' | '4'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tb.reviews.local');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews([...parsed, ...DEFAULT_REVIEWS]);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (filter === '5') return r.rating === 5;
    if (filter === '4') return r.rating === 4;
    return true;
  });

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / Math.max(1, reviews.length)).toFixed(1);
  const recommendPercent = Math.round((reviews.filter((r) => r.recommend).length / Math.max(1, reviews.length)) * 100);

  return (
    <div className="space-y-4 text-start p-1" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Summary Card */}
      <div className="p-4 rounded-3xl bg-surface border border-border shadow-md flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-text">{avgRating}</span>
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-xs font-bold text-muted mt-1">
            {reviews.length} {isArabic ? 'تقييم من المتعلمين' : 'Learner Reviews'} · {recommendPercent}% {isArabic ? 'يوصون به' : 'Recommend'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-primary text-on-primary font-black text-xs shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle size={16} />
          <span>{isArabic ? 'أضف تقييمك' : 'Write Review'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface border border-border text-muted'
          }`}
        >
          {isArabic ? 'الكل' : 'All'} ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('5')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === '5' ? 'bg-amber-500 text-stone-950' : 'bg-surface border border-border text-muted'
          }`}
        >
          5 ⭐
        </button>
        <button
          type="button"
          onClick={() => setFilter('4')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filter === '4' ? 'bg-amber-500 text-stone-950' : 'bg-surface border border-border text-muted'
          }`}
        >
          4 ⭐
        </button>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {filteredReviews.map((r, idx) => (
          <div key={r.id || idx} className="p-4 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center">
                  {(r.name || 'A')[0]}
                </div>
                <span className="text-xs font-black text-text">{r.name || (isArabic ? 'متعلم' : 'Learner')}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} className="fill-amber-400" />
                <span className="text-xs font-bold">{r.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-text font-medium leading-relaxed">{r.text}</p>

            {r.recommend && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ThumbsUp size={12} />
                {isArabic ? 'يوصي بهذا التطبيق' : 'Recommends Thinking Bridge'}
              </span>
            )}
          </div>
        ))}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToast={onToast}
        isArabic={isArabic}
      />
    </div>
  );
}
