import React, { useState, useRef } from 'react';
import { RTLIcon } from '../../components/RTLIcon';
import { Mic, Square, Activity } from 'lucide-react';

export const PronunciationRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

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

      // Auto stop after 5 seconds
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
    <div className="bg-surface border border-border p-6 rounded-2xl max-w-sm mx-auto text-center rtl:space-x-reverse">
      <h3 className="text-lg font-bold mb-2 flex justify-center items-center gap-2">
        <RTLIcon icon={Activity} className="text-teal-500" />
        مُسجّل النطق المحلّي
      </h3>
      <p className="text-sm text-muted mb-6">
        سجّل صوتك واستمع إليه محلياً للاستماع ومقارنة نطقك. الصوت محفوظ محلياً على جهازك ولا يغادر الجهاز نهائياً.
      </p>

      <div className="flex justify-center items-center gap-4 mb-6">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex justify-center items-center hover:bg-red-500/30 transition-colors animate-pulse"
          >
            <RTLIcon icon={Square} className="fill-current" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-teal-500 text-surface flex justify-center items-center hover:bg-teal-600 transition-colors"
          >
            <RTLIcon icon={Mic} className="w-8 h-8" />
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="text-xs text-teal-400 font-bold">تم التسجيل بنجاح - استمع لصوتك</span>
          <audio src={audioUrl} controls className="w-full max-w-[240px] h-10" />
        </div>
      )}
    </div>
  );
};
