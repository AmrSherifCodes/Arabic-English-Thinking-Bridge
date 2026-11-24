import React, { useState } from 'react';
import { ProgressionState } from '../../progression/types';
import { UserProfile } from '../../types';
import { Shield, Download, Upload, Trash2, Settings, Brain, KeyRound, Crown, Gauge, Palette, Cloud, RefreshCw, Copy, Check, Bug, Send, Globe } from 'lucide-react';
import { buildDiagnosticPayload, loadErrorLog, sendApprovedErrorReport } from '../../utils/errorLogger';
import { GlobalTutorBrain } from '../../utils/OnlineLearningEngine';
import { useUiMode } from '../../utils/uiMode';
import {
  GuideMode,
  LearnerTrack,
  getLearnerTrackMeta,
  useGuidePreferences,
} from '../../utils/guideMode';
import { EntitlementState, EntitlementTier } from '../../types/entitlement';
import { getOrCreateDeviceId, hasProAccess, saveCachedEntitlement } from '../../services/entitlementService';
import { TrophyCabinet } from '../../features/gamification/TrophyCabinet';
import { PerfModeSetting, usePerfMode } from '../../utils/devicePerf';
import { AVATAR_FRAME_MAP, EconomyState, loadEconomyState, saveEconomyState, useEconomy } from '../../features/gamification/economy';
import { loadUserProgress, saveUserProgress } from '../../utils/storage';

