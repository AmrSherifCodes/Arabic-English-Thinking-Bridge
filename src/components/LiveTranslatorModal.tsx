// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  X,
  Mic,
  Volume2,
  RotateCw,
  Trash2,
  BookmarkPlus,
  Check,
  Send,
  Download,
  Loader2,
  Plane,
  RefreshCw,
} from 'lucide-react';
import type { TargetLanguage } from '../types';
import {
  TranslatorLangCode,
  ModelStatusResult,
  WEB_OFFLINE_APK_BADGE_AR,
  WEB_OFFLINE_APK_BADGE_EN,
  normalizeTranslatorLang,
  getLocalTranslatorModelStatus,
  downloadLocalTranslatorModel,
  deleteLocalTranslatorModel,
  translateLocally,
} from '../native/localTranslator';
import { listenOnceForSpeech, stopActiveSpeechListening } from '../native/travelSpeech';
import { speakUnified } from '../utils/offlineTts';
import { unlockWordInBank, playPentatonicChime } from '../utils/wordBank';

interface LiveTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLang: TargetLanguage;
  isArabic?: boolean;
  onToast?: (msg: string) => void;
}

const LANG_META: Record<
  TranslatorLangCode,
  { codeUpper: string; flag: string; nativeLabel: string; arLabel: string; speakPrompt: string }
> = {
  en: { codeUpper: 'EN', flag: '🇬🇧', nativeLabel: 'English', arLabel: 'الإنجليزي', speakPrompt: 'Speak English' },
  de: { codeUpper: 'DE', flag: '🇩🇪', nativeLabel: 'Deutsch', arLabel: 'الألماني', speakPrompt: 'Speak Deutsch' },
  es: { codeUpper: 'ES', flag: '🇪🇸', nativeLabel: 'Español', arLabel: 'الإسباني', speakPrompt: 'Speak Español' },
  it: { codeUpper: 'IT', flag: '🇮🇹', nativeLabel: 'Italiano', arLabel: 'الإيطالي', speakPrompt: 'Speak Italiano' },
  fr: { codeUpper: 'FR', flag: '🇫🇷', nativeLabel: 'Français', arLabel: 'الفرنسي', speakPrompt: 'Speak Français' },
  ar: { codeUpper: 'AR', flag: '🇪🇬', nativeLabel: 'العربية', arLabel: 'العربي', speakPrompt: 'اتكلم عربي' },
};

const TARGET_PICKER_ORDER: TranslatorLangCode[] = ['en', 'de', 'es', 'it', 'fr'];

const EMERGENCY_CHIPS_AR = [
  'أين الحمام؟',
  'بكم هذا؟',
  'هل هذا حلال؟',
  'أحتاج مساعدة',
];

const EMERGENCY_CHIPS_EN = [
  'Where is the bathroom?',
  'How much is this?',
  'Is this Halal?',
  'I need help, please.',
];

