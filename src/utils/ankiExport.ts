import type { ProgressionState } from '../progression/types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getTargetDictionaryAsync } from '../data/dictionaries';

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export interface AnkiCardData {
  front: string;
  back: string;
  arabic: string;
  german: string;
  spanish: string;
  french: string;
  tags: string;
}

function findTranslation(dict: any[], englishWord: string): string {
  if (!englishWord || !dict || dict.length === 0) return '';
  const cleanEng = englishWord.toLowerCase().trim();
  const match = dict.find(entry => {
    const en = (entry.englishTranslation || entry.translation || '').toLowerCase();
    // exact match or part of comma separated
    return en === cleanEng || en.split(/[;,]/).map((s: string) => s.trim()).includes(cleanEng);
  });
  if (match) {
    return match.word || match.term || match.germanWord || match.spanishWord || match.frenchWord || match.arabicWord || match.translation || '';
  }
  return '';
}

function findArabic(dict: any[], englishWord: string): string {
  if (!englishWord || !dict || dict.length === 0) return '';
  const cleanEng = englishWord.toLowerCase().trim();
  const match = dict.find(entry => {
    const en = (entry.translation || entry.englishTranslation || '').toLowerCase();
    return en === cleanEng || en.split(/[;,]/).map((s: string) => s.trim()).includes(cleanEng);
  });
  if (match) {
    return match.word || match.term || match.arabicWord || match.translation || '';
  }
  return '';
}

export async function getExportableCards(progress: ProgressionState): Promise<AnkiCardData[]> {
  const arDict = await getTargetDictionaryAsync('ar');
  const deDict = await getTargetDictionaryAsync('de');
  const esDict = await getTargetDictionaryAsync('es');
  const frDict = await getTargetDictionaryAsync('fr');

  const items = Object.values(progress.srsItems || {});
  const cards: AnkiCardData[] = [];

  for (const item of items) {
    const front = (item.targetText || item.term || '').trim();
    const back = item.sourceText.trim();
    if (front && back) {
      let engWord = '';
      if (item.targetLang === 'en') {
        engWord = front;
      } else if (item.targetLang === 'ar') {
        engWord = back; // usually sourceText is English if target is Arabic
      } else {
        // target is non-English, source is likely Arabic. Let's find English from Arabic Dict.
        const arMatch = arDict.find(e => {
          const w = (e.word || e.term || e.arabicWord || '').trim();
          return w === back || w === front;
        });
        if (arMatch) {
          engWord = arMatch.englishTranslation || arMatch.translation || '';
        }
        // If not found, maybe back is already English?
        if (!engWord && /^[a-zA-Z\s]+$/.test(back)) {
          engWord = back;
        }
      }

      let arabic = item.targetLang === 'ar' ? front : (item.targetLang === 'en' ? back : findArabic(arDict, engWord));
      let german = item.targetLang === 'de' ? front : findTranslation(deDict, engWord);
      let spanish = item.targetLang === 'es' ? front : findTranslation(esDict, engWord);
      let french = item.targetLang === 'fr' ? front : findTranslation(frDict, engWord);

      if (!arabic) arabic = findArabic(arDict, engWord);
      if (!german) german = findTranslation(deDict, engWord);
      if (!spanish) spanish = findTranslation(esDict, engWord);
      if (!french) french = findTranslation(frDict, engWord);

      // Final fallback if Arabic wasn't found in dict but 'back' is Arabic
      if (!arabic && !/^[a-zA-Z\s]+$/.test(back)) arabic = back;

      cards.push({
        front,
        back,
        arabic,
        german,
        spanish,
        french,
        tags: `ThinkingBridge ${item.targetLang}`
      });
    }
  }

  return cards;
}

