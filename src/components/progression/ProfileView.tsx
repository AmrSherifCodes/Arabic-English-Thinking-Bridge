import React, { useState, useRef } from 'react';
import { ProgressionState } from '../../progression/types';
import { SkillRadar } from './SkillRadar';
import { UserProfile } from '../../types';
import { TARGET_LANGUAGE_META } from '../../data/languages';
import { Shield, Download, Upload, Trash2, Settings, HelpCircle, Moon, Sun, Lock, Share2, CheckCircle2, Brain } from 'lucide-react';
import { GlobalTutorBrain } from '../../utils/OnlineLearningEngine';
import { useUiMode } from '../../utils/uiMode';

const categoryLabelsAr: Record<string, string> = {
  copula: 'الرابط الخفي (copula)',
  article: 'أدوات التنكير والتعريف (article)',
  tense: 'الزمن (tense)',
  preposition: 'حروف الجر (preposition)',
  word_order: 'ترتيب الجملة (word_order)',
  vocabulary: 'المفردات (vocabulary)',
  general: 'عام (general)',
  grammar: 'قواعد الجملة (grammar)',
  pronunciation: 'النطق (pronunciation)',
};

const difficultyLabelsAr: Record<string, string> = {
  Hard: 'متقدم',
  Medium: 'متوسط',
  Easy: 'سهل',
};

