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
}

export interface FlashcardItemData {
  ar: string;
  en: string;
  breakdownChunks: ChunkMapping[] | null;
  nextReviewDate: number;
  exercise?: Exercise;
}

export const CHUNK_COLORS: Record<ChunkRole, string> = {
  subject: 'bg-sky-100 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800',
  verb: 'bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800',
  auxiliary: 'bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800',
  object: 'bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800',
  connector: 'bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800',
  modifier: 'bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
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
  'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 mb-3 shadow-md shadow-slate-900/5 dark:shadow-black/30';
export const BTN_PRIMARY =
  'rounded-full border border-teal-400/30 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 text-sm font-semibold shadow-md shadow-black/30 hover:from-teal-500 hover:to-cyan-500 active:scale-[0.98] transition-all disabled:opacity-45 disabled:pointer-events-none';
export const BTN_GHOST =
  'rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none';
