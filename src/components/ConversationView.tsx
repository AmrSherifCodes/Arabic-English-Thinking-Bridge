import { TutorAvatar } from './TutorAvatar';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Square, Send, RotateCcw, Sparkles, Bot, User, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types';
import { createSpeechRecognition, isSpeechRecognitionSupported, speakWithRate, CLOUD_AI_VOICE_ID } from '../utils/audio';
import { sendConversationMessage, ConversationHistoryItem } from '../services/geminiLexicon';
import { generateSmartConversationReply } from '../services/smartConversation';
import { API_BASE_URL } from '../utils/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ConversationViewProps {
  profile: UserProfile;
  onToast: (msg: string) => void;
  preferredVoice?: string;
}

const STORAGE_KEY = 'tb.live_conversation_history';

function getTailoredTopicSuggestions(profile: UserProfile): Array<{ en: string; ar: string }> {
  const focus = String(profile.focusArea || '').toLowerCase();
  const goal = String(profile.goal || '').toLowerCase();

  if (focus.includes('chem') || focus.includes('science')) {
    return [
      { en: "Let's talk about a chemistry lab experiment.", ar: "يلا نتكلم عن تجربة في معمل الكيمياء" },
      { en: "How do catalysts speed up reactions?", ar: "إزاي العوامل الحفازة بتسرع التفاعلات؟" },
      { en: "Can you explain covalent bonding in simple words?", ar: "ممكن تشرحلي الروابط التساهمية ببساطة؟" }
    ];
  }

  if (goal === 'travel') {
    return [
      { en: "Hi! I need help checking into my hotel.", ar: "أهلاً! محتاج مساعدة في تسجيل الوصول بالفندق" },
      { en: "How do I order food politely at a restaurant?", ar: "إزاي أطلب أكل بذوق في المطعم؟" },
      { en: "Excuse me, can you give me directions to the airport?", ar: "لو سمحت، ممكن تدلني على طريق المطار؟" }
    ];
  }

  if (goal === 'work' || goal === 'business') {
    return [
      { en: "Let's practice a job interview in English.", ar: "يلا نتدرب على مقابلة عمل بالإنجليزي" },
      { en: "How do I handle a difficult customer politely?", ar: "إزاي أتعامل مع عميل زعلان باحترافية؟" },
      { en: "I want to give a short project status update.", ar: "عايز أقدم تحديث سريع عن حالة المشروع" }
    ];
  }

  return [
    { en: "Hi there! How is your day going?", ar: "أهلاً! يومك ماشي إزاي النهاردة؟" },
    { en: "I want to talk about my favorite hobbies.", ar: "عايز أتكلم عن هواياتي المفضلة" },
    { en: "Can you ask me a simple question to answer?", ar: "ممكن تسألني سؤال بسيط أجاوب عليه؟" }
  ];
}

function getInitialGreeting(profile: UserProfile): string {
  const name = profile.name ? ` ${profile.name}` : '';
  const goal = String(profile.goal || '').toLowerCase();

  if (goal === 'travel') {
    return `Hello${name}! ✈️ I'm your English speaking partner. Where would you like to travel, or what situation should we practice today?`;
  }
  if (goal === 'work' || goal === 'business') {
    return `Hello${name}! 💼 Ready to practice professional English? Tell me a little about your work or what you want to improve!`;
  }
  return `Hello${name}! 👋 I'm your Egyptian English speaking partner. Tap the microphone and talk to me naturally—don't worry about mistakes! How are you doing today?`;
}

