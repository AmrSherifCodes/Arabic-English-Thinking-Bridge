import { useState } from 'react';
import { CardSchedule, UserProgress, UserProfile } from '../../types';
import { calculateSM2 } from '../../utils/sm2';
import { applyHabitWin } from '../../utils/habitPsychology';
import { mixRetentionIntoDueQueue } from '../../utils/adaptiveCurriculum';
import { LexiconEntry } from '../../services/geminiLexicon';
import { DeckStats, FlashcardItemData } from '../../components/uiConstants';
import { getDeckCardKeys, getCardData, getDeckStats } from './deckUtils';

interface UndoGradeSnapshot {
  cardKey: string;
  previousSchedule: CardSchedule | undefined;
  previousQueue: string[];
  previousScore: number;
  reviewDateKey: string;
  previousDateCount: number;
}

export function useDeckEngine(
  progress: UserProgress,
  updateAndSaveProgress: (updater: (prev: UserProgress) => UserProgress) => void,
  profile: UserProfile | null,
  dictionaryEntries: LexiconEntry[],
  onAskAIAboutCard: (card: FlashcardItemData) => void,
  showToast: (msg: string) => void,
  onAnswer?: (isCorrect: boolean) => void
) {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<string[] | null>(null);
  const [cardAnswerShown, setCardAnswerShown] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoGradeSnapshot | null>(null);
  const [isStruggling, setIsStruggling] = useState(false);

  const computeDueCardQueue = (currentProgress: UserProgress, deckId: string | null): string[] => {
    const keys = getDeckCardKeys(deckId, currentProgress, dictionaryEntries, profile);
    const cardsMap = currentProgress.cards || {};
    const now = Date.now();

    const dueList = keys
      .filter(k => {
        if (!getCardData(k, currentProgress, dictionaryEntries, profile)) return false;
        const sched = cardsMap[k];
        if (!sched) return true;
        return (sched.nextReviewDate ?? sched.due) <= now;
      })
      .slice(0, 50);

    return mixRetentionIntoDueQueue(dueList, currentProgress, 2);
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setReviewQueue(computeDueCardQueue(progress, deckId));
    setCardAnswerShown(false);
    setUndoSnapshot(null);
  };

  const handleCardGrade = (g: 0 | 1 | 2 | 3, currentQueue: string[]) => {
    if (!currentQueue.length) return;
    if (onAnswer) onAnswer(g > 0);

    const [k, ...rest] = currentQueue;
    const existingSched = progress.cards?.[k];
    const nextSched = calculateSM2(existingSched, g, { isStruggling });
    const nextReviewDate = nextSched.due;

    const todayKey = new Date().toISOString().split('T')[0];
    const prevDateCount = progress.reviewHistory?.[todayKey] || 0;

    setUndoSnapshot({
      cardKey: k,
      previousSchedule: existingSched ? { ...existingSched } : undefined,
      previousQueue: [...currentQueue],
      previousScore: progress.score || 0,
      reviewDateKey: todayKey,
      previousDateCount: prevDateCount
    });

    const updatedQueue = g === 0 ? [...rest, k] : [...rest];
    const baseCardXp = g === 0 ? 0 : 2;
    const winTransition = g > 0 ? applyHabitWin(progress, baseCardXp, todayKey) : null;

    updateAndSaveProgress(prev => {
      const baseNext = winTransition ? winTransition.nextProgress : prev;
      return {
        ...baseNext,
        cards: {
          ...(prev.cards || {}),
          [k]: { ...nextSched, due: nextReviewDate, nextReviewDate }
        },
        reviewHistory: {
          ...(prev.reviewHistory || {}),
          [todayKey]: prevDateCount + 1
        }
      };
    });

    setReviewQueue(updatedQueue);
    setCardAnswerShown(false);
    setIsStruggling(g === 0);
  };

  const handleUndoLastGrade = () => {
    if (!undoSnapshot) return;
    const snap = undoSnapshot;

    updateAndSaveProgress(prev => {
      const nextCards = { ...(prev.cards || {}) };
      if (snap.previousSchedule === undefined) {
        delete nextCards[snap.cardKey];
      } else {
        nextCards[snap.cardKey] = snap.previousSchedule;
      }

      const nextHistory = { ...(prev.reviewHistory || {}) };
      if (snap.previousDateCount <= 0) {
        delete nextHistory[snap.reviewDateKey];
      } else {
        nextHistory[snap.reviewDateKey] = snap.previousDateCount;
      }

      return {
        ...prev,
        score: snap.previousScore,
        cards: nextCards,
        reviewHistory: nextHistory
      };
    });

    setReviewQueue(snap.previousQueue);
    setCardAnswerShown(false);
    setUndoSnapshot(null);
    showToast('Undid last card review ↩️');
  };

  const handleAskAIAboutCard = () => {
    const activeCardQueue = reviewQueue || [];
    const card = activeCardQueue[0] ? getCardData(activeCardQueue[0], progress, dictionaryEntries, profile) : null;
    if (!card) return;
    onAskAIAboutCard(card);
  };

  return {
    activeDeckId,
    setActiveDeckId,
    reviewQueue,
    setReviewQueue,
    cardAnswerShown,
    setCardAnswerShown,
    undoSnapshot,
    isStruggling,
    getDeckStats: (id: string) => getDeckStats(id, progress, dictionaryEntries, profile),
    handleSelectDeck,
    handleCardGrade,
    handleUndoLastGrade,
    handleAskAIAboutCard,
    getCardData: (id: string) => getCardData(id, progress, dictionaryEntries, profile),
    totalDueOrNew: getDeckStats('all', progress, dictionaryEntries, profile).newCount + getDeckStats('all', progress, dictionaryEntries, profile).learningCount + getDeckStats('all', progress, dictionaryEntries, profile).dueCount
  };
}