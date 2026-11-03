import React from 'react';
import { Sparkles, Compass, Play } from 'lucide-react';

interface EmptyLessonStateProps {
  stage: string;
  onStartFirstLesson: () => void;
  isArabic?: boolean;
}

export function EmptyLessonState({
  stage,
  onStartFirstLesson,
  isArabic = true
}: EmptyLessonStateProps) {
  return (
    <div
      className="p-8 rounded-3xl bg-surface/70 border border-border/80 text-center space-y-4 backdrop-blur-md shadow-xl my-4"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shadow-inner">
        <Compass size={32} className="animate-spin-slow" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-base font-black text-text">
          {isArabic ? `ابدأ رحلة التفكير في ${stage}` : `Begin Your Journey in ${stage}`}
        </h4>
        <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
          {isArabic
            ? 'لم تكمل أي درس في هذه المرحلة بعد. انقر أدناه لبدء أول تمرين وتفعيل طلاقتك التلقائية.'
            : 'No lessons completed in this stage yet. Tap below to launch your first cognitive drill.'}
        </p>
      </div>

      <button
        onClick={onStartFirstLesson}
        className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg active:scale-95 transition"
      >
        <Play size={16} fill="currentColor" />
        <span>{isArabic ? 'انطلق في الدرس الأول 🚀' : 'Start First Lesson 🚀'}</span>
      </button>
    </div>
  );
}
