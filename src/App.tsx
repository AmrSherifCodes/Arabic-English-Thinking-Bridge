import { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { ChoiceMenu, MenuRoute } from './features/menu/ChoiceMenu';
import { PreferencesView } from './features/preferences/PreferencesView';
import { VoicePracticeView } from './features/voice/VoicePracticeView';
import { FlashcardsView } from './features/flashcards/FlashcardsView';
import { LessonView } from './features/lesson/LessonView';
import { CVModal } from './components/CVModal';
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
  const [cvOpen, setCvOpen] = useState(false);
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

  // Native Android Shell & Back Button Configuration
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0c0a09' }).catch(() => {});
      Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
    }
  }, []);

  // Android Hardware Back Button Handler
  useEffect(() => {
    let sub: Promise<any> | null = null;
    try {
      sub = CapApp.addListener('backButton', () => {
        setView(curr => {
          if (curr.name === 'route') {
            return { name: 'menu' };
          }
          CapApp.exitApp();
          return curr;
        });
      });
    } catch {
      // Non-native fallback
    }
    return () => {
      sub?.then(h => h.remove?.()).catch(() => {});
    };
  }, []);

  const openConstitution = () => {
    window.open(
      'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/blob/main/CONSTITUTION.md',
      '_blank',
      'noopener,noreferrer'
    );
  };

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

  return (
    <>
      {view.name === 'menu' && (
        <ChoiceMenu
          dueCards={dueCards}
          onSelect={(route) => setView({ name: 'route', route })}
          onOpenCV={() => setCvOpen(true)}
          onOpenConstitution={openConstitution}
        />
      )}

      {view.name === 'route' && view.route === 'voice' && (
        <VoicePracticeView onBack={goHome} />
      )}

      {view.name === 'route' && view.route === 'preferences' && (
        <PreferencesView onBack={goHome} />
      )}

      {view.name === 'route' && view.route === 'flashcards' && (
        <FlashcardsView
          profile={profile}
          progress={progress}
          updateAndSaveProgress={updateAndSaveProgress}
          onBack={goHome}
          onToast={showToast}
          onAnswer={recordAnswer}
          onAskAIAboutCard={handleAskAIAboutCard}
        />
      )}

      {view.name === 'route' && view.route === 'lesson' && (
        <LessonView
          profile={profile}
          progress={progress}
          updateAndSaveProgress={updateAndSaveProgress}
          onBack={goHome}
          onToast={showToast}
          preferredVoice={progress.preferredVoice}
        />
      )}

      {/* Floating CV Modal */}
      <CVModal isOpen={cvOpen} onClose={() => setCvOpen(false)} />

      {/* Floating AI Helper */}
      {profile && <AIHelper profile={profile} request={aiHelperRequest} />}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#1c1917',
            color: '#f5f5f4',
            padding: '10px 20px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #44403c',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
