import React from 'react';
import { GraduationCap, Sprout, BookOpen, Baby, School, Award, Compass, Zap } from 'lucide-react';
import {
  computePedagogicalStage,
  type PedagogicalStage,
  type HighSchoolTrack,
} from '../features/preferences/usePreferences';

interface RoleAgeConfiguratorProps {
  age: number;
  isStudent: boolean;
  highSchoolTrack?: HighSchoolTrack;
  onAgeChange: (age: number) => void;
  onStudentChange: (isStudent: boolean) => void;
  onHighSchoolTrackChange?: (track: HighSchoolTrack) => void;
  onStartFromZero?: () => void;
}

const AGE_PRESETS = [
  { label: '👶 ٥ سنين', age: 5 },
  { label: '🎒 ٩ سنين', age: 9 },
  { label: '📚 ١٣ سنة', age: 13 },
  { label: '🎓 ١٧ سنة', age: 17 },
  { label: '💼 ٢٢ سنة', age: 22 },
  { label: '☕ ٣٥ سنة', age: 35 },
];

export function RoleAgeConfigurator({
  age,
  isStudent,
  highSchoolTrack = 'thanawiya',
  onAgeChange,
  onStudentChange,
  onHighSchoolTrackChange,
  onStartFromZero,
}: RoleAgeConfiguratorProps) {
  const computedStage: PedagogicalStage = computePedagogicalStage(age, isStudent);

  const getStageInfo = (stage: PedagogicalStage) => {
    switch (stage) {
      case 'kg_kids':
        return {
          title: '👶 كي جي وأطفال صغار (KG & Kids)',
          desc: 'خط عملاق، بطاقات مصورة بالإيموجي، نطق صوتي فوري، جمل من كلمتين فقط بدون نصوص معقدة.',
          badgeColor: 'border-pink-500/40 bg-pink-950/40 text-pink-300',
          icon: Baby,
        };
      case 'elementary':
        return {
          title: '🎒 ابتدائي تأسيس (Elementary Foundation)',
          desc: 'مصنع كتابة الاسم بالإنجليزية، الحيوانات، الألوان، العائلة، المدرسة، وألعاب فلاش كارد مسلية.',
          badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
          icon: School,
        };
      case 'prep_school':
        return {
          title: '📚 إعدادي تكوين جمل (Prep School)',
          desc: 'بناء جمل كاملة (I am / I do / I went)، والتخلص من الترجمة الحرفية كلمة بكلمة.',
          badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
          icon: BookOpen,
        };
      case 'high_school':
        return {
          title: '🎯 ثانوي عام / IGCSE / دبلومة أمريكية',
          desc: 'روابط الجمل (although, however)، جسور الأزمنة (I ate vs I have eaten)، والجاهزية للامتحانات.',
          badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
          icon: Award,
        };
      case 'university':
        return {
          title: '🎓 جامعة وبحث علمي (University & Academia)',
          desc: 'مصطلحات أكاديمية، قراءة علمية وتقنية متقدمة، والطلاقة للوصول إلى مستوى C1.',
          badgeColor: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
          icon: GraduationCap,
        };
      case 'everyday_street':
      default:
        return {
          title: '🌱 للشارع والشغل والسفر (Everyday & Career)',
          desc: 'من تحت الصفر، كلمات الشارع المستعارة (كابتن، لوكيشن، أوردر)، ومحادثات الشغل والسفر بدون تعقيد.',
          badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
          icon: Compass,
        };
    }
  };

  const stageInfo = getStageInfo(computedStage);
  const StageIcon = stageInfo.icon;

  return (
    <div className="space-y-4 text-right font-arabic" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column (Desktop): Student status & Age Slider */}
        <div className="space-y-4">
          {/* 1. Student vs Non-Student Toggle */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 block">
              هل أنت طالب؟ (اختر وضعك الدراسي أو العملي)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStudentChange(true)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                  isStudent
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <GraduationCap className={`h-5 w-5 flex-shrink-0 ${isStudent ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm truncate">🎓 أنا طالب</div>
                  <div className="text-[10px] text-slate-400 truncate">مدرسة / جامعة</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onStudentChange(false)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                  !isStudent
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Sprout className={`h-5 w-5 flex-shrink-0 ${!isStudent ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm truncate">🌱 مش طالب</div>
                  <div className="text-[10px] text-slate-400 truncate">شغل / سفر</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Interactive Age Slider */}
          <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-200">العمر:</span>
              <span className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-sm font-extrabold text-emerald-300">
                {age} سنة
              </span>
            </div>

            <input
              type="range"
              min={4}
              max={60}
              value={age}
              onChange={(e) => onAgeChange(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />

            {/* Quick Age Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {AGE_PRESETS.map((p) => (
                <button
                  key={p.age}
                  type="button"
                  onClick={() => onAgeChange(p.age)}
                  className={`rounded-xl px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    age === p.age
                      ? 'bg-emerald-500 text-black font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Desktop): Computed Profile Card & High School Sub-track */}
        <div className="space-y-4">
          {/* High School Sub-track if in High School range */}
          {computedStage === 'high_school' && onHighSchoolTrackChange && (
            <div className="space-y-2 p-3.5 rounded-2xl border border-purple-900/40 bg-purple-950/20">
              <span className="text-xs font-bold text-purple-200 block">حدد نظامك الدراسي الثانوي:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'thanawiya', label: '🇪🇬 ثانوي عام' },
                  { id: 'igcse', label: '🇬🇧 IGCSE' },
                  { id: 'american', label: '🇺🇸 American Diploma' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onHighSchoolTrackChange(t.id as HighSchoolTrack)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      highSchoolTrack === t.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamically Computed Pedagogical Profile Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0E151E] p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${stageInfo.badgeColor}`}>
                <StageIcon size={14} />
                {stageInfo.title}
              </span>
              <span className="text-[10px] text-slate-400 block">نظام التعلم التلقائي المناسب</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stageInfo.desc}
            </p>
          </div>

          {/* Giant Zero-Stress Button: ابدأ من تحت الصفر */}
          {onStartFromZero && (
            <button
              type="button"
              onClick={onStartFromZero}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sprout className="h-4 w-4" />
              <span>🌱 ابدأ من تحت الصفر (A0 بالصوت)</span>
              <Zap className="h-4 w-4 text-amber-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
