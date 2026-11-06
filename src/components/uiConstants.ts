import { ChunkMapping, ChunkRole, Exercise } from '../types';
import { PrebuiltDeck } from '../data/prebuiltDecks';

export interface DeckDefinition {
  id: string;
  name: string;
  subtitle: string;
  isOpenSource?: boolean;
  prebuilt?: PrebuiltDeck;
}

export interface DeckStats {
  newCount: number;
  learningCount: number;
  dueCount: number;
  totalCards: number;
  cappedNewCount: number;
  cappedLearningCount: number;
  cappedDueCount: number;
  cappedTotal: number;
}

export interface FlashcardItemData {
  ar: string;
  en: string;
  breakdownChunks: ChunkMapping[] | null;
  nextReviewDate: number;
  exercise?: Exercise;
}

export const CHUNK_COLORS: Record<ChunkRole, string> = {
  subject: 'bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-500/50 text-sky-950 dark:text-sky-100',
  verb: 'bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/50 text-rose-950 dark:text-rose-100',
  auxiliary: 'bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/50 text-purple-950 dark:text-purple-100',
  object: 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/50 text-amber-950 dark:text-amber-100',
  connector: 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/50 text-emerald-950 dark:text-emerald-100',
  modifier: 'bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/50 text-indigo-950 dark:text-indigo-100'
};

export const CHUNK_LABELS: Record<ChunkRole, string> = {
  subject: 'Subject',
  verb: 'Verb',
  auxiliary: 'Helper Verb',
  object: 'Object',
  connector: 'Connector',
  modifier: 'Modifier'
};

export const CARD_CLASS =
  'rounded-2xl border border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 p-5 mb-4 shadow-xs font-medium';
export const BTN_PRIMARY =
  'rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white px-5 py-2.5 text-sm font-bold shadow-sm transition-all disabled:opacity-45 disabled:pointer-events-none text-center cursor-pointer';
export const BTN_GHOST =
  'rounded-2xl border border-stone-300 dark:border-stone-600 px-4 py-2.5 text-sm font-semibold text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none text-center cursor-pointer';
