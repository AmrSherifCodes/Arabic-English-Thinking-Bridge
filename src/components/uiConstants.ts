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
  'rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 mb-3 shadow-xs';
export const BTN_PRIMARY =
  'rounded-full bg-teal-700 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-45 disabled:pointer-events-none';
export const BTN_GHOST =
  'rounded-full border border-stone-300 dark:border-stone-600 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none';
