// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useState } from 'react';
import { X, Plane, CheckCircle2, Play, Crown, Clock } from 'lucide-react';
import {
  TRAVEL_SPRINT_DAYS,
  buildTravelSprintLesson,
  getTravelReadinessPercent,
  loadCompletedTravelDays,
} from '../data/travelSprintData';
import type { LessonNode } from '../progression/types';
import type { TargetLanguage } from '../types';
import { TARGET_LANGUAGE_META } from '../data/languages';

interface TravelSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLang: TargetLanguage;
  isArabic?: boolean;
  onStartDayLesson: (lesson: LessonNode) => void;
}

export const TravelSprintModal: React.FC<TravelSprintModalProps> = ({
  isOpen,
  onClose,
  targetLang,
  isArabic = true,
  onStartDayLesson,
}) => {
  const [activeWeek, setActiveWeek] = useState<1 | 2 | 3>(1);
  const completedDays = loadCompletedTravelDays();
  const readinessPct = getTravelReadinessPercent(completedDays);
  const nextDayNum = TRAVEL_SPRINT_DAYS.find((d) => !completedDays.includes(d.day))?.day || 21;

  if (!isOpen) return null;

  const langMeta = TARGET_LANGUAGE_META[targetLang];
  const weekDays = TRAVEL_SPRINT_DAYS.filter((d) => d.week === activeWeek);

  const weekTabs: Array<{ id: 1 | 2 | 3; ar: string; en: string }> = [
    { id: 1, ar: 'الأسبوع ١ (١–٧)', en: 'Week 1 (1–7)' },
    { id: 2, ar: 'الأسبوع ٢ (٨–١٤)', en: 'Week 2 (8–14)' },
    { id: 3, ar: 'الأسبوع ٣ (١٥–٢١)', en: 'Week 3 (15–21)' },
  ];

  return (
    <div
      data-testid="travel-sprint-modal"
      className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#0B1120', borderColor: 'rgba(34, 211, 238, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="shrink-0 px-5 py-4 border-b space-y-3"
          style={{ backgroundColor: '#131C31', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 text-start">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22D3EE]/15 border border-[#22D3EE]/40 text-[#22D3EE] text-[10px] font-black">
                <Plane size={12} />
                <span>
                  {langMeta?.flag || '✈️'} {isArabic ? 'مسار السفر السريع · 15 دقيقة يومياً' : '15 min/day Immersion Track'}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#F8FAFC]">
                {isArabic ? 'تحدي السفر في 21 يوم ✈️' : '21-Day Travel Abroad Sprint ✈️'}
              </h2>
              <p className="text-xs text-[#CBD5E1]">
                {isArabic
                  ? 'انغماس عملي يجمع بنك كلمات Anki + تمارين سريعة + حوارات سفر حقيقية'
                  : 'Anki FSRS Word Bank + Thumb-Zone Drills + Real Native Roleplay Dialogues'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#CBD5E1] cursor-pointer shrink-0"
              style={{ backgroundColor: '#1B2742' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Live Travel Readiness Meter */}
          <div
            data-testid="travel-readiness-meter"
            className="p-3 rounded-2xl border space-y-2"
            style={{ backgroundColor: '#0B1120', borderColor: 'rgba(16, 185, 129, 0.35)' }}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-black">
              <span className="text-[#10B981]">
                {isArabic ? `جاهزيتك للسفر: ${readinessPct}% ✈️` : `Travel Readiness: ${readinessPct}% ✈️`}
              </span>
              <span className="text-[#FBBF24] tabular-nums">
                {isArabic ? `اليوم ${completedDays.length} / 21` : `Day ${completedDays.length} / 21`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden bg-[#1B2742]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#10B981] via-[#22D3EE] to-[#F59E0B] transition-all duration-300"
                style={{ width: `${Math.max(4, readinessPct)}%` }}
              />
            </div>
            <button
              type="button"
              data-testid="travel-sprint-continue-btn"
              onClick={() => {
                const lesson = buildTravelSprintLesson(nextDayNum, targetLang);
                onClose();
                onStartDayLesson(lesson);
              }}
              className="w-full min-h-[44px] py-2 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald"
            >
              <Play size={14} className="fill-current" />
              <span>
                {isArabic
                  ? `ابدأ مهمة اليوم ${nextDayNum} الآن`
                  : `Launch Day ${nextDayNum} Mission Now`}
              </span>
            </button>
          </div>

          {/* Week Switcher */}
          <div className="grid grid-cols-3 gap-1.5">
            {weekTabs.map((w) => {
              const selected = activeWeek === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveWeek(w.id)}
                  className="min-h-[40px] px-2 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer transition"
                  style={
                    selected
                      ? { backgroundColor: '#22D3EE', color: '#0B1120', borderColor: '#22D3EE' }
                      : { backgroundColor: '#0B1120', color: '#CBD5E1', borderColor: 'var(--border)' }
                  }
                >
                  {isArabic ? w.ar : w.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Days List */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5">
          {weekDays.map((d) => {
            const done = completedDays.includes(d.day);
            const isNext = d.day === nextDayNum;
            return (
              <button
                key={d.day}
                type="button"
                data-testid={`travel-day-${d.day}`}
                onClick={() => {
                  const lesson = buildTravelSprintLesson(d.day, targetLang);
                  onClose();
                  onStartDayLesson(lesson);
                }}
                className="w-full p-3.5 rounded-2xl border text-start flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.99]"
                style={{
                  backgroundColor: done
                    ? 'rgba(16, 185, 129, 0.14)'
                    : d.isBossDay
                      ? 'rgba(245, 158, 11, 0.14)'
                      : isNext
                        ? 'rgba(34, 211, 238, 0.12)'
                        : '#131C31',
                  borderColor: done
                    ? '#10B981'
                    : d.isBossDay
                      ? '#F59E0B'
                      : isNext
                        ? '#22D3EE'
                        : 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B1120] border border-slate-600/40 flex items-center justify-center text-xl shrink-0">
                    {d.icon}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1B2742] text-[#22D3EE]">
                        {isArabic ? `اليوم ${d.day}` : `Day ${d.day}`}
                      </span>
                      {d.isBossDay && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F59E0B]/20 text-[#FBBF24]">
                          <Crown size={10} />
                          <span>{isArabic ? 'اختبار البطل' : 'Boss Test'}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#94A3B8]">
                        <Clock size={10} />
                        <span>{d.estimatedMinutes}m</span>
                      </span>
                    </div>
                    <div className="text-sm font-black text-[#F8FAFC] leading-snug">
                      {isArabic ? d.titleAr : d.titleEn}
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] leading-snug">
                      {isArabic ? d.focusAr : d.focusEn}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 size={22} className="text-[#10B981]" />
                  ) : (
                    <span className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] flex items-center justify-center">
                      <Play size={15} className="fill-current" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
