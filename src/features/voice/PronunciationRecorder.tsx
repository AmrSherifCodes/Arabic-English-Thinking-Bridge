import React, { useState, useRef } from 'react';
import { RTLIcon } from '../../components/RTLIcon';
import { Mic, Square, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { DualSpeedAudio } from '../../components/DualSpeedAudio';

const SAMPLE_PHRASES = [
  { en: 'Hello, how are you?', ar: 'أهلاً، إزيك؟', phonetic: 'هيلو، هاو آر يو؟' },
  { en: 'I am ready', ar: 'أنا جاهز', phonetic: 'آي آم ريدي' },
  { en: 'Excuse me, where is the station?', ar: 'لو سمحت، المحطة فين؟', phonetic: 'إكسكيوز مي، وير إز ذا ستيشن؟' },
  { en: 'Please speak slowly', ar: 'من فضلك اتكلم بالراحة', phonetic: 'بليز سبيك سلولي' },
  { en: 'Thank you very much', ar: 'شكراً جزيلاً', phonetic: 'ثانك يو فيري ماتش' },
  { en: 'Could you help me, please?', ar: 'ممكن تساعدني لو سمحت؟', phonetic: 'كود يو هيلب مي، بليز؟' },
];

export const PronunciationRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const activePhrase = SAMPLE_PHRASES[currentIndex] || SAMPLE_PHRASES[0];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        audioChunks.current = [];
      };

      audioChunks.current = [];
      mediaRecorder.current.start();
      setIsRecording(true);
      setAudioUrl(null);

      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          stopRecording();
        }
      }, 5000);

    } catch (err) {
      console.error('Failed to get local microphone access', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-md mx-auto text-center space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <span>🎙️ مُسجّل النطق المحلّي (Local Recorder)</span>
        </h3>
        <span className="text-xs font-bold text-teal-400 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30">
          {currentIndex + 1} / {SAMPLE_PHRASES.length}
        </span>
      </div>

      <p className="text-xs text-stone-300 leading-relaxed">
        استمع للنطق الأصلي، سجّل صوتك، وقارن نطقك 100% بدون إنترنت.
      </p>

      {/* Target Phrase Card */}
      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
        <span className="text-[10px] font-black uppercase text-amber-400 block">الجملة المستهدفة:</span>
        <h4 className="text-lg font-black text-white" dir="ltr">{activePhrase.en}</h4>
        <p className="text-sm font-bold text-teal-300">{activePhrase.ar}</p>
        <p className="text-xs text-stone-400 italic">النطق بالعربي: {activePhrase.phonetic}</p>

        <div className="flex justify-center pt-2">
          <DualSpeedAudio text={activePhrase.en} showLabels={true} />
        </div>
      </div>

      {/* Phrase Switcher */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : SAMPLE_PHRASES.length - 1))}
          className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition"
        >
          <ChevronRight size={16} />
          <span>السابق</span>
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev < SAMPLE_PHRASES.length - 1 ? prev + 1 : 0))}
          className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1 transition"
        >
          <span>التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="flex justify-center items-center gap-4 py-2">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex justify-center items-center hover:bg-red-500/30 transition-colors animate-pulse cursor-pointer shadow-lg"
            title="إيقاف التسجيل"
          >
            <Square className="fill-current" size={24} />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-teal-500 text-slate-950 flex justify-center items-center hover:bg-teal-400 transition-colors cursor-pointer shadow-xl"
            title="ابدأ التسجيل"
          >
            <Mic size={28} />
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col items-center gap-2">
          <span className="text-xs text-teal-300 font-bold">✅ تم التسجيل بنجاح - استمع لصوتك:</span>
          <audio src={audioUrl} controls className="w-full max-w-[260px] h-10" />
        </div>
      )}
    </div>
  );
};
