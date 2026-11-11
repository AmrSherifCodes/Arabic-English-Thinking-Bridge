import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useState } from 'react';
import { CardSchedule, UserProgress, UserProfile, SourceLanguage, TargetLanguage } from '../../types';
import { calculateSM2 } from '../../utils/sm2';
import { applyHabitWin } from '../../utils/habitPsychology';
import { updateStreakAndShields } from '../../progression/engine';
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
  onAnswer?: (isCorrect: boolean) => void,
  sourceLang: SourceLanguage = 'ar',
  targetLang: TargetLanguage = 'en'
) {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<string[] | null>(null);
  const [cardAnswerShown, setCardAnswerShown] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoGradeSnapshot | null>(null);
  const [isStruggling, setIsStruggling] = useState(false);

  const computeDueCardQueue = (currentProgress: UserProgress, deckId: string | null): string[] => {
    const keys = getDeckCardKeys(deckId, currentProgress, dictionaryEntries, profile, sourceLang, targetLang);
    const cardsMap = currentProgress.cards || {};
    const now = Date.now();

    const validKeys = keys.filter(k => !!getCardData(k, currentProgress, dictionaryEntries, profile, sourceLang, targetLang));

    const learningCards: string[] = [];
    const reviewCards: string[] = [];
    const newCards: string[] = [];

    for (const k of validKeys) {
      const sched = cardsMap[k];
      if (!sched) {
        newCards.push(k);
      } else if ((sched.nextReviewDate ?? sched.due) <= now) {
        if (sched.reps === 0 || sched.int < 1) {
          learningCards.push(k);
        } else {
          reviewCards.push(k);
        }
      }
    }

    const cappedLearning = learningCards.slice(0, 20);
    const cappedReview = reviewCards.slice(0, 100);
    const combinedDue = [...cappedLearning, ...cappedReview];

    let queue: string[] = [];
    if (combinedDue.length > 0) {
      const remainingSpace = Math.max(0, 100 - combinedDue.length);
      const cappedNew = newCards.slice(0, Math.min(20, remainingSpace));
      queue = [...combinedDue, ...cappedNew];
    } else {
      queue = newCards.slice(0, 20);
    }

    return mixRetentionIntoDueQueue(queue, currentProgress, 2);
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

    if (Capacitor.isNativePlatform()) {
      if (g === 0) {
        Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
      } else if (g === 3) {
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      } else {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    }

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

    try {
      const raw = localStorage.getItem('tb.progressionState');
      if (raw) {
        let pState = JSON.parse(raw);
        pState = updateStreakAndShields(pState, todayKey);
        pState.xp += g > 0 ? 5 : 1;
        pState.quests = (pState.quests || []).map((q: any) => {
          if (q.id === 'q-srs-10' || (q.titleEn && q.titleEn.includes('Review 10 words'))) {
            const nextCount = (q.currentCount || 0) + 1;
            const isJustCompleted = nextCount >= q.targetCount && !q.isCompleted;
            if (isJustCompleted) {
              pState.xp += q.xpReward || 50;
            }
            return {
              ...q,
              currentCount: nextCount,
              isCompleted: q.isCompleted || nextCount >= q.targetCount,
            };
          }
          return q;
        });
        localStorage.setItem('tb.progressionState', JSON.stringify(pState));
      }
    } catch {
      // Ignore storage errors
    }

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
    showToast('تراجعت عن آخر كارت ↩️'); // Will be wrapped in App.tsx T()
  };

  const handleAskAIAboutCard = () => {
    const activeCardQueue = reviewQueue || [];
    const card = activeCardQueue[0] ? getCardData(activeCardQueue[0], progress, dictionaryEntries, profile, sourceLang, targetLang) : null;
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
    getDeckStats: (id: string) => getDeckStats(id, progress, dictionaryEntries, profile, sourceLang, targetLang),
    handleSelectDeck,
    handleCardGrade,
    handleUndoLastGrade,
    handleAskAIAboutCard,
    getCardData: (id: string) => getCardData(id, progress, dictionaryEntries, profile, sourceLang, targetLang),
    totalDueOrNew: getDeckStats('all', progress, dictionaryEntries, profile, sourceLang, targetLang).cappedTotal
  };
}