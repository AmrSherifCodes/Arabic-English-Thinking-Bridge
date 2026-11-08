import type { ProgressionState } from '../progression/types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export interface AnkiCardData {
  front: string;
  back: string;
  tags: string;
}

export function getExportableCards(progress: ProgressionState): AnkiCardData[] {
  return Object.values(progress.srsItems || {}).flatMap((item) => {
    const front = (item.targetText || item.term || '').trim();
    const back = item.sourceText.trim();
    return front && back
      ? [{ front, back, tags: `ThinkingBridge ${item.targetLang}` }]
      : [];
  });
}

export function createAnkiCsv(progress: ProgressionState): string {
  const cards = getExportableCards(progress);
  if (cards.length === 0) {
    throw new Error('No saved flashcards are available to export.');
  }
  const rows = cards.map((card) =>
    [
      escapeCsv(card.front),
      escapeCsv(card.back),
      escapeCsv(card.tags),
    ].join(',')
  );

  // Prepend the UTF-8 BOM (\uFEFF) so Arabic, Japanese, and Chinese
  // characters are detected as UTF-8 by Anki and spreadsheet apps.
  return '\uFEFF' + [
    '#separator:Comma',
    '#html:false',
    '#tags column:3',
    'Front,Back,Tags',
    ...rows,
  ].join('\n');
}

export async function exportToAnki(
  progress: ProgressionState,
  filename = 'Thinking_Bridge_Anki_Deck.csv'
): Promise<number> {
  const csv = createAnkiCsv(progress);
  const cardCount = getExportableCards(progress).length;
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
