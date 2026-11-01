/**
 * Pluggable Language Infrastructure Architecture
 * Thinking English Platform (Arabic <-> English Cognitive Transfer)
 * Phase 1 Foundation: Extensible Dictionary and Grammar Provider Interfaces
 */

import { STATIC_DICTIONARY, getStaticDictionaryEntries } from '../data/staticDictionary';
import { ALL_LESSONS } from '../data/lessons';
import type { Lesson } from '../types';

export interface DictionaryEntry {
  term: string;
  normalizedTerm: string;
  sourceLanguage: string;
  targetLanguage: string;
  translations: string[];
  partOfSpeech?: string;
  pronunciationIpa?: string;
  examples?: Array<{
    source: string;
    target: string;
  }>;
  dialect?: 'egyptian' | 'msa' | 'general';
  situations?: string[];
  metadata?: Record<string, unknown>;
}

export interface DictionaryLookupOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  dialect?: 'egyptian' | 'msa' | 'general';
  includeExamples?: boolean;
  limit?: number;
}

export interface DictionaryProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly isOfflineReady: boolean;
  
  lookup(term: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry | null>;
  search(prefix: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry[]>;
  isAvailable(): Promise<boolean>;
}

export interface CognitiveStructureRule {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  transferConcept: string;
  transferConceptAr: string;
  weakSpotTag?: string;
  sampleExercise?: {
    arabicThought: string;
    englishTarget: string;
  };
}

export interface GrammarAnalysisResult {
  sentence: string;
  matchedRules: CognitiveStructureRule[];
  explanationEn: string;
  explanationAr: string;
}

export interface GrammarProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  analyzeSentence(sentence: string, targetDialect?: 'egyptian' | 'msa'): Promise<GrammarAnalysisResult>;
  getRule(ruleId: string): Promise<CognitiveStructureRule | null>;
  listRules(): Promise<CognitiveStructureRule[]>;
}

/**
 * Built-in Local Offline Dictionary Provider
 * Zero latency, zero network cost, guaranteed offline safety
 */
