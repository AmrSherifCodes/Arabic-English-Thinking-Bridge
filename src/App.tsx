import { useState, useRef } from 'react';
import { ChoiceMenu, MenuRoute } from './features/menu/ChoiceMenu';
import { PreferencesView } from './features/preferences/PreferencesView';
import { VoicePracticeView } from './features/voice/VoicePracticeView';
import { FlashcardsView } from './features/flashcards/FlashcardsView';
import { useUserProfile } from './hooks/useUserProfile';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { UserProgress } from './types';
import { useAdaptiveLearning } from './hooks/useAdaptiveLearning';
import { AIHelper, AIHelperRequest } from './components/AIHelper';
import { LexiconEntry } from './services/geminiLexicon';
import { FlashcardItemData } from './components/uiConstants';
import { useDueCount } from './features/flashcards/useDueCount';

type View = { name: 'menu' } | { name: 'route'; route: MenuRoute };

export default function App() {
  const [view, setView] = useState<View>({ name: 'menu' });
  const { profile } = useUserProfile();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());
  const { recordAnswer } = useAdaptiveLearning();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [aiHelperRequest, setAiHelperRequest] = useState<AIHelperRequest | null>(null);
  const aiRequestIdRef = useRef(0);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2600);
  };

  const goHome = () => setView({ name: 'menu' });

  const updateAndSaveProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      const ok = saveUserProgress(next);
      if (!ok) showToast('Couldn’t save (using in-memory vault)');
      return next;
    });
  };

  const handleAskAIAboutCard = (card: FlashcardItemData) => {
    const currentWord: LexiconEntry = {
      arabicWord: card.ar,
      englishTranslation: card.en,
      partOfSpeech: 'phrase',
      situations: [],
      exampleSentenceArabic: card.ar,
      exampleSentenceEnglish: card.en,
      dialect: profile?.dialect ?? 'egyptian'
    };
    setAiHelperRequest({
      id: ++aiRequestIdRef.current,
      currentWord,
      prompt: `Explain this flashcard and its use: Arabic “${card.ar}” means “${card.en}”. Give one brief usage tip.`
    });
  };

  const dueCards = useDueCount(profile, progress);

  if (view.name === 'menu')
    return <ChoiceMenu dueCards={dueCards} onSelect={(route) => setView({ name: 'route', route })} />;

  if (view.route === 'voice')       return <VoicePracticeView onBack={goHome} />;
  if (view.route === 'preferences') return <PreferencesView onBack={goHome} />;
  if (view.route === 'flashcards') {
    return (
      <>
        <FlashcardsView
          profile={profile}
          progress={progress}
          updateAndSaveProgress={updateAndSaveProgress}
          onBack={goHome}
          onToast={showToast}
          onAnswer={recordAnswer}
          onAskAIAboutCard={handleAskAIAboutCard}
        />
        {profile && <AIHelper profile={profile} request={aiHelperRequest} />}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1c1917', color: '#f5f5f4', padding: '10px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600, border: '1px solid #44403c', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
            {toastMsg}
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ padding: 24, minHeight: '100dvh', background: 'var(--bg, #0b0d10)', color: 'var(--fg, #e9ecf1)' }}>
      <button onClick={goHome} style={{ minHeight: 48, padding: '8px 16px', borderRadius: 8, background: '#ffffff1a', color: 'inherit', border: 0, cursor: 'pointer', marginBottom: 16 }}>
        ← Back
      </button>
      <p>{view.route} screen is wired in Phase 2.3.</p>

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1c1917', color: '#f5f5f4', padding: '10px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600, border: '1px solid #44403c', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
