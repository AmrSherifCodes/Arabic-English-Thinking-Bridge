import React, { useEffect, useRef, useState } from 'react';
import { UserProfile, UserProgress } from '../../types';
import { DeckListView, ReviewView } from '../../components/CardsView';
import { useMasterDictionary } from '../../services/dictionaryLoader';
import { useDeckEngine } from './useDeckEngine';
import { PrebuiltDeck } from '../../data/prebuiltDecks';
import { EXPANDED_DECKS } from '../../data/expandedDecks';
import { PREBUILT_DECKS } from '../../data/prebuiltDecks';
import { GERMAN_PREBUILT_DECKS } from '../../data/curriculum/germanDecks';
import { JAPANESE_PREBUILT_DECKS } from '../../data/curriculum/japaneseDecks';
import { SPANISH_PREBUILT_DECKS } from '../../data/curriculum/spanishDecks';
import { SourceLanguage, TargetLanguage } from '../../types';
import { DeckDefinition, FlashcardItemData } from '../../components/uiConstants';
import { BTN_GHOST, BTN_PRIMARY } from '../../components/uiConstants';
import { uiText } from '../../utils/i18n';

const CORE_DECKS: DeckDefinition[] = [
  {
    id: 'phase-1',
    name: 'Phase 1: Foundations',
    subtitle: 'Lessons 1–8 · Copula, Possession & SVO Skeleton'
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Flow & Nuance',
    subtitle: 'Lessons 9–16 · Relative Clauses, Conditionals & Phrasal Verbs'
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Mastery & Register',
    subtitle: 'Lessons 17–24 · Inversion, Clefts, False Friends & C1 Collocations'
  },
  {
    id: 'custom',
    name: 'My Custom Translations',
    subtitle: 'Saved & bulk-imported from the Translate tab'
  },
  {
    id: 'master-dictionary',
    name: 'Master Dictionary',
    subtitle: 'Profile-matched Arabic vocabulary with examples (+10k words)'
  }
];

export interface FlashcardsViewProps {
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
  onBack: () => void;
  profile: UserProfile | null;
  progress: UserProgress;
  updateAndSaveProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onToast: (msg: string) => void;
  onAskAIAboutCard?: (card: FlashcardItemData) => void;
  onAnswer?: (isCorrect: boolean) => void;
  /** Optional deep-link: open this deck immediately instead of the deck list. */
  initialDeckId?: string;
}

