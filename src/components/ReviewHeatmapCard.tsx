import React from 'react';
import { CARD_CLASS } from './uiConstants';

/**
 * Anki-Style Review Heatmap (7 rows for days of week x 20 columns for weeks)
 */
export function ReviewHeatmapCard({ reviewHistory }: { reviewHistory: Record<string, number> }) {
  const days: Array<{ dateStr: string; count: number }> = [];
  const today = new Date();
  // 7 rows x 20 columns = 140 days ending today
  for (let i = 139; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      dateStr,
      count: reviewHistory[dateStr] || 0
    });
  }

  const todayKey = today.toISOString().split('T')[0];
  const todayReviews = reviewHistory[todayKey] || 0;
  const totalReviews = Object.values(reviewHistory).reduce((acc, v) => acc + v, 0);
  const activeDays = Object.values(reviewHistory).filter(v => v > 0).length;

  const getCellColorClass = (count: number): string => {
    if (count <= 0) return 'bg-stone-200 dark:bg-stone-700/70';
    if (count < 5) return 'bg-emerald-200 dark:bg-emerald-900/80';
    if (count < 10) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count < 20) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-700 dark:bg-emerald-300';
  };

  return (
    <div id="review-heatmap-card" className={CARD_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold">Review Heatmap</h3>
          <p className="text-xs opacity-70">
            Last 20 weeks · Today: <strong>{todayReviews}</strong> · Total:{' '}
            <strong>{totalReviews}</strong> reviews across <strong>{activeDays}</strong> days
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] opacity-70">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-stone-200 dark:bg-stone-700/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700 dark:bg-emerald-300 inline-block" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          id="review-heatmap-grid"
          className="grid grid-rows-7 grid-flow-col gap-1 w-max"
          role="img"
          aria-label="Anki review activity heatmap over the past 20 weeks"
        >
          {days.map(cell => (
            <div
              key={cell.dateStr}
              title={`${cell.dateStr}: ${cell.count} review${cell.count === 1 ? '' : 's'}`}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] transition-colors ${getCellColorClass(
                cell.count
              )}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