export class LocalOfflineDictionaryProvider implements DictionaryProvider {
  readonly id = 'local-offline-dictionary';
  readonly name = 'Local Offline Flashcard Dictionary';
  readonly version = '1.0.0';
  readonly isOfflineReady = true;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async lookup(term: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry | null> {
    const clean = term.trim().toLowerCase();
    const dialect = options?.dialect === 'egyptian' ? 'egyptian' : 'msa';
    const match = STATIC_DICTIONARY.find(entry => 
      (entry.dialect === dialect || !options?.dialect) &&
      (entry.arabicWord.toLowerCase() === clean || entry.englishTranslation.toLowerCase() === clean)
    );

    if (!match) return null;

    return {
      term: match.arabicWord,
      normalizedTerm: match.arabicWord.trim(),
      sourceLanguage: 'ar',
      targetLanguage: 'en',
      translations: [match.englishTranslation],
      partOfSpeech: match.partOfSpeech,
      dialect: match.dialect,
      situations: match.situations,
      examples: [
        {
          source: match.exampleSentenceArabic,
          target: match.exampleSentenceEnglish
        }
      ]
    };
  }

  async search(prefix: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry[]> {
    const clean = prefix.trim().toLowerCase();
    const dialect = options?.dialect === 'egyptian' ? 'egyptian' : 'msa';
    const matches = STATIC_DICTIONARY.filter(entry =>
      (entry.dialect === dialect || !options?.dialect) &&
      (entry.arabicWord.toLowerCase().includes(clean) || entry.englishTranslation.toLowerCase().includes(clean))
    ).slice(0, options?.limit ?? 10);

    return matches.map(match => ({
      term: match.arabicWord,
      normalizedTerm: match.arabicWord.trim(),
      sourceLanguage: 'ar',
      targetLanguage: 'en',
      translations: [match.englishTranslation],
      partOfSpeech: match.partOfSpeech,
      dialect: match.dialect,
      situations: match.situations,
      examples: [
        {
          source: match.exampleSentenceArabic,
          target: match.exampleSentenceEnglish
        }
      ]
    }));
  }
}

/**
 * Wiktionary / Kaikki Free Dictionary Provider (Phase 2 Placeholder)
 * Architecture stub ready for Wiktionary JSON / Kaikki Wiktextract ingest
 */
export class WiktionaryKaikkiDictionaryProvider implements DictionaryProvider {
  readonly id = 'wiktionary-kaikki';
  readonly name = 'Wiktionary / Kaikki Open Data Provider';
  readonly version = '2.0.0-draft';
  readonly isOfflineReady = false;

  async isAvailable(): Promise<boolean> {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  async lookup(term: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry | null> {
    // Phase 2 will execute live fetch against Kaikki / Wiktionary endpoints
    return null;
  }

  async search(prefix: string, options?: DictionaryLookupOptions): Promise<DictionaryEntry[]> {
    // Phase 2 will execute live search against Kaikki / Wiktionary endpoints
    return [];
  }
}

/**
 * Built-in Cognitive Grammar Provider
 * Maps sentence structures to Egyptian/Arabic vs English cognitive models
 */
export class CognitiveGrammarProvider implements GrammarProvider {
  readonly id = 'cognitive-transfer-grammar';
  readonly name = 'Arabic-to-English Cognitive Transfer Rules';
  readonly version = '1.0.0';

  async listRules(): Promise<CognitiveStructureRule[]> {
    return ALL_LESSONS.map((l: Lesson) => ({
      id: l.id,
      number: l.number,
      title: l.title,
      titleAr: l.titleAr,
      transferConcept: l.transferConcept,
      transferConceptAr: l.transferConceptAr,
      weakSpotTag: l.weakSpotTag,
      sampleExercise: l.exercises[0] ? {
        arabicThought: l.exercises[0].arabicThought,
        englishTarget: l.exercises[0].englishTarget
      } : undefined
    }));
  }

  async getRule(ruleId: string): Promise<CognitiveStructureRule | null> {
    const found = ALL_LESSONS.find((l: Lesson) => l.id === ruleId);
    if (!found) return null;
    return {
      id: found.id,
      number: found.number,
      title: found.title,
      titleAr: found.titleAr,
      transferConcept: found.transferConcept,
      transferConceptAr: found.transferConceptAr,
      weakSpotTag: found.weakSpotTag,
      sampleExercise: found.exercises[0] ? {
        arabicThought: found.exercises[0].arabicThought,
        englishTarget: found.exercises[0].englishTarget
      } : undefined
    };
  }

  async analyzeSentence(sentence: string, targetDialect: 'egyptian' | 'msa' = 'egyptian'): Promise<GrammarAnalysisResult> {
    const clean = sentence.trim().toLowerCase();
    const rules = await this.listRules();
    
    // Heuristic detection based on transfer concepts
    const matched = rules.filter(r => {
      if (r.weakSpotTag === 'copula-omission' && !clean.includes('is') && !clean.includes('are') && !clean.includes('am')) {
        return true;
      }
      return false;
    });

    return {
      sentence,
      matchedRules: matched,
      explanationEn: matched[0]?.transferConcept || 'Think in structural chunks rather than word-for-word translation.',
      explanationAr: matched[0]?.transferConceptAr || 'فكّر في الهيكل البنائي والكتل اللغوية بدلاً من الترجمة الحرفية كلمة بكلمة.'
    };
  }
}

// Registry singleton for runtime dependency injection
export const registry = {
  dictionary: new LocalOfflineDictionaryProvider() as DictionaryProvider,
  grammar: new CognitiveGrammarProvider() as GrammarProvider,
  setDictionaryProvider(provider: DictionaryProvider) {
    this.dictionary = provider;
  },
  setGrammarProvider(provider: GrammarProvider) {
    this.grammar = provider;
  }
};
