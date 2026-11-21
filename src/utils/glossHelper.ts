import { ChunkMapping } from '../types';
import { EGYPTIAN_WORD_GLOSSES } from '../data/egyptianLexicon';

export function getGlossForWord(word: string, chunks: ChunkMapping[], targetLang: string, sourceLang: string): string {
    if (!word) return '';

    // 1. Exact match in chunks
    const exactChunk = chunks.find(c => c.englishText.toLowerCase() === word.toLowerCase() || c.targetText?.toLowerCase() === word.toLowerCase());
    if (exactChunk) return exactChunk.arabicText || exactChunk.sourceText || '';

    // 2. Partial match in chunks
    const partialChunk = chunks.find(c => {
        const enWords = (c.englishText || c.targetText || '').toLowerCase().split(/[\s.,!?]+/);
        return enWords.includes(word.toLowerCase());
    });
    if (partialChunk) return partialChunk.arabicText || partialChunk.sourceText || '';

    // 3. Fallback to Egyptian Lexicon if target is English and source is Arabic
    if (targetLang === 'en' && (sourceLang === 'ar' || sourceLang === 'arz')) {
        const found = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([ar, en]) => en.toLowerCase() === word.toLowerCase());
        if (found) return found[0];
    }

    // If not found, return empty (it might be a distractor we don't have a gloss for)
    return '';
}
