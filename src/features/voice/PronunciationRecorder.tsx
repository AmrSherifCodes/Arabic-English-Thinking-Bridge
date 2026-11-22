import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, ChevronRight, ChevronLeft } from 'lucide-react';
import { DualSpeedAudio } from '../../components/DualSpeedAudio';
import { useLanguagePair } from '../../hooks/useLanguagePair';

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
}

export const PronunciationRecorder: React.FC<PronunciationRecorderProps> = ({ targetLang }) => {
  const { targetLang: pairTarget } = useLanguagePair();
  const activeTargetLang = (targetLang || pairTarget || 'en').split('-')[0].toLowerCase();
  const phrases = PHRASES_BY_LANG[activeTargetLang] || PHRASES_BY_LANG.en;

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const activeStream = useRef<MediaStream | null>(null);
  const autoStopTimer = useRef<number | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const cleanupRecording = () => {
    if (autoStopTimer.current) {
      window.clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    try {
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    } catch {}
    if (activeStream.current) {
      activeStream.current.getTracks().forEach((track) => track.stop());
      activeStream.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    cleanupRecording();
    setCurrentIndex(0);
    setMicError(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [activeTargetLang]);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const activePhrase = phrases[currentIndex] || phrases[0];

  const startRecording = async () => {
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
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
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
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      autoStopTimer.current = window.setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          stopRecording();
        }
      }, 5000);
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
    } catch {}
    setIsRecording(false);
    if (activeStream.current) {
      activeStream.current.getTracks().forEach((track) => track.stop());
      activeStream.current = null;
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-md w-full mx-auto text-center space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-black text-white flex items-center gap-2 text-start leading-snug break-words min-w-0">
          <span>🎙️ مُسجّل النطق المحلّي (Local Recorder)</span>
        </h3>
        <span
          dir="ltr"
          className="text-xs font-bold text-teal-400 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30 whitespace-nowrap min-w-[3.25rem] text-center shrink-0"
        >
          {currentIndex + 1} / {phrases.length}
        </span>
      </div>

      <p className="text-xs text-stone-300 leading-relaxed">
        استمع للنطق الأصلي، سجّل صوتك، وقارن نطقك 100% بدون إنترنت.
      </p>

      {/* Target Phrase Card */}
      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
        <span className="text-[10px] font-black uppercase text-amber-400 block">الجملة المستهدفة:</span>
        <h4 className="text-lg font-black text-white" dir="ltr">{activePhrase.target}</h4>
        <p className="text-sm font-bold text-teal-300">{activePhrase.ar}</p>
        <p className="text-xs text-stone-400 italic">النطق بالعربي: {activePhrase.phonetic}</p>

        <div className="flex justify-center pt-2">
          <DualSpeedAudio text={activePhrase.target} targetLang={activeTargetLang} showLabels={true} />
        </div>
      </div>

      {/* Phrase Switcher */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : phrases.length - 1))}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
        >
          <ChevronRight size={16} />
          <span>السابق</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev < phrases.length - 1 ? prev + 1 : 0))}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
        >
          <span>التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="flex justify-center items-center gap-4 py-2">
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex justify-center items-center hover:bg-red-500/30 transition-colors animate-pulse cursor-pointer shadow-lg"
            title="إيقاف التسجيل"
          >
            <Square className="fill-current" size={24} />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-teal-500 text-slate-950 flex justify-center items-center hover:bg-teal-400 transition-colors cursor-pointer shadow-xl"
            title="ابدأ التسجيل"
          >
            <Mic size={28} />
          </button>
        )}
      </div>

      {micError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-bold leading-relaxed"
        >
          {micError}
        </div>
      )}

      {audioUrl && (
        <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col items-center gap-2">
          <span className="text-xs text-teal-300 font-bold">✅ تم التسجيل بنجاح - استمع لصوتك:</span>
          <audio src={audioUrl} controls className="w-full max-w-[260px] h-10" />
        </div>
      )}
    </div>
  );
};
