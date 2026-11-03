import React, { useState } from 'react';
import { ProgressionState } from '../../progression/types';
import { SkillRadar } from './SkillRadar';
import { UserProfile } from '../../types';
import { Shield, Download, Trash2, Settings, HelpCircle, Moon, Sun, Lock } from 'lucide-react';

interface ProfileViewProps {
  state: ProgressionState;
  profile?: UserProfile | null;
  onUpdateState?: (updater: (prev: ProgressionState) => ProgressionState) => void;
  onExportData?: () => void;
  onDeleteData?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenPreferences?: () => void;
  onResetProgress?: () => void;
  onOpenPrivacy?: () => void;
  isArabic?: boolean;
}

export function ProfileView({
  state,
  profile,
  onUpdateState,
  onExportData,
  onDeleteData,
  onOpenPrivacyPolicy,
  isArabic = true,
}: ProfileViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6 max-w-md mx-auto pb-36 sm:pb-32" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. Header Profile & Overall Level Card */}
      <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 shadow-xl text-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-black text-2xl shadow-inner">
              👑
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-white">
                {state.anonymousAlias}
              </h3>
              <span className="text-xs font-bold text-teal-400 block">
                {isArabic ? `المستوى الإجمالي ${state.overallLevel}` : `Overall Level ${state.overallLevel}`}
              </span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
            {isArabic ? `المرحلة ${state.currentStage}` : `Stage ${state.currentStage}`}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-stone-800">
          <div className="p-2 rounded-xl bg-stone-950">
            <span className="text-sm font-black text-amber-400 block">{state.xp}</span>
            <span className="text-[10px] text-stone-400">{isArabic ? 'مجموع الـ XP' : 'Total XP'}</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-950">
            <span className="text-sm font-black text-teal-400 block">🔥 {state.streak}</span>
            <span className="text-[10px] text-stone-400">{isArabic ? 'أيام حماسة' : 'Streak'}</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-950">
            <span className="text-sm font-black text-blue-400 block">🛡️ {state.streakShields}</span>
            <span className="text-[10px] text-stone-400">{isArabic ? 'دروع' : 'Shields'}</span>
          </div>
        </div>
      </div>

      {/* 2. 5-Skill Radar Chart */}
      <SkillRadar skills={state.skills} isArabic={isArabic} />

      {/* 3. Settings & Controls */}
      <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 text-start">
        <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <Settings size={14} className="text-teal-400" />
          <span>{isArabic ? 'تفضيلات التدريب والبطاقات' : 'Practice Preferences'}</span>
        </h4>

        <div className="space-y-2 text-xs">
          {/* Daily Cards Cap */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-300 font-bold">
              {isArabic ? 'الحد الأقصى للبطاقات اليومية:' : 'Daily Flashcards Review Cap:'}
            </span>
            <select
              value={state.dailyCardsCap}
              onChange={(e) => {
                const cap = Number(e.target.value);
                onUpdateState?.((prev) => ({ ...prev, dailyCardsCap: cap }));
              }}
              className="bg-stone-900 border border-stone-700 text-teal-400 rounded-lg px-2 py-1 font-bold"
            >
              <option value={15}>15 {isArabic ? 'بطاقة' : 'cards'}</option>
              <option value={30}>30 {isArabic ? 'بطاقة' : 'cards'}</option>
              <option value={50}>50 {isArabic ? 'بطاقة' : 'cards'}</option>
            </select>
          </div>

          {/* Weekend Pause Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
            <span className="text-stone-300 font-bold">
              {isArabic ? 'إيقاف الحماسة في عطلة نهاية الأسبوع:' : 'Weekend Pause Protection:'}
            </span>
            <button
              onClick={() => {
                onUpdateState?.((prev) => ({ ...prev, weekendPauseActive: !prev.weekendPauseActive }));
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                state.weekendPauseActive ? 'bg-teal-500 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {state.weekendPauseActive ? (isArabic ? 'مفعل' : 'On') : (isArabic ? 'معطل' : 'Off')}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Data Rights */}
      <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 text-start">
        <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <Shield size={14} className="text-amber-400" />
          <span>{isArabic ? 'الخصوصية وحقوق البيانات' : 'Privacy & Data Rights'}</span>
        </h4>

        <div className="flex flex-col gap-2">
          <button
            onClick={onExportData}
            className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-bold text-xs hover:border-teal-500/50 transition flex items-center justify-between"
          >
            <span>{isArabic ? 'تصدير نسخة احتياطية من بياناتي (Export JSON)' : 'Export my data (JSON)'}</span>
            <Download size={14} className="text-teal-400" />
          </button>

          <button
            onClick={onOpenPrivacyPolicy}
            className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-bold text-xs hover:border-teal-500/50 transition flex items-center justify-between"
          >
            <span>{isArabic ? 'سياسة الخصوصية وتأمين البيانات' : 'Privacy Policy & Plain Summary'}</span>
            <Lock size={14} className="text-amber-400" />
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-950/50 transition flex items-center justify-between"
            >
              <span>{isArabic ? 'حذف الحساب والبيانات بالكامل' : 'Delete my account and data'}</span>
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500 space-y-2">
              <p className="text-[11px] text-red-200 font-bold">
                {isArabic
                  ? 'هل أنت متأكد من مسح كافة السجلات والتقدم برمجياً؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to erase all progression records? This cannot be undone.'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDeleteData}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-black text-xs"
                >
                  {isArabic ? 'نعم، امسح كل شيء' : 'Yes, Delete All'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-stone-800 text-stone-300 font-bold text-xs"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