export const LiveTranslatorModal: React.FC<LiveTranslatorModalProps> = ({
  isOpen,
  onClose,
  targetLang,
  isArabic = true,
  onToast,
}) => {
  const isNative = Capacitor.isNativePlatform();

  // If user is learning Arabic (EN -> AR), user side is EN and stranger side is AR.
  // Otherwise user side is AR and stranger side is the active target language (EN/DE/ES/IT/FR).
  const initialUserLang: TranslatorLangCode = targetLang === 'ar' ? 'en' : 'ar';
  const initialStrangerLang: TranslatorLangCode =
    targetLang === 'ar' ? 'ar' : normalizeTranslatorLang(targetLang);

  const [userLang, setUserLang] = useState<TranslatorLangCode>(initialUserLang);
  const [strangerLang, setStrangerLang] = useState<TranslatorLangCode>(initialStrangerLang);
  const [flipStrangerSide, setFlipStrangerSide] = useState(false);

  const [modelStatus, setModelStatus] = useState<ModelStatusResult | null>(null);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);

  const [userText, setUserText] = useState('');
  const [strangerText, setStrangerText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [listeningSide, setListeningSide] = useState<'user' | 'stranger' | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [lastEngine, setLastEngine] = useState<string>('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [savedToastKey, setSavedToastKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (targetLang === 'ar') {
      setUserLang('en');
      setStrangerLang('ar');
    } else {
      setUserLang('ar');
      setStrangerLang(normalizeTranslatorLang(targetLang));
    }
  }, [isOpen, targetLang]);

  const refreshModelStatus = useCallback(async (src: TranslatorLangCode, tgt: TranslatorLangCode) => {
    const status = await getLocalTranslatorModelStatus({ sourceLang: src, targetLang: tgt });
    setModelStatus(status);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void refreshModelStatus(userLang, strangerLang);
  }, [isOpen, userLang, strangerLang, refreshModelStatus]);

  useEffect(() => {
    if (!isOpen) {
      void stopActiveSpeechListening();
      setListeningSide(null);
    }
  }, [isOpen]);

  const userMeta = LANG_META[userLang];
  const strangerMeta = LANG_META[strangerLang];

  const emergencyChips = useMemo(
    () => (userLang === 'ar' ? EMERGENCY_CHIPS_AR : EMERGENCY_CHIPS_EN),
    [userLang]
  );

  const handleDownloadModel = async () => {
    if (!isNative || isDownloadingModel) return;
    setIsDownloadingModel(true);
    setStatusError(null);
    try {
      await downloadLocalTranslatorModel({ sourceLang: userLang, targetLang: strangerLang });
      await refreshModelStatus(userLang, strangerLang);
      playPentatonicChime(3);
      onToast?.(
        isArabic
          ? '✈️ تم تحميل نموذج الترجمة! يعمل الآن 100% بدون إنترنت'
          : '✈️ Offline translation model downloaded!'
      );
    } catch {
      setStatusError(
        isArabic
          ? 'تعذر تحميل النموذج الآن — تأكد من الاتصال بالإنترنت للتحميل مرة واحدة.'
          : 'Could not download model — check internet for one-time setup.'
      );
    } finally {
      setIsDownloadingModel(false);
    }
  };

  const handleDeleteModel = async () => {
    if (!isNative) return;
    try {
      const langToDelete = strangerLang === 'en' ? userLang : strangerLang;
      await deleteLocalTranslatorModel({ lang: langToDelete });
      await refreshModelStatus(userLang, strangerLang);
      onToast?.(
        isArabic
          ? `🗑️ تم مسح نموذج ${LANG_META[langToDelete].arLabel} وتوفير ~30 MB`
          : `🗑️ Deleted ${LANG_META[langToDelete].nativeLabel} model (~30 MB freed)`
      );
    } catch {}
  };

  const speakPhrase = useCallback((text: string, lang: TranslatorLangCode, rate = 1.0) => {
    if (!text.trim()) return;
    void speakUnified({ text, lang, rate });
  }, []);

  const runTranslation = useCallback(
    async (text: string, fromSide: 'user' | 'stranger') => {
      const clean = text.trim();
      if (!clean) return;
      setIsTranslating(true);
      setStatusError(null);

      const src = fromSide === 'user' ? userLang : strangerLang;
      const tgt = fromSide === 'user' ? strangerLang : userLang;

      if (fromSide === 'user') {
        setUserText(clean);
      } else {
        setStrangerText(clean);
      }

      try {
        const res = await translateLocally({ text: clean, sourceLang: src, targetLang: tgt });
        if (fromSide === 'user') {
          setStrangerText(res.translatedText);
        } else {
          setUserText(res.translatedText);
        }
        setLastLatencyMs(res.latencyMs);
        setLastEngine(res.engine);
        playPentatonicChime(1);
        // Auto-speak translated sentence aloud to the listener
        speakPhrase(res.translatedText, tgt, 1.0);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'MODEL_NOT_DOWNLOADED') {
          setStatusError(
            isArabic
              ? 'اضغط "تحميل نموذج الأوفلاين (~30 MB)" بالمنتصف لتفعيل الترجمة الكاملة بدون إنترنت.'
              : 'Tap "Download Offline Model (~30 MB)" in the center strip first.'
          );
        } else {
          setStatusError(isArabic ? 'حدث خطأ أثناء الترجمة المحلية.' : 'Local translation error.');
        }
      } finally {
        setIsTranslating(false);
      }
    },
    [isArabic, speakPhrase, strangerLang, userLang]
  );

  const handleMicTap = async (side: 'user' | 'stranger') => {
    if (listeningSide) {
      await stopActiveSpeechListening();
      setListeningSide(null);
      return;
    }

    const lang = side === 'user' ? userLang : strangerLang;
    setListeningSide(side);
    setStatusError(null);

    const result = await listenOnceForSpeech({
      lang,
      prompt: side === 'user' ? userMeta.speakPrompt : strangerMeta.speakPrompt,
      onPartial: (partial) => {
        if (side === 'user') setUserText(partial);
        else setStrangerText(partial);
      },
    });

    setListeningSide(null);
    if (result.transcript) {
      await runTranslation(result.transcript, side);
    } else if (result.error) {
      setStatusError(result.error);
    }
  };

  const handleSaveToWordBank = () => {
    if (!strangerText.trim() || !userText.trim()) return;
    const foreignText = userLang === 'ar' ? strangerText : userText;
    const arabicText = userLang === 'ar' ? userText : strangerText;
    const bankLang = userLang === 'ar' ? strangerLang : 'ar';

    unlockWordInBank({
      word: foreignText,
      translationAr: arabicText,
      targetLang: bankLang,
    });
    playPentatonicChime(4);
    setSavedToastKey(`${foreignText}::${Date.now()}`);
    onToast?.(
      isArabic ? '✅ تم الحفظ في بنك الكلمات بنجاح!' : '✅ Saved to your Personal Word Bank!'
    );
    window.setTimeout(() => setSavedToastKey(null), 1800);
  };

  const handleCycleStrangerLang = () => {
    if (userLang !== 'ar') {
      // EN -> AR mode: toggle to AR -> EN
      setUserLang('ar');
      setStrangerLang('en');
      return;
    }
    const idx = TARGET_PICKER_ORDER.indexOf(strangerLang);
    const next = TARGET_PICKER_ORDER[(idx + 1) % TARGET_PICKER_ORDER.length];
    setStrangerLang(next);
  };

  const handleClear = () => {
    setUserText('');
    setStrangerText('');
    setTypedInput('');
    setStatusError(null);
    setLastLatencyMs(null);
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const toTranslate = typedInput.trim();
    setTypedInput('');
    void runTranslation(toTranslate, 'user');
  };

  if (!isOpen) return null;

  const isDownloaded = Boolean(modelStatus?.downloaded);
  const canSave = Boolean(userText.trim() && strangerText.trim());

  return (
    <div
      data-testid="live-translator-modal"
      className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-3"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full sm:max-w-lg h-[100dvh] sm:h-[92dvh] max-h-[100dvh] flex flex-col overflow-hidden sm:rounded-3xl border shadow-2xl"
        style={{ backgroundColor: '#0B1120', borderColor: 'rgba(16, 185, 129, 0.4)' }}
      >
        {/* TOP HALF — STRANGER SIDE (Optional 180° Flip) */}
        <section
          data-testid="translator-stranger-half"
          className={`flex-1 min-h-0 flex flex-col justify-between p-3.5 sm:p-4 transition-transform duration-300 ${
            flipStrangerSide ? 'rotate-180' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #131C31 0%, #0E172A 100%)',
          }}
        >
          {/* Stranger Header Row */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs font-black">
              <span>{strangerMeta.flag}</span>
              <span>{strangerMeta.codeUpper} · {strangerMeta.nativeLabel}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {strangerText && (
                <>
                  <button
                    type="button"
                    data-testid="stranger-speak-normal"
                    onClick={() => speakPhrase(strangerText, strangerLang, 1.0)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-[#1B2742] border border-[#10B981]/40 text-[#10B981] text-xs font-black inline-flex items-center gap-1 cursor-pointer active:scale-95"
                    aria-label="Speak 1.0x"
                  >
                    <Volume2 size={14} />
                    <span>1.0x</span>
                  </button>
                  <button
                    type="button"
                    data-testid="stranger-speak-slow"
                    onClick={() => speakPhrase(strangerText, strangerLang, 0.75)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-[#1B2742] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-black inline-flex items-center gap-1 cursor-pointer active:scale-95"
                    aria-label="Speak 0.75x"
                  >
                    <span>🐢 0.75x</span>
                  </button>
                </>
              )}
              <button
                type="button"
                data-testid="live-translator-close"
                onClick={onClose}
                aria-label={isArabic ? 'إغلاق' : 'Close'}
                className="min-h-[38px] min-w-[38px] rounded-xl bg-[#1B2742] text-[#CBD5E1] flex items-center justify-center cursor-pointer active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Stranger Translated Text Display */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-2 py-1 overflow-hidden">
            {strangerText ? (
              <p
                data-testid="stranger-translated-text"
                dir={strangerLang === 'ar' ? 'rtl' : 'ltr'}
                className="text-xl sm:text-2xl font-black text-[#F8FAFC] leading-snug line-clamp-3"
              >
                {strangerText}
              </p>
            ) : (
              <p className="text-sm font-bold text-[#94A3B8]">
                {isArabic
                  ? `الترجمة الفورية بـ ${strangerMeta.arLabel} هتظهر وتتنطق هنا`
                  : `Instant ${strangerMeta.nativeLabel} translation will appear & speak here`}
              </p>
            )}
          </div>

          {/* Stranger Action Row: Emerald Mic + Save to Word Bank */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="stranger-mic-btn"
              onClick={() => void handleMicTap('stranger')}
              className={`flex-1 min-h-[48px] px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] tb-btn-3d ${
                listeningSide === 'stranger'
                  ? 'bg-rose-500 text-white border-2 border-rose-300 animate-pulse'
                  : 'tb-btn-emerald'
              }`}
            >
              <Mic size={18} />
              <span>
                {listeningSide === 'stranger'
                  ? isArabic
                    ? 'جاري الاستماع...'
                    : 'Listening...'
                  : `🎙️ ${strangerMeta.speakPrompt}`}
              </span>
            </button>

            {canSave && (
              <button
                type="button"
                data-testid="translator-save-wordbank"
                onClick={handleSaveToWordBank}
                className="min-h-[48px] px-3 rounded-2xl bg-[#1B2742] border border-[#F59E0B]/50 text-[#FBBF24] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                {savedToastKey ? <Check size={15} /> : <BookmarkPlus size={15} />}
                <span>{savedToastKey ? (isArabic ? 'تم الحفظ' : 'Saved') : (isArabic ? '+ حفظ' : '+ Save')}</span>
              </button>
            )}
          </div>
        </section>

        {/* CENTER DIVIDER STRIP */}
        <div
          data-testid="translator-center-strip"
          className="shrink-0 px-3 py-2 border-y flex flex-wrap items-center justify-between gap-2"
          style={{ backgroundColor: '#0B1120', borderColor: 'rgba(245, 158, 11, 0.35)' }}
        >
          {/* Language Pair Pill */}
          <button
            type="button"
            data-testid="translator-lang-pair-btn"
            onClick={handleCycleStrangerLang}
            className="min-h-[36px] px-3 py-1 rounded-xl bg-[#131C31] border border-[#22D3EE]/40 text-[#F8FAFC] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{userMeta.flag} {userMeta.codeUpper}</span>
            <span className="text-[#22D3EE]">⇄</span>
            <span>{strangerMeta.flag} {strangerMeta.codeUpper}</span>
            <RefreshCw size={12} className="text-[#22D3EE]" />
          </button>

          {/* Offline Status / Model Download / Web APK Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            {isNative ? (
              isDownloaded ? (
                <div className="inline-flex items-center gap-1">
                  <span
                    data-testid="translator-offline-ready-badge"
                    className="px-2.5 py-1 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[11px] font-black inline-flex items-center gap-1"
                  >
                    <Plane size={12} />
                    <span>{isArabic ? 'يعمل بدون إنترنت' : 'Offline Ready'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDeleteModel()}
                    title={isArabic ? 'مسح نموذج الأوفلاين (~30 MB)' : 'Delete offline model (~30 MB)'}
                    aria-label="Delete offline model"
                    className="min-h-[32px] min-w-[32px] rounded-lg bg-[#131C31] border border-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="translator-download-model-btn"
                  disabled={isDownloadingModel}
                  onClick={() => void handleDownloadModel()}
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/60 text-[#FBBF24] text-[11px] font-black inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {isDownloadingModel ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                  <span>
                    {isDownloadingModel
                      ? isArabic
                        ? 'جاري التحميل...'
                        : 'Downloading...'
                      : isArabic
                        ? `⬇️ تحميل الأوفلاين (~${modelStatus?.estimatedSizeMb || 30} MB)`
                        : `⬇️ Download Offline (~${modelStatus?.estimatedSizeMb || 30} MB)`}
                  </span>
                </button>
              )
            ) : (
              <span
                data-testid="translator-web-apk-badge"
                className="px-2.5 py-1 rounded-xl bg-[#131C31] border border-[#22D3EE]/35 text-[#CBD5E1] text-[10px] font-bold truncate max-w-[230px] sm:max-w-[280px]"
                title={isArabic ? WEB_OFFLINE_APK_BADGE_AR : WEB_OFFLINE_APK_BADGE_EN}
              >
                {isArabic ? WEB_OFFLINE_APK_BADGE_AR : WEB_OFFLINE_APK_BADGE_EN}
              </span>
            )}
          </div>

          {/* 180° Flip + Clear Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="translator-flip-btn"
              onClick={() => setFlipStrangerSide((v) => !v)}
              className={`min-h-[36px] px-2.5 py-1 rounded-xl border text-[11px] font-black inline-flex items-center gap-1 cursor-pointer active:scale-95 ${
                flipStrangerSide
                  ? 'bg-[#22D3EE] text-[#0B1120] border-[#22D3EE]'
                  : 'bg-[#131C31] text-[#CBD5E1] border-slate-700'
              }`}
              title={isArabic ? 'اقلب للشخص اللي قدامك 180°' : 'Flip 180° for stranger'}
            >
              <RotateCw size={13} />
              <span>{isArabic ? 'اقلب 180°' : 'Flip 180°'}</span>
            </button>
            <button
              type="button"
              data-testid="translator-clear-btn"
              onClick={handleClear}
              aria-label={isArabic ? 'مسح' : 'Clear'}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#131C31] border border-slate-700 text-slate-300 text-[11px] font-black cursor-pointer active:scale-95"
            >
              {isArabic ? 'مسح' : 'Clear'}
            </button>
          </div>
        </div>

        {/* BOTTOM HALF — YOUR SIDE (THUMB ZONE) */}
        <section
          data-testid="translator-user-half"
          className="flex-1 min-h-0 flex flex-col justify-between p-3.5 sm:p-4 gap-2"
          style={{ backgroundColor: '#0B1120' }}
        >
          {/* User Side Output / Status */}
          <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#94A3B8]">
              <span>
                {userMeta.flag} {isArabic ? 'كلامك' : 'Your Side'} ({userMeta.nativeLabel})
              </span>
              <div className="flex items-center gap-2">
                {lastLatencyMs !== null && (
                  <span className="px-2 py-0.5 rounded-full bg-[#131C31] border border-slate-700 text-[#22D3EE] text-[10px] font-black tabular-nums">
                    {lastEngine === 'mlkit-offline' ? '⚡ ML Kit' : '⚡ Offline'} · {lastLatencyMs}ms
                  </span>
                )}
                {userText && (
                  <button
                    type="button"
                    onClick={() => speakPhrase(userText, userLang, 1.0)}
                    className="px-2 py-0.5 rounded-lg bg-[#131C31] text-[#FBBF24] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {statusError ? (
              <p className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                {statusError}
              </p>
            ) : (
              <p
                data-testid="user-side-text"
                dir={userLang === 'ar' ? 'rtl' : 'ltr'}
                className="text-base sm:text-lg font-black text-[#F8FAFC] leading-snug line-clamp-2 min-h-[28px]"
              >
                {isTranslating
                  ? isArabic
                    ? 'جاري الترجمة محلياً...'
                    : 'Translating locally...'
                  : userText ||
                    (isArabic
                      ? 'اضغط الزر الذهبي واتكلم، أو اختار جملة طوارئ تحت 👇'
                      : 'Tap the Gold mic to speak, or tap an emergency chip below 👇')}
              </p>
            )}
          </div>

          {/* 4 Instant 1-Tap Emergency Survival Chips */}
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {emergencyChips.map((chip) => (
              <button
                key={chip}
                type="button"
                data-testid="translator-emergency-chip"
                onClick={() => void runTranslation(chip, 'user')}
                className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[#131C31] border border-slate-700/80 hover:border-[#F59E0B]/60 text-[#F8FAFC] text-xs font-bold truncate cursor-pointer active:scale-[0.98]"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Quick Keyboard Fallback Input */}
          <form onSubmit={handleTypedSubmit} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              data-testid="translator-text-input"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={
                isArabic ? 'أو اكتب جملة هنا للترجمة الفورية...' : 'Or type a sentence to translate...'
              }
              className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#131C31] border border-slate-700 text-[#F8FAFC] placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:border-[#F59E0B]"
            />
            <button
              type="submit"
              data-testid="translator-send-btn"
              aria-label={isArabic ? 'ترجم' : 'Translate'}
              className="min-h-[42px] min-w-[42px] rounded-xl bg-[#1B2742] border border-[#22D3EE]/50 text-[#22D3EE] flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Giant Warm Gold 3D Mic Button (Thumb Zone) */}
          <button
            type="button"
            data-testid="user-mic-btn"
            onClick={() => void handleMicTap('user')}
            className={`w-full min-h-[54px] rounded-2xl font-black text-base flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-[0.98] shrink-0 shadow-xl ${
              listeningSide === 'user'
                ? 'bg-rose-500 text-white border-2 border-rose-300 animate-pulse'
                : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-[#0B1120] border-b-4 border-[#B45309]'
            }`}
          >
            <Mic size={20} />
            <span>
              {listeningSide === 'user'
                ? isArabic
                  ? '🎙️ بسمعك دلوقتي... (اضغط للإيقاف)'
                  : '🎙️ Listening... (Tap to stop)'
                : userLang === 'ar'
                  ? '🎙️ اتكلم عربي'
                  : '🎙️ Speak English'}
            </span>
          </button>
        </section>
      </div>
    </div>
  );
};
