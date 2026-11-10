import React, { useState, useMemo } from 'react';
import { Copy, CheckCircle2, Code2, ArrowRight } from 'lucide-react';
import { generateLessonLink } from '../../utils/videoLinks';
import { PHASES_DATA } from '../../data/lessons';
import type { Lesson } from '../../types';

interface StudioDashboardProps {
  onBack: () => void;
  isArabic: boolean;
}

export function StudioDashboard({ onBack, isArabic }: StudioDashboardProps) {
  const [selectedJson, setSelectedJson] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Flatten all lessons from PHASES_DATA
  const allLessons = useMemo(() => {
    return PHASES_DATA.flatMap((phase) => phase.lessons);
  }, []);

  const tUI = (en: string, ar: string) => (isArabic ? ar : en);

  const handleGenerateJson = (lesson: Lesson) => {
    const firstExercise = lesson.exercises[0];
    const arabicThought = firstExercise?.arabicThought || 'N/A';
    const targetSentence = firstExercise?.englishTarget || firstExercise?.targetSentence || 'N/A';
    const breakdownChunks = firstExercise?.breakdownChunks || [];

    const payload = {
      id: lesson.id,
      title: isArabic ? lesson.titleAr : lesson.title,
      arabicThought,
      targetSentence,
      breakdownChunks,
      videoLink: generateLessonLink(lesson.id, isArabic),
    };

    setSelectedJson(JSON.stringify(payload, null, 2));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selectedJson) return;
    try {
      await navigator.clipboard.writeText(selectedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 sm:p-8"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--accent-teal)] flex items-center gap-2">
              <Code2 size={24} />
              {tUI('Creator Studio Dashboard', 'لوحة تحكم الاستوديو للمُنشئ')}
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              {tUI(
                'Generate JSON payloads for Remotion video templates.',
                'استخراج بيانات الدروس بصيغة JSON لإنشاء الفيديوهات.'
              )}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-teal)] font-bold text-sm transition-colors flex items-center gap-2"
            aria-label={tUI('Go back', 'العودة')}
          >
            {isArabic ? <ArrowRight size={16} /> : null}
            {tUI('Back', 'العودة')}
            {!isArabic ? <ArrowRight size={16} /> : null}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-3 bg-[var(--surface)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] h-[70vh] overflow-y-auto">
            <h2 className="font-bold text-lg sticky top-0 bg-[var(--surface)] pb-2 z-10">
              {tUI('All Lessons', 'جميع الدروس')} ({allLessons.length})
            </h2>
            <ul className="space-y-2">
              {allLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 transition-colors"
                >
                  <span className="text-sm font-bold truncate pr-2">
                    {isArabic ? lesson.titleAr : lesson.title}
                  </span>
                  <button
                    onClick={() => handleGenerateJson(lesson)}
                    className="shrink-0 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-teal)] text-stone-950 font-black text-xs hover:opacity-90 active:scale-95 transition-transform"
                    aria-label={tUI(`Generate JSON for ${lesson.title}`, `استخراج بيانات ${lesson.titleAr}`)}
                  >
                    {tUI('Generate JSON', 'استخراج JSON')}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col bg-[var(--surface)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {tUI('JSON Payload Preview', 'معاينة البيانات (JSON)')}
              </h2>
              <button
                onClick={handleCopy}
                disabled={!selectedJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent-teal)] text-[var(--accent-teal)] font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={tUI('Copy to Clipboard', 'نسخ إلى الحافظة')}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? tUI('Copied!', 'تم النسخ!') : tUI('Copy', 'نسخ')}
              </button>
            </div>

            <div className="flex-1 bg-[#0A0E13] rounded-[var(--radius-sm)] p-4 border border-[var(--border)] overflow-auto">
              {selectedJson ? (
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap text-left" dir="ltr">
                  {selectedJson}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm font-bold">
                  {tUI('Select a lesson to generate JSON.', 'اختر درساً لاستخراج بياناته.')}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
