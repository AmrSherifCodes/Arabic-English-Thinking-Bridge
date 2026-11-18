/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React from 'react';
import { ExamSessionResult } from './types';
import { CAN_DO } from './data/cefrCanDo';
import { BADGES } from './data/badges';
import { ShareCard } from './components/ShareCard';
import { RotateCcw, AlertCircle, Award } from 'lucide-react';

interface ExamResultScreenProps {
  result: ExamSessionResult;
  supporterMode?: boolean;
  onRetry: () => void;
  onExit: () => void;
}

export const ExamResultScreen: React.FC<ExamResultScreenProps> = ({
  result,
  supporterMode = false,
  onRetry,
  onExit,
}) => {
  const canDoText = CAN_DO[result.estimatedCefr] || '';
  const unlockedBadgesList = BADGES.filter((b) =>
    result.unlockedBadges.includes(b.id)
  );

  const issueTitle = encodeURIComponent(`Exam correction: ${result.lang}`);
  const issueBody = encodeURIComponent(
    `Language: ${result.lang}\nEstimated CEFR: ${result.estimatedCefr}\nDate: ${result.date}\n\nWhat's wrong:`
  );
  const githubIssueUrl = `https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/issues/new?title=${issueTitle}&body=${issueBody}`;

  return (
    <div
      className={`w-full max-w-xl mx-auto flex flex-col items-center gap-6 p-4 font-arabic text-right text-stone-100 ${
        supporterMode
          ? 'bg-gradient-to-b from-stone-900 via-amber-950/20 to-stone-950 transition-colors duration-1000'
          : ''
      }`}
      data-supporter={supporterMode ? 'true' : undefined}
    >
      {/* Header Result Card */}
      <div
        className={`w-full bg-stone-900/95 border rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-3 backdrop-blur-xl ${
          supporterMode ? 'border-amber-500/50 shadow-[0_0_25px_rgba(212,169,74,0.2)]' : 'border-stone-800'
        }`}
      >
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
          نتيجة الاختبار التكيّفي · CEFR Result
        </span>

        <h2 className="text-xl font-bold text-stone-200">
          مستواك التقريبي · Estimated Level:
        </h2>
        <div className="text-6xl font-black text-emerald-400 font-mono tracking-wider my-1">
          {result.estimatedCefr}
        </div>

        {/* Can-Do Description */}
        <p className="text-sm text-stone-200 bg-stone-950/80 p-4 rounded-2xl border border-stone-800 max-w-md leading-relaxed">
          {canDoText}
        </p>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-3 border-t border-stone-800 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-stone-400">الدقة · Accuracy</span>
            <span className="text-amber-400 font-bold font-mono text-base">
              {result.scorePercentage}%
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-stone-400">السلسلة · Streak</span>
            <span className="text-amber-400 font-bold font-mono text-base">
              {result.bestStreak} 🔥
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-stone-400">النقاط · XP</span>
            <span className="text-amber-400 font-bold font-mono text-base">
              +{result.xpEarned} XP
            </span>
          </div>
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadgesList.length > 0 && (
        <div className="w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> الأوسمة المفتوحة · Unlocked Badges ({unlockedBadgesList.length})
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {unlockedBadgesList.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  supporterMode
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : 'bg-stone-950/60 border-stone-800 text-stone-200'
                }`}
                data-supporter={supporterMode ? 'true' : undefined}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold">{badge.nameAr}</span>
                  <span className="text-[10px] text-stone-400">{badge.descAr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Card Generator */}
      <ShareCard result={result} supporterMode={supporterMode} />

      {/* Supporter Mode Footer Note */}
      <div className="text-center text-xs text-stone-300">
        {supporterMode ? (
          <p className="text-amber-300 font-bold">
            شكرًا لدعمك يا باشا 💚 — الكارت ده مذهّب باسمك (بس بدون بيانات شخصية)
          </p>
        ) : (
          <p>عايز الكارت ده يبقى مذهّب؟ فعّل Supporter Mode من إعدادات الامتحان 💚</p>
        )}
      </div>

      {/* Action Buttons (Retry / Exit) */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onRetry}
          aria-label="جرّب تاني · Try Again"
          className="flex-1 min-h-[56px] py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-300 shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
          <span>جرّب تاني · Try Again</span>
        </button>

        <button
          onClick={onExit}
          aria-label="العودة للمسار · Back to Path"
          className="flex-1 min-h-[56px] py-3.5 px-4 rounded-2xl bg-stone-800 border border-stone-700 hover:bg-stone-750 text-stone-200 font-bold text-base transition-all focus-visible:ring-2 focus-visible:ring-stone-400"
        >
          <span>العودة للمسار · Back</span>
        </button>
      </div>

      {/* GitHub Issue Correction Link */}
      <a
        href={githubIssueUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-stone-300 hover:text-amber-300 flex items-center gap-1.5 underline mt-2"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>لقيت غلطة في سؤال؟ قول لنا هنا · Report Question Issue</span>
      </a>

      {/* Attribution */}
      <div className="text-center text-xs text-stone-400 mt-2 font-sans">
        Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
      </div>
    </div>
  );
};
