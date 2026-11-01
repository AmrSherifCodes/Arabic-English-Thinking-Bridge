import { useEffect, useState } from 'react';
import { useVoiceOrchestrator, VoiceState } from './useVoiceOrchestrator';
import './voice.css';

const LABELS: Record<VoiceState, string> = {
  idle: 'Tap the mic to begin',
  listening: 'Listening… speak naturally',
  transcribing: 'Transcribing speech…',
  thinking: 'Thinking…',
  speaking: 'Speaking… (Tap to interrupt)',
};

export function VoicePracticeView({ onBack }: { onBack: () => void }) {
  const {
    state,
    interimTranscript,
    currentAssistantText,
    messages,
    error,
    latencyMetrics,
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
        <button
          className="voice__type-toggle"
          onClick={() => setShowInput((prev) => !prev)}
          aria-label="Toggle text input"
        >
          ⌨️
        </button>
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

        {/* Live Transcription Bubble */}
        {(interimTranscript || currentAssistantText) && (
          <div className="voice__bubble" aria-live="polite">
            {interimTranscript && (
              <div className="voice__bubble-user">
                <span className="voice__bubble-label">You:</span> {interimTranscript}
              </div>
            )}
            {currentAssistantText && (
              <div className="voice__bubble-ai">
                <span className="voice__bubble-label">Amr:</span> {currentAssistantText}
              </div>
            )}
          </div>
        )}

        {/* Last few messages transcript preview */}
        {messages.length > 0 && !interimTranscript && !currentAssistantText && (
          <div className="voice__history-preview">
            {messages.slice(-2).map((m) => (
              <div
                key={m.id}
                className={`voice__history-item voice__history-item--${m.role}`}
              >
                <strong>{m.role === 'user' ? 'You' : 'Amr'}:</strong> {m.text}
              </div>
            ))}
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
          className={`voice__mic ${state === 'speaking' || state === 'thinking' ? 'voice__mic--interrupt' : ''} ${state === 'listening' ? 'voice__mic--active' : ''}`}
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
    </div>
  );
}
