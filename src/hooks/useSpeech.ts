import { useCallback, useEffect, useRef, useState } from 'react';

interface RecAlt { transcript: string; confidence: number }
interface RecResult { readonly length: number; readonly isFinal: boolean; [i: number]: RecAlt }
interface RecEvent extends Event { readonly resultIndex: number; readonly results: { readonly length: number; [i: number]: RecResult } }
interface RecErrorEvent extends Event { readonly error: string; readonly message?: string }
interface RecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  onstart: (() => void) | null; onend: (() => void) | null;
  onerror: ((e: RecErrorEvent) => void) | null; onresult: ((e: RecEvent) => void) | null;
  start(): void; stop(): void; abort(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const hasTts = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export type SpeechErrorCode = 'stt-unsupported' | 'tts-unsupported' | 'permission-denied' | 'no-speech' | 'no-microphone' | 'network' | 'tts-no-voice' | 'tts-failed' | 'unknown';
export interface SpeechError { code: SpeechErrorCode; message: string; }
export interface UseSpeechOptions { defaultLang?: string; continuous?: boolean; }

function mapSttError(code: string): SpeechError {
  switch (code) {
    case 'not-allowed': case 'service-not-allowed': return { code: 'permission-denied', message: 'Microphone access blocked.' };
    case 'no-speech': return { code: 'no-speech', message: "Didn't hear anything." };
    case 'audio-capture': return { code: 'no-microphone', message: 'No microphone found.' };
    case 'network': return { code: 'network', message: 'Needs internet.' };
    default: return { code: 'unknown', message: `Error (${code}).` };
  }
}

function splitIntoChunks(text: string, max = 180): string[] {
  const sentences = text.match(/[^.!?؟\n]+[.!?؟]*/g) ?? [text];
  const out: string[] = []; let cur = '';
  for (const s of sentences) {
    const t = s.trim(); if (!t) continue;
    if (cur && `${cur} ${t}`.length > max) { out.push(cur); cur = t; } else { cur = cur ? `${cur} ${t}` : t; }
  }
  if (cur) out.push(cur); return out.length ? out : [text];
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const norm = (l: string) => l.toLowerCase().replace('_', '-'); const want = norm(lang); const primary = want.split('-')[0];
  return voices.find((v) => norm(v.lang) === want) ?? voices.find((v) => norm(v.lang).split('-')[0] === primary);
}

export function useSpeech({ defaultLang = 'en-US', continuous = false }: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recRef = useRef<RecognitionLike | null>(null);
  const finalRef = useRef(''); const interimRef = useRef(''); const speakTokenRef = useRef(0);
  const utterancesRef = useRef(new Set<SpeechSynthesisUtterance>());
  const isSttSupported = !!getRecognitionCtor(); const isTtsSupported = hasTts();

  useEffect(() => {
    if (!hasTts()) return; const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices()); load(); synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  const cancelSpeech = useCallback(() => { speakTokenRef.current++; if (hasTts()) window.speechSynthesis.cancel(); utterancesRef.current.clear(); setIsSpeaking(false); }, []);
  const stopListening = useCallback(() => recRef.current?.stop(), []);
  const abortListening = useCallback(() => recRef.current?.abort(), []);
  const resetTranscript = useCallback(() => { finalRef.current = ''; interimRef.current = ''; setTranscript(''); setInterimTranscript(''); }, []);

  const startListening = useCallback((lang: string = defaultLang) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) { setError({ code: 'stt-unsupported', message: 'Voice input unsupported.' }); return; }
    if (recRef.current) return; setError(null); resetTranscript(); cancelSpeech();
    const rec = new Ctor(); rec.lang = lang; rec.continuous = continuous; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]; const text = r[0]?.transcript ?? '';
        if (r.isFinal) finalRef.current = `${finalRef.current} ${text}`.trim(); else interim += text;
      }
      interimRef.current = interim.trim(); setTranscript(finalRef.current); setInterimTranscript(interimRef.current);
    };
    rec.onerror = (e) => { if (e.error !== 'aborted') setError(mapSttError(e.error)); };
    rec.onend = () => {
      recRef.current = null; setIsListening(false);
      if (interimRef.current) { finalRef.current = `${finalRef.current} ${interimRef.current}`.trim(); setTranscript(finalRef.current); interimRef.current = ''; setInterimTranscript(''); }
    };
    recRef.current = rec;
    try { rec.start(); } catch (e) { recRef.current = null; setIsListening(false); setError({ code: 'unknown', message: 'Could not start.' }); }
  }, [defaultLang, continuous, cancelSpeech, resetTranscript]);

  const speak = useCallback((text: string, lang: string = defaultLang, opts: { rate?: number; pitch?: number } = {}) =>
    new Promise<void>((resolve) => {
      if (!hasTts()) { setError({ code: 'tts-unsupported', message: 'TTS unsupported.' }); return resolve(); }
      const clean = text.trim(); if (!clean) return resolve();
      recRef.current?.abort(); window.speechSynthesis.cancel(); setError(null);
      const available = window.speechSynthesis.getVoices(); const voice = pickVoice(available, lang);
      if (available.length > 0 && !voice) { setError({ code: 'tts-no-voice', message: `No voice for ${lang}.` }); return resolve(); }
      const token = ++speakTokenRef.current; const chunks = splitIntoChunks(clean); let index = 0;
      const next = () => {
        if (token !== speakTokenRef.current) return resolve();
        if (index >= chunks.length) { setIsSpeaking(false); return resolve(); }
        const u = new SpeechSynthesisUtterance(chunks[index++]); u.lang = lang; if (voice) u.voice = voice; u.rate = opts.rate ?? 0.95;
        utterancesRef.current.add(u);
        u.onend = () => { utterancesRef.current.delete(u); next(); };
        u.onerror = (ev) => { utterancesRef.current.delete(u); if (token === speakTokenRef.current) { if (ev.error !== 'canceled') setError({ code: 'tts-failed', message: 'Audio failed.' }); setIsSpeaking(false); } resolve(); };
        window.speechSynthesis.speak(u);
      };
      setIsSpeaking(true); setTimeout(next, 50);
    }), [defaultLang]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') { recRef.current?.abort(); cancelSpeech(); } };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); recRef.current?.abort(); cancelSpeech(); };
  }, [cancelSpeech]);

  const hasVoiceFor = useCallback((lang: string) => !!pickVoice(voices, lang), [voices]);
  return { isListening, isSpeaking, transcript, interimTranscript, error, isSttSupported, isTtsSupported, voices, startListening, stopListening, abortListening, resetTranscript, speak, cancelSpeech, hasVoiceFor, clearError: () => setError(null) };
}