export async function createAnkiCsv(progress: ProgressionState): Promise<string> {
  const cards = await getExportableCards(progress);
  if (cards.length === 0) {
    throw new Error('No saved flashcards are available to export.');
  }
  const rows = cards.map((card) => {
    const extras: string[] = [];
    if (card.arabic && card.arabic !== card.back && card.arabic !== card.front) extras.push(`🇸🇦 ${card.arabic}`);
    if (card.german && card.german !== card.back && card.german !== card.front) extras.push(`🇩🇪 ${card.german}`);
    if (card.spanish && card.spanish !== card.back && card.spanish !== card.front) extras.push(`🇪🇸 ${card.spanish}`);
    if (card.french && card.french !== card.back && card.french !== card.front) extras.push(`🇫🇷 ${card.french}`);

    let enrichedBack = card.back;
    if (extras.length > 0) {
      enrichedBack += `<br><br><div style="font-size: 0.85em; opacity: 0.8; text-align: left;" dir="auto">`;
      enrichedBack += extras.join('<br>');
      enrichedBack += `</div>`;
    }

    return [
      escapeCsv(card.front),
      escapeCsv(enrichedBack),
      escapeCsv(card.tags),
    ].join(',');
  });

  // Prepend the UTF-8 BOM (\uFEFF) so Arabic, Japanese, and Chinese
  // characters are detected as UTF-8 by Anki and spreadsheet apps.
  return '\uFEFF' + [
    '#separator:Comma',
    '#html:true',
    '#tags column:3',
    'Front,Back,Tags',
    ...rows,
  ].join('\n');
}

export async function exportMasterDictionaryToAnki(): Promise<number> {
  const arDict = await getTargetDictionaryAsync('ar');
  const deDict = await getTargetDictionaryAsync('de');
  const esDict = await getTargetDictionaryAsync('es');
  const frDict = await getTargetDictionaryAsync('fr');

  const cards: AnkiCardData[] = [];

  // Master Arabic Dictionary is the source of truth for the 10k words
  for (const entry of arDict) {
    const arabicWord = (entry.word || entry.term || entry.arabicWord || '').trim();
    const englishWord = (entry.englishTranslation || entry.translation || '').trim();
    if (!arabicWord || !englishWord) continue;

    const german = findTranslation(deDict, englishWord);
    const spanish = findTranslation(esDict, englishWord);
    const french = findTranslation(frDict, englishWord);

    cards.push({
      front: englishWord,
      back: arabicWord,
      arabic: arabicWord,
      german,
      spanish,
      french,
      tags: `ThinkingBridge Master`
    });
  }

  if (cards.length === 0) {
    throw new Error('Master dictionary is empty.');
  }

  const rows = cards.map((card) => {
    const extras: string[] = [];
    if (card.arabic && card.arabic !== card.back && card.arabic !== card.front) extras.push(`🇸🇦 ${card.arabic}`);
    if (card.german && card.german !== card.back && card.german !== card.front) extras.push(`🇩🇪 ${card.german}`);
    if (card.spanish && card.spanish !== card.back && card.spanish !== card.front) extras.push(`🇪🇸 ${card.spanish}`);
    if (card.french && card.french !== card.back && card.french !== card.front) extras.push(`🇫🇷 ${card.french}`);

    let enrichedBack = card.back;
    if (extras.length > 0) {
      enrichedBack += `<br><br><div style="font-size: 0.85em; opacity: 0.8; text-align: left;" dir="auto">`;
      enrichedBack += extras.join('<br>');
      enrichedBack += `</div>`;
    }

    return [
      escapeCsv(card.front),
      escapeCsv(enrichedBack),
      escapeCsv(card.tags),
    ].join(',');
  });

  const csvWithBOM = '\uFEFF' + [
    '#separator:Comma',
    '#html:true',
    '#tags column:3',
    'Front,Back,Tags',
    ...rows,
  ].join('\n');

  const filename = 'Thinking_Bridge_Master_Deck.csv';

  if (Capacitor.isNativePlatform()) {
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: csvWithBOM,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });

    await Share.share({
      title: 'Thinking Bridge Master Deck',
      url: writeResult.uri,
      dialogTitle: 'Export Master Deck'
    });
  } else {
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return cards.length;
}
export async function exportToAnki(
  progress: ProgressionState,
  filename = 'Thinking_Bridge_Anki_Deck.csv'
): Promise<number> {
  const csv = await createAnkiCsv(progress);
  const cards = await getExportableCards(progress);
  const cardCount = cards.length;
  // createAnkiCsv already includes the UTF-8 BOM (\uFEFF).
  const csvWithBOM = csv;

  if (Capacitor.isNativePlatform()) {
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: csvWithBOM,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });

    await Share.share({
      title: 'Thinking Bridge Anki Deck',
      url: writeResult.uri,
      dialogTitle: 'Export Anki Deck'
    });
  } else {
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return cardCount;
}
