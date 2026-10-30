import React from 'react';
import confetti from 'canvas-confetti';
import { PrebuiltDeck } from '../data/prebuiltDecks';
import { speakWithRate } from '../utils/audio';
import { InteractiveArabicSentence } from './InteractiveArabicSentence';
import { Flashcard } from './Flashcard';
import { OliveBranchIcon } from './CulturalToast';
import { BouncyButton } from './BouncyButton';
import {
  BTN_GHOST,
  BTN_PRIMARY,
  CARD_CLASS,
  CHUNK_COLORS,
  DeckDefinition,
  DeckStats,
  FlashcardItemData
} from './uiConstants';

export interface DeckListViewProps {
  coreDecks: DeckDefinition[];
  expandedDecks: PrebuiltDeck[];
  prebuiltDecks: PrebuiltDeck[];
  importedDecks: string[];
  getDeckStats: (deckId: string) => DeckStats;
  onSelectDeck: (deckId: string) => void;
  onDownloadDeck: (deck: PrebuiltDeck) => void;
  onDownloadAllExpandedDecks: () => void;
  onOpenAttribution: (deck: PrebuiltDeck) => void;
}

/**
 * Anki Mobile Deck List Dashboard ("The Vision")
 * - Three-column stats on the right: New (Blue), Learning (Red), Due (Green)
 * - Prominent "Study All Due Cards" button at the top
 * - Core Decks + Prebuilt Master Decks (150 Cards) + Open Source Decks (100% Copyright-Free CC0)
 */
