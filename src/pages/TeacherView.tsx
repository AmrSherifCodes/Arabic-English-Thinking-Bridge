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
      className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip flex flex-col pb-safe font-arabic print:bg-white print:text-black"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
      dir="rtl"
    >
      {/* Header (hidden when printing parent card) */}
      <header
        className="tb-hud-bar sticky top-0 z-40 flex flex-wrap justify-between items-center gap-3 p-4 md:px-8 pt-safe border-b print:hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] flex items-center gap-2 px-4 py-2 border font-bold rounded-xl transition-colors text-sm cursor-pointer"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        >
          <X className="w-4 h-4" />
          <span>إغلاق</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-base md:text-xl font-black flex items-center gap-2" style={{ color: 'var(--gold)' }}>
            <span>🏫</span>
            <span>لوحة المعلّم والأكاديمية</span>
          </h1>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs font-bold"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {cohortCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cohort')}
            className="min-h-[48px] flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            style={
              activeTab === 'cohort'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' }
                : { backgroundColor: 'var(--bg)', color: 'var(--ink)', borderColor: 'var(--border)' }
            }
          >
            <Users className="w-4 h-4" />
            <span>المجموعة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projector')}
            className="min-h-[48px] flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            style={
              activeTab === 'projector'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' }
                : { backgroundColor: 'var(--bg)', color: 'var(--ink)', borderColor: 'var(--border)' }
            }
          >
            <Presentation className="w-4 h-4" />
            <span>السبورة</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[90] px-6 py-2.5 rounded-full font-bold shadow-2xl border text-sm print:hidden pointer-events-none"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' }}
        >
          {toast}
        </div>
      )}

      {/* TAB 1: ACADEMY TEACHER COHORT DASHBOARD */}
      {activeTab === 'cohort' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 print:hidden">
          {/* Cohort Status Banner */}
          <section
            className="tb-card-surface border rounded-3xl p-5 md:p-6 flex flex-wrap items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full border font-mono text-xs font-black"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                >
                  كود المجموعة: {cohortCode}
                </span>
                {isAcademyTeacher ? (
                  <span
                    className="px-2.5 py-1 rounded-full border text-xs font-bold"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  >
                    حساب معلّم مفعّل
                  </span>
                ) : (
                  <span
                    className="px-2.5 py-1 rounded-full border text-xs font-bold"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  >
                    وضع المعاينة (بدون إنترنت)
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black break-words" style={{ color: 'var(--ink)' }}>
                {cohortLabel || 'لوحة متابعة طلاب المجموعة'}
              </h2>
              <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {isDemoMode
                  ? isAcademyTeacher
                    ? 'لم يقم أي طالب بالمزامنة بعد — يتم عرض بيانات تجريبية جاهزة للمعاينة وتجربة تقارير أولياء الأمور.'
                    : 'معاينة فورية لمدير المركز والمعلّمين. فعّل كود المعلّم (مثل ALAQSA-TEACH-01) لربط طلاب مجموعتك الحقيقيين.'
                  : `متصل بمجموعة ${cohortCode} — يعرض التقدم الأسبوعي المرسل اختيارياً من أجهزة الطلاب.`}
              </p>
              {rosterError && <p className="text-xs font-bold pt-1" style={{ color: 'var(--gold)' }}>{rosterError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAcademyTeacher && liveStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForceDemoPreview((prev) => !prev)}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                >
                  {forceDemoPreview ? 'عرض الطلاب الحقيقيين' : 'معاينة بيانات تجريبية'}
                </button>
              )}
              {isAcademyTeacher && (
                <button
                  type="button"
                  onClick={loadRoster}
                  disabled={isLoadingRoster}
                  className="min-h-[48px] flex items-center gap-2 px-4 py-2.5 rounded-xl disabled:opacity-50 text-xs sm:text-sm font-black transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRoster ? 'animate-spin' : ''}`} />
                  <span>{isLoadingRoster ? 'جاري التحديث...' : 'تحديث القائمة'}</span>
                </button>
              )}
            </div>
          </section>

          {/* KPI Strip */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="tb-card-surface border rounded-2xl p-4 space-y-1" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                <span>الطلاب المسجلون</span>
                <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-3xl font-black font-mono" style={{ color: 'var(--ink)' }}>{cohortStats.count}</p>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>إجمالي طلاب المجموعة</p>
            </div>

            <div className="tb-card-surface border rounded-2xl p-4 space-y-1" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                <span>متوسط نقاط الأسبوع</span>
                <Trophy className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
              </div>
              <p className="text-3xl font-black font-mono" style={{ color: 'var(--ink)' }}>
                {cohortStats.avgWeeklyXp}
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>نقطة أسبوعياً</p>
            </div>

            <div className="tb-card-surface border rounded-2xl p-4 space-y-1" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                <span>متوسط الاستمرارية</span>
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
              </div>
              <p className="text-3xl font-black font-mono" style={{ color: 'var(--ink)' }}>
                {cohortStats.avgStreak}
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>أيام متتالية</p>
            </div>

            <div className="tb-card-surface border rounded-2xl p-4 space-y-1" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                <span>نجم الأسبوع</span>
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-base font-black break-words pt-1" style={{ color: 'var(--accent)' }}>
                {cohortStats.topStudent?.displayName || '—'}
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--ink-muted)' }}>
                {cohortStats.topStudent ? `${cohortStats.topStudent.weeklyXp} XP` : 'لا توجد بيانات'}
              </p>
            </div>
          </section>

          {/* Main Dashboard Grid: Enrolled Students + Recurring L1 Mistakes */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
            {/* Enrolled Students List */}
            <section
              className="tb-card-surface border rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h3 className="text-base font-black" style={{ color: 'var(--ink)' }}>
                    قائمة طلاب المجموعة
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    اضغط «تقرير ولي الأمر» لطباعة أو نسخ ملخص واتساب جاهز
                  </p>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--ink-muted)' }}>
                  {displayedStudents.length} طالب
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {displayedStudents.map((student, idx) => (
                  <div
                    key={student.deviceId}
                    className="p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-full border font-mono text-xs font-black flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                        >
                          {idx + 1}
                        </span>
                        <p className="font-bold text-sm md:text-base break-words" style={{ color: 'var(--ink)' }}>
                          {student.displayName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold"
                          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          {student.weeklyXp} XP / أسبوع
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold"
                          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                        >
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {student.streakDays} يوم
                        </span>
                        <span className="font-mono font-bold" style={{ color: 'var(--ink-muted)' }}>
                          {student.completedLessons} درس
                        </span>
                      </div>

                      {student.topL1Mistakes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {student.topL1Mistakes.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/35 text-rose-500 text-xs font-bold"
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
                      className="min-h-[48px] shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'var(--accent-soft)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      <span>تقرير ولي الأمر</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Recurring L1 Mistakes Across Cohort */}
            <aside
              className="tb-card-surface border rounded-3xl p-5 space-y-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-black" style={{ color: 'var(--ink)' }}>
                    أكثر أخطاء التفكير العربي تكراراً
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    أبرز الأنماط التي تحتاج مراجعة في الحصة
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
                        className="p-3.5 rounded-2xl border space-y-2"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold break-words" style={{ color: 'var(--ink)' }}>{label.ar}</span>
                          <span className="text-xs font-mono font-bold text-rose-500 shrink-0">
                            {studentCount}/{cohortStats.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
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
                <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>لا توجد أخطاء مسجلة بعد.</p>
              )}

              <div className="pt-2 border-t text-xs leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}>
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className="px-5 py-2 font-bold rounded-t-xl text-base border-t border-x shadow-md"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' }}
                  >
                    {scene.characterName[targetLang] || scene.characterName['en']}
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--ink-muted)' }}>
                    المشهد {currentIndex + 1} من {sceneKeys.length}
                  </span>
                </div>

                <div
                  className="bg-black/50 rounded-3xl rounded-tr-none p-8 md:p-12 min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden border-2 shadow-2xl"
                  style={{
                    borderColor: 'var(--border)',
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
                        className="text-xl md:text-3xl font-bold leading-relaxed text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                        dir="rtl"
                      >
                        {scene.text[sourceLang]}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center relative z-10 bg-black/75 px-8 py-6 rounded-2xl backdrop-blur-md border border-stone-700 shadow-xl">
                      <EyeOff className="w-12 h-12 text-stone-300 mx-auto mb-3 opacity-80" />
                      <p className="text-xl md:text-2xl text-white font-bold">
                        اضغط «اكشف النص» لعرض الجملة للطلاب
                      </p>
                      <p className="text-xs text-stone-300 mt-1">
                        النص مخفي مؤقتاً لوضع العرض على السبورة
                      </p>
                    </div>
                  )}
                </div>

                {/* Teacher Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    className="min-h-[52px] py-4 px-6 text-lg font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
                  >
                    {revealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    <span>{revealed ? 'إخفاء النص' : 'اكشف النص'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentIndex <= 0}
                    className="min-h-[52px] py-4 px-6 border font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>المشهد السابق</span>
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentIndex >= sceneKeys.length - 1}
                    className="min-h-[52px] py-4 px-6 border font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    <span>المشهد التالي</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* Classroom QR Sidebar */}
              <aside
                className="tb-card-surface border p-6 rounded-3xl flex flex-col items-center justify-start gap-4 shadow-xl"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="text-center">
                  <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--gold)' }}>رمز المتابعة الفورية</h2>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>امسح الرمز لمتابعة الدرس مباشرة</p>
                </div>

                <TeacherQRCode url={shareUrl} size={240} />

                <div className="w-full text-center space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full min-h-[48px] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors border flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ رابط المشهد</span>
                  </button>
                  <p className="text-xs leading-snug" style={{ color: 'var(--ink-muted)' }}>
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