const categoryLabelsAr: Record<string, string> = {
  copula: 'الرابط الخفي (is / am / are)',
  article: 'أدوات التعريف والتنكير',
  tense: 'الأزمنة',
  preposition: 'حروف الجر',
  word_order: 'ترتيب الجملة',
  vocabulary: 'المفردات',
  general: 'عام',
  grammar: 'قواعد الجملة',
  pronunciation: 'النطق',
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
    <div
      className="tb-card-surface p-5 rounded-3xl border space-y-4 shadow-xl text-start"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--ink)',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2 rounded-xl border shrink-0"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
            }}
          >
            <Brain size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black flex items-center gap-1.5 break-words" style={{ color: 'var(--ink)' }}>
              <span>{isArabic ? '🧠 نقاط قوتك ونقاط محتاجة تمرين' : 'Cognitive Strength Overview'}</span>
            </h4>
            <p className="text-[11px] font-medium leading-snug" style={{ color: 'var(--ink-muted)' }}>
              {isArabic ? 'تحليل ذكي على جهازك لنقاط قوتك والمهارات التي تحتاج تمريناً' : 'On-device analysis tracking your cognitive strengths'}
            </p>
          </div>
        </div>

        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0"
          style={{
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderColor: 'var(--accent)',
          }}
        >
          {isArabic ? `المستوى: ${diffLabel}` : `Level: ${profile.difficultyLevel}`}
        </span>
      </div>

      {/* Cognitive Concept Matrix */}
      <div className="space-y-2">
        <span className="text-xs font-bold block" style={{ color: 'var(--ink)' }}>
          {isArabic ? 'مهاراتك الأساسية:' : 'Core Skills:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(profile.errorWeights).map(([category, errWeight]) => {
            const isStrong = errWeight <= 0.4;
            const isWeak = errWeight >= 0.6;
            const borderColor = isStrong ? '#10B981' : isWeak ? '#EF4444' : '#F59E0B';
            const dotColor = isStrong ? 'bg-emerald-500' : isWeak ? 'bg-red-500' : 'bg-amber-500';
            const displayName = isArabic ? (categoryLabelsAr[category] || category.replace('_', ' ')) : category.replace('_', ' ');

            return (
              <div
                key={category}
                data-category={category.replace('_', ' ')}
                className="p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor,
                  color: 'var(--ink)',
                }}
              >
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                  <span className="text-xs font-black leading-snug break-words">
                    {displayName}
                  </span>
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                  {isStrong
                    ? (isArabic ? 'قوي 🟢' : 'Strong 🟢')
                    : isWeak
                      ? (isArabic ? 'يحتاج تمرين 🔴' : 'Needs Practice 🔴')
                      : (isArabic ? 'متوسط 🟡' : 'Medium 🟡')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Hyperparameters & Loss Strip */}
      <div
        className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div>
          <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'جولات التمرين' : 'Sessions'}</span>
          <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>{profile.epoch}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'مؤشر الدقة' : 'Accuracy Index'}</span>
          <span className="text-sm font-black" style={{ color: 'var(--gold)' }}>{profile.loss.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'سرعة التفكير' : 'Avg Speed'}</span>
          <span className="text-sm font-black" style={{ color: 'var(--ink)' }}>{(profile.avgReactionTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Neural Weight Nodes */}
      <div className="space-y-3 pt-1">
        {nodes.map((node) => {
          const percent = Math.round(node.weight * 100);
          return (
            <div key={node.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="break-words" style={{ color: 'var(--ink)' }}>{isArabic ? node.labelAr : node.labelEn}</span>
                <span className="font-mono text-xs font-black shrink-0" style={{ color: 'var(--accent)' }}>{percent}%</span>
              </div>
              <div
                className="w-full h-2.5 rounded-full overflow-hidden border"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%`, backgroundColor: 'var(--accent)' }}
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
  entitlement?: EntitlementState;
  onOpenActivateCode?: () => void;
  onOpenShop?: () => void;
  onOpenTeacherMode?: () => void;
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
  entitlement,
  onOpenActivateCode,
  onOpenShop,
  onOpenTeacherMode,
  onOpenPreferences,
  onExportData,
  onDeleteData,
  onOpenPrivacyPolicy,
  onToast,
  isArabic = true,
}: ProfileViewProps) {
  const [uiMode, setUiMode] = useUiMode();
  const {
    guideMode,
    learnerTrack,
    setGuideMode,
    setLearnerTrack,
  } = useGuidePreferences();
  const { setting: perfSetting, resolved: resolvedPerf, setPerfMode } = usePerfMode();
  const { economy } = useEconomy();
  const activeFrame = AVATAR_FRAME_MAP[economy.equippedFrame] || AVATAR_FRAME_MAP.classic;
  const activeTier = entitlement?.tier || 'free';
  const tierLabel =
    activeTier === 'pro'
      ? isArabic ? 'باقة Pro مفعّلة' : 'Pro Active'
      : activeTier === 'academy_student'
        ? isArabic ? 'طالب أكاديمية' : 'Academy Student'
        : activeTier === 'academy_teacher'
          ? isArabic ? 'معلم أكاديمية' : 'Academy Teacher'
          : isArabic ? 'مجاني للأبد' : 'Free Forever';

  const isProUnlocked = entitlement ? hasProAccess(entitlement) : false;
  const [backupTab, setBackupTab] = useState<'backup' | 'restore'>('backup');
  const [backupPin, setBackupPin] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [savedRecoveryCode, setSavedRecoveryCode] = useState<string | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [diagConfirmOpen, setDiagConfirmOpen] = useState(false);
  const [diagPreviewOpen, setDiagPreviewOpen] = useState(false);
  const [diagSending, setDiagSending] = useState(false);

  const handleConfirmSendDiagnostics = async () => {
    setDiagSending(true);
    const result = await sendApprovedErrorReport();
    setDiagSending(false);
    if (result.ok) {
      setDiagConfirmOpen(false);
      setDiagPreviewOpen(false);
      onToast?.(
        isArabic
          ? '✅ تم إرسال سجل الأعطال للمطور بنجاح.'
          : '✅ Diagnostic log sent to developer.'
      );
    } else if (result.error === 'RATE_LIMITED') {
      onToast?.(
        isArabic
          ? '⏳ تم الوصول للحد الأقصى مؤقتاً. حاول بعد 15 دقيقة.'
          : '⏳ Report limit reached. Try again in 15 minutes.'
      );
    } else {
      onToast?.(
        isArabic
          ? '⚠️ تعذر الإرسال حالياً. تأكد من الاتصال بالإنترنت.'
          : '⚠️ Unable to send right now. Check connection.'
      );
    }
  };

  const diagnosticConfirmBox = diagConfirmOpen ? (
    <div
      className="p-3.5 rounded-2xl border space-y-2.5 text-start"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)', color: 'var(--ink)' }}
    >
      <p className="text-xs font-black leading-relaxed" style={{ color: 'var(--ink)' }}>
        {isArabic
          ? `هل توافق على إرسال سجل الأعطال للمطور؟ (${loadErrorLog().length} سجل محلي — بدون أي بيانات شخصية)`
          : `Approve sending diagnostic log to developer? (${loadErrorLog().length} local log(s) — zero personal data)`}
      </p>
      <button
        type="button"
        onClick={() => setDiagPreviewOpen((prev) => !prev)}
        className="min-h-[48px] inline-flex items-center text-xs font-bold cursor-pointer"
        style={{ color: 'var(--accent)' }}
      >
        {diagPreviewOpen
          ? isArabic ? 'إخفاء تفاصيل التقرير' : 'Hide Report Preview'
          : isArabic ? 'معاينة تفاصيل التقرير' : 'Preview Report'}
      </button>
      {diagPreviewOpen && (
        <pre
          dir="ltr"
          className="max-h-40 overflow-auto rounded-xl border p-2 text-[10px] font-mono whitespace-pre-wrap break-words"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        >
          {JSON.stringify(buildDiagnosticPayload(), null, 2)}
        </pre>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={diagSending}
          onClick={handleConfirmSendDiagnostics}
          className="px-4 py-2 min-h-[48px] rounded-xl disabled:opacity-50 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          <Send size={13} />
          <span>
            {diagSending
              ? isArabic ? 'جاري الإرسال...' : 'Sending...'
              : isArabic ? 'موافق وإرسال التقرير' : 'Approve & Send'}
          </span>
        </button>
        <button
          type="button"
          disabled={diagSending}
          onClick={() => {
            setDiagConfirmOpen(false);
            setDiagPreviewOpen(false);
          }}
          className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-bold cursor-pointer"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  ) : null;

  const handleCloudSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(backupPin.trim())) {
      setBackupFeedback(isArabic ? 'أدخل رمز PIN من 4 أرقام.' : 'Enter a 4-digit numeric PIN.');
      return;
    }
    setBackupBusy(true);
    setBackupFeedback(null);
    try {
      const deviceId = getOrCreateDeviceId();
      const payload = {
        version: '8.0.0',
        savedAt: new Date().toISOString(),
        economy: loadEconomyState(),
        progression: state,
        userProgress: loadUserProgress(),
      };
      const res = await fetch('/api/backup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          pin: backupPin.trim(),
          recoveryCode: recoveryCodeInput.trim().toUpperCase() || savedRecoveryCode || undefined,
          payload,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        recoveryCode?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !data.recoveryCode) {
        const msg =
          data?.error === 'PRO_REQUIRED'
            ? isArabic
              ? 'النسخ السحابي متاح لمشتركي Pro والأكاديمية فقط.'
              : 'Cloud Backup is available for Pro & Academy members.'
            : data?.error === 'RATE_LIMITED'
              ? isArabic
                ? 'محاولات كثيرة. انتظر قليلاً وحاول مرة أخرى.'
                : 'Too many attempts. Please wait a bit.'
              : isArabic
                ? 'تعذر الحفظ السحابي حالياً. تأكد من الاتصال بالإنترنت.'
                : 'Unable to sync backup right now. Check connection.';
        setBackupFeedback(msg);
        return;
      }

      setSavedRecoveryCode(data.recoveryCode);
      setBackupPin('');
      const okMsg = isArabic
        ? `✅ تم حفظ النسخة السحابية! كود الاستعادة: ${data.recoveryCode}`
        : `✅ Cloud backup saved! Recovery code: ${data.recoveryCode}`;
      setBackupFeedback(okMsg);
      onToast?.(okMsg);
    } catch {
      setBackupFeedback(isArabic ? 'لا يوجد اتصال بالإنترنت.' : 'No internet connection.');
    } finally {
      setBackupBusy(false);
    }
  };

  const handleCloudRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = recoveryCodeInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,16}$/.test(code) || !/^\d{4}$/.test(backupPin.trim())) {
      setBackupFeedback(
        isArabic
          ? 'أدخل كود الاستعادة (6 أحرف/أرقام) ورمز PIN من 4 أرقام.'
          : 'Enter your 6-character Recovery Code and 4-digit PIN.'
      );
      return;
    }
    setBackupBusy(true);
    setBackupFeedback(null);
    try {
      const newDeviceId = getOrCreateDeviceId();
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryCode: code,
          pin: backupPin.trim(),
          newDeviceId,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        entitlement?: Partial<EntitlementState> | null;
        payload?: {
          economy?: EconomyState;
          progression?: ProgressionState;
          userProgress?: ReturnType<typeof loadUserProgress>;
        };
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        setBackupFeedback(
          data?.error === 'RATE_LIMITED'
            ? isArabic
              ? 'محاولات كثيرة جداً. انتظر 15 دقيقة.'
              : 'Too many attempts. Please wait 15 minutes.'
            : isArabic
              ? 'كود الاستعادة أو رمز PIN غير صحيح.'
              : 'Invalid recovery code or PIN.'
        );
        return;
      }

      if (data.entitlement?.tier) {
        saveCachedEntitlement({
          tier: data.entitlement.tier as EntitlementTier,
          cohortCode: data.entitlement.cohortCode ?? null,
          label: data.entitlement.label ?? null,
          activatedAt: data.entitlement.activatedAt ?? new Date().toISOString(),
          expiresAt: data.entitlement.expiresAt ?? null,
          lastSyncedAt: new Date().toISOString(),
          source: 'server',
        });
      }
      if (data.payload?.economy) {
        saveEconomyState(data.payload.economy);
      }
      if (data.payload?.progression) {
        try {
          localStorage.setItem('tb.progressionState', JSON.stringify(data.payload.progression));
        } catch {
          // Ignore storage quota errors
        }
      }
      if (data.payload?.userProgress) {
        saveUserProgress(data.payload.userProgress);
      }

      onToast?.(
        isArabic
          ? '✅ تم استعادة باقتك وعملاتك وتقدمك بنجاح! جاري التحديث...'
          : '✅ Pro tier, coins & progress restored! Reloading...'
      );
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      setBackupFeedback(isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach server.');
    } finally {
      setBackupBusy(false);
    }
  };

  const cloudBackupCard = (
    <div
      className="tb-card-surface p-4 rounded-3xl border space-y-3 shadow-xl text-start"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--ink)',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="p-2 rounded-xl border shrink-0"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
          >
            <Cloud size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black break-words" style={{ color: 'var(--ink)' }}>
              {isArabic ? 'النسخ الاحتياطي السحابي للهاتف' : 'Cloud Phone Backup'}
            </h4>
            <p className="text-[11px] leading-snug" style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? 'استعد اشتراكك وعملاتك وتقدمك على هاتف جديد في 10 ثوانٍ.'
                : 'Restore Pro tier, coins & progress onto a new phone in 10 seconds.'}
            </p>
          </div>
        </div>
        <div
          className="flex rounded-xl p-1 border text-xs font-black shrink-0"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            onClick={() => {
              setBackupTab('backup');
              setBackupFeedback(null);
            }}
            className="min-h-[48px] px-3.5 py-1.5 rounded-lg cursor-pointer transition"
            style={
              backupTab === 'backup'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }
                : { color: 'var(--ink-muted)' }
            }
          >
            {isArabic ? 'حفظ' : 'Backup'}
          </button>
          <button
            type="button"
            onClick={() => {
              setBackupTab('restore');
              setBackupFeedback(null);
            }}
            className="min-h-[48px] px-3.5 py-1.5 rounded-lg cursor-pointer transition"
            style={
              backupTab === 'restore'
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }
                : { color: 'var(--ink-muted)' }
            }
          >
            {isArabic ? 'استعادة' : 'Restore'}
          </button>
        </div>
      </div>

      {backupTab === 'backup' ? (
        isProUnlocked ? (
          <form onSubmit={handleCloudSync} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={backupPin}
                onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={isArabic ? 'رمز PIN من 4 أرقام' : '4-digit PIN'}
                dir="ltr"
                className="min-h-[48px] px-3 py-2.5 rounded-xl border text-xs font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
              <button
                type="submit"
                disabled={backupBusy || backupPin.length !== 4}
                className="min-h-[48px] px-4 py-2.5 rounded-xl disabled:opacity-50 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                <RefreshCw size={13} className={backupBusy ? 'animate-spin' : ''} />
                {isArabic ? 'حفظ النسخة السحابية' : 'Sync Cloud Backup'}
              </button>
            </div>
            {savedRecoveryCode && (
              <div
                className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs"
                style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--ink)' }}
              >
                <span>
                  {isArabic ? 'كود الاستعادة:' : 'Recovery Code:'}{' '}
                  <strong className="font-mono" style={{ color: 'var(--accent)' }} dir="ltr">
                    {savedRecoveryCode}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(savedRecoveryCode);
                      setCopiedRecovery(true);
                      window.setTimeout(() => setCopiedRecovery(false), 1800);
                    } catch { }
                  }}
                  className="min-h-[48px] px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  {copiedRecovery ? <Check size={14} /> : <Copy size={14} />}
                  {isArabic ? 'نسخ' : 'Copy'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <div
            className="p-3 rounded-2xl border flex items-center justify-between gap-2 flex-wrap text-xs"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <span style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? 'النسخ السحابي التلقائي متاح لمشتركي Pro والأكاديمية.'
                : 'Cloud phone backup is unlocked with Pro or Academy.'}
            </span>
            {onOpenActivateCode && (
              <button
                type="button"
                onClick={onOpenActivateCode}
                className="min-h-[48px] px-4 py-2 rounded-xl font-black cursor-pointer"
                style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
              >
                {isArabic ? 'تفعيل كود' : 'Activate Code'}
              </button>
            )}
          </div>
        )
      ) : (
        <form onSubmit={handleCloudRestore} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            maxLength={16}
            value={recoveryCodeInput}
            onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder={isArabic ? 'كود الاستعادة (6 أحرف)' : '6-char Code'}
            dir="ltr"
            className="min-h-[48px] px-3 py-2.5 rounded-xl border text-xs font-mono"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={backupPin}
            onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder={isArabic ? 'رمز PIN (4 أرقام)' : '4-digit PIN'}
            dir="ltr"
            className="min-h-[48px] px-3 py-2.5 rounded-xl border text-xs font-mono"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
          <button
            type="submit"
            disabled={backupBusy || recoveryCodeInput.length < 6 || backupPin.length !== 4}
            className="min-h-[48px] px-4 py-2.5 rounded-xl disabled:opacity-50 text-xs font-black cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            {backupBusy
              ? isArabic ? 'جاري الاستعادة...' : 'Restoring...'
              : isArabic ? 'استعادة الهاتف' : 'Restore Phone'}
          </button>
        </form>
      )}

      {backupFeedback && (
        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{backupFeedback}</p>
      )}
    </div>
  );

  const perfControlCard = (
    <div
      className="tb-card-surface p-4 rounded-3xl border space-y-3 text-start"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--ink)',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Gauge size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="min-w-0">
            <h4 className="text-sm font-black break-words" style={{ color: 'var(--ink)' }}>
              {isArabic ? 'الوضع الخفيف للأجهزة البسيطة' : 'Lite Mode for Low-End Devices'}
            </h4>
            <p className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
              {isArabic
                ? `الأداء الحالي: ${resolvedPerf === 'lite' ? 'خفيف (سريع وسلس)' : 'كامل (تأثيرات بصرية)'}`
                : `Active engine: ${resolvedPerf === 'lite' ? 'Lite (Flat 60 FPS)' : 'Rich (Visual FX)'}`}
            </p>
          </div>
        </div>
        {onOpenShop && (
          <button
            type="button"
            onClick={onOpenShop}
            className="min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
            }}
          >
            <Palette size={15} />
            <span>{isArabic ? `متجر الثيمات (🪙 ${economy.coins})` : `Theme Shop (🪙 ${economy.coins})`}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: 'auto', ar: 'تلقائي', en: 'Auto' },
            { id: 'lite', ar: 'خفيف ⚡', en: 'Lite ⚡' },
            { id: 'rich', ar: 'كامل ✨', en: 'Rich ✨' },
          ] as Array<{ id: PerfModeSetting; ar: string; en: string }>
        ).map((opt) => {
          const selected = perfSetting === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setPerfMode(opt.id);
                onToast?.(
                  isArabic
                    ? `تم ضبط وضع الأداء: ${opt.ar}`
                    : `Performance mode set to: ${opt.en}`
                );
              }}
              className="min-h-[48px] px-2.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition"
              style={
                selected
                  ? {
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    borderColor: 'var(--accent)',
                  }
                  : {
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    borderColor: 'var(--border)',
                  }
              }
            >
              {isArabic ? opt.ar : opt.en}
            </button>
          );
        })}
      </div>
    </div>
  );

  const guidePreferenceCard = (
    <div
      className="tb-card-surface p-4 rounded-3xl border space-y-3.5 text-start"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--ink)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Globe size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />
        <div className="min-w-0">
          <h4 className="text-sm font-black break-words" style={{ color: 'var(--ink)' }}>
            {isArabic ? 'لغة الشرح ومسار التعلم' : 'Guidance Language & Track'}
          </h4>
          <p className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
            {isArabic
              ? 'اختر لهجة الشرح أو وضع English-Guided (إنجليزي بالكامل + نطق صوتي للعربي)'
              : 'Switch between Everyday Egyptian, Standard Arabic, or 100% English-Guided (LTR + phonetics)'}
          </p>
        </div>
      </div>

      {/* 3-Mode Guidance Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(
          [
            { id: 'egyptian_ar', icon: '🇪🇬', ar: 'مصري بسيط', en: 'Egyptian Arabic' },
            { id: 'standard_ar', icon: '📖', ar: 'عربي فصيح', en: 'Standard Arabic' },
            { id: 'english_guided', icon: '🌍', ar: 'English-Guided', en: 'English-Guided' },
          ] as Array<{ id: GuideMode; icon: string; ar: string; en: string }>
        ).map((opt) => {
          const selected = guideMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setGuideMode(opt.id);
                onToast?.(
                  opt.id === 'english_guided'
                    ? '🌍 Switched to English-Guided (LTR + Phonetics)'
                    : opt.id === 'standard_ar'
                    ? '📖 تم التبديل إلى العربية الفصحى'
                    : '🇪🇬 تم التبديل إلى المصري البسيط'
                );
              }}
              className="min-h-[48px] px-3 py-2 rounded-xl text-xs font-black border cursor-pointer transition flex items-center justify-center gap-1.5"
              style={
                selected
                  ? {
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      borderColor: 'var(--accent)',
                    }
                  : {
                      backgroundColor: 'var(--bg)',
                      color: 'var(--ink)',
                      borderColor: 'var(--border)',
                    }
              }
            >
              <span>{opt.icon}</span>
              <span>{isArabic ? opt.ar : opt.en}</span>
            </button>
          );
        })}
      </div>

      {/* 4-Track Learner Role Selector */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>
          {isArabic ? 'مسارك الحالي:' : 'Your Track:'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(['starter', 'school_igcse', 'uni_career', 'teacher'] as LearnerTrack[]).map((trackId) => {
            const meta = getLearnerTrackMeta(trackId);
            const selected = learnerTrack === trackId;
            const label = isArabic
              ? guideMode === 'standard_ar'
                ? meta.labelMsa
                : meta.labelEg
              : meta.labelEn;
            return (
              <button
                key={trackId}
                type="button"
                onClick={() => {
                  setLearnerTrack(trackId);
                  if (trackId === 'teacher' && onOpenTeacherMode) {
                    onOpenTeacherMode();
                    return;
                  }
                  onToast?.(
                    isArabic
                      ? `${meta.icon} تم اختيار مسار: ${label}`
                      : `${meta.icon} Track updated: ${meta.labelEn}`
                  );
                }}
                className="min-h-[48px] px-3 py-2 rounded-xl text-xs font-black border cursor-pointer transition flex items-center justify-center gap-1.5"
                style={
                  selected
                    ? {
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        borderColor: 'var(--accent)',
                      }
                    : {
                        backgroundColor: 'var(--bg)',
                        color: 'var(--ink)',
                        borderColor: 'var(--border)',
                      }
                }
              >
                <span>{meta.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (uiMode === 'simple') {
    return (
      <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36 overflow-x-clip" dir={isArabic ? 'rtl' : 'ltr'}>
        <div
          className="tb-card-surface p-5 rounded-3xl border-2 shadow-xl text-start space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--accent)',
            color: 'var(--ink)',
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-black border"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
              }}
            >
              🟢 {isArabic ? 'الوضع البسيط' : 'Simple Mode'}
            </span>
            <button
              type="button"
              onClick={() => setUiMode('pro')}
              className="min-h-[48px] px-3.5 py-2 rounded-xl font-bold text-xs transition border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--gold)',
                color: 'var(--ink)',
              }}
            >
              ⚡ {isArabic ? 'التبديل للوضع المتقدم' : 'Switch to Pro Mode'}
            </button>
          </div>
          <h3 className="text-xl font-black" style={{ color: 'var(--ink)' }}>{isArabic ? 'حسابي وإنجازاتك' : 'Account & Progress'}</h3>
          <div className="grid grid-cols-1 min-[340px]:grid-cols-3 gap-3">
            <div
              className="p-3 rounded-2xl border text-center"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <span className="text-xl block">🔥</span>
              <span className="text-lg font-black" style={{ color: 'var(--gold)' }}>{state?.streak || 0}</span>
              <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'أيام الاستمرار' : 'Streak Days'}</span>
            </div>
            <div
              className="p-3 rounded-2xl border text-center"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <span className="text-xl block">🪙</span>
              <span className="text-lg font-black" style={{ color: 'var(--gold)' }}>{economy.coins}</span>
              <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'عملات الجسر' : 'Bridge Coins'}</span>
            </div>
            <div
              className="p-3 rounded-2xl border text-center"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <span className="text-xl block">✅</span>
              <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>{state?.completedLessonIds?.length || 0}</span>
              <span className="text-[11px] font-bold block" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'دروس مكتملة' : 'Completed Lessons'}</span>
            </div>
          </div>
        </div>

        {guidePreferenceCard}

        {perfControlCard}

        {cloudBackupCard}

        {/* Backup & Restore */}
        <div
          className="tb-card-surface p-5 rounded-3xl border space-y-3 shadow-xl text-start"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--ink)',
          }}
        >
          <h4 className="text-sm font-black" style={{ color: 'var(--ink)' }}>{isArabic ? 'حفظ واستعادة تقدمك' : 'Save & Restore Progress'}</h4>
          <div className="flex flex-wrap gap-2.5">
            {onExportData && (
              <button
                type="button"
                onClick={onExportData}
                className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <Download size={14} /> {isArabic ? 'حفظ نسخة من تقدمك' : 'Export Progress'}
              </button>
            )}
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <Shield size={14} /> {isArabic ? 'عن التطبيق والخصوصية' : 'About & Privacy'}
              </button>
            )}
            {onOpenActivateCode && (
              <button
                type="button"
                onClick={onOpenActivateCode}
                className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-black flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--gold-ink)' }}
              >
                <KeyRound size={14} /> {isArabic ? 'تفعيل كود Pro / أكاديمية' : 'Activate Pro / Academy Code'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setUiMode('pro')}
              className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              ⚡ {isArabic ? 'عرض كل أدوات الوضع المتقدم' : 'Show All Pro Tools'}
            </button>
            <button
              type="button"
              onClick={() => setDiagConfirmOpen((prev) => !prev)}
              className="px-4 py-2 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <Bug size={14} />
              <span>{isArabic ? 'إرسال سجل الأعطال للمطور' : 'Send Diagnostic Log to Dev'}</span>
            </button>
          </div>
          {diagnosticConfirmBox}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto pb-32 sm:pb-36 overflow-x-clip" dir={isArabic ? 'rtl' : 'ltr'}>
      <div
        className="tb-card-surface p-5 rounded-3xl border space-y-4 shadow-xl text-start"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--ink)',
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
              style={{
                border: `3px solid ${activeFrame.ringColor}`,
                backgroundColor: activeFrame.accentBg,
              }}
              aria-label={isArabic ? activeFrame.nameAr : activeFrame.nameEn}
            >
              {activeFrame.badge}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black break-words" style={{ color: 'var(--ink)' }}>{isArabic ? 'الملف الشخصي والإعدادات' : 'Profile & Settings'}</h3>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{isArabic ? 'إدارة بياناتك والخصوصية محلية 100%' : '100% local-first data & privacy'}</p>
            </div>
          </div>
          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className="px-3.5 py-2 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              <Settings size={14} />
              <span>{isArabic ? 'الإعدادات' : 'Preferences'}</span>
            </button>
          )}
        </div>

        {/* Plan & Voucher Activation Strip */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 flex-wrap"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="p-2 rounded-xl border shrink-0"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--gold)', borderColor: 'var(--gold)' }}
            >
              <Crown size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black" style={{ color: 'var(--ink)' }}>{tierLabel}</span>
                {entitlement?.cohortCode && (
                  <span
                    dir="ltr"
                    className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  >
                    {entitlement.cohortCode}
                  </span>
                )}
              </div>
              <p className="text-xs leading-snug" style={{ color: 'var(--ink-muted)' }}>
                {activeTier === 'free'
                  ? isArabic
                    ? 'معاك كود InstaPay أو أكاديمية؟ فعّله هنا.'
                    : 'Have an InstaPay or Academy voucher? Activate it here.'
                  : isArabic
                    ? 'مفعّل ومحفوظ للعمل بدون إنترنت على هذا الجهاز.'
                    : 'Active and cached for 100% offline use on this device.'}
              </p>
            </div>
          </div>
          {onOpenActivateCode && (
            <button
              type="button"
              onClick={onOpenActivateCode}
              className="px-4 py-2 min-h-[48px] rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--gold-ink)' }}
            >
              <KeyRound size={14} />
              <span>{isArabic ? 'تفعيل كود Pro / أكاديمية' : 'Activate Pro / Academy Code'}</span>
            </button>
          )}
        </div>
      </div>

      {guidePreferenceCard}

      {perfControlCard}

      <TrophyCabinet
        state={state}
        playerName={profile?.name || state.anonymousAlias || (isArabic ? 'بطل جسر التفكير' : 'Learner')}
        isPro={entitlement ? hasProAccess(entitlement) : false}
        isArabic={isArabic}
        onOpenActivateCode={onOpenActivateCode}
        onToast={onToast}
      />

      <BrainActivityMatrixCard isArabic={isArabic} />

      {cloudBackupCard}

      <div
        className="tb-card-surface p-5 rounded-3xl border space-y-3 shadow-xl text-start"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--ink)',
        }}
      >
        <h4 className="text-sm font-black" style={{ color: 'var(--ink)' }}>{isArabic ? 'إدارة البيانات والخصوصية' : 'Data & Privacy'}</h4>
        <div className="flex flex-wrap gap-2.5">
          {onExportData && (
            <button
              type="button"
              onClick={onExportData}
              className="px-4 py-2.5 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <Download size={14} />
              <span>{isArabic ? 'حفظ نسخة من تقدمك' : 'Export Progress'}</span>
            </button>
          )}

          <label
            className="px-4 py-2.5 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <Upload size={14} />
            <span>{isArabic ? 'استعادة نسخة محفوظة' : 'Import Backup File'}</span>
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
            type="button"
            onClick={async () => {
              try {
                const { exportToAnki } = await import('../../utils/ankiExport');
                await exportToAnki(state);
                onToast?.(isArabic ? '✅ تم تصدير بطاقات Anki (10,000 كلمة)' : 'Anki deck exported successfully!');
              } catch (err) {
                console.warn('Anki export error', err);
                onToast?.(isArabic ? '❌ تعذر تصدير بطاقات Anki حالياً' : 'Failed to export Anki deck');
              }
            }}
            className="px-4 py-2.5 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--gold)', color: 'var(--ink)' }}
          >
            <Download size={14} style={{ color: 'var(--gold)' }} />
            <span>{isArabic ? 'تصدير بطاقات Anki (10k)' : 'Export Anki Deck'}</span>
          </button>

          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="px-4 py-2.5 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <Shield size={14} />
              <span>{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setDiagConfirmOpen((prev) => !prev)}
            className="px-4 py-2.5 min-h-[48px] rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <Bug size={14} />
            <span>{isArabic ? 'إرسال سجل الأعطال للمطور' : 'Send Diagnostic Log to Dev'}</span>
          </button>
          {onDeleteData && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(isArabic ? 'هل تريد مسح تقدم التعلم محلياً؟ (سيتم الاحتفاظ بأي كود Pro أو أكاديمية مفعّل على جهازك).' : 'Clear local learning progress? (Any activated Pro/Academy license on this device will be preserved).')) {
                  onDeleteData();
                }
              }}
              className="px-4 py-2.5 min-h-[48px] rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-500 border border-red-500/40 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{isArabic ? 'مسح تقدم التعلم محلياً' : 'Clear Learning Data'}</span>
            </button>
          )}
        </div>
        {diagnosticConfirmBox}
      </div>
    </div>
  );
}
