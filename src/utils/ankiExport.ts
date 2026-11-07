import type { ProgressionState } from '../progression/types';

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

  return [
    '#separator:Comma',
    '#html:false',
    '#tags column:3',
    'Front,Back,Tags',
    ...rows,
  ].join('\n');
}

export function exportToAnki(
  progress: ProgressionState,
  filename = 'Thinking_Bridge_Anki_Deck.csv'
): number {
  const csv = createAnkiCsv(progress);
  const cardCount = getExportableCards(progress).length;
  // Add UTF-8 BOM (\uFEFF) to ensure Arabic characters display perfectly in Anki/Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);

  return cardCount;
}
