import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useVoiceOrchestrator, VoiceState } from './useVoiceOrchestrator';
import { UserProfile, UserProgress, SourceLanguage, TargetLanguage } from '../../types';
import { unlockAudio } from '../../utils/audio';
import { TabTutorialModal } from '../../components/TabTutorialModal';
import { applyHabitWin } from '../../utils/habitPsychology';
import './voice.css';

const LABELS_AR: Record<VoiceState, string> = {
  idle: 'اضغط المايك للبدء في التحدث مع عمرو',
  listening: 'جاري الاستماع... اتكلم براحتك',
  transcribing: 'جاري تحويل كلامك لنص...',
  thinking: 'عمرو شريف يفكر في الرد...',
  speaking: 'عمرو شريف يتحدث... (اضغط للإيقاف)',
};

const LABELS_EN: Record<VoiceState, string> = {
  idle: 'Tap the mic to begin',
  listening: 'Listening… speak naturally',
  transcribing: 'Transcribing speech…',
  thinking: 'Amr is thinking…',
  speaking: 'Speaking… (Tap to interrupt)',
};

// Common conversational words that should not be flagged as "New Words"
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'am', 'is', 'are', 'was', 'were', 'been',
  'has', 'had', 'did', 'yes', 'no', 'can', 'could', 'how', 'why',
  'here', 'now', 'very', 'well', 'your', 'our', 'them', 'him',
  'hello', 'good', 'morning', 'evening', 'amr', 'thanks', 'thank'
]);

interface VoicePracticeViewProps {
  onBack: () => void;
  progress?: UserProgress;
  profile?: UserProfile | null;
  updateAndSaveProgress?: (updater: (prev: UserProgress) => UserProgress) => void;
  onToast?: (msg: string) => void;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
}

