import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquareHeart, Lightbulb, X, Send } from 'lucide-react';
import type { UserProfile } from '../types';

export interface UserFeedbackData {
  rating: number;
  generalFeedback: string;
  featureIdea: string;
  createdAt: string;
  userName?: string;
  profileGoal?: string;
  focusArea?: string;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFeedbackData) => void;
  onToast: (message: string) => void;
  profile?: UserProfile | null;
}

const FEEDBACK_STORAGE_KEY = 'user_feedback';

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  onToast,
  profile
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [generalFeedback, setGeneralFeedback] = useState<string>('');
  const [featureIdea, setFeatureIdea] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData: UserFeedbackData = {
      rating,
      generalFeedback: generalFeedback.trim(),
      featureIdea: featureIdea.trim(),
      createdAt: new Date().toISOString(),
      userName: profile?.name,
      profileGoal: profile?.goal,
      focusArea: profile?.focusArea
    };

    try {
      const existingRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existingList: UserFeedbackData[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.push(feedbackData);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existingList));
    } catch {
      // LocalStorage quota or restricted mode fallback
    }

    onToast('Thank you! Your feedback directly shapes the future of this app.');
    onSubmit(feedbackData);
    setIsSubmitting(false);
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const ratingLabels: Record<number, string> = {
    1: 'Needs Work 🛠️',
    2: 'Fair 😐',
    3: 'Good 🙂',
    4: 'Great! 😃',
    5: 'Mind-Blowing 🚀'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Experience Feedback"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-700/80 bg-stone-900 p-6 sm:p-7 text-stone-100 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
              <MessageSquareHeart size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">5-Exercise Milestone 🎉</h3>
              <p className="text-xs text-stone-400">You just completed your 5th cognitive exercise!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Skip feedback"
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="rounded-2xl border border-stone-800 bg-stone-800/40 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
              How is your experience so far?
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
                      size={28}
                      className={`transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-stone-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-300 mt-2">
              {ratingLabels[currentDisplayRating] || 'Tap to rate'}
            </p>
          </div>

          {/* General Feedback Textarea */}
          <div>
            <label htmlFor="general-feedback-input" className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              General Feedback (What felt great or confusing?)
            </label>
            <textarea
              id="general-feedback-input"
              rows={3}
              value={generalFeedback}
              onChange={e => setGeneralFeedback(e.target.value)}
              placeholder="e.g. The word blocks really helped me stop translating word-for-word, but I'd like more practice with..."
              className="w-full rounded-xl border border-stone-700 bg-stone-800/80 p-3 text-xs text-white placeholder-stone-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none leading-relaxed"
            />
          </div>

          {/* Feature Idea Textarea */}
          <div>
            <label htmlFor="feature-idea-input" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Suggest a New Feature / Idea</span>
            </label>
            <textarea
              id="feature-idea-input"
              rows={2}
              value={featureIdea}
              onChange={e => setFeatureIdea(e.target.value)}
              placeholder="e.g. Chemistry vocabulary deck, WhatsApp voice feedback, spaced repetition widget..."
              className="w-full rounded-xl border border-teal-500/40 bg-stone-800/80 p-3 text-xs text-white placeholder-stone-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-400 hover:text-stone-200 px-3 py-2 transition"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Send size={14} />
              <span>Submit Feedback ✓</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
