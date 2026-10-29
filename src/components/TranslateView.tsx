import React from 'react';
import { speakWithRate } from '../utils/audio';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';

export interface TranslateViewProps {
  trSrc: string;
  trOut: string;
  trFrom: 'ar' | 'en' | '';
  trTo: 'ar' | 'en' | '';
  trBusy: boolean;
  bulkText: string;
  bulkBusy: boolean;
  preferredVoice?: string;
  trInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onType: (val: string) => void;
  onPaste: () => void;
  onClear: () => void;
  onCopy: () => void;
  onSaveAsCard: () => void;
  onChangeBulkText: (val: string) => void;
  onGenerateBulkCards: () => void;
  onInsertSampleBulkLines: () => void;
}

export function TranslateView({
  trSrc,
  trOut,
  trFrom,
  trTo,
  trBusy,
  bulkText,
  bulkBusy,
  preferredVoice,
  trInputRef,
  onType,
  onPaste,
  onClear,
  onCopy,
  onSaveAsCard,
  onChangeBulkText,
  onGenerateBulkCards,
  onInsertSampleBulkLines
}: TranslateViewProps) {
  return (
    <div>
      {/* Single Sentence Auto-Translator */}
      <div className={CARD_CLASS}>
        <div className="text-xs uppercase opacity-60 mb-2">
          Type or paste Arabic or English. It detects the language and translates automatically.
        </div>
        <textarea
          ref={trInputRef}
          id="tri"
          rows={3}
          value={trSrc}
          onChange={e => onType(e.target.value)}
          placeholder="اكتب هنا… / Type here…"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent p-3"
        />
        <p id="mymemory-privacy-note" className="text-[11px] opacity-75 mt-2">
          🔒 <strong>Privacy note:</strong> Translations are sent to MyMemory.net. Don’t paste anything private.
        </p>
        <div className="flex gap-2 mt-2">
          <button type="button" className={`${BTN_GHOST} flex-1`} onClick={onPaste}>
            📋 Paste
          </button>
          <button type="button" className={`${BTN_GHOST} flex-1`} onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <div className={CARD_CLASS} id="tro">
        {trBusy ? (
          <p className="text-sm opacity-70">Translating…</p>
        ) : !trOut ? (
          <p className="text-sm opacity-60">Your translation appears here.</p>
        ) : (
          <div>
            <div
              dir={trTo === 'ar' ? 'rtl' : undefined}
              translate="no"
              className={
                trTo === 'ar'
                  ? 'ar text-2xl leading-relaxed font-semibold'
                  : 'text-xl font-semibold'
              }
            >
              {trOut}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {trFrom === 'ar' ? 'Arabic → English' : 'English → Arabic'}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className={BTN_GHOST}
                onClick={() =>
                  speakWithRate(trTo === 'en' ? trOut : trSrc, 1, preferredVoice)
                }
              >
                🔊 Hear English
              </button>
              <button type="button" className={BTN_GHOST} onClick={onCopy}>
                Copy
              </button>
              <button type="button" className={BTN_PRIMARY} onClick={onSaveAsCard}>
                ➕ Save as card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Add Custom Cards (Batch Import) */}
      <div id="bulk-add-card-box" className={`${CARD_CLASS} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base">📦 Bulk Add Custom Cards</h3>
          <button
            type="button"
            id="bulk-sample-btn"
            onClick={onInsertSampleBulkLines}
            className="text-xs text-teal-700 dark:text-teal-300 underline font-medium !min-h-[32px]"
          >
            ✨ Insert Sample Lines
          </button>
        </div>
        <p className="text-xs opacity-75 mb-2.5 leading-relaxed">
          Paste multiple lines below (one sentence per line in Arabic or English, or two-column pairs
          separated by <code>|</code>, <code>-</code>, or <code>Tab</code>). We will pair or
          auto-translate each line and add them all to <strong>My Custom Translations</strong>.
        </p>
        <textarea
          id="bulk-cards-input"
          rows={5}
          value={bulkText}
          onChange={e => onChangeBulkText(e.target.value)}
          placeholder={
            'أنا مستعد للاجتماع | I am ready for the meeting.\nهل يمكنك مساعدتي في هذا التقرير؟\nI have been waiting for half an hour.'
          }
          className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent p-3 text-sm"
        />
        <div className="flex flex-wrap gap-2 mt-2.5">
          <button
            type="button"
            id="bulk-generate-btn"
            disabled={bulkBusy || !bulkText.trim()}
            onClick={onGenerateBulkCards}
            className={`${BTN_PRIMARY} flex-1`}
          >
            {bulkBusy ? '⏳ Generating Cards…' : '⚡ Generate Cards from Lines'}
          </button>
          {bulkText.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onChangeBulkText('')}
              className={BTN_GHOST}
            >
              Clear Lines
            </button>
          )}
        </div>
      </div>

      <p className="text-xs opacity-60 mt-2">
        Tip: hit “➕ Save as card” or use “⚡ Generate Cards from Lines” to build your custom Anki
        deck in seconds.
      </p>
    </div>
  );
}
