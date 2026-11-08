import React, { useState, useRef } from 'react';
import { ProgressionState } from '../../progression/types';
import { SkillRadar } from './SkillRadar';
import { UserProfile } from '../../types';
import { TARGET_LANGUAGE_META } from '../../data/languages';
import { Shield, Download, Upload, Trash2, Settings, HelpCircle, Moon, Sun, Lock, Share2 } from 'lucide-react';

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
  onUpdateState,
  onExportData,
  onDeleteData,
  onOpenPrivacyPolicy,
  onOpenPreferences,
  onToast,
  isArabic = true,
}: ProfileViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportToAnki = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const { exportToAnki } = await import('../../utils/ankiExport');
      const count = await exportToAnki(state);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      onToast?.(isArabic
        ? `📥 تم تصدير ${count} بطاقة إلى Anki`
        : `📥 Exported ${count} cards to Anki`);
    } catch (error: unknown) {
      console.error('Unable to export the Anki deck.', error);
      onToast?.(isArabic
        ? 'لا توجد بطاقات محفوظة للتصدير'
        : error instanceof Error ? error.message : 'Unable to export the Anki deck');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const backupData = {
      version: '3.1.0',
      exportedAt: new Date().toISOString(),
      progressionState: state,
      userProfile: profile,
      activeProfileConfig: localStorage.getItem('tb.activeProfileConfig')
        ? JSON.parse(localStorage.getItem('tb.activeProfileConfig')!)
        : null,
      userProgress: localStorage.getItem('tb_user_progress')
        ? JSON.parse(localStorage.getItem('tb_user_progress')!)
        : null,
    };

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thinking_Bridge_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast?.(isArabic ? '💾 تم تصدير النسخة الاحتياطية بنجاح!' : '💾 Backup JSON exported successfully!');
  };

  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.progressionState) {
          localStorage.setItem('tb.progressionState', JSON.stringify(parsed.progressionState));
        }
        if (parsed.userProfile) {
          localStorage.setItem('tb.userProfile', JSON.stringify(parsed.userProfile));
        }
        if (parsed.activeProfileConfig) {
          localStorage.setItem('tb.activeProfileConfig', JSON.stringify(parsed.activeProfileConfig));
        }
        if (parsed.userProgress) {
          localStorage.setItem('tb_user_progress', JSON.stringify(parsed.userProgress));
        }

        onToast?.(isArabic ? '✅ تم استعادة النسخة الاحتياطية! جاري إعادة التحميل...' : '✅ Backup restored! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        onToast?.(isArabic ? '❌ خطأ في تنسيق ملف النسخة الاحتياطية' : '❌ Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const shareProgress = async () => {
    let targetLang = 'en';
    try {
      const savedProfile: unknown = JSON.parse(localStorage.getItem('tb.activeProfileConfig') || '{}');
      if (typeof savedProfile === 'object' && savedProfile !== null && 'targetLang' in savedProfile) {
        const code = savedProfile.targetLang;
        if (typeof code === 'string' && Object.prototype.hasOwnProperty.call(TARGET_LANGUAGE_META, code)) {
          targetLang = code;
        }
      }
    } catch (error) {
      console.warn('Unable to read the active language profile for sharing.', error);
    }

    const languageName = TARGET_LANGUAGE_META[targetLang as keyof typeof TARGET_LANGUAGE_META].nameEn;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://amrsherif.localhost.cc';
    const shareText = `I'm learning ${languageName} on Thinking Bridge! 🔥 Current Streak: ${state.streak} days. Total XP: ${state.xp}. Join me in rewiring your brain for free at ${appUrl}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'My Thinking Bridge progress', text: shareText });
        onToast?.(isArabic ? 'تمت مشاركة تقدمك بنجاح' : 'Progress shared successfully');
      } else {
        await navigator.clipboard.writeText(shareText);
        onToast?.(isArabic ? 'تم نسخ تقدمك إلى الحافظة' : 'Progress copied to clipboard');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Unable to share or copy progress.', error);
      onToast?.(isArabic ? 'تعذرت مشاركة التقدم' : 'Could not share progress');
    }
  };

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

          <span className="max-w-full text-ellipsis overflow-hidden whitespace-nowrap px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
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
        <button
          type="button"
          onClick={shareProgress}
          aria-label={isArabic ? 'مشاركة تقدمي' : 'Share my progress'}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/30 px-3 py-2 text-xs font-bold text-teal-300 transition hover:bg-teal-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
        >
          <Share2 size={15} />
          {isArabic ? 'مشاركة تقدمي' : 'Share My Progress'}
        </button>

        {/* Top Anki Deck Export Entry Point */}
        <div className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-stone-300 text-sm font-bold">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Download size={18} />
            </div>
            <div className="text-start flex-1">
              <h4 className="text-white">{isArabic ? 'تصدير إلى Anki' : 'Export to Anki'}</h4>
              <p className="text-[10px] text-stone-400 font-normal">
                {isArabic ? 'احفظ بطاقاتك لتراجعها لاحقاً' : 'Save your cards for later review'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportToAnki}
            disabled={isExporting || exportSuccess}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 px-3 py-2.5 text-xs font-black transition-all"
          >
            {isExporting ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-amber-400 rounded-full animate-spin" />
            ) : exportSuccess ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>{isArabic ? 'تم التصدير بنجاح' : 'Exported Successfully'}</span>
              </>
            ) : (
              <>
                <span>{isArabic ? 'تصدير بصيغة CSV' : 'Export as CSV'}</span>
              </>
            )}
          </button>
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
        <button
          type="button"
          onClick={onOpenPreferences}
          className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-bold text-xs hover:border-teal-500/50 transition text-start"
        >
          {isArabic ? 'إعدادات التطبيق واللغة' : 'App and language settings'}
        </button>

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
            onClick={handleExportToAnki}
            disabled={isExporting || exportSuccess}
            className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/20 disabled:opacity-50 transition flex items-center justify-between"
          >
            <span>
              {isExporting ? (isArabic ? 'جاري التصدير...' : 'Exporting...')
                : exportSuccess ? (isArabic ? 'تم التصدير بنجاح' : 'Exported Successfully')
                : (isArabic ? 'تصدير بطاقات الاستذكار إلى Anki (CSV)' : 'Export SRS Deck to Anki (CSV)')}
            </span>
            {isExporting ? (
              <span className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            ) : exportSuccess ? (
              <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
              <Download size={14} className="text-amber-400" />
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-bold text-xs hover:border-teal-500/50 transition flex items-center justify-between"
          >
            <span>{isArabic ? 'تصدير نسخة احتياطية (Export JSON)' : 'Export Backup (JSON)'}</span>
            <Download size={14} className="text-teal-400" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 font-bold text-xs hover:border-teal-500/50 transition flex items-center justify-between"
          >
            <span>{isArabic ? 'استعادة من نسخة احتياطية (Restore JSON)' : 'Restore from Backup (JSON)'}</span>
            <Upload size={14} className="text-teal-400" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleRestoreJson}
            className="hidden"
          />

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