export function FlashcardsView({
  onBack,
  profile,
  progress,
  updateAndSaveProgress,
  onToast,
  onAskAIAboutCard,
  onAnswer,
  initialDeckId,
  sourceLang = 'ar',
  targetLang = 'en'
}: FlashcardsViewProps) {
  const isGerman = targetLang === 'de';
  const isJapanese = targetLang === 'ja';
  const isSpanish = targetLang === 'es';
  const t = (en: string, ar: string) => uiText(profile?.language, en, ar);

  const localizedCoreDecks: DeckDefinition[] = CORE_DECKS.map((deck) => {
    switch (deck.id) {
      case 'phase-1':
        return {
          ...deck,
          name: t('Phase 1: Foundations', 'المرحلة ١: الأساسات'),
          subtitle: t(
            'Lessons 1–8 · Copula, Possession & SVO Skeleton',
            'الدروس ١–٨ · فعل الربط والملكية وبناء الجملة'
          ),
        };
      case 'phase-2':
        return {
          ...deck,
          name: t('Phase 2: Flow & Nuance', 'المرحلة ٢: الانسيابية والفروق الدقيقة'),
          subtitle: t(
            'Lessons 9–16 · Relative Clauses, Conditionals & Phrasal Verbs',
            'الدروس ٩–١٦ · الجمل الوصلية والشرطية والأفعال المركبة'
          ),
        };
      case 'phase-3':
        return {
          ...deck,
          name: t('Phase 3: Mastery & Register', 'المرحلة ٣: الإتقان والمستوى اللغوي'),
          subtitle: t(
            'Lessons 17–24 · Inversion, Clefts, False Friends & C1 Collocations',
            'الدروس ١٧–٢٤ · التقديم والتأكيد والأصدقاء الخادعون ومتلازمات C1'
          ),
        };
      case 'custom':
        return {
          ...deck,
          name: t('My Custom Translations', 'ترجماتي الخاصة'),
          subtitle: t(
            'Saved & bulk-imported from the Translate tab',
            'محفوظة ومستوردة من تبويب الترجمة'
          ),
        };
      case 'master-dictionary':
        return {
          ...deck,
          name: t('Master Dictionary', 'القاموس الشامل'),
          subtitle: t(
            'Profile-matched Arabic vocabulary with examples (+10k words)',
            'مفردات عربية مطابقة لملفك مع أمثلة (+١٠ آلاف كلمة)'
          ),
        };
      default:
        return deck;
    }
  });

  const activeCoreDecks = isGerman
    ? [
        { id: 'phase-1', name: 'Phase 1: Das Fundament', subtitle: 'Verb-Zweit-Regel (V2), Genders & Accusative Case' },
        { id: 'custom', name: 'My Custom German Cards', subtitle: 'Saved words and practice sentences' }
      ]
    : isJapanese
    ? [
        { id: 'phase-1', name: 'Phase 1: 基礎 The Skeleton', subtitle: 'SOV word order, Particles (は, を, に) & Furigana' },
        { id: 'custom', name: 'My Custom Japanese Cards', subtitle: 'Saved words, kanji, and practice sentences' }
      ]
    : isSpanish
    ? [
        { id: 'phase-1', name: 'Phase 1: Los Cimientos', subtitle: 'Gendered articles, ser/estar & present tense' },
        { id: 'phase-2', name: 'Phase 2: Conexiones y Pasado', subtitle: 'Preterite/imperfect, pronouns & por/para' },
        { id: 'phase-3', name: 'Phase 3: Dominio', subtitle: 'Subjunctive, conditional & business register' },
        { id: 'custom', name: 'My Custom Spanish Cards', subtitle: 'Saved words and practice sentences' }
      ]
    : localizedCoreDecks;

  const activePrebuiltDecks = isGerman
    ? GERMAN_PREBUILT_DECKS
    : isJapanese
    ? JAPANESE_PREBUILT_DECKS
    : isSpanish
    ? SPANISH_PREBUILT_DECKS
    : isSpanish
    ? SPANISH_PREBUILT_DECKS
    : PREBUILT_DECKS;

  const activeExpandedDecks = (isGerman || isJapanese || isSpanish) ? [] : EXPANDED_DECKS;
  const { entries: dictionaryEntries } = useMasterDictionary();
  const [attributionDeck, setAttributionDeck] = useState<PrebuiltDeck | null>(null);

  const engine = useDeckEngine(
    progress,
    updateAndSaveProgress,
    profile,
    dictionaryEntries,
    onAskAIAboutCard || (() => {}),
    onToast,
    onAnswer,
    sourceLang,
    targetLang
  );

  // Deep-link from the path checkpoints: open the requested deck once.
  const didAutoOpenDeck = useRef(false);
  useEffect(() => {
    if (didAutoOpenDeck.current || !initialDeckId) return;
    didAutoOpenDeck.current = true;
    engine.handleSelectDeck(initialDeckId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDeckId]);

  const handleDownloadOpenSourceDeck = (deck: PrebuiltDeck) => {
    updateAndSaveProgress(prev => ({
      ...prev,
      importedDecks: Array.from(new Set([...(prev.importedDecks || []), deck.id]))
    }));
    onToast(t(`Downloaded ${deck.name} to your decks!`, `تم تنزيل ${deck.name} إلى مجموعاتك!`));
  };

  const handleDownloadAllExpandedDecks = () => {
    updateAndSaveProgress(prev => ({
      ...prev,
      importedDecks: Array.from(new Set([
        ...(prev.importedDecks || []),
        ...EXPANDED_DECKS.map(d => d.id)
      ]))
    }));
    onToast(t('Downloaded all 4 Master Decks!', 'تم تنزيل المجموعات الأربع كاملة!'));
  };

  const isEgyptianOnly = profile?.dialect === 'egyptian';
  const visibleCoreDecks = isEgyptianOnly
    ? localizedCoreDecks.filter(d => d.id === 'master-dictionary' || d.id === 'custom').sort((a, b) =>
        a.id === 'master-dictionary' ? -1 : b.id === 'master-dictionary' ? 1 : 0
      )
    : localizedCoreDecks;

  const coreDecks = visibleCoreDecks.map(deck => {
    if (deck.id === 'master-dictionary') {
      const count = dictionaryEntries.length.toLocaleString();
      return {
        ...deck,
        name: t(`Personalized Vocabulary (${count} words)`, `مفرداتك الشخصية (${count} كلمة)`),
        subtitle: t(
          `${count} words matched to your dialect`,
          `${count} كلمة مطابقة لهجتك`
        )
      };
    }
    return deck;
  });

  const activeDeckTitle =
    engine.activeDeckId === 'all'
      ? t('All Due Cards', 'كل البطاقات المستحقة')
      : coreDecks.find(d => d.id === engine.activeDeckId)?.name ||
        [...PREBUILT_DECKS, ...EXPANDED_DECKS].find(d => d.id === engine.activeDeckId)?.name ||
        t('Review', 'مراجعة');

  return (
    <div className="p-3 sm:p-5 md:p-6 min-h-[100dvh] bg-[var(--bg,#0b0d10)] text-[var(--fg,#e9ecf1)]">
      <div className="max-w-4xl mx-auto w-full">
      
        <button onClick={onBack} style={{ minHeight: 48, padding: '8px 16px', borderRadius: 8, background: '#ffffff1a', color: 'inherit', border: 0, cursor: 'pointer', marginBottom: 16 }}>
        {t('← Back to Menu', '→ العودة للقائمة')}
      </button>

      {engine.activeDeckId === null ? (
        <DeckListView
          profile={profile}
          sourceLang={sourceLang}
          targetLang={targetLang}
          coreDecks={coreDecks}
          expandedDecks={activeExpandedDecks}
          prebuiltDecks={activePrebuiltDecks}
          importedDecks={progress.importedDecks || []}
          getDeckStats={engine.getDeckStats}
          onSelectDeck={engine.handleSelectDeck}
          onDownloadDeck={handleDownloadOpenSourceDeck}
          onDownloadAllExpandedDecks={handleDownloadAllExpandedDecks}
          onOpenAttribution={deck => setAttributionDeck(deck)}
        />
      ) : (
        <ReviewView
          profile={profile}
          sourceLang={sourceLang}
          targetLang={targetLang}
          deckName={activeDeckTitle}
          deckStats={engine.getDeckStats(engine.activeDeckId)}
          activeQueue={engine.reviewQueue || []}
          currentCardData={
            (engine.reviewQueue || [])[0] ? engine.getCardData((engine.reviewQueue || [])[0]) : null
          }
          currentCardSchedule={
            (engine.reviewQueue || [])[0] ? progress.cards?.[(engine.reviewQueue || [])[0]] : undefined
          }
          cardAnswerShown={engine.cardAnswerShown}
          canUndo={engine.undoSnapshot !== null}
          isStruggling={engine.isStruggling}
          preferredVoice={progress.preferredVoice}
          comboCount={progress.comboCount ?? 0}
          onBackToDecks={() => {
            engine.setActiveDeckId(null);
            engine.setReviewQueue(null);
            engine.setCardAnswerShown(false);
          }}
          onShowAnswer={() => engine.setCardAnswerShown(true)}
          onHideAnswer={() => engine.setCardAnswerShown(false)}
          onGradeCard={g => engine.handleCardGrade(g, engine.reviewQueue || [])}
          onUndoLastGrade={engine.handleUndoLastGrade}
          onAskAIAboutCard={engine.handleAskAIAboutCard}
        />
      )}

      {attributionDeck && (
        <div
          id="attribution-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Attribution for ${attributionDeck.name}`}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">ⓘ Deck Attribution & License</h2>
              <button type="button" onClick={() => setAttributionDeck(null)} className={BTN_GHOST + ' !px-3 !py-1'}>
                ✕
              </button>
            </div>
            <div className="text-sm space-y-1.5">
              <div><span className="opacity-65">Deck:</span> <strong>{attributionDeck.name}</strong></div>
              <div><span className="opacity-65">Author / Source:</span> <strong>{attributionDeck.author}</strong></div>
              <div><span className="opacity-65">License:</span> <strong>{attributionDeck.license}</strong></div>
            </div>
            <p className="text-xs rounded-xl bg-stone-100 dark:bg-stone-800 p-3 border border-stone-200 dark:border-stone-700 leading-relaxed">
              {attributionDeck.disclaimer}
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={() => setAttributionDeck(null)} className={BTN_PRIMARY}>
                Got it
              </button>
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed pt-1 border-t border-stone-200 dark:border-stone-800">
              Master dictionary dataset license: CC BY-SA 4.0 (derived from Kaikki/Wiktionary & open linguistic datasets).
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
