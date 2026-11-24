import React, { useState } from 'react';
import { Check, Copy, Flame, GraduationCap, Printer, Sparkles, Trophy, X } from 'lucide-react';
import type { CohortStudentSummary } from '../../types/entitlement';
import { formatL1MistakeTag } from '../../services/cohortSyncService';

interface ParentProgressCardProps {
  student: CohortStudentSummary;
  cohortLabel?: string | null;
  isDemo?: boolean;
  onClose: () => void;
}

export function buildParentWhatsAppSummary(
  student: CohortStudentSummary,
  cohortLabel?: string | null
): string {
  const centerName = cohortLabel?.trim() || `مجموعة ${student.cohortCode}`;
  const mistakeLines =
    student.topL1Mistakes.length > 0
      ? student.topL1Mistakes
          .slice(0, 3)
          .map((tag) => {
            const label = formatL1MistakeTag(tag);
            return `• ${label.ar} (${label.en})`;
          })
          .join('\n')
      : '• أداء متوازن — لا توجد أخطاء متكررة هذا الأسبوع (Balanced performance)';

  return [
    `📘 *تقرير التقدم الأسبوعي — فكّر إنجليزي (Thinking Bridge)*`,
    `🏫 ${centerName} | كود المجموعة: ${student.cohortCode}`,
    `👤 الطالب: *${student.displayName}*`,
    ``,
    `⭐ نقاط هذا الأسبوع (Weekly XP): *${student.weeklyXp} XP*`,
    `🔥 الاستمرارية (Streak): *${student.streakDays} يوم / days*`,
    `📚 الدروس المكتملة (Completed Lessons): *${student.completedLessons}*`,
    `🏆 إجمالي النقاط (Total XP): *${student.totalXp} XP*`,
    ``,
    `🎯 *نقاط التركيز للأسبوع القادم (Focus Areas):*`,
    mistakeLines,
    ``,
    `✨ استمروا في تشجيع الطالب على ١٠ دقائق تدريب يومياً بدون إنترنت على تطبيق فكّر إنجليزي.`,
    `Keep encouraging 10 minutes of daily offline practice on Thinking Bridge!`,
  ].join('\n');
}

