import { useState } from 'react';
import './voice.css';

type VoiceState = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';
const LABELS: Record<VoiceState, string> = {
  idle: 'Tap the mic to begin', listening: 'Listening…', transcribing: 'Transcribing…',
  thinking: 'Thinking…', speaking: 'Speaking…',
};

export function VoicePracticeView({ onBack }: { onBack: () => void }) {
  const [state] = useState<VoiceState>('idle');
  return (
    <div className="voice">
      <header className="voice__header">
        <button className="voice__back" onClick={onBack} aria-label="Back">←</button>
        <span>Voice Practice</span>
      </header>
      <div className="voice__stage">
        <div className={`voice__orb voice__orb--${state}`} aria-hidden />
        <p className="voice__status">{LABELS[state]}</p>
      </div>
      <button className="voice__mic" aria-label="Tap to speak">🎙️</button>
    </div>
  );
}