export function BrainActivityMatrixCard({ isArabic = true }: { isArabic?: boolean }) {
  const brain = GlobalTutorBrain.getInstance();
  const profile = brain.getProfile();
  const nodes = brain.getBrainMatrixNodes();

  const diffLabel = isArabic
    ? (difficultyLabelsAr[profile.difficultyLevel] || profile.difficultyLevel)
    : profile.difficultyLevel;

  return (
    <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 shadow-xl text-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Brain size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{isArabic ? '🧠 نقاط قوتك ونقاط محتاجة تمرين' : 'Neural Matrix Brain Activity'}</span>
            </h4>
            <p className="text-[10px] text-stone-400 font-medium">
              {isArabic ? 'مصفوفة إدراكية حية تتتبع نقاط القوة والضعف عصبياً' : 'On-device neural matrix tracking cognitive strengths'}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-teal-500/20 text-teal-300 border-teal-500/40">
          {isArabic ? `المستوى: ${diffLabel}` : `Level: ${profile.difficultyLevel}`}
        </span>
      </div>

      {/* Cognitive Concept Matrix */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-stone-300 block">
          {isArabic ? 'مصفوفة المفاهيم الإدراكية:' : 'Cognitive Concept Matrix:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(profile.errorWeights).map(([category, errWeight]) => {
            const isStrong = errWeight <= 0.4;
            const isWeak = errWeight >= 0.6;
            const colorClass = isStrong
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : isWeak
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300';
            const dotColor = isStrong ? 'bg-emerald-400' : isWeak ? 'bg-red-400' : 'bg-amber-400';
            const displayName = isArabic ? (categoryLabelsAr[category] || category.replace('_', ' ')) : category.replace('_', ' ');

            return (
              <div
                key={category}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 ${colorClass}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                  <span className="text-xs font-black capitalize">
                    {displayName} <span className="text-[9px] opacity-60">({category.replace('_', ' ')})</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold opacity-90">
                  {isStrong
                    ? (isArabic ? 'مفهوم قوي 🟢' : 'Strong 🟢')
                    : isWeak
                    ? (isArabic ? 'مفهوم ضعيف 🔴' : 'Weak 🔴')
                    : (isArabic ? 'متوسط 🟡' : 'Medium 🟡')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Hyperparameters & Loss Strip */}
      <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-stone-950 border border-stone-800/80">
        <div>
          <span className="text-[10px] text-stone-500 block uppercase font-mono">{isArabic ? 'جولات التمرين' : 'Epochs'}</span>
          <span className="text-xs font-black text-teal-400">{profile.epoch}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 block uppercase font-mono">{isArabic ? 'مؤشر الدقة' : 'MSE Loss'}</span>
          <span className="text-xs font-black text-amber-400">{profile.loss.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 block uppercase font-mono">{isArabic ? 'متوسط سرعة التفكير' : 'Avg Speed'}</span>
          <span className="text-xs font-black text-emerald-400">{(profile.avgReactionTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Neural Weight Nodes */}
      <div className="space-y-3 pt-1">
        {nodes.map((node) => {
          const percent = Math.round(node.weight * 100);
          return (
            <div key={node.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-stone-300">{isArabic ? node.labelAr : node.labelEn}</span>
                <span className="text-teal-400 font-mono text-[11px]">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  onToast?: (message: string) => void;
  isArabic?: boolean;
}

export function ProfileView({
  state,
  profile,
  onOpenPreferences,
  onExportData,
  onDeleteData,
  onOpenPrivacyPolicy,
  onToast,
  isArabic = true,
}: ProfileViewProps) {
  const [uiMode, setUiMode] = useUiMode();

  if (uiMode === 'simple') {
    return (
      <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#0B1C33] to-[#0E2746] border-2 border-emerald-500/50 shadow-2xl text-start space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              🟢 {isArabic ? 'الوضع البسيط' : 'Simple Mode'}
            </span>
            <button
              onClick={() => setUiMode('pro')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition border border-amber-500/40 cursor-pointer"
            >
              ⚡ {isArabic ? 'التبديل للوضع المتقدم' : 'Switch to Pro Mode'}
            </button>
          </div>
          <h3 className="text-xl font-black text-white">{isArabic ? 'حسابي وإنجازاتك' : 'Account & Progress'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <span className="text-xl block">🔥</span>
              <span className="text-lg font-black text-amber-300">{state?.streak || 0}</span>
              <span className="text-[10px] text-stone-400 block">{isArabic ? 'أيام الاستمرار' : 'Streak Days'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <span className="text-xl block">⭐</span>
              <span className="text-lg font-black text-cyan-300">{state?.xp || 0}</span>
              <span className="text-[10px] text-stone-400 block">{isArabic ? 'مجموع النقاط' : 'Total XP'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <span className="text-xl block">✅</span>
              <span className="text-lg font-black text-emerald-300">{state?.completedLessonIds?.length || 0}</span>
              <span className="text-[10px] text-stone-400 block">{isArabic ? 'دروس مكتملة' : 'Completed Lessons'}</span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 shadow-xl text-start">
          <h4 className="text-sm font-black text-white">{isArabic ? 'حفظ واستعادة تقدمك' : 'Save & Restore Progress'}</h4>
          <div className="flex flex-wrap gap-3">
            {onExportData && (
              <button onClick={onExportData} className="px-4 py-2 min-h-[48px] rounded-xl bg-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2 cursor-pointer">
                <Download size={14} /> {isArabic ? 'تصدير التقدم (JSON)' : 'Export Progress (JSON)'}
              </button>
            )}
            {onOpenPrivacyPolicy && (
              <button onClick={onOpenPrivacyPolicy} className="px-4 py-2 min-h-[48px] rounded-xl bg-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2 cursor-pointer">
                <Shield size={14} /> {isArabic ? 'عن التطبيق والخصوصية' : 'About & Privacy'}
              </button>
            )}
            <button onClick={() => setUiMode('pro')} className="px-4 py-2 min-h-[48px] rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold cursor-pointer border border-cyan-500/30">
              ⚡ {isArabic ? 'عرض كل أدوات الوضع المتقدم' : 'Show All Pro Tools'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4 shadow-xl text-start">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">{isArabic ? 'الملف الشخصي والإعدادات' : 'Profile & Settings'}</h3>
            <p className="text-xs text-stone-400">{isArabic ? 'إدارة بياناتك والخصوصية محلية 100%' : '100% local-first data & privacy'}</p>
          </div>
          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="px-3.5 py-2 min-h-[48px] rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition hover:bg-teal-500/30 cursor-pointer"
            >
              <Settings size={14} />
              <span>{isArabic ? 'الإعدادات' : 'Preferences'}</span>
            </button>
          )}
        </div>
      </div>

      <BrainActivityMatrixCard isArabic={isArabic} />

      <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 shadow-xl text-start">
        <h4 className="text-sm font-black text-white">{isArabic ? 'إدارة البيانات والخصوصية' : 'Data & Privacy'}</h4>
        <div className="flex flex-wrap gap-3">
          {onExportData && (
            <button
              onClick={onExportData}
              className="px-4 py-2.5 min-h-[48px] rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Download size={14} />
              <span>{isArabic ? 'تصدير التقدم (JSON)' : 'Export Progress'}</span>
            </button>
          )}

          <label className="px-4 py-2.5 min-h-[48px] rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer">
            <Upload size={14} />
            <span>{isArabic ? 'استعادة ملف JSON' : 'Import JSON Backup'}</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const json = event.target?.result as string;
                    const parsed = JSON.parse(json);
                    if (parsed) {
                      localStorage.setItem('tb.progressionState', JSON.stringify(parsed));
                      onToast?.(isArabic ? '✅ تم استعادة التقدم بنجاح! جاري التحديث...' : 'Progress restored successfully!');
                      window.location.reload();
                    }
                  } catch {
                    onToast?.(isArabic ? '❌ ملف التصدير غير صالح' : 'Invalid backup file');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>

          <button
            onClick={async () => {
              try {
                const { exportToAnki } = await import('../../utils/ankiExport');
                await exportToAnki(state);
                onToast?.(isArabic ? '✅ تم تصدير بطاقات Anki (10,000 كلمة)' : 'Anki deck exported successfully!');
              } catch (err) {
                console.warn('Anki export error', err);
                onToast?.('Failed to export Anki deck');
              }
            }}
            className="px-4 py-2.5 min-h-[48px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Download size={14} />
            <span>{isArabic ? 'تصدير بطاقات Anki (10k)' : 'Export Anki Deck'}</span>
          </button>

          {onOpenPrivacyPolicy && (
            <button
              onClick={onOpenPrivacyPolicy}
              className="px-4 py-2.5 min-h-[48px] rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Shield size={14} />
              <span>{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            </button>
          )}
          {onDeleteData && (
            <button
              onClick={() => {
                if (window.confirm(isArabic ? 'هل تريد حقاً مسح كل البيانات محلياً؟' : 'Are you sure you want to clear all local data?')) {
                  onDeleteData();
                }
              }}
              className="px-4 py-2.5 min-h-[48px] rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{isArabic ? 'مسح البيانات محلياً' : 'Clear Local Data'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
