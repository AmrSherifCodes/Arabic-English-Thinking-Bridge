import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import {
  Mic,
  Square,
  ChevronRight,
  ChevronLeft,
  Repeat,
  Volume2,
  Headphones,
  Crown,
  Sparkles,
} from 'lucide-react';
import { DualSpeedAudio } from '../../components/DualSpeedAudio';
import { useLanguagePair } from '../../hooks/useLanguagePair';
import { useEntitlement } from '../../hooks/useEntitlement';
import { useDailyProTimer } from '../../hooks/useDailyProTimer';
import { DailyProExpiredCard, DailyProTimerPill } from '../../components/DailyProTimerPill';
import { speakWithRate } from '../../utils/audio';

const LazyActivateCodeModal = React.lazy(() =>
  import('../../components/ActivateCodeModal').then((m) => ({ default: m.ActivateCodeModal }))
);

const PREFERRED_AUDIO_MIMES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  'audio/ogg;codecs=opus',
];

function negotiateAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  for (const mime of PREFERRED_AUDIO_MIMES) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    } catch {
      // Ignore browser-specific unsupported probes
    }
  }
  return undefined;
}

interface RecorderPhrase {
  target: string;
  ar: string;
  phonetic: string;
}

const PHRASES_BY_LANG: Record<string, RecorderPhrase[]> = {
  en: [
    { target: 'Hello, how are you?', ar: 'أهلاً، إزيك؟', phonetic: 'هيلو، هاو آر يو؟' },
    { target: 'I am ready', ar: 'أنا جاهز', phonetic: 'آي آم ريدي' },
    { target: 'Excuse me, where is the station?', ar: 'لو سمحت، المحطة فين؟', phonetic: 'إكسكيوز مي، وير إز ذا ستيشن؟' },
    { target: 'Please speak slowly', ar: 'من فضلك اتكلم بالراحة', phonetic: 'بليز سبيك سلولي' },
    { target: 'Thank you very much', ar: 'شكراً جزيلاً', phonetic: 'ثانك يو فيري ماتش' },
    { target: 'Could you help me, please?', ar: 'ممكن تساعدني لو سمحت؟', phonetic: 'كود يو هيلب مي، بليز؟' },
  ],
  de: [
    { target: 'Hallo, wie geht es dir?', ar: 'أهلاً، إزيك؟', phonetic: 'هالو، في جيت إس دير؟' },
    { target: 'Ich lerne Deutsch', ar: 'أنا أتعلم الألمانية', phonetic: 'إيش ليرنه دويتش' },
    { target: 'Entschuldigung, wo ist der Bahnhof?', ar: 'لو سمحت، محطة القطار فين؟', phonetic: 'إنتشولديجونج، فو إست دير بانهوف؟' },
    { target: 'Bitte sprechen Sie langsam', ar: 'من فضلك اتكلم بالراحة', phonetic: 'بيته شبريشن زي لانجزام' },
    { target: 'Vielen Dank', ar: 'شكراً جزيلاً', phonetic: 'فيلن دانك' },
    { target: 'Können Sie mir bitte helfen?', ar: 'ممكن تساعدني لو سمحت؟', phonetic: 'كونن زي مير بيته هيلفن؟' },
  ],
  es: [
    { target: 'Hola, ¿cómo estás?', ar: 'أهلاً، كيف حالك؟', phonetic: 'أولا، كومو إستاس؟' },
    { target: 'Estoy listo', ar: 'أنا جاهز', phonetic: 'إستوي ليستو' },
    { target: 'Disculpa, ¿dónde está la estación?', ar: 'لو سمحت، أين المحطة؟', phonetic: 'ديسكولبا، دوندي إستا لا إستاسيون؟' },
    { target: 'Habla más despacio, por favor', ar: 'من فضلك تحدث ببطء', phonetic: 'أبلا ماس ديسباثيو، بور فافور' },
    { target: 'Muchas gracias', ar: 'شكراً جزيلاً', phonetic: 'موتشاس جراثيياس' },
    { target: '¿Puedes ayudarme, por favor?', ar: 'هل يمكنك مساعدتي من فضلك؟', phonetic: 'بويديس أيودارمي، بور فافور؟' },
  ],
  fr: [
    { target: 'Bonjour, comment allez-vous ?', ar: 'مرحباً، كيف حالك؟', phonetic: 'بونجور، كومان تالي فو؟' },
    { target: 'Je suis prêt', ar: 'أنا جاهز', phonetic: 'جو سوي بري' },
    { target: 'Excusez-moi, où est la gare ?', ar: 'لو سمحت، أين المحطة؟', phonetic: 'إكسكوزي موا، أو إيه لا جار؟' },
    { target: 'Parlez lentement, s’il vous plaît', ar: 'تحدث ببطء من فضلك', phonetic: 'بارلي لونتمان، سيل فو بليه' },
    { target: 'Merci beaucoup', ar: 'شكراً جزيلاً', phonetic: 'ميرسي بوكو' },
    { target: 'Pouvez-vous m’aider ?', ar: 'هل يمكنك مساعدتي؟', phonetic: 'بوفي فو ميديه؟' },
  ],
  tr: [
    { target: 'Merhaba, nasılsın?', ar: 'أهلاً، كيف حالك؟', phonetic: 'مرحبا، ناصلسين؟' },
    { target: 'Hazırım', ar: 'أنا جاهز', phonetic: 'هاضرم' },
    { target: 'Affedersiniz, istasyon nerede?', ar: 'لو سمحت، أين المحطة؟', phonetic: 'أفيدرسينيز، إستاسيون نيريدي؟' },
    { target: 'Lütfen yavaş konuşun', ar: 'من فضلك تحدث ببطء', phonetic: 'لوتفن يافاش كونوشون' },
    { target: 'Çok teşekkür ederim', ar: 'شكراً جزيلاً', phonetic: 'تشوك تيشكور إيدريم' },
    { target: 'Bana yardım edebilir misiniz?', ar: 'هل يمكنك مساعدتي؟', phonetic: 'بانا يارديم إيديبيلير ميسينيز؟' },
  ],
  ja: [
    { target: 'こんにちは、元気ですか？', ar: 'أهلاً، إزيك؟', phonetic: 'كونيتشيوا، جينكي ديسكا؟' },
    { target: '準備ができました', ar: 'أنا جاهز', phonetic: 'جونبي جا ديكيماشتا' },
    { target: 'すみません、駅はどこですか？', ar: 'لو سمحت، المحطة فين؟', phonetic: 'سوميماسين، إيكي وا دوكو ديسكا؟' },
    { target: 'ゆっくり話してください', ar: 'من فضلك اتكلم بالراحة', phonetic: 'يوكوري هاناشيتي كوداساي' },
    { target: 'ありがとうございます', ar: 'شكراً جزيلاً', phonetic: 'أريجاتو جوزايماس' },
  ],
  it: [
    { target: 'Ciao, come stai?', ar: 'أهلاً، إزيك؟', phonetic: 'تشاو، كومي ستاي؟' },
    { target: 'Sono pronto', ar: 'أنا جاهز', phonetic: 'سونو برونتو' },
    { target: 'Scusi, dov’è la stazione?', ar: 'لو سمحت، المحطة فين؟', phonetic: 'سكوزي، دوفيه لا ستاتسيونيه؟' },
    { target: 'Grazie mille', ar: 'شكراً جزيلاً', phonetic: 'جراتسييه ميلّيه' },
  ],
  pt: [
    { target: 'Olá, tudo bem?', ar: 'أهلاً، إزيك؟', phonetic: 'أولا، تودو بيم؟' },
    { target: 'Estou pronto', ar: 'أنا جاهز', phonetic: 'إستو برونتو' },
    { target: 'Com licença, onde fica a estação?', ar: 'لو سمحت، المحطة فين؟', phonetic: 'كوم ليسينسا، أونجي فيكا أ إستاساو؟' },
    { target: 'Muito obrigado', ar: 'شكراً جزيلاً', phonetic: 'مويتو أوبريجادو' },
  ],
  ar: [
    { target: 'أهلاً، عامل إيه؟', ar: 'Hello, how are you?', phonetic: 'Ahlan, amel eh?' },
    { target: 'أنا جاهز دلوقتي', ar: 'I am ready now', phonetic: 'Ana gahiz delwa’ti' },
    { target: 'لو سمحت، المحطة فين؟', ar: 'Excuse me, where is the station?', phonetic: 'Law samaht, el-mahatta fein?' },
    { target: 'شكراً جزيلاً', ar: 'Thank you very much', phonetic: 'Shokran gazilan' },
  ],
};

