import React, { useEffect, useMemo, useState } from 'react';
import { useVoiceOrchestrator, VoiceState } from './useVoiceOrchestrator';
import { UserProgress } from '../../types';
import './voice.css';

const LABELS: Record<VoiceState, string> = {
  idle: 'Tap the mic to begin',
  listening: 'Listening… speak naturally',
  transcribing: 'Transcribing speech…',
  thinking: 'Thinking…',
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

import { TabTutorialModal } from '../../components/TabTutorialModal';
import { UserProfile } from '../../types';

interface VoicePracticeViewProps {
  onBack: () => void;
  progress?: UserProgress;
  profile?: UserProfile | null;
}

export function VoicePracticeView({ onBack, progress, profile }: VoicePracticeViewProps) {
  const [showGuide, setShowGuide] = useState(false);
  const {
    state,
    interimTranscript,
    currentAssistantText,
    messages,
    error,
    latencyMetrics,
    audioProgress,
    currentSpokenWordIndex,
    startTurn,
    stopTurn,
    handleManualText,
  } = useVoiceOrchestrator();

  const [textInput, setTextInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (error) setShowInput(true);
  }, [error]);

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
    if (state === 'listening') {
      stopTurn();
    } else {
      startTurn();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
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

  return (
    <div className="voice">
      <header className="voice__header">
        <button className="voice__back" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="voice__title-group">
          <span className="voice__title">Voice Practice</span>
          {latencyMetrics.ttfa != null && (
            <span className="voice__latency-badge">
              TTFA: {latencyMetrics.ttfa}ms
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="voice__type-toggle"
            onClick={() => setShowGuide(true)}
            aria-label="How voice practice works"
            title="Voice Guide"
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
        <p className="voice__status">{LABELS[state]}</p>

        {!isOnline && (
          <div className="voice__offline-banner" role="status">
            📡 You are offline. Voice streaming is paused, but you can practice using text.
          </div>
        )}

        {error && (
          <div className="voice__error-box">
            <p className="voice__error">{error}</p>
            {error.toLowerCase().includes('permission') && (
              <p className="voice__hint">
                Microphone access is blocked. Please enable permissions in your device settings or browser bar to speak with Amr.
              </p>
            )}
          </div>
        )}

        {/* Live Transcription Bubble with Duolingo-style Karaoke & New Word Badge */}
        {(interimTranscript || activeAiText) && (
          <div className="voice__bubble" aria-live="polite">
            {interimTranscript && (
              <div className="voice__bubble-user">
                <span className="voice__bubble-label">You:</span> {interimTranscript}
              </div>
            )}
            {activeAiText && (
              <div className="voice__bubble-ai">
                <div className="voice__bubble-header">
                  <span className="voice__bubble-label">Amr:</span>
                  {hasNewWordsInActive && (
                    <span className="voice__new-word-badge">★ NEW WORD</span>
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
            {messages.slice(-2).map((m) => {
              const msgWords = m.text.trim().split(/\s+/);
              return (
                <div
                  key={m.id}
                  className={`voice__history-item voice__history-item--${m.role}`}
                >
                  <strong>{m.role === 'user' ? 'You' : 'Amr'}:</strong>{' '}
                  {m.role === 'assistant' ? renderKaraokeWords(msgWords, false) : m.text}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showInput && (
        <form className="voice__input-bar" onSubmit={handleSendText}>
          <input
            type="text"
            className="voice__text-input"
            placeholder="Type your message here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="voice__send-btn">
            Send
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