export const ParentProgressCard: React.FC<ParentProgressCardProps> = ({
  student,
  cohortLabel,
  isDemo = false,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const reportDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyWhatsApp = async () => {
    const message = buildParentWhatsAppSummary(student, cohortLabel);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Fall through to textarea fallback
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="تقرير ولي الأمر الأسبوعي"
    >
      <div className="w-full max-w-2xl bg-[#121820] text-[#EEF2F5] border border-stone-700 rounded-3xl shadow-2xl overflow-hidden print:bg-white print:text-black print:border-stone-300 print:rounded-none print:shadow-none print:max-w-none">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#0D1219] border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <GraduationCap className="w-4 h-4" />
            <span>بطاقة متابعة ولي الأمر · Parent Progress Card</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-5 print:border-stone-300">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-700">
                فكّر إنجليزي · Thinking Bridge v7
              </p>
              <h2 className="text-2xl font-black mt-1 text-white print:text-black">
                تقرير التقدم الأسبوعي
              </h2>
              <p className="text-xs text-stone-400 print:text-stone-600" dir="ltr">
                Weekly Student Progress Summary
              </p>
            </div>
            <div className="text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold print:bg-amber-50 print:text-amber-900 print:border-amber-300">
                {student.cohortCode}
              </span>
              {cohortLabel && (
                <p className="text-xs text-stone-400 print:text-stone-600">{cohortLabel}</p>
              )}
              <p className="text-[11px] text-stone-500 print:text-stone-500">{reportDate}</p>
            </div>
          </div>

          {isDemo && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs print:hidden">
              وضع المعاينة (Demo Preview) — سيتم استبدال هذه البيانات تلقائياً بتقدم الطالب الحقيقي فور مزامنة الطلاب.
            </div>
          )}

          {/* Student Identity */}
          <div className="bg-[#0A0E13] border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 print:bg-stone-50 print:border-stone-300">
            <div>
              <p className="text-xs text-stone-400 print:text-stone-600">اسم الطالب · Student</p>
              <p className="text-xl font-black text-white print:text-black mt-0.5">
                {student.displayName}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-stone-400 print:text-stone-600">إجمالي النقاط · Total XP</p>
              <p className="text-lg font-extrabold text-teal-400 print:text-teal-700 font-mono">
                {student.totalXp.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#161E29] border border-stone-800 rounded-2xl p-4 text-center print:bg-white print:border-stone-300">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1.5 print:text-amber-600" />
              <p className="text-2xl font-black font-mono text-white print:text-black">
                {student.weeklyXp}
              </p>
              <p className="text-xs font-bold text-stone-300 print:text-stone-700">نقاط الأسبوع</p>
              <p className="text-[11px] text-stone-500">Weekly XP</p>
            </div>

            <div className="bg-[#161E29] border border-stone-800 rounded-2xl p-4 text-center print:bg-white print:border-stone-300">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1.5 print:text-orange-600" />
              <p className="text-2xl font-black font-mono text-white print:text-black">
                {student.streakDays}
              </p>
              <p className="text-xs font-bold text-stone-300 print:text-stone-700">أيام الاستمرار</p>
              <p className="text-[11px] text-stone-500">Day Streak</p>
            </div>

            <div className="bg-[#161E29] border border-stone-800 rounded-2xl p-4 text-center print:bg-white print:border-stone-300">
              <Sparkles className="w-5 h-5 text-teal-400 mx-auto mb-1.5 print:text-teal-600" />
              <p className="text-2xl font-black font-mono text-white print:text-black">
                {student.completedLessons}
              </p>
              <p className="text-xs font-bold text-stone-300 print:text-stone-700">دروس مكتملة</p>
              <p className="text-[11px] text-stone-500">Lessons Done</p>
            </div>
          </div>

          {/* Top L1 Thinking Bridges to Focus On */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-black text-amber-400 print:text-amber-800">
                نقاط التركيز في التفكير الإنجليزي (أخطاء الترجمة الحرفية)
              </h3>
              <p className="text-xs text-stone-400 print:text-stone-600" dir="ltr">
                Top L1 Arabic-to-English Patterns to Reinforce This Week
              </p>
            </div>

            {student.topL1Mistakes.length > 0 ? (
              <div className="space-y-2">
                {student.topL1Mistakes.slice(0, 4).map((tag) => {
                  const formatted = formatL1MistakeTag(tag);
                  return (
                    <div
                      key={tag}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-800 print:bg-stone-50 print:border-stone-300"
                    >
                      <span className="text-sm font-bold text-stone-100 print:text-black">
                        {formatted.ar}
                      </span>
                      <span className="text-xs font-mono text-stone-400 print:text-stone-600" dir="ltr">
                        {formatted.en}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-teal-300 print:text-teal-700 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3">
                أداء ممتاز هذا الأسبوع بدون أنماط أخطاء متكررة — Excellent balance with no recurring L1 interference patterns!
              </p>
            )}
          </div>

          {/* Bilingual Parent Encouragement Footer */}
          <div className="rounded-2xl bg-teal-500/10 border border-teal-500/25 p-4 space-y-1.5 print:bg-stone-50 print:border-stone-300">
            <p className="text-sm font-bold text-teal-200 print:text-black">
              توصية المعلّم لولي الأمر: ١٠ دقائق تدريب يومي بدون إنترنت على تطبيق «فكّر إنجليزي» تبني ثقة حقيقية في التحدث.
            </p>
            <p className="text-xs text-stone-300 print:text-stone-700" dir="ltr">
              Teacher Note: 10 minutes of daily offline practice on Thinking Bridge builds lasting English fluency without literal translation.
            </p>
          </div>
        </div>

        {/* Bottom Action Buttons (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 bg-[#0D1219] border-t border-stone-800 print:hidden">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ لواتساب! · Copied' : 'نسخ لواتساب · Copy WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0A0E13] font-black text-sm transition-colors shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير · Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