export function ConversationView({ profile, onToast, preferredVoice }: ConversationViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: getInitialGreeting(profile),
        timestamp: Date.now()
      }
    ];
  });

  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recognizerRef = useRef<any | null>(null);
  const silenceTimerRef = useRef<any | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const speakingTimeoutRef = useRef<any | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRecognitionSupported(isSpeechRecognitionSupported());
  }, []);

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, conversationState]);

  // Clean up timers, audio & recognizer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
        } catch {}
        currentAudioRef.current = null;
      }
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startSilenceTimer = (ms = 5000) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    }, ms);
  };

  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (conversationState === 'speaking') {
      setConversationState('idle');
    }
  };

  const playBackendAudio = async (text: string) => {
    try {
      stopAudioPlayback();
      setConversationState('speaking');

      // Strip markdown / punctuation noise for clean speech synthesis
      const cleanText = text.replace(/[*_#`~]/g, '').trim();
      if (!cleanText) {
        setConversationState('idle');
        return;
      }

      const isAr = /[\u0600-\u06FF]/.test(cleanText);
      const targetLang = isAr ? 'ar-EG' : 'en-US';
      const targetVoice = isAr ? 'ar-EG-SalmaNeural' : (preferredVoice || 'en-US-AvaNeural');

      let playedBlob = false;
      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // Fast in-memory MP3 playback via /api/tts POST endpoint
      if (onlineNow) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const response = await fetch(`${API_BASE_URL}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cleanText,
              lang: targetLang,
              voice: targetVoice,
              rate: 1
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 200) {
              const blobUrl = URL.createObjectURL(blob);
              const audio = new Audio(blobUrl);
              currentAudioRef.current = audio;

              audio.onended = () => {
                URL.revokeObjectURL(blobUrl);
                currentAudioRef.current = null;
                setConversationState('idle');
              };

              audio.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                currentAudioRef.current = null;
                fallbackNativeSpeak(cleanText);
              };

              await audio.play();
              playedBlob = true;
            }
          }
        } catch (fetchErr) {
          console.warn('[ConversationView] Direct TTS blob fetch failed:', fetchErr);
        }
      }

      if (!playedBlob) {
        fallbackNativeSpeak(cleanText);
      }
    } catch (err) {
      console.error('[ConversationView] Audio playback failed:', err);
      fallbackNativeSpeak(text);
    }
  };

  const fallbackNativeSpeak = (cleanText: string) => {
    speakWithRate(cleanText, 1, preferredVoice || CLOUD_AI_VOICE_ID);
    const wordsCount = cleanText.split(/\s+/).length;
    const estimatedDurationMs = Math.max(2200, Math.min(22000, wordsCount * 420));
    speakingTimeoutRef.current = setTimeout(() => {
      setConversationState('idle');
    }, estimatedDurationMs);
  };

  const handleSendPrompt = async (userText: string) => {
    const clean = userText.trim();
    if (!clean) return;

    stopAudioPlayback();

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: clean,
      timestamp: Date.now()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLiveTranscript('');
    setConversationState('thinking');

    try {
      const historyPayload: ConversationHistoryItem[] = nextMessages
        .slice(-8)
        .map(m => ({ role: m.role, text: m.text }));

      let replyText = '';
      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // 1. Attempt Cloud AI (Gemini) if online with a fast 3.5s timeout
      if (onlineNow) {
        try {
          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Cloud timeout')), 3500)
          );
          replyText = await Promise.race([
            sendConversationMessage(clean, historyPayload, profile),
            timeoutPromise
          ]);
          console.log('[ConversationView] Fast reply from cloud AI:', replyText);
        } catch (cloudErr) {
          console.warn('[ConversationView] Fast cloud fallback engaged:', cloudErr);
        }
      }

      // 2. If Cloud AI returned empty or timed out, instantly use the deterministic conversational engine (<15ms)
      if (!replyText) {
        replyText = generateSmartConversationReply(clean, historyPayload, profile);
      }

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        text: replyText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      await playBackendAudio(replyText);
    } catch (err) {
      console.error('[ConversationView] Error communicating with tutor:', err);
      const fallback = generateSmartConversationReply(clean, [], profile);
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        text: fallback,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      await playBackendAudio(fallback);
    }
  };

  const handleToggleMic = () => {
    if (conversationState === 'listening') {
      // User tapped to stop listening
      clearSilenceTimer();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      return;
    }

    if (conversationState === 'speaking') {
      stopAudioPlayback();
    }

    const recognizer = createSpeechRecognition();
    if (!recognizer) {
      onToast('خاصية التعرف الصوتي غير مدعومة في هذا المتصفح. يمكنك الكتابة في المربع بالأسفل.');
      return;
    }

    recognizerRef.current = recognizer;
    setLiveTranscript('');
    setConversationState('listening');

    recognizer.onstart = () => {
      startSilenceTimer(5000);
    };

    recognizer.onaudiostart = () => {
      startSilenceTimer(5000);
    };

    recognizer.onspeechstart = () => {
      startSilenceTimer(6000);
    };

    recognizer.onresult = (event: any) => {
      clearSilenceTimer();
      let transcript = '';
      if (event.results && event.results[0] && event.results[0][0]) {
        transcript = event.results[0][0].transcript || '';
      }
      if (transcript.trim()) {
        setLiveTranscript(transcript);
        handleSendPrompt(transcript);
      }
    };

    recognizer.onerror = (event: any) => {
      clearSilenceTimer();
      setConversationState('idle');
      if (event.error === 'not-allowed') {
        onToast('تم حظر الميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onToast('حدث خطأ أثناء الاستماع للصوت.');
      }
    };

    recognizer.onend = () => {
      clearSilenceTimer();
      setConversationState(prev => (prev === 'listening' ? 'idle' : prev));
    };

    try {
      recognizer.start();
    } catch (err) {
      console.error('[ConversationView] Could not start speech recognition:', err);
      setConversationState('idle');
      onToast('تعذر تشغيل الميكروفون حالياً.');
    }
  };

  const handleResetConversation = () => {
    stopAudioPlayback();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch {}
    }
    const fresh = [
      {
        id: `msg-${Date.now()}-welcome`,
        role: 'model' as const,
        text: getInitialGreeting(profile),
        timestamp: Date.now()
      }
    ];
    setMessages(fresh);
    setConversationState('idle');
    setLiveTranscript('');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    onToast('تم بدء محادثة جديدة! 🚀');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const text = manualInput;
    setManualInput('');
    handleSendPrompt(text);
  };

  const topicSuggestions = getTailoredTopicSuggestions(profile);

  return (
    <div
      dir="rtl"
      className="mx-auto flex w-full max-w-2xl flex-col min-h-[calc(100dvh-12rem)] pb-24 ar"
    >
      {/* Top Header Card */}
      <header className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300">
              <Bot size={22} />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                المحادثة الصوتية المباشرة
              </h1>
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                Live Voice Partner · اتكلم والذكاء الاصطناعي هيرد عليك بصوته
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-xs ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
              }`}
            >
              {isOnline ? '🌐 Cloud AI' : '📱 Offline AI'}
            </span>

            <button
              type="button"
              onClick={handleResetConversation}
              title="بدء محادثة جديدة"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 transition"
            >
              <RotateCcw size={14} />
              <span>محادثة جديدة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Amr Animated AI Tutor Avatar & Speech Bubble */}
      <div className="mb-4 p-3.5 sm:p-4 rounded-3xl border border-teal-500/20 bg-gradient-to-r from-teal-50/50 via-white to-white dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 shadow-sm">
        <TutorAvatar
          isSpeaking={conversationState === 'speaking'}
          expression={conversationState === 'thinking' ? 'thinking' : 'happy'}
          size="md"
          speechText={
            conversationState === 'speaking'
              ? '🔊 بكلمك دلوقتي بالذكاء الاصطناعي... اسمع كويس وركز في النطق!'
              : conversationState === 'thinking'
              ? '🧠 بفكر في أفضل رد بالإنجليزي علشانك...'
              : conversationState === 'listening'
              ? '🔴 سامعك! اتكلم براحتك بالإنجليزي من غير قلق...'
              : 'أهلاً بيك! أنا عمرو شريف، شريكك الذكي للمحادثة. اضغط على المايك تحت وابدأ اتكلم معايا!'
          }
        />
      </div>


      {/* Center Stage: Giant Glowing Microphone Controller */}
      <div className="relative my-2 flex flex-col items-center justify-center rounded-3xl border border-teal-600/20 bg-gradient-to-b from-teal-50/50 via-white to-white dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 p-6 sm:p-8 shadow-sm text-center overflow-hidden">
        {/* State description banner */}
        <div className="mb-4">
          {conversationState === 'listening' ? (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-black text-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 سامعك... اتكلم بالإنجليزي (Listening...)</span>
            </motion.span>
          ) : conversationState === 'thinking' ? (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-black text-sm"
            >
              <Sparkles size={16} className="animate-spin text-amber-600 dark:text-amber-400" />
              <span>🧠 بيفكر في الرد... (Thinking...)</span>
            </motion.span>
          ) : conversationState === 'speaking' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-black text-sm"
            >
              <Volume2 size={16} className="animate-bounce text-emerald-600 dark:text-emerald-400" />
              <span>🔊 بيتكلم دلوقتي... (Speaking...)</span>
              <button
                type="button"
                onClick={stopAudioPlayback}
                className="ml-1 text-[11px] underline font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900"
              >
                وقف الصوت
              </button>
            </motion.div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-500/20 text-teal-800 dark:text-teal-300 font-bold text-xs">
              <Sparkles size={14} />
              <span>اضغط على المايك وابدأ المحادثة</span>
            </span>
          )}
        </div>

        {/* The Giant Glowing Microphone Button */}
        <div className="relative my-2 flex items-center justify-center">
          {/* Animated glow aura rings */}
          {conversationState === 'listening' && (
            <span
              aria-hidden="true"
              className="absolute -inset-4 sm:-inset-6 rounded-full bg-rose-500/20 animate-ping opacity-75"
            />
          )}
          {conversationState === 'speaking' && (
            <span
              aria-hidden="true"
              className="absolute -inset-4 sm:-inset-6 rounded-full bg-emerald-500/20 animate-pulse opacity-75"
            />
          )}

          <motion.button
            type="button"
            onClick={handleToggleMic}
            whileTap={{ scale: 0.92 }}
            animate={
              conversationState === 'listening'
                ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                : conversationState === 'speaking'
                ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 2 } }
                : { scale: 1 }
            }
            className={`relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full transition-all shadow-xl active:scale-95 ${
              conversationState === 'listening'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-500/30 shadow-rose-600/30'
                : conversationState === 'thinking'
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-8 ring-amber-500/30'
                : conversationState === 'speaking'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-500/30 shadow-emerald-600/30'
                : 'bg-teal-700 hover:bg-teal-800 text-white ring-8 ring-teal-600/20 shadow-teal-900/30'
            }`}
            aria-label={
              conversationState === 'listening'
                ? 'إيقاف الاستماع'
                : 'بدء التحدث بالإنجليزية'
            }
          >
            {conversationState === 'listening' ? (
              <MicOff size={42} strokeWidth={2.5} className="animate-pulse" />
            ) : conversationState === 'speaking' ? (
              <Volume2 size={42} strokeWidth={2.5} />
            ) : conversationState === 'thinking' ? (
              <Sparkles size={42} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Mic size={42} strokeWidth={2.5} />
            )}
          </motion.button>
        </div>

        {/* Live speech preview */}
        {liveTranscript && (
          <p className="mt-3 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 italic max-w-md mx-auto">
            &ldquo;{liveTranscript}&rdquo;
          </p>
        )}

        {/* Quick topic suggestion chips */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 w-full max-w-lg">
          <p className="text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-2">
            مواضيع مقترحة لبدء الكلام:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {topicSuggestions.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendPrompt(topic.en)}
                disabled={conversationState === 'thinking'}
                className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition text-right"
              >
                <span>{topic.ar}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Warning if speech recognition is not supported */}
      {!recognitionSupported && (
        <div className="my-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            متصفحك يحجب التعرف الصوتي السحابي (Brave/حماية الخصوصية). يمكنك الكتابة في المربع بالأسفل وسيصلك الرد الصوتي فوراً، أو تجربة شاشة &quot;Voice Practice&quot; المزودة بنظام التسجيل المباشر!
          </span>
        </div>
      )}

      {/* Scrolling Chat Messages Container */}
      <div className="mt-3 flex-1 space-y-3 px-1">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs font-medium text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-br-xs text-left'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-xs text-right'
                  }`}
                >
                  {/* Role Header & Actions */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 text-[11px] font-bold opacity-80">
                    <span className="flex items-center gap-1.5">
                      {isUser ? <User size={13} /> : <Bot size={13} />}
                      <span>{isUser ? 'أنت (You)' : 'المعلم الذكي (Tutor)'}</span>
                    </span>

                    {/* Audio replay button for AI messages */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => playBackendAudio(msg.text)}
                          title="استمع للرد (Listen)"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-stone-800 hover:bg-teal-100 dark:hover:bg-stone-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-stone-700 transition text-xs font-bold shadow-xs active:scale-95"
                        >
                          <Volume2 size={13} className="shrink-0 text-teal-700 dark:text-teal-400" />
                          <span>🔊 Listen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakWithRate(msg.text, 0.75, preferredVoice || CLOUD_AI_VOICE_ID)}
                          title="استمع ببطء (Slow)"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition text-xs font-bold"
                        >
                          <span>🐢 Slow</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={chatBottomRef} />
      </div>

      {/* Fallback Text Input Bar */}
      <form
        onSubmit={handleManualSubmit}
        className="mt-4 flex items-center gap-2 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-1.5 shadow-sm"
      >
        <input
          type="text"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          placeholder="اكتب رسالة بالإنجليزي أو اضغط على المايك بالأعلى..."
          disabled={conversationState === 'thinking'}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-900 dark:text-white placeholder-stone-500 focus:outline-none text-right font-medium"
        />
        <button
          type="submit"
          disabled={!manualInput.trim() || conversationState === 'thinking'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 hover:bg-teal-800 text-white transition disabled:opacity-40 disabled:pointer-events-none"
          title="إرسال"
        >
          <Send size={16} className="rtl-flip" />
        </button>
      </form>
    </div>
  );
}
