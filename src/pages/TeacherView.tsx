import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  Presentation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { chapter1 } from '../data/storyData';
import { TeacherQRCode } from '../components/story/TeacherQRCode';
import { ParentProgressCard } from '../components/teacher/ParentProgressCard';
import { useEntitlement } from '../hooks/useEntitlement';
import {
  DEMO_COHORT_CODE,
  DEMO_COHORT_STUDENTS,
  fetchTeacherCohortRoster,
  formatL1MistakeTag,
} from '../services/cohortSyncService';
import type { CohortStudentSummary } from '../types/entitlement';
import type { LanguageCode } from '../types/story';

interface Props {
  onBack: () => void;
}

type TeacherTab = 'cohort' | 'projector';

export const TeacherView: React.FC<Props> = ({ onBack }) => {
  const { entitlement, isAcademyTeacher } = useEntitlement();
  const [activeTab, setActiveTab] = useState<TeacherTab>('cohort');

  // Cohort Dashboard state
  const [liveStudents, setLiveStudents] = useState<CohortStudentSummary[]>([]);
  const [cohortCode, setCohortCode] = useState<string>(entitlement.cohortCode || DEMO_COHORT_CODE);
  const [cohortLabel, setCohortLabel] = useState<string | null>(entitlement.label ?? null);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [forceDemoPreview, setForceDemoPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CohortStudentSummary | null>(null);

  // Classroom Projector state (preserved from previous version)
  const sourceLang: LanguageCode = 'ar';
  const targetLang: LanguageCode = 'en';
  const [currentSceneId, setCurrentSceneId] = useState(chapter1.startSceneId);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scene = chapter1.scenes[currentSceneId];
  const sceneKeys = Object.keys(chapter1.scenes);
  const currentIndex = sceneKeys.indexOf(currentSceneId);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/teacher?scene=${currentSceneId}`
      : `https://tb-eg.vercel.app/teacher?scene=${currentSceneId}`;

  const loadRoster = useCallback(async () => {
    if (!isAcademyTeacher) {
      setLiveStudents([]);
      setCohortCode(entitlement.cohortCode || DEMO_COHORT_CODE);
      setCohortLabel(entitlement.label ?? 'Al-Aqsa Academy · وضع المعاينة');
      return;
    }

    setIsLoadingRoster(true);
    setRosterError(null);
    const result = await fetchTeacherCohortRoster();
    setIsLoadingRoster(false);

    if (result.ok) {
      setLiveStudents(result.students);
      if (result.cohortCode) setCohortCode(result.cohortCode);
      if (result.label) setCohortLabel(result.label);
    } else if (!result.skipped) {
      setRosterError(
        result.errorCode === 'NETWORK_OFFLINE'
          ? 'غير متصل بالإنترنت — يتم عرض وضع المعاينة الأوفلاين.'
          : 'تعذر تحديث قائمة الطلاب حالياً — يتم عرض وضع المعاينة.'
      );
    }
  }, [isAcademyTeacher, entitlement.cohortCode, entitlement.label]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    setRevealed(false);
  }, [currentSceneId]);

  const isDemoMode = !isAcademyTeacher || forceDemoPreview || liveStudents.length === 0;
  const displayedStudents = useMemo<CohortStudentSummary[]>(() => {
    if (!isDemoMode) return liveStudents;
    return DEMO_COHORT_STUDENTS.map((s) => ({
      ...s,
      cohortCode: cohortCode || DEMO_COHORT_CODE,
    }));
  }, [isDemoMode, liveStudents, cohortCode]);

  const cohortStats = useMemo(() => {
    const count = displayedStudents.length;
    const totalWeeklyXp = displayedStudents.reduce((acc, s) => acc + s.weeklyXp, 0);
    const avgWeeklyXp = count > 0 ? Math.round(totalWeeklyXp / count) : 0;
    const avgStreak =
      count > 0
        ? Math.round(
            (displayedStudents.reduce((acc, s) => acc + s.streakDays, 0) / count) * 10
          ) / 10
        : 0;
    const topStudent = displayedStudents[0] || null;

    const mistakeCounts = new Map<string, number>();
    for (const student of displayedStudents) {
      for (const tag of student.topL1Mistakes) {
        mistakeCounts.set(tag, (mistakeCounts.get(tag) || 0) + 1);
      }
    }
    const recurringMistakes = Array.from(mistakeCounts.entries())
      .map(([tag, studentCount]) => ({ tag, studentCount }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);

    return { count, avgWeeklyXp, avgStreak, topStudent, recurringMistakes };
  }, [displayedStudents]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setToast('تم نسخ الرابط');
      } else {
        setToast('النسخ غير متاح — حدد الرابط يدوياً');
      }
    } catch {
      setToast('النسخ غير متاح — حدد الرابط يدوياً');
    }
    setTimeout(() => setToast(null), 2500);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentSceneId(sceneKeys[currentIndex - 1]);
    }
  };

  const goNext = () => {
    if (currentIndex < sceneKeys.length - 1) {
      setCurrentSceneId(sceneKeys[currentIndex + 1]);
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex flex-col pt-safe pb-safe font-arabic print:bg-white print:text-black"
      dir="rtl"
    >
      {/* Header (hidden when printing parent card) */}
      <header className="flex flex-wrap justify-between items-center gap-3 p-4 md:px-8 border-b border-stone-800 bg-[#121820] print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          <span>إغلاق</span>
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-base md:text-xl font-black text-amber-400 flex items-center gap-2">
            <span>🏫</span>
            <span>لوحة المعلّم والأكاديمية · Teacher Hub</span>
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/35 font-mono text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {cohortCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cohort')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              activeTab === 'cohort'
                ? 'bg-amber-500 text-[#0A0E13]'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المجموعة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projector')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              activeTab === 'projector'
                ? 'bg-amber-500 text-[#0A0E13]'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>السبورة</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold shadow-2xl border border-teal-400 text-sm print:hidden">
          {toast}
        </div>
      )}

      {/* TAB 1: ACADEMY TEACHER COHORT DASHBOARD */}
      {activeTab === 'cohort' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 print:hidden">
          {/* Cohort Status Banner */}
          <section className="bg-[#121820] border border-stone-800 rounded-3xl p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 font-mono text-xs font-black">
                  COHORT: {cohortCode}
                </span>
                {isAcademyTeacher ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    حساب معلّم مفعّل · Verified Teacher
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-bold">
                    وضع المعاينة الأوفلاين · Offline Demo Preview
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                {cohortLabel || 'لوحة متابعة طلاب المجموعة'}
              </h2>
              <p className="text-xs md:text-sm text-stone-400">
                {isDemoMode
                  ? isAcademyTeacher
                    ? 'لم يقم أي طالب بالمزامنة بعد — يتم عرض بيانات تجريبية جاهزة للمعاينة وتجربة تقارير أولياء الأمور.'
                    : 'معاينة فورية لمدير المركز والمعلّمين. فعّل كود المعلّم (مثل ALAQSA-TEACH-01) لربط طلاب مجموعتك الحقيقيين.'
                  : `متصل بمجموعة ${cohortCode} — يعرض التقدم الأسبوعي المرسل اختيارياً من أجهزة الطلاب.`}
              </p>
              {rosterError && <p className="text-xs text-amber-300 pt-1">{rosterError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAcademyTeacher && liveStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForceDemoPreview((prev) => !prev)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors"
                >
                  {forceDemoPreview ? 'عرض الطلاب الحقيقيين' : 'معاينة بيانات تجريبية'}
                </button>
              )}
              {isAcademyTeacher && (
                <button
                  type="button"
                  onClick={loadRoster}
                  disabled={isLoadingRoster}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRoster ? 'animate-spin' : ''}`} />
                  <span>{isLoadingRoster ? 'جاري التحديث...' : 'تحديث القائمة'}</span>
                </button>
              )}
            </div>
          </section>

          {/* KPI Strip */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121820] border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold">
                <span>الطلاب المسجلون</span>
                <Users className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-3xl font-black font-mono text-white">{cohortStats.count}</p>
              <p className="text-[11px] text-stone-500">Enrolled Students</p>
            </div>

            <div className="bg-[#121820] border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold">
                <span>متوسط نقاط الأسبوع</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black font-mono text-white">
                {cohortStats.avgWeeklyXp}
              </p>
              <p className="text-[11px] text-stone-500">Avg Weekly XP</p>
            </div>

            <div className="bg-[#121820] border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold">
                <span>متوسط الاستمرارية</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-3xl font-black font-mono text-white">
                {cohortStats.avgStreak}
              </p>
              <p className="text-[11px] text-stone-500">Avg Streak (Days)</p>
            </div>

            <div className="bg-[#121820] border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold">
                <span>نجم الأسبوع</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-base font-black text-emerald-300 truncate pt-1">
                {cohortStats.topStudent?.displayName || '—'}
              </p>
              <p className="text-[11px] text-stone-500 font-mono">
                {cohortStats.topStudent ? `${cohortStats.topStudent.weeklyXp} XP` : 'No data'}
              </p>
            </div>
          </section>

          {/* Main Dashboard Grid: Enrolled Students + Recurring L1 Mistakes */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
            {/* Enrolled Students List */}
            <section className="bg-[#121820] border border-stone-800 rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white">
                    قائمة طلاب المجموعة · Cohort Roster
                  </h3>
                  <p className="text-xs text-stone-400">
                    اضغط «تقرير ولي الأمر» لطباعة أو نسخ ملخص واتساب جاهز
                  </p>
                </div>
                <span className="text-xs font-mono text-stone-400">
                  {displayedStudents.length} students
                </span>
              </div>

              <div className="divide-y divide-stone-800/80">
                {displayedStudents.map((student, idx) => (
                  <div
                    key={student.deviceId}
                    className="p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#171F2A] transition-colors"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-stone-800 text-amber-400 font-mono text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-white text-sm md:text-base truncate">
                          {student.displayName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-mono font-bold">
                          <Trophy className="w-3.5 h-3.5" />
                          {student.weeklyXp} XP / أسبوع
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-300 font-mono font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          {student.streakDays} يوم
                        </span>
                        <span className="text-stone-400 font-mono">
                          {student.completedLessons} درس
                        </span>
                      </div>

                      {student.topL1Mistakes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {student.topL1Mistakes.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px]"
                            >
                              {formatL1MistakeTag(tag).ar}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 font-bold text-xs transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>تقرير ولي الأمر</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Recurring L1 Mistakes Across Cohort */}
            <aside className="bg-[#121820] border border-stone-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black text-white">
                    أكثر أخطاء التفكير العربي تكراراً
                  </h3>
                  <p className="text-xs text-stone-400" dir="ltr">
                    Top Recurring L1 Interference Patterns
                  </p>
                </div>
              </div>

              {cohortStats.recurringMistakes.length > 0 ? (
                <div className="space-y-3">
                  {cohortStats.recurringMistakes.map(({ tag, studentCount }) => {
                    const label = formatL1MistakeTag(tag);
                    const pct =
                      cohortStats.count > 0
                        ? Math.round((studentCount / cohortStats.count) * 100)
                        : 0;
                    return (
                      <div
                        key={tag}
                        className="p-3.5 rounded-2xl bg-[#0A0E13] border border-stone-800 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-stone-100">{label.ar}</span>
                          <span className="text-xs font-mono font-bold text-rose-300 shrink-0">
                            {studentCount}/{cohortStats.count}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono" dir="ltr">
                          {label.en}
                        </p>
                        <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-l from-rose-500 to-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-400">لا توجد أخطاء مسجلة بعد.</p>
              )}

              <div className="pt-2 border-t border-stone-800 text-xs text-stone-400 leading-relaxed">
                💡 استخدم هذه الأنماط لاختيار تمرين الإحماء في أول ٥ دقائق من الحصة القادمة.
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* TAB 2: CLASSROOM PROJECTOR MODE (PRESERVED) */}
      {activeTab === 'projector' && (
        <>
          {!scene ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-xl">المشهد غير موجود</p>
            </div>
          ) : (
            <main className="flex-1 grid md:grid-cols-[1fr_auto] gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full items-start print:hidden">
              {/* Primary Projector Section */}
              <section className="space-y-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold rounded-t-xl text-base border-t border-x border-teal-500/50 shadow-md">
                    {scene.characterName[targetLang] || scene.characterName['en']}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    المشهد {currentIndex + 1} من {sceneKeys.length}
                  </span>
                </div>

                <div
                  className="bg-black/50 rounded-3xl rounded-tr-none p-8 md:p-12 min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden border-2 border-stone-800 shadow-2xl"
                  style={{
                    backgroundImage: `url(${scene.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay',
                    backgroundColor: 'rgba(10, 14, 19, 0.88)',
                  }}
                >
                  {revealed ? (
                    <div className="space-y-6 text-center relative z-10 max-w-3xl">
                      <p
                        className="text-3xl md:text-5xl font-extrabold leading-relaxed text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                        dir="ltr"
                      >
                        {scene.text[targetLang] || scene.text['en']}
                      </p>
                      <p
                        className="text-xl md:text-3xl font-bold leading-relaxed text-amber-300/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                        dir="rtl"
                      >
                        {scene.text[sourceLang]}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center relative z-10 bg-black/70 px-8 py-6 rounded-2xl backdrop-blur-md border border-stone-700/50 shadow-xl">
                      <EyeOff className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
                      <p className="text-xl md:text-2xl text-stone-300 font-bold">
                        اضغط "اكشف" لعرض النص للتلاميذ
                      </p>
                      <p className="text-xs text-stone-500 mt-1 font-mono">
                        Dialogue hidden for presentation mode
                      </p>
                    </div>
                  )}
                </div>

                {/* Teacher Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    className="py-4 px-6 text-lg bg-amber-500 hover:bg-amber-400 text-[#0A0E13] font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {revealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    <span>{revealed ? 'اخفاء النص' : 'اكشف النص'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentIndex <= 0}
                    className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>المشهد السابق</span>
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentIndex >= sceneKeys.length - 1}
                    className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>المشهد التالي</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* Classroom QR Sidebar */}
              <aside className="bg-[#141A22] border border-stone-800 p-6 rounded-3xl flex flex-col items-center justify-start gap-4 shadow-xl">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-amber-400 mb-1">رمز المتابعة الفورية</h2>
                  <p className="text-xs text-stone-400">Scan to follow lesson live</p>
                </div>

                <TeacherQRCode url={shareUrl} size={240} />

                <div className="w-full text-center space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-mono font-bold transition-colors border border-stone-700 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ رابط المشهد</span>
                  </button>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    يعمل بدون إنترنت بعد التحميل الأول لدى الطلاب.
                  </p>
                </div>
              </aside>
            </main>
          )}
        </>
      )}

      {/* Printable & WhatsApp-Copyable Parent Progress Card Modal */}
      {selectedStudent && (
        <ParentProgressCard
          student={selectedStudent}
          cohortLabel={cohortLabel}
          isDemo={isDemoMode}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
