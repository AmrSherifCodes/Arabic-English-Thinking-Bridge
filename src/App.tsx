import { useState } from 'react';
import { ChoiceMenu, MenuRoute } from './features/menu/ChoiceMenu';
import { PreferencesView } from './features/preferences/PreferencesView';
import { VoicePracticeView } from './features/voice/VoicePracticeView';

type View = { name: 'menu' } | { name: 'route'; route: MenuRoute };

export default function App() {
  const [view, setView] = useState<View>({ name: 'menu' });
  const goHome = () => setView({ name: 'menu' });

  if (view.name === 'menu')
    return <ChoiceMenu dueCards={0} onSelect={(route) => setView({ name: 'route', route })} />;

  if (view.route === 'voice')       return <VoicePracticeView onBack={goHome} />;
  if (view.route === 'preferences') return <PreferencesView onBack={goHome} />;

  return (
    <div style={{ padding: 24, minHeight: '100dvh', background: 'var(--bg, #0b0d10)', color: 'var(--fg, #e9ecf1)' }}>
      <button onClick={goHome} style={{ minHeight: 48, padding: '8px 16px', borderRadius: 8, background: '#ffffff1a', color: 'inherit', border: 0, cursor: 'pointer', marginBottom: 16 }}>
        ← Back
      </button>
      <p>{view.route} screen is wired in Phase 2.3.</p>
    </div>
  );
}