export function DeckListView({
  coreDecks,
  expandedDecks,
  prebuiltDecks,
  importedDecks,
  getDeckStats,
  onSelectDeck,
  onDownloadDeck,
  onDownloadAllExpandedDecks,
  onOpenAttribution
}: DeckListViewProps) {
  const allStats = getDeckStats('all');
  const totalDueOrNew = allStats.newCount + allStats.learningCount + allStats.dueCount;
  const customStats = getDeckStats('custom');
  const undownloadedExpandedCount = expandedDecks
    .filter(d => !importedDecks.includes(d.id))
    .reduce((sum, d) => sum + d.cards.length, 0);

  const renderPrebuiltDeckRow = (deck: PrebuiltDeck) => {
    const isDownloaded = importedDecks.includes(deck.id);
    const st = getDeckStats(deck.id);

    return (
      <div
        key={deck.id}
        id={`os-deck-${deck.id}`}
        className={`${CARD_CLASS} !mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isDownloaded ? (
              <BouncyButton
                type="button"
                onClick={() => onSelectDeck(deck.id)}
                className="font-semibold text-base text-left hover:text-teal-700 dark:hover:text-teal-300 transition-colors !min-h-0 !min-w-0"
              >
                {deck.name}
              </BouncyButton>
            ) : (
              <span className="font-semibold text-base">{deck.name}</span>
            )}
            <button
              type="button"
              id={`attr-btn-${deck.id}`}
              aria-label={`Attribution info for ${deck.name}`}
              title="Public domain license & attribution"
              onClick={e => {
                e.stopPropagation();
                onOpenAttribution(deck);
              }}
              className="text-xs px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 !min-h-[32px] !min-w-[32px]"
            >
              ⓘ
            </button>
          </div>
          <p className="text-xs opacity-75 mt-0.5 leading-relaxed">{deck.description}</p>
          <div className="text-[11px] opacity-60 mt-1">
            {deck.author} · {deck.license} · {deck.cards.length} cards
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {/* Anki 3-Column Stats always visible so user sees New (Blue) card volume */}
          <div
            onClick={() => {
              if (isDownloaded) onSelectDeck(deck.id);
            }}
            role={isDownloaded ? 'button' : undefined}
            tabIndex={isDownloaded ? 0 : undefined}
            onKeyDown={e => {
              if (isDownloaded && (e.key === 'Enter' || e.key === ' ')) {
                onSelectDeck(deck.id);
              }
            }}
            className={`grid grid-cols-3 gap-3 text-right w-28 font-bold text-sm tabular-nums ${
              isDownloaded ? 'cursor-pointer' : ''
            }`}
          >
            <span
              className={
                st.newCount > 0
                  ? 'text-sky-700 dark:text-sky-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title="New cards"
            >
              {st.newCount}
            </span>
            <span
              className={
                st.learningCount > 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title="Learning cards"
            >
              {st.learningCount}
            </span>
            <span
              className={
                st.dueCount > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title="Due cards"
            >
              {st.dueCount}
            </span>
          </div>

          {isDownloaded ? (
            <button
              type="button"
              id={`study-os-${deck.id}`}
              onClick={() => onSelectDeck(deck.id)}
              className={BTN_PRIMARY}
            >
              Study
            </button>
          ) : (
            <button
              type="button"
              id={`download-deck-${deck.id}`}
              onClick={() => onDownloadDeck(deck)}
              className={BTN_PRIMARY + ' shrink-0'}
            >
              ⬇ Download ({deck.cards.length})
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="anki-deck-list" className="space-y-5">
      {/* Top Aggregated Study Banner */}
      <div className={`${CARD_CLASS} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <div className="text-xs font-semibold text-olive-800 dark:text-olive-300 flex items-center gap-1.5">
            <OliveBranchIcon size={15} className="text-olive-700 dark:text-olive-400" />
            <span>Anki Spaced Repetition Dashboard · 100% Copyright-Free (CC0)</span>
          </div>
          <div className="text-sm opacity-85 mt-0.5 flex flex-wrap items-center gap-3 tabular-nums">
            <span>
              New: <strong className="text-sky-700 dark:text-sky-400">{allStats.newCount}</strong>
            </span>
            <span>·</span>
            <span>
              Learning:{' '}
              <strong className="text-red-700 dark:text-red-400">{allStats.learningCount}</strong>
            </span>
            <span>·</span>
            <span>
              Due:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">{allStats.dueCount}</strong>
            </span>
            <span>·</span>
            <span className="text-xs opacity-75">
              Total Active Pool: <strong>{allStats.totalCards}</strong> cards
            </span>
          </div>
        </div>
        <button
          type="button"
          id="study-all-btn"
          disabled={totalDueOrNew === 0}
          onClick={() => onSelectDeck('all')}
          className={BTN_PRIMARY + ' whitespace-nowrap'}
        >
          ⚡ Study All Due Cards ({totalDueOrNew})
        </button>
      </div>

      {/* Core Decks Section */}
      <div>
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold opacity-65">
          <span>Core Curriculum Decks</span>
          <div className="grid grid-cols-3 gap-3 text-right w-36">
            <span className="text-sky-700 dark:text-sky-400">New</span>
            <span className="text-red-700 dark:text-red-400">Learn</span>
            <span className="text-emerald-700 dark:text-emerald-400">Due</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {coreDecks.map(deck => {
            const st = getDeckStats(deck.id);
            const isEmptyCustom = deck.id === 'custom' && st.totalCards === 0;
            return (
              <button
                key={deck.id}
                type="button"
                id={`deck-card-${deck.id}`}
                onClick={() => onSelectDeck(deck.id)}
                className={`${CARD_CLASS} !mb-0 w-full text-left flex items-center justify-between gap-3 hover:border-olive-600 dark:hover:border-olive-500 transition-colors`}
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-base truncate flex items-center gap-1.5">
                    <span>{deck.name}</span>
                    {isEmptyCustom && (
                      <OliveBranchIcon
                        size={15}
                        className="text-olive-700 dark:text-olive-400"
                        title="Plant your first custom card in the Translate tab"
                      />
                    )}
                  </div>
                  <div className="text-xs opacity-70 truncate mt-0.5">
                    {isEmptyCustom
                      ? 'Empty deck · Plant your first custom translation seed in the Translate tab'
                      : deck.subtitle}
                  </div>
                </div>

                {/* Anki Three-Column Stats: New (Blue), Learning (Red), Due (Green) */}
                <div className="grid grid-cols-3 gap-3 text-right w-36 shrink-0 font-bold text-sm tabular-nums">
                  <span
                    className={
                      st.newCount > 0
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }
                  >
                    {st.newCount}
                  </span>
                  <span
                    className={
                      st.learningCount > 0
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }
                  >
                    {st.learningCount}
                  </span>
                  <span
                    className={
                      st.dueCount > 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }
                  >
                    {st.dueCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {customStats.totalCards === 0 && (
          <div
            id="custom-deck-empty-callout"
            className="mt-2.5 flex items-center gap-2.5 rounded-2xl border border-olive-600/25 dark:border-olive-500/25 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <OliveBranchIcon size={18} className="text-olive-700 dark:text-olive-400" />
            <span className="opacity-85">
              <strong>My Custom Translations</strong> is ready for your own sentences — save any phrase from the{' '}
              <strong>Translate</strong> tab to grow your personal olive grove of cards.
            </span>
          </div>
        )}
      </div>

      {/* Prebuilt Master Decks (150 Cards across 4 Thematic Decks) */}
      <div id="prebuilt-master-decks-section">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-2">
          <div>
            <span className="text-xs font-semibold opacity-75">
              Prebuilt Master Decks (150 Cards · CEFR A1–B2 · CC0 Public Domain)
            </span>
          </div>
          {undownloadedExpandedCount > 0 && (
            <button
              type="button"
              id="download-all-master-decks-btn"
              onClick={onDownloadAllExpandedDecks}
              className="text-xs font-semibold text-olive-800 dark:text-olive-300 underline !min-h-[32px]"
            >
              ⬇ Download All 4 Master Decks (+{undownloadedExpandedCount} Cards)
            </button>
          )}
        </div>

        <div className="space-y-2.5">{expandedDecks.map(renderPrebuiltDeckRow)}</div>
      </div>

      {/* Open Source & Starter Public Domain Decks Section */}
      <div>
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold opacity-65">
          <span>Starter & Public Domain Community Decks</span>
          <span className="text-[11px] font-normal">CC0 1.0 Public Domain (100% Copyright-Free)</span>
        </div>

        <div className="space-y-2.5">{prebuiltDecks.map(renderPrebuiltDeckRow)}</div>
      </div>
    </div>
  );
}

export interface ReviewViewProps {
  deckName: string;
  deckStats: DeckStats;
  activeQueue: string[];
  currentCardData: FlashcardItemData | null;
  cardAnswerShown: boolean;
  canUndo: boolean;
  isStruggling: boolean;
  preferredVoice?: string;
  comboCount?: number;
  onBackToDecks: () => void;
  onShowAnswer: () => void;
  onHideAnswer: () => void;
  onGradeCard: (grade: 0 | 1 | 2 | 3) => void;
  onUndoLastGrade: () => void;
  onAskAIAboutCard: () => void;
}

/**
 * Anki-Style Review Experience (Noob-Friendly + Addictive Dopamine Feedback)
 * - Header: Deck name, New (Blue) + Learning (Red) + Due (Green) counts, Mystery Chest progress, and Undo (↩️) button
 * - Card Area: Arabic front (with double-tap word lookup) + English back + color-coded breakdown
 * - Answer Buttons: Beginner-friendly bilingual labels + Anki intervals
 */
export function ReviewView({
  deckName,
  deckStats,
  activeQueue,
  currentCardData,
  cardAnswerShown,
  canUndo,
  isStruggling,
  preferredVoice,
  comboCount = 0,
  onBackToDecks,
  onShowAnswer,
  onHideAnswer,
  onGradeCard,
  onUndoLastGrade,
  onAskAIAboutCard
}: ReviewViewProps) {
  const currentKey = activeQueue[0];
  const winsToChest = 3 - (comboCount % 3);

  return (
    <div id="anki-review-view">
      {/* Review Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            id="back-to-decks-btn"
            onClick={onBackToDecks}
            className={BTN_GHOST + ' !px-3 !py-1.5 text-xs shrink-0'}
          >
            ← Decks
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{deckName}</div>
            <div className="text-xs font-bold tabular-nums flex items-center gap-1.5">
              <span className="text-sky-700 dark:text-sky-400" title="New cards">
                {deckStats.newCount}
              </span>
              <span className="opacity-40">+</span>
              <span className="text-red-700 dark:text-red-400" title="Learning cards">
                {deckStats.learningCount}
              </span>
              <span className="opacity-40">+</span>
              <span className="text-emerald-700 dark:text-emerald-400" title="Due review cards">
                {deckStats.dueCount}
              </span>
              <span className="opacity-40">·</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                🎁 {winsToChest} to Chest
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          id="anki-undo-btn"
          disabled={!canUndo}
          onClick={onUndoLastGrade}
          title="Undo last card grade"
          aria-label="Undo last card grade"
          className={BTN_GHOST + ' !px-3 !py-1.5 text-xs shrink-0'}
        >
          ↩️ Undo
        </button>
      </div>

      {activeQueue.length === 0 || !currentCardData ? (
        <div
          id="review-empty-state"
          className={`${CARD_CLASS} kuffiyeh-card-watermark text-center py-8 border-olive-600/30 dark:border-olive-500/30`}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-olive-600/15 dark:bg-olive-500/20 text-olive-800 dark:text-olive-300 mb-3">
            <OliveBranchIcon size={32} className="text-olive-700 dark:text-olive-400" />
          </div>
          <p className="font-semibold text-lg">
            {deckStats.totalCards === 0
              ? 'This Olive Grove Deck Is Waiting for Your First Seed'
              : 'Congratulations! You have finished this deck for now.'}
          </p>
          <p className="text-sm opacity-75 mt-1 max-w-md mx-auto">
            {deckStats.totalCards === 0 ? (
              <>
                No cards are in <strong>{deckName}</strong> yet. Visit the{' '}
                <strong>Translate</strong> tab to save custom Arabic–English sentences and grow your
                personal deck.
              </>
            ) : (
              <>
                All due cards in <strong>{deckName}</strong> have been reviewed. Like the olive
                tree, steady daily roots yield lasting fluency.
              </>
            )}
          </p>
          <p dir="rtl" className="ar text-xs font-semibold text-olive-800 dark:text-olive-300 mt-2">
            «العلمُ غرسٌ، والصبرُ جذوره، والثمرةُ لسانٌ فصيح»
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={onBackToDecks} className={BTN_PRIMARY}>
              ← Back to Deck List
            </button>
          </div>
        </div>
      ) : (
        <div>
          {isStruggling && (
            <p
              role="status"
              className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            >
              Let&apos;s slow down and review this a bit more.
            </p>
          )}
          <Flashcard
            isFlipped={cardAnswerShown}
            onFlip={cardAnswerShown ? onHideAnswer : onShowAnswer}
            front={
              <div dir="rtl" className={`${CARD_CLASS} text-center py-5`}>
                <InteractiveArabicSentence
                  sentence={currentCardData.ar}
                  exercise={currentCardData.exercise}
                  preferredVoice={preferredVoice}
                  className="ar text-3xl leading-relaxed font-semibold"
                  showCaption={true}
                  resetKey={`card-${currentKey}`}
                />
              </div>
            }
            back={
              <div className={`${CARD_CLASS} text-center py-5`}>
                <div dir="rtl" className="ar text-3xl leading-relaxed font-semibold">
                  {currentCardData.ar}
                </div>
                <hr className="my-4 border-slate-200 dark:border-slate-700" />
                <div dir="ltr" translate="no" className="text-xl font-semibold mb-3">
                  {currentCardData.en}
                </div>
                {currentCardData.breakdownChunks && (
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {currentCardData.breakdownChunks.map((chunk, idx) => (
                      <div key={idx} className={`rounded-xl p-2 ${CHUNK_COLORS[chunk.role]}`}>
                        <div dir="rtl" className="ar font-semibold">
                          {chunk.arabicText}
                        </div>
                        <div dir="ltr" translate="no" className="font-semibold text-sm">
                          {chunk.englishText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={`${BTN_GHOST} mt-3`}
                  onClick={() => speakWithRate(currentCardData.en, 1, preferredVoice)}
                >
                  🔊 Hear Pronunciation
                </button>
              </div>
            }
          />

          {!cardAnswerShown ? (
            <button
              type="button"
              id="show-answer-btn"
              className={`${BTN_PRIMARY} w-full`}
              onClick={onShowAnswer}
            >
              👀 Tap card to reveal English answer (إظهار الإجابة)
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    ['Again', '🔄 Forgot · نسيتها', 'bg-red-600 hover:bg-red-700'],
                    ['Hard', '😅 Tricky · صعبة', 'bg-amber-600 hover:bg-amber-700'],
                    ['Good', '👍 Got It! · عرفتها', 'bg-emerald-600 hover:bg-emerald-700'],
                    ['Easy', '⚡ Easy! · سهلة', 'bg-sky-600 hover:bg-sky-700']
                  ] as const
                ).map(([idKey, friendlyLabel, bgClass], g) => {
                  const grade = g as 0 | 1 | 2 | 3;
                  const intervalText = isStruggling
                    ? ['10s', '1m', '10m', '1d'][grade]
                    : ['1m', '1d', '3d', '7d'][grade];
                  return (
                    <BouncyButton
                      key={idKey}
                      type="button"
                      id={`grade-btn-${idKey.toLowerCase()}`}
                      onClick={() => {
                        onGradeCard(grade);
                        if (grade >= 2) {
                          void confetti({
                            particleCount: grade === 3 ? 90 : 55,
                            spread: grade === 3 ? 78 : 62,
                            origin: { y: 0.72 }
                          });
                        }
                      }}
                      className={`${bgClass} text-white rounded-xl py-2.5 px-2 text-xs font-semibold min-h-[56px] transition-colors flex flex-col items-center justify-center`}
                    >
                      <div className="text-xs sm:text-sm font-bold whitespace-nowrap">
                        {idKey}
                      </div>
                      <div className="opacity-90 font-medium text-[11px] mt-0.5 tabular-nums">
                        {friendlyLabel} · {intervalText}
                      </div>
                    </BouncyButton>
                  );
                })}
              </div>
              <p className="text-xs opacity-60 mt-3 text-center">
                No stress! Tap <strong>Forgot (نسيتها)</strong> if you want to see this card again
                in a minute, or <strong>Got It! (عرفتها)</strong> to earn XP toward your 🎁 Mystery
                Chest.
              </p>
            </>
          )}
          <BouncyButton
            type="button"
            id="ask-ai-about-card-btn"
            onClick={onAskAIAboutCard}
            className={`${BTN_GHOST} mt-3 w-full`}
          >
            ✨ Ask AI about this word
          </BouncyButton>
        </div>
      )}
    </div>
  );
}