export function VoicePracticeView({
  onBack,
  progress,
  profile,
  updateAndSaveProgress,
  onToast,
  sourceLang = 'ar',
  targetLang = 'en'
}: VoicePracticeViewProps) {
  const [showGuide, setShowGuide] = useState(false);
  const {
    state,
    interimTranscript,
    currentAssistantText,
    messages,
    error,
    clearError,
    latencyMetrics,
    audioProgress,
    currentSpokenWordIndex,
    startTurn,
    stopTurn,
    handleManualText,
    pendingFeedbackDraft,
    submitPendingFeedback,
    cancelPendingFeedback,
  } = useVoiceOrchestrator(targetLang, sourceLang);

  const [textInput, setTextInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editedFeedbackText, setEditedFeedbackText] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (pendingFeedbackDraft) {
      setEditedFeedbackText(pendingFeedbackDraft.polishedMessage);
    }
  }, [pendingFeedbackDraft]);

  useEffect(() => {
    if (error) setShowInput(true);
  }, [error]);

  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && updateAndSaveProgress) {
        const todayKey = new Date().toISOString().split('T')[0];
        updateAndSaveProgress(prev => {
          const habit = applyHabitWin(prev, 5, todayKey);
          const prevReviewCount = prev.reviewHistory?.[todayKey] || 0;
          return {
            ...habit.nextProgress,
            lastActiveDate: todayKey,
            reviewHistory: {
              ...(prev.reviewHistory || {}),
              [todayKey]: prevReviewCount + 1
            }
          };
        });
      }
      prevMsgCountRef.current = messages.length;
    }
  }, [messages, updateAndSaveProgress]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setShowInput(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleMicClick = () => {
    unlockAudio();
    if (error) clearError();
    if (state === 'listening') {
      stopTurn();
    } else {
      startTurn();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    unlockAudio();
    if (error) clearError();
    handleManualText(textInput);
    setTextInput('');
    setShowInput(false);
  };

  // Build a set of words already practiced or known by the user
  const knownWordsSet = useMemo(() => {
    const set = new Set<string>();
    STOP_WORDS.forEach((w) => set.add(w));

    if (progress?.cards) {
      for (const key of Object.keys(progress.cards)) {
        const parts = key.split(':');
        if (parts[2]) {
          try {
            const phrase = decodeURIComponent(parts[2]).toLowerCase();
            phrase.split(/\s+/).forEach((w) => {
              const clean = w.replace(/[^\w]/g, '');
              if (clean) set.add(clean);
            });
          } catch {
            /* noop */
          }
        }
      }
    }
    return set;
  }, [progress?.cards]);

  // Determine active text for karaoke rendering
  const activeAiText =
    currentAssistantText ||
    (state === 'speaking' && messages.length > 0 && messages[messages.length - 1].role === 'assistant'
      ? messages[messages.length - 1].text
      : '');

  const words = useMemo(() => {
    return activeAiText.trim() ? activeAiText.trim().split(/\s+/) : [];
  }, [activeAiText]);

  const activeWordIndex = useMemo(() => {
    if (state !== 'speaking' || words.length === 0) return -1;
    if (currentSpokenWordIndex >= 0 && currentSpokenWordIndex < words.length) {
      return currentSpokenWordIndex;
    }
    return Math.min(words.length - 1, Math.max(0, Math.floor(audioProgress * words.length)));
  }, [state, words.length, currentSpokenWordIndex, audioProgress]);

  // Check if active sentence contains any new words
  const hasNewWordsInActive = useMemo(() => {
    return words.some((word) => {
      const clean = word.replace(/[^\w]/g, '').toLowerCase();
      return clean.length >= 4 && !knownWordsSet.has(clean) && !/[\u0600-\u06FF]/.test(word);
    });
  }, [words, knownWordsSet]);

  const renderKaraokeWords = (textWords: string[], isLive: boolean) => {
    return textWords.map((word, idx) => {
      const clean = word.replace(/[^\w]/g, '').toLowerCase();
      const isNewWord = clean.length >= 4 && !knownWordsSet.has(clean) && !/[\u0600-\u06FF]/.test(word);
      const isCurrentlySpoken = isLive && idx === activeWordIndex;

      return (
        <span
          key={`${word}-${idx}`}
          className={`voice__karaoke-word ${
            isCurrentlySpoken ? 'voice__karaoke-word--active' : ''
          } ${isNewWord ? 'voice__word--new' : ''}`}
        >
          {isNewWord ? '★ ' : ''}
          {word}{' '}
        </span>
      );
    });
  };

  const isAr = sourceLang === 'ar' || (profile?.language || 'arabic') === 'arabic';
  const currentLabels = isAr ? LABELS_AR : LABELS_EN;

  return (
    <div className="voice" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="voice__header">
        <button className="voice__back" onClick={onBack} aria-label={isAr ? 'رجوع' : 'Back'}>
          ←
        </button>
        <div className="voice__title-group">
          <span className="voice__title">{isAr ? 'تدريب المحادثة الصوتي' : 'Voice Practice'}</span>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30">
            {sourceLang === 'ar' ? '🇪🇬' : '🇬🇧'} ➔ {targetLang === 'de' ? '🇩🇪 Deutsch' : targetLang === 'ja' ? '🇯🇵 日本語' : '🇬🇧 English'}
          </span>
          {latencyMetrics.ttfa != null && (
            <span className="voice__latency-badge">
              TTFA: {latencyMetrics.ttfa}ms
            </span>
          )}
        </div>
        <div style={{ display: 'flex', items: 'center', gap: '8px' }}>
          <button
            type="button"
            className="voice__type-toggle"
            onClick={() => setShowGuide(true)}
            aria-label="How voice practice works"
            title={isAr ? 'دليل التدريب الصوتي' : 'Voice Guide'}
          >
            ❓
          </button>
          <button
            className="voice__type-toggle"
            onClick={() => setShowInput((prev) => !prev)}
            aria-label="Toggle text input"
          >
            ⌨️
          </button>
        </div>
      </header>

      <div className="voice__stage">
        <div
          className={`voice__orb voice__orb--${state}`}
          aria-hidden
          onClick={handleMicClick}
        />
        <p className="voice__status">{currentLabels[state]}</p>

        {!isOnline && (
          <div className="voice__offline-banner" role="status">
            {isAr
              ? '📡 أنت غير متصل بالإنترنت. التحدث الصوتي متوقف مؤقتاً، لكن يمكنك التدرب بالكتابة.'
              : '📡 You are offline. Voice streaming is paused, but you can practice using text.'}
          </div>
        )}

        {error && (
          <div className="voice__error-box">
            <div className="voice__error-row">
              <p className="voice__error">
                {isAr && error.includes('Could not transcribe audio')
                  ? 'تعذر التعرف الصوتي. يمكنك كتابة رسالتك أدناه والبدء فوراً!'
                  : error}
              </p>
              <button
                type="button"
                className="voice__error-dismiss"
                onClick={clearError}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
            {error.toLowerCase().includes('permission') && (
              <p className="voice__hint">
                {isAr
                  ? 'تم حظر الوصول إلى الميكروفون. يرجى تفعيل السماح بالميكروفون من إعدادات المتصفح للتحدث مع عمرو.'
                  : 'Microphone access is blocked. Please enable permissions in your device settings to speak with Amr.'}
              </p>
            )}
            {error.toLowerCase().includes('network') && (
              <p className="voice__hint">
                {isAr
                  ? '🦁 تستخدم متصفح Brave أو مانع التتبع؟ يتم تحويل التسجيل إلى وضع الصوت المباشر أو الكتابة أدناه!'
                  : '🦁 Using Brave or privacy shields? Direct recording is active, or you can practice by typing below!'}
              </p>
            )}
          </div>
        )}

        {/* Live Transcription Bubble with Duolingo-style Karaoke & New Word Badge */}
        {(interimTranscript || activeAiText) && (
          <div className="voice__bubble" aria-live="polite">
            {interimTranscript && (
              <div className="voice__bubble-user">
                <span className="voice__bubble-label">{isAr ? 'أنت:' : 'You:'}</span> {interimTranscript}
              </div>
            )}
            {activeAiText && (
              <div className="voice__bubble-ai">
                <div className="voice__bubble-header">
                  <span className="voice__bubble-label">{isAr ? 'عمرو:' : 'Amr:'}</span>
                  {hasNewWordsInActive && (
                    <span className="voice__new-word-badge">{isAr ? '★ كلمة جديدة' : '★ NEW WORD'}</span>
                  )}
                </div>
                <div className="voice__bubble-text">
                  {renderKaraokeWords(words, true)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last few messages transcript preview */}
        {messages.length > 0 && !interimTranscript && !activeAiText && (
          <div className="voice__history-preview">
            {messages.slice(-3).map((m) => {
              const msgWords = m.text.trim().split(/\s+/);
              return (
                <div
                  key={m.id}
                  className={`voice__history-item voice__history-item--${m.role}`}
                >
                  <strong>{m.role === 'user' ? (isAr ? 'أنت' : 'You') : (isAr ? 'عمرو' : 'Amr')}:</strong>{' '}
                  {m.role === 'assistant' ? renderKaraokeWords(msgWords, false) : m.text}
                  {m.feedbackStatus === 'sent' && (
                    <div className="voice__feedback-card-sent mt-1 text-[11px]">
                      ✅ تم إرسال رسالة الفيدباك للمطورين بنجاح 🚀
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Feedback Draft Confirmation Card */}
        {pendingFeedbackDraft && (
          <div className="voice__feedback-card w-full" role="region" aria-label="Feedback Draft">
            <div className="voice__feedback-card-header">
              <span className="voice__feedback-card-badge">
                {pendingFeedbackDraft.category === 'bug'
                  ? '🐛 مشكلة تقنية'
                  : pendingFeedbackDraft.category === 'content'
                  ? '📖 محتوى ومفردات'
                  : '💡 فكرة وميزة جديدة'}
              </span>
              <span className="voice__feedback-card-prompt">
                {sourceLang === 'ar' ? 'عايز أبعتها كفيدباك دلوقتي؟' : 'Send this as feedback now?'}
              </span>
            </div>

            <textarea
              className="voice__feedback-card-textarea"
              value={editedFeedbackText}
              onChange={(e) => setEditedFeedbackText(e.target.value)}
              placeholder={sourceLang === 'ar' ? 'عدّل نص الفيدباك هنا إذا أردت...' : 'Edit feedback note if you like...'}
            />

            <div className="voice__feedback-card-actions">
              <button
                type="button"
                className="voice__feedback-btn-cancel"
                onClick={() => cancelPendingFeedback(pendingFeedbackDraft)}
              >
                {sourceLang === 'ar' ? '❌ إلغاء' : '❌ Cancel'}
              </button>
              <button
                type="button"
                className="voice__feedback-btn-send"
                onClick={async () => {
                  const ok = await submitPendingFeedback(
                    pendingFeedbackDraft,
                    editedFeedbackText || pendingFeedbackDraft.polishedMessage
                  );
                  if (ok && onToast) {
                    onToast(
                      sourceLang === 'ar'
                        ? '🎉 شكراً ليك يا بطل! تم إرسال رسالتك لفريق التطوير بنجاح 🚀 +100 XP'
                        : '🎉 Thank you! Your feedback was sent directly to our team 🚀 +100 XP'
                    );
                  }
                }}
              >
                {sourceLang === 'ar' ? '🚀 أيوة، ابعتها دلوقتي!' : '🚀 Yes, Send Feedback!'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showInput && (
        <form className="voice__input-bar" onSubmit={handleSendText}>
          <input
            type="text"
            className="voice__text-input"
            placeholder={isAr ? 'اكتب رسالتك لعمرو هنا...' : 'Type your message here...'}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="voice__send-btn">
            {isAr ? 'إرسال' : 'Send'}
          </button>
        </form>
      )}

      <footer className="voice__footer">
        <button
          className={`voice__mic ${
            state === 'speaking' || state === 'thinking' ? 'voice__mic--interrupt' : ''
          } ${state === 'listening' ? 'voice__mic--active' : ''}`}
          onClick={handleMicClick}
          aria-label={
            state === 'speaking' || state === 'thinking'
              ? 'Interrupt and speak'
              : state === 'listening'
                ? 'Stop listening'
                : 'Tap to speak'
          }
        >
          {state === 'speaking' || state === 'thinking' ? '✋' : '🎙️'}
        </button>
      </footer>

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={profile?.language === 'arabic' ? 'arabic' : 'english'}
        initialTab="voice"
      />
    </div>
  );
}