interface PronunciationRecorderProps {
  targetLang?: string;
  isArabic?: boolean;
  onBackToLessons?: () => void;
  onToast?: (msg: string) => void;
}

type ShadowSpeed = 1 | 0.75;
type ActiveABPhase = 'idle' | 'native' | 'user';

export const PronunciationRecorder: React.FC<PronunciationRecorderProps> = ({
  targetLang,
  isArabic = true,
  onBackToLessons,
  onToast,
}) => {
  const { targetLang: pairTarget } = useLanguagePair();
  const { isPro } = useEntitlement();
  const activeTargetLang = (targetLang || pairTarget || 'en').split('-')[0].toLowerCase();
  const phrases = PHRASES_BY_LANG[activeTargetLang] || PHRASES_BY_LANG.en;

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedMime, setRecordedMime] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pro Voice Shadowing Studio state
  const [customSentence, setCustomSentence] = useState('');
  const [shadowSpeed, setShadowSpeed] = useState<ShadowSpeed>(1);
  const [isLoopingAB, setIsLoopingAB] = useState(false);
  const [activePhase, setActivePhase] = useState<ActiveABPhase>('idle');
  const [loopCount, setLoopCount] = useState(0);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const isUsingProStudio = isLoopingAB || customSentence.trim().length > 0;
  const { remainingSeconds, formattedRemaining, hasProAccess, isExpired, showPill } = useDailyProTimer({
    isPro,
    active: isUsingProStudio,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const activeStream = useRef<MediaStream | null>(null);
  const autoStopTimer = useRef<number | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const loopActiveRef = useRef(false);
  const audioChunks = useRef<BlobPart[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const createdBlobUrlsRef = useRef<Set<string>>(new Set());

  const activePhrase = phrases[currentIndex] || phrases[0];
  const activeTargetText = (hasProAccess && customSentence.trim()) ? customSentence.trim() : activePhrase.target;

  const revokeAllBlobUrls = useCallback(() => {
    createdBlobUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore already-revoked URLs
      }
    });
    createdBlobUrlsRef.current.clear();
  }, []);

  const stopShadowLoop = useCallback(() => {
    loopActiveRef.current = false;
    setIsLoopingAB(false);
    setActivePhase('idle');
    if (loopTimerRef.current) {
      window.clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (userAudioRef.current) {
      userAudioRef.current.onended = null;
      userAudioRef.current.onerror = null;
      userAudioRef.current.pause();
      try {
        userAudioRef.current.currentTime = 0;
      } catch {
        // Ignore seek errors before metadata loads
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore WebView speech synthesis errors
      }
    }
  }, []);

  const cleanupRecording = useCallback(() => {
    if (autoStopTimer.current) {
      window.clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    try {
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    } catch {
      // Ignore already stopped recorder
    }
    if (activeStream.current) {
      activeStream.current.getTracks().forEach((track) => track.stop());
      activeStream.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    stopShadowLoop();
    cleanupRecording();
    setCurrentIndex(0);
    setMicError(null);
    setRecordedMime(null);
    setAudioUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
        createdBlobUrlsRef.current.delete(prev);
      }
      return null;
    });
  }, [activeTargetLang, cleanupRecording, stopShadowLoop]);

  useEffect(() => {
    return () => {
      stopShadowLoop();
      cleanupRecording();
      revokeAllBlobUrls();
    };
  }, [cleanupRecording, revokeAllBlobUrls, stopShadowLoop]);

  const estimateSpeechDurationMs = (text: string, speed: ShadowSpeed): number => {
    const words = Math.max(2, text.trim().split(/\s+/).length);
    const baseMs = words * 430 + 700;
    return Math.min(7500, Math.round(baseMs / speed));
  };

  const playNativeReference = (speed: ShadowSpeed) => {
    stopShadowLoop();
    setActivePhase('native');
    speakWithRate(activeTargetText, speed);
    const estMs = estimateSpeechDurationMs(activeTargetText, speed);
    loopTimerRef.current = window.setTimeout(() => {
      setActivePhase('idle');
    }, estMs);
  };

  const playUserRecording = () => {
    if (!audioUrl || !userAudioRef.current) return;
    stopShadowLoop();
    setActivePhase('user');
    const audioEl = userAudioRef.current;
    audioEl.currentTime = 0;
    audioEl.onended = () => setActivePhase('idle');
    audioEl.onerror = () => setActivePhase('idle');
    audioEl.play().catch(() => setActivePhase('idle'));
  };

  const runABCycle = useCallback(
    (speed: ShadowSpeed) => {
      if (!loopActiveRef.current) return;

      // Phase A: Native audio at chosen speed (1.0x or 0.75x)
      setActivePhase('native');
      speakWithRate(activeTargetText, speed);
      const nativeWaitMs = estimateSpeechDurationMs(activeTargetText, speed);

      loopTimerRef.current = window.setTimeout(() => {
        if (!loopActiveRef.current) return;

        // Phase B: Learner's local recording
        const audioEl = userAudioRef.current;
        if (!audioEl || !audioUrl) {
          stopShadowLoop();
          return;
        }

        setActivePhase('user');
        try {
          audioEl.currentTime = 0;
        } catch {
          // Ignore seek errors
        }

        const scheduleNextCycle = () => {
          if (!loopActiveRef.current) return;
          setLoopCount((c) => c + 1);
          setActivePhase('idle');
          loopTimerRef.current = window.setTimeout(() => {
            if (loopActiveRef.current) {
              runABCycle(speed);
            }
          }, 650);
        };

        audioEl.onended = scheduleNextCycle;
        audioEl.onerror = () => stopShadowLoop();
        audioEl.play().catch(() => stopShadowLoop());
      }, nativeWaitMs);
    },
    [activeTargetText, audioUrl, stopShadowLoop]
  );

  useEffect(() => {
    if (isExpired && isLoopingAB) {
      stopShadowLoop();
    }
  }, [isExpired, isLoopingAB, stopShadowLoop]);

  const handleToggleABLoop = () => {
    if (!hasProAccess) {
      setActivateModalOpen(true);
      return;
    }

    if (isLoopingAB) {
      stopShadowLoop();
      return;
    }

    if (!audioUrl) {
      setMicError('🎙️ سجّل صوتك الأول لمدة ثواني عشان نبدأ حلقة المقارنة A/B.');
      return;
    }

    setMicError(null);
    setLoopCount(0);
    loopActiveRef.current = true;
    setIsLoopingAB(true);
    runABCycle(shadowSpeed);
  };

  const startRecording = async () => {
    stopShadowLoop();
    setMicError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function' ||
      typeof MediaRecorder === 'undefined'
    ) {
      setMicError('🎙️ المايكروفون غير مدعوم في المتصفح أو الجهاز ده حالياً — تقدر تسمع النطق الأصلي وتردده بصوتك عادي.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream.current = stream;

      const negotiatedMime = negotiateAudioMimeType();
      mediaRecorder.current = negotiatedMime
        ? new MediaRecorder(stream, { mimeType: negotiatedMime })
        : new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const finalMime = mediaRecorder.current?.mimeType || negotiatedMime || 'audio/mp4';
        const audioBlob = new Blob(audioChunks.current, { type: finalMime });
        const url = URL.createObjectURL(audioBlob);
        createdBlobUrlsRef.current.add(url);
        setRecordedMime(finalMime);
        setAudioUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
            createdBlobUrlsRef.current.delete(prev);
          }
          return url;
        });
        audioChunks.current = [];
        if (activeStream.current) {
          activeStream.current.getTracks().forEach((track) => track.stop());
          activeStream.current = null;
        }
      };

      audioChunks.current = [];
      mediaRecorder.current.start();
      setIsRecording(true);
      setAudioUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
          createdBlobUrlsRef.current.delete(prev);
        }
        return null;
      });

      const maxDurationMs = hasProAccess ? 10000 : 6000;
      autoStopTimer.current = window.setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          stopRecording();
        }
      }, maxDurationMs);
    } catch (err: any) {
      const errName = String(err?.name || '');
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errName === 'SecurityError') {
        setMicError('🚫 إذن المايكروفون مرفوض — افتح إعدادات التطبيق أو المتصفح واسمح بالوصول للمايكروفون عشان تسجّل صوتك.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setMicError('🎙️ مش لاقي مايكروفون متوصل بالجهاز حالياً — اتأكد إن المايك شغال وجرّب تاني.');
      } else {
        setMicError('⚠️ تعذّر تشغيل المايكروفون دلوقتي — اتأكد إن مفيش تطبيق تاني بيستخدمه وجرّب تاني.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (autoStopTimer.current) {
      window.clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    try {
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    } catch {
      // Ignore already stopped recorder
    }
    setIsRecording(false);
    if (activeStream.current) {
      activeStream.current.getTracks().forEach((track) => track.stop());
      activeStream.current = null;
    }
  };

  const handleChangePhrase = (nextIndex: number) => {
    stopShadowLoop();
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 p-5 sm:p-6 rounded-3xl max-w-lg w-full mx-auto text-center space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-black text-white flex items-center gap-2 text-start leading-snug break-words min-w-0">
          <span>🎙️ استوديو النطق و Shadowing</span>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {isPro ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/40 whitespace-nowrap">
              <Crown size={12} />
              <span>PRO</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setActivateModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-full border border-amber-500/40 whitespace-nowrap cursor-pointer transition"
            >
              <Sparkles size={12} />
              <span>فتح Pro</span>
            </button>
          )}
          <span
            dir="ltr"
            className="text-xs font-bold text-teal-400 bg-teal-500/15 px-2.5 py-1 rounded-full border border-teal-500/30 whitespace-nowrap text-center"
          >
            {currentIndex + 1} / {phrases.length}
          </span>
        </div>
      </div>

      <p className="text-xs text-stone-300 leading-relaxed">
        استمع للنطق الأصلي بسرعة <span dir="ltr" className="font-mono font-bold text-teal-300">1.0x</span> أو{' '}
        <span dir="ltr" className="font-mono font-bold text-teal-300">0.75x</span>، سجّل صوتك، وقارن نطقك محلياً 100% بدون رفع أي ملفات.
      </p>

      {/* Target Phrase Card */}
      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
        <span className="text-[10px] font-black uppercase text-amber-400 block">
          {hasProAccess && customSentence.trim() ? 'جملتك الخاصة للتدريب (Pro Shadowing):' : 'الجملة المستهدفة:'}
        </span>
        <h4 className="text-lg font-black text-white break-words" dir="ltr">
          {activeTargetText}
        </h4>
        {!(hasProAccess && customSentence.trim()) && (
          <>
            <p className="text-sm font-bold text-teal-300">{activePhrase.ar}</p>
            <p className="text-xs text-stone-400 italic">النطق بالعربي: {activePhrase.phonetic}</p>
          </>
        )}

        <div className="flex justify-center pt-2">
          <DualSpeedAudio text={activeTargetText} targetLang={activeTargetLang} showLabels={true} />
        </div>
      </div>

      {/* Phrase Switcher */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleChangePhrase(currentIndex > 0 ? currentIndex - 1 : phrases.length - 1)}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
        >
          <ChevronRight size={16} />
          <span>السابق</span>
        </button>
        <button
          type="button"
          onClick={() => handleChangePhrase(currentIndex < phrases.length - 1 ? currentIndex + 1 : 0)}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
        >
          <span>التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Free Single-Take Recorder Trigger */}
      <div className="flex flex-col items-center gap-2 py-1">
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex justify-center items-center hover:bg-red-500/30 transition-colors animate-pulse cursor-pointer shadow-lg"
            title="إيقاف التسجيل"
            aria-label="إيقاف التسجيل"
          >
            <Square className="fill-current" size={24} />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-teal-500 text-slate-950 flex justify-center items-center hover:bg-teal-400 transition-colors cursor-pointer shadow-xl"
            title="ابدأ التسجيل"
            aria-label="ابدأ التسجيل"
          >
            <Mic size={28} />
          </button>
        )}
        <span className="text-[11px] font-bold text-stone-400">
          {isRecording
            ? '🔴 جاري التسجيل محلياً على جهازك...'
            : hasProAccess
            ? 'تسجيل محلي (حتى 10 ثوانٍ) · متاح حلقة A/B'
            : 'التسجيل الفردي مجاني 100% · محلي على جهازك'}
        </span>
      </div>

      {micError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-bold leading-relaxed"
        >
          {micError}
        </div>
      )}

      {/* Recorded Take Playback (Free & Pro) */}
      {audioUrl && (
        <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs text-teal-300 font-bold">✅ تم التسجيل محلياً — استمع لصوتك:</span>
            {recordedMime && (
              <span dir="ltr" className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md">
                {recordedMime.split(';')[0]}
              </span>
            )}
          </div>
          <audio ref={userAudioRef} src={audioUrl} controls className="w-full h-10" />
        </div>
      )}

      {/* ================= PRO VOICE SHADOWING STUDIO (A/B LOOP) ================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 border border-amber-500/30 text-start space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Repeat size={16} className="text-amber-400 shrink-0" />
            <h4 className="text-xs sm:text-sm font-black text-white">
              استوديو المقارنة A/B (Voice Shadowing Loop)
            </h4>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${
              hasProAccess
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}
          >
            {isPro
              ? 'مفتوح (Pro) ✓'
              : hasProAccess
              ? `⏱ ${formattedRemaining} مجاني`
              : 'انتهى وقت اليوم'}
          </span>
        </div>

        <p className="text-[11px] text-stone-300 leading-relaxed">
          اسمع النطق الأصلي (A) متبوعاً بصوتك المسجّل (B) تلقائياً في حلقة متواصلة لملاحظة الفارق في النغمة والإيقاع — محلياً 100%.
        </p>

        {/* Speed Selector (1.0x vs 0.75x) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-stone-400">سرعة الصوت الأصلي (A):</span>
          <div className="inline-flex rounded-xl bg-stone-950 border border-stone-800 p-1 gap-1" dir="ltr">
            <button
              type="button"
              onClick={() => setShadowSpeed(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                shadowSpeed === 1
                  ? 'bg-teal-500 text-stone-950'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              1.0x Native
            </button>
            <button
              type="button"
              onClick={() => setShadowSpeed(0.75)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                shadowSpeed === 0.75
                  ? 'bg-amber-400 text-stone-950'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              0.75x Slow
            </button>
          </div>
        </div>

        {/* Side-by-Side A / B Comparison Deck */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => playNativeReference(shadowSpeed)}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              activePhase === 'native'
                ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-lg shadow-teal-500/15'
                : 'bg-stone-950/90 border-stone-800 text-stone-200 hover:border-teal-500/40'
            }`}
          >
            <Volume2 size={18} className="text-teal-400" />
            <span className="text-xs font-black">A · الأصلي ({shadowSpeed}x)</span>
            <span className="text-[10px] text-stone-400">نطق مرجعي</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!hasProAccess) {
                setActivateModalOpen(true);
                return;
              }
              playUserRecording();
            }}
            disabled={hasProAccess && !audioUrl}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 disabled:opacity-45 ${
              activePhase === 'user'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/15'
                : 'bg-stone-950/90 border-stone-800 text-stone-200 hover:border-amber-500/40'
            }`}
          >
            <Headphones size={18} className="text-amber-400" />
            <span className="text-xs font-black">B · صوتك المحلّي</span>
            <span className="text-[10px] text-stone-400">
              {audioUrl ? 'جاهز للمقارنة' : 'سجّل صوتك أولاً'}
            </span>
          </button>
        </div>

        {/* Custom English Sentence Input (Pro / Daily 15-min Pass) */}
        {hasProAccess ? (
          <div className="space-y-1.5">
            <label htmlFor="tb-shadow-custom" className="block text-[11px] font-bold text-stone-400">
              جرّب أي جملة إنجليزية مخصصة للـ Shadowing (اختياري):
            </label>
            <input
              id="tb-shadow-custom"
              type="text"
              dir="ltr"
              value={customSentence}
              onChange={(e) => setCustomSentence(e.target.value)}
              placeholder="e.g. I'd love to walk you through my experience..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder:text-stone-500 text-xs font-medium focus:outline-none focus:border-amber-400"
            />
          </div>
        ) : null}

        {/* Unlimited A/B Shadowing Loop CTA or Warm Daily Expiry Card */}
        {hasProAccess ? (
          <button
            type="button"
            onClick={handleToggleABLoop}
            className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              isLoopingAB
                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20'
            }`}
          >
            {isLoopingAB ? (
              <>
                <Square size={15} className="fill-current" />
                <span>إيقاف حلقة A/B (الدورة {loopCount + 1})</span>
              </>
            ) : (
              <>
                <Repeat size={16} />
                <span>تشغيل حلقة A/B تلقائياً ({shadowSpeed}x ← صوتك)</span>
              </>
            )}
          </button>
        ) : (
          <DailyProExpiredCard
            isArabic={isArabic}
            onOpenActivateCode={() => setActivateModalOpen(true)}
            onBackToLessons={onBackToLessons}
          />
        )}
      </div>

      <DailyProTimerPill
        visible={showPill}
        remainingSeconds={remainingSeconds}
        isArabic={isArabic}
        onClick={() => setActivateModalOpen(true)}
      />

      {activateModalOpen && (
        <Suspense fallback={null}>
          <LazyActivateCodeModal
            isOpen={activateModalOpen}
            onClose={() => setActivateModalOpen(false)}
            isArabic={isArabic}
            onToast={onToast}
          />
        </Suspense>
      )}
    </div>
  );
};
