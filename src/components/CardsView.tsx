import React, { useState } from 'react';
import { TabTutorialModal } from './TabTutorialModal';
import confetti from 'canvas-confetti';
import { PrebuiltDeck } from '../data/prebuiltDecks';
import type { UserProfile } from '../hooks/useUserProfile';
import type { CardSchedule, SourceLanguage, TargetLanguage } from '../types';
import { SOURCE_LANGUAGES, TARGET_LANGUAGE_META, getLanguageFontFamily } from '../data/languages';
import { speakWithRate } from '../utils/audio';
import { isArabicUI, uiText } from '../utils/i18n';
import { getCardIntervalPreviews } from '../utils/sm2';
import { getArabicPhoneticSpelling } from '../utils/arabicPhonetics';
import { InteractiveArabicSentence } from './InteractiveArabicSentence';
import { JapaneseFuriganaText } from './JapaneseFuriganaText';
import { Flashcard } from './Flashcard';
import { OliveBranchIcon } from './CulturalToast';
import { BouncyButton } from './BouncyButton';
import { soundFX } from '../utils/soundFX';
import { BubbleArcadeGame } from './BubbleArcadeGame';
import {
  BTN_GHOST,
  BTN_PRIMARY,
  CARD_CLASS,
  CHUNK_COLORS,
  DeckDefinition,
  DeckStats,
  FlashcardItemData
} from './uiConstants';

export interface DeckListViewProps {
  profile?: UserProfile | null;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
  coreDecks: DeckDefinition[];
  expandedDecks: PrebuiltDeck[];
  prebuiltDecks: PrebuiltDeck[];
  importedDecks: string[];
  getDeckStats: (deckId: string) => DeckStats;
  onSelectDeck: (deckId: string) => void;
  onDownloadDeck: (deck: PrebuiltDeck) => void;
  onDownloadAllExpandedDecks: () => void;
  onOpenAttribution: (deck: PrebuiltDeck) => void;
}

/**
 * Anki Mobile Deck List Dashboard ("The Vision")
 * - Three-column stats on the right: New (Blue), Learning (Red), Due (Green)
 * - Prominent "Study All Due Cards" button at the top with daily cap
 * - Core Decks + Prebuilt Master Decks (150 Cards) + Open Source Decks (100% Copyright-Free CC0)
 */
export function DeckListView({
  profile,
  sourceLang = 'ar',
  targetLang = 'en',
  coreDecks,
  expandedDecks,
  prebuiltDecks,
  importedDecks,
  getDeckStats,
  onSelectDeck,
  onDownloadDeck,
  onDownloadAllExpandedDecks,
  onOpenAttribution
}: DeckListViewProps) {
  const rtl = isArabicUI(profile?.language);
  const t = (en: string, ar: string) => uiText(profile?.language, en, ar);
  const isEgyptianOnly = profile?.dialect === 'egyptian';
  const [showGuide, setShowGuide] = useState(false);

  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['ar'];
  const targetMeta = TARGET_LANGUAGE_META[targetLang] || TARGET_LANGUAGE_META['en'];

  const allStats = getDeckStats('all');
  const actualDueTotal = allStats.dueCount + allStats.learningCount;
  const isDueMode = actualDueTotal > 0;

  const undownloadedExpandedCount = expandedDecks
    .filter(d => !importedDecks.includes(d.id))
    .reduce((sum, d) => sum + d.cards.length, 0);

  const renderPrebuiltDeckRow = (deck: PrebuiltDeck) => {
    const isDownloaded = importedDecks.includes(deck.id);
    const st = getDeckStats(deck.id);

    return (
      <div
        key={deck.id}
        id={`os-deck-${deck.id}`}
        className={`${CARD_CLASS} !mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isDownloaded ? (
              <BouncyButton
                type="button"
                onClick={() => onSelectDeck(deck.id)}
                className="font-semibold text-base text-left hover:text-teal-700 dark:hover:text-teal-300 transition-colors !min-h-0 !min-w-0"
              >
                {deck.name}
              </BouncyButton>
            ) : (
              <span className="font-semibold text-base">{deck.name}</span>
            )}
            <button
              type="button"
              id={`attr-btn-${deck.id}`}
              aria-label={`Attribution info for ${deck.name}`}
              title={t('Public domain license & attribution', 'معلومات الترخيص والمصدر')}
              onClick={e => {
                e.stopPropagation();
                onOpenAttribution(deck);
              }}
              className="text-xs px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 !min-h-[32px] !min-w-[32px]"
            >
              ⓘ
            </button>
          </div>
          <p className="text-xs opacity-75 mt-0.5 leading-relaxed">{deck.description}</p>
          <div className="text-[11px] opacity-60 mt-1">
            {deck.author} · {deck.license} · {deck.cards.length} {t('cards', 'بطاقة')}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div
            onClick={() => {
              if (isDownloaded) onSelectDeck(deck.id);
            }}
            role={isDownloaded ? 'button' : undefined}
            tabIndex={isDownloaded ? 0 : undefined}
            onKeyDown={e => {
              if (isDownloaded && (e.key === 'Enter' || e.key === ' ')) {
                onSelectDeck(deck.id);
              }
            }}
            className={`grid grid-cols-3 gap-3 text-right w-28 font-bold text-sm tabular-nums ${
              isDownloaded ? 'cursor-pointer' : ''
            }`}
          >
            <span
              className={
                st.newCount > 0
                  ? 'text-sky-700 dark:text-sky-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title={t('New cards', 'بطاقات جديدة')}
            >
              {st.newCount}
            </span>
            <span
              className={
                st.learningCount > 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title={t('Learning cards', 'بطاقات قيد التعلم')}
            >
              {st.learningCount}
            </span>
            <span
              className={
                st.dueCount > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-600'
              }
              title={t('Due cards', 'بطاقات مستحقة')}
            >
              {st.dueCount}
            </span>
          </div>

          {isDownloaded ? (
            <button
              type="button"
              id={`study-os-${deck.id}`}
              onClick={() => onSelectDeck(deck.id)}
              className={BTN_PRIMARY}
              style={{ minHeight: 48 }}
            >
              {t('Study', 'ادرس')}
            </button>
          ) : (
            <button
              type="button"
              id={`download-deck-${deck.id}`}
              onClick={() => onDownloadDeck(deck)}
              className={BTN_PRIMARY + ' shrink-0'}
              style={{ minHeight: 48 }}
            >
              ⬇ {t('Download', 'تحميل')} ({deck.cards.length})
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="anki-deck-list" dir={rtl ? 'rtl' : 'ltr'} className="space-y-5">
      {/* Top Header & Study CTA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <span>🧠</span>
              <span>{t('Flashcards & Review', 'البطاقات والمراجعة')}</span>
            </h2>
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-1">
              {t(
                'Spaced repetition for long-term memory',
                'مراجعة ذكية بالتكرار المتباعد لتثبيت الكلمات في الذاكرة'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition"
            aria-label={t('How flashcards work', 'كيف تعمل البطاقات')}
            style={{ minHeight: 40 }}
          >
            <span>❓</span>
            <span>{t('Guide', 'دليل البطاقات')}</span>
          </button>
        </div>

        {/* Primary Full-Width CTA Button */}
        <button
          type="button"
          id="study-all-btn"
          disabled={allStats.totalCards === 0 || (actualDueTotal === 0 && allStats.newCount === 0)}
          onClick={() => onSelectDeck('all')}
          className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          style={{ minHeight: 56 }}
        >
          <span>⚡</span>
          <span>
            {isDueMode
              ? t(`Study ${allStats.cappedTotal} Cards`, `ادرس ${allStats.cappedTotal} بطاقات`)
              : allStats.newCount > 0
              ? t(`Learn ${allStats.cappedNewCount} New Cards`, `تعلم ${allStats.cappedNewCount} بطاقات جديدة`)
              : t('All Cards Completed! ✨', 'أكملت جميع البطاقات! ✨')}
          </span>
          <span className="text-xs font-bold opacity-90 bg-teal-800/80 px-2.5 py-0.5 rounded-xl">
            {isDueMode
              ? `${allStats.cappedTotal} / ${actualDueTotal} ${t('due', 'مستحق')}`
              : allStats.newCount > 0
              ? `${allStats.cappedNewCount} / ${allStats.newCount} ${t('new', 'جديدة')}`
              : '0'}
          </span>
        </button>
      </div>

      {/* Core Decks Section */}
      <div>
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <span>
            {isEgyptianOnly
              ? t(
                  'Egyptian Arabic (Ammiya) Decks 🇪🇬',
                  'مجموعات العامية المصرية المخصصة 🇪🇬'
                )
              : t(
                  `Decks for ${targetMeta.nameEn} (from ${sourceMeta.nameEn})`,
                  `مجموعات ${targetMeta.nameAr} (من ${sourceMeta.nameAr})`
                )}
          </span>
        </div>

        <div className="space-y-2.5">
          {coreDecks.map(deck => {
            const st = getDeckStats(deck.id);
            const isEmptyCustom = deck.id === 'custom' && st.totalCards === 0;
            const isMaster = deck.id === 'master-dictionary';

            if (isEmptyCustom) {
              return (
                <button
                  key={deck.id}
                  type="button"
                  id={`deck-card-${deck.id}`}
                  onClick={() => onSelectDeck(deck.id)}
                  className="w-full text-right p-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-600 dark:hover:border-teal-500 bg-stone-50/70 dark:bg-stone-900/70 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  style={{ minHeight: 52 }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center text-lg font-bold shrink-0">
                      ➕
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {t('Tap here to create your first flashcard', 'اضغط هنا لإنشاء بطاقتك الأولى')}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 truncate">
                        {t('Save words or phrases from the Translate tab', 'احفظ أي عبارة من تبويب الترجمة لتظهر هنا')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-xl bg-teal-100/70 dark:bg-teal-950/70 shrink-0">
                    {t('New', 'جديدة')}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={deck.id}
                type="button"
                id={`deck-card-${deck.id}`}
                onClick={() => onSelectDeck(deck.id)}
                className="w-full text-right p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:shadow-md hover:border-teal-600 dark:hover:border-teal-500 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                style={{ minHeight: 56 }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-stone-800 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform border border-teal-100 dark:border-stone-700">
                    {isMaster ? '📚' : '📝'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-base text-stone-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors flex items-center gap-2">
                      <span>{deck.name}</span>
                    </div>
                    <div className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate mt-0.5">
                      {deck.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {st.dueCount > 0 ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {st.dueCount} {t('due', 'مستحق')}
                    </span>
                  ) : st.newCount > 0 ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                      {st.newCount} {t('new', 'جديد')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      {t('Done', 'مكتمل')} ✨
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prebuilt Master Decks & Starter Decks (Shown only for MSA so Egyptian learners never see MSA cards) */}
      {!isEgyptianOnly && (
        <>
          <div id="prebuilt-master-decks-section">
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-2">
              <div>
                <span className="text-xs font-semibold opacity-75">
                  {t(
                    `Prebuilt Master Decks (${targetMeta.nameEn} · CC0 Public Domain)`,
                    `مجموعات الإتقان الجاهزة (${targetMeta.nameAr} · ملكية عامة CC0)`
                  )}
                </span>
              </div>
              {undownloadedExpandedCount > 0 && (
                <button
                  type="button"
                  id="download-all-master-decks-btn"
                  onClick={onDownloadAllExpandedDecks}
                  className="text-xs font-semibold text-olive-800 dark:text-olive-300 underline !min-h-[32px]"
                >
                  ⬇ {t('Download All 4 Master Decks', 'تحميل المجموعات الأربع كاملة')} (+
                  {undownloadedExpandedCount} {t('Cards', 'بطاقة')})
                </button>
              )}
            </div>

            <div className="space-y-2.5">{expandedDecks.map(renderPrebuiltDeckRow)}</div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold opacity-65">
              <span>
                {t('Starter & Public Domain Community Decks', 'مجموعات البداية والمجتمع المفتوحة')}
              </span>
              <span className="text-[11px] font-medium">CC0 1.0 Public Domain</span>
            </div>

            <div className="space-y-2.5">{prebuiltDecks.map(renderPrebuiltDeckRow)}</div>
          </div>
        </>
      )}

      <TabTutorialModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        language={rtl ? 'arabic' : 'english'}
        initialTab="flashcards"
      />
    </div>
  );
}

export interface ReviewViewProps {
  profile?: UserProfile | null;
  sourceLang?: SourceLanguage;
  targetLang?: TargetLanguage;
  deckName: string;
  deckStats: DeckStats;
  activeQueue: string[];
  currentCardData: FlashcardItemData | null;
  currentCardSchedule?: CardSchedule;
  cardAnswerShown: boolean;
  canUndo: boolean;
  isStruggling: boolean;
  preferredVoice?: string;
  comboCount?: number;
  onBackToDecks: () => void;
  onShowAnswer: () => void;
  onHideAnswer: () => void;
  onGradeCard: (grade: 0 | 1 | 2 | 3) => void;
  onUndoLastGrade: () => void;
  onAskAIAboutCard: () => void;
}

function getCardEmoji(text: string): string {
  const lower = (text || '').toLowerCase();
  if (lower.includes('cat') || lower.includes('قط')) return '🐱';
  if (lower.includes('dog') || lower.includes('كلب')) return '🐶';
  if (lower.includes('lion') || lower.includes('أسد')) return '🦁';
  if (lower.includes('apple') || lower.includes('تفاح')) return '🍎';
  if (lower.includes('rocket') || lower.includes('صاروخ') || lower.includes('سهلة') || lower.includes('فجّر')) return '🚀';
  if (lower.includes('hand') || lower.includes('شكرا') || lower.includes('thank') || lower.includes('gracias') || lower.includes('danke') || lower.includes('merci')) return '🤝';
  if (lower.includes('love') || lower.includes('حب')) return '❤️';
  if (lower.includes('happy') || lower.includes('فرح') || lower.includes('سعيد')) return '😄';
  if (lower.includes('water') || lower.includes('ماء') || lower.includes('مية') || lower.includes('دوش') || lower.includes('douche')) return '💧';
  if (lower.includes('coffee') || lower.includes('قهوة') || lower.includes('taze') || lower.includes('طاز')) return '☕';
  if (lower.includes('food') || lower.includes('أكل') || lower.includes('طعام') || lower.includes('أوردر') || lower.includes('order')) return '🍔';
  if (lower.includes('book') || lower.includes('كتاب') || lower.includes('درس')) return '📚';
  if (lower.includes('car') || lower.includes('عربية') || lower.includes('سيارة')) return '🚗';
  if (lower.includes('home') || lower.includes('بيت') || lower.includes('منزل') || lower.includes('أوضة') || lower.includes('oda')) return '🏠';
  if (lower.includes('bridge') || lower.includes('كوبري') || lower.includes('جسر') || lower.includes('köprü')) return '🌉';
  return '⭐';
}

/**
 * Anki-Style Review Experience (Noob-Friendly + Addictive Dopamine Feedback)
 */
export function ReviewView({
  profile,
  sourceLang = 'ar',
  targetLang = 'en',
  deckName,
  deckStats,
  activeQueue,
  currentCardData,
  currentCardSchedule,
  cardAnswerShown,
  canUndo,
  isStruggling,
  preferredVoice,
  comboCount = 0,
  onBackToDecks,
  onShowAnswer,
  onHideAnswer,
  onGradeCard,
  onUndoLastGrade,
  onAskAIAboutCard
}: ReviewViewProps) {
  const [isBubbleMode, setIsBubbleMode] = useState(false);
  const currentKey = activeQueue[0];
  const winsToChest = 3 - (comboCount % 3);
  const rtl = isArabicUI(profile?.language);
  const t = (en: string, ar: string) => uiText(profile?.language, en, ar);
  const isEgyptian = profile?.dialect === 'egyptian';
  const intervalPreviews = getCardIntervalPreviews(currentCardSchedule, isStruggling);

  const sourceMeta = SOURCE_LANGUAGES[sourceLang] || SOURCE_LANGUAGES['ar'];
  const targetMeta = TARGET_LANGUAGE_META[targetLang] || TARGET_LANGUAGE_META['en'];

  const sourceFont = getLanguageFontFamily(sourceMeta.code);
  const targetFont = getLanguageFontFamily(targetMeta.code);

  const cardEmoji = currentCardData ? getCardEmoji(currentCardData.en + ' ' + currentCardData.ar) : '⭐';

  const handleRevealAnswer = () => {
    soundFX.playFlipCoin();
    onShowAnswer();
    if (currentCardData?.en) {
      try {
        speakWithRate(currentCardData.en, 1.0, preferredVoice);
      } catch {}
    }
  };

  return (
    <div id="anki-review-view" dir={rtl ? 'rtl' : 'ltr'} className="mx-auto w-full">
      {/* Review Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            id="back-to-decks-btn"
            onClick={onBackToDecks}
            className={BTN_GHOST + ' !px-3 !py-1.5 text-xs shrink-0'}
            style={{ minHeight: 48 }}
          >
            {t('← Decks', '→ المجموعات')}
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{deckName}</div>
            <div className="text-xs font-bold tabular-nums flex items-center gap-1.5">
              <span className="text-sky-700 dark:text-sky-400" title={t('New cards', 'بطاقات جديدة')}>
                {deckStats.newCount}
              </span>
              <span className="opacity-40">+</span>
              <span
                className="text-red-700 dark:text-red-400"
                title={t('Learning cards', 'بطاقات قيد التعلم')}
              >
                {deckStats.learningCount}
              </span>
              <span className="opacity-40">+</span>
              <span
                className="text-emerald-700 dark:text-emerald-400"
                title={t('Due review cards', 'بطاقات مستحقة')}
              >
                {deckStats.dueCount}
              </span>
              <span className="opacity-40">·</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                🎁 {t(`${winsToChest} to Chest`, `باقي ${winsToChest} للصندوق`)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBubbleMode(prev => !prev)}
            className="px-3 py-1.5 rounded-xl border border-teal-500/50 bg-teal-950/60 text-teal-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition shadow-sm"
          >
            {isBubbleMode ? '🎴 بطاقات أنكي' : '🎮 فرقع الفقاعة'}
          </button>

          <button
            type="button"
            id="anki-undo-btn"
            disabled={!canUndo}
            onClick={onUndoLastGrade}
            title={t('Undo last card grade', 'التراجع عن آخر تقييم')}
            aria-label={t('Undo last card grade', 'التراجع عن آخر تقييم')}
            className={BTN_GHOST + ' !px-3 !py-1.5 text-xs shrink-0'}
            style={{ minHeight: 48 }}
          >
            {t('↩️ Undo', '↩️ تراجع')}
          </button>
        </div>
      </div>

      {isBubbleMode && currentCardData ? (
        <BubbleArcadeGame
          cards={[currentCardData]}
          onFinish={() => setIsBubbleMode(false)}
          onGradeCard={onGradeCard}
          preferredVoice={preferredVoice}
          isArabic={rtl}
        />
      ) : activeQueue.length === 0 || !currentCardData ? (
        <div
          id="review-empty-state"
          className={`${CARD_CLASS} kuffiyeh-card-watermark text-center py-8 border-stone-300 dark:border-stone-700`}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-olive-600/15 dark:bg-olive-500/20 text-olive-800 dark:text-olive-300 mb-3">
            <OliveBranchIcon size={32} className="text-olive-700 dark:text-olive-400" />
          </div>
          <p className="font-semibold text-lg">
            {deckStats.totalCards === 0
              ? isEgyptian
                ? t(
                    'No More Egyptian Arabic (Ammiya) Words in This Deck Right Now 🇪🇬',
                    'لا توجد بطاقات بالعامية المصرية في هذه المجموعة حالياً 🇪🇬'
                  )
                : t(
                    'This Olive Grove Deck Is Waiting for Your First Seed',
                    'هذه المجموعة بانتظار أول بطاقة تضيفها'
                  )
              : isEgyptian
                ? t(
                    'You’ve Reviewed All Available Egyptian Arabic Words for Now! 🎉',
                    'لقد راجعت كل الكلمات المتاحة بالعامية المصرية حالياً! 🎉'
                  )
                : t(
                    'Congratulations! You have finished this deck for now.',
                    'أحسنت! لقد أنهيت مراجعة هذه المجموعة في الوقت الحالي.'
                  )}
          </p>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mt-1 max-w-md mx-auto">
            {deckStats.totalCards === 0 ? (
              isEgyptian ? (
                t(
                  `We strictly keep your session in Egyptian Arabic (Ammiya) and never mix in MSA words. Open your Personalized Egyptian Vocabulary deck or add custom cards in the Translate tab!`,
                  `نحن نلتزم تماماً باختيارك للعامية المصرية ولا نخلطها ببطاقات الفصحى. افتح قاموسك المخصص بالعامية المصرية أو أضف بطاقاتك الخاصة من تبويب الترجمة!`
                )
              ) : (
                t(
                  `No cards are in "${deckName}" yet. Visit the Translate tab to save custom words/sentences and grow your personal deck.`,
                  `لا توجد بطاقات في "${deckName}" بعد. انتقل إلى تبويب الترجمة لحفظ جملك الخاصة وتوسيع مجموعتك.`
                )
              )
            ) : (
              t(
                `All due cards in "${deckName}" have been reviewed. Check back soon when your next cards are due!`,
                `تمت مراجعة جميع البطاقات المستحقة في "${deckName}". عد قريباً عند حلول موعد المراجعة القادمة!`
              )
            )}
          </p>
          <p dir="rtl" className="ar text-xs font-semibold text-olive-800 dark:text-olive-300 mt-2">
            «العلمُ غرسٌ، والصبرُ جذوره، والثمرةُ لسانٌ فصيح»
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={onBackToDecks} className={BTN_PRIMARY} style={{ minHeight: 48 }}>
              {t('← Back to Deck List', '→ العودة إلى قائمة المجموعات')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {isStruggling && (
            <p
              role="status"
              className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {t(
                "Let's slow down and review this a bit more.",
                'لنتمهل قليلاً ونراجع هذه البطاقة بتركيز أكبر.'
              )}
            </p>
          )}
          <Flashcard
            isFlipped={cardAnswerShown}
            onFlip={cardAnswerShown ? onHideAnswer : handleRevealAnswer}
            front={
              <div dir={sourceMeta.direction} style={{ fontFamily: sourceFont }} className={`${CARD_CLASS} text-center py-6`}>
                <div className="text-5xl sm:text-6xl mb-3 drop-shadow-md select-none animate-pulse">
                  {cardEmoji}
                </div>
                {sourceMeta.direction === 'rtl' ? (
                  <InteractiveArabicSentence
                    sentence={currentCardData.ar}
                    exercise={currentCardData.exercise}
                    preferredVoice={preferredVoice}
                    className="ar text-3xl sm:text-4xl leading-relaxed font-semibold"
                    showCaption={true}
                    resetKey={`card-${currentKey}`}
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl leading-relaxed font-semibold">
                    {currentCardData.ar}
                  </div>
                )}
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    className={`${BTN_GHOST} text-xs font-bold active:translate-y-1`}
                    style={{ minHeight: 48 }}
                    onClick={e => {
                      e.stopPropagation();
                      speakWithRate(currentCardData.ar, 1, preferredVoice);
                    }}
                  >
                    {t(`🔊 Hear ${sourceMeta.nameEn}`, `🔊 استمع لـ ${sourceMeta.nameAr}`)}
                  </button>
                </div>
              </div>
            }
            back={
              <div className={`${CARD_CLASS} text-center py-6`}>
                <div className="text-5xl sm:text-6xl mb-3 drop-shadow-md select-none animate-bounce">
                  {cardEmoji}
                </div>
                <div dir={sourceMeta.direction} style={{ fontFamily: sourceFont }} className="text-2xl sm:text-3xl leading-relaxed font-semibold text-slate-300">
                  {currentCardData.ar}
                </div>
                <hr className="my-3 border-slate-700/60" />
                
                {/* Foreign sentence with interactive tap-to-hear word chips */}
                <div dir={targetMeta.direction} style={{ fontFamily: targetFont }} translate="no" className="text-2xl sm:text-3xl font-black mb-2 flex flex-wrap items-center justify-center gap-1.5">
                  {currentCardData.en.split(/\s+/).map((w, wIdx) => (
                    <button
                      key={wIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWithRate(w, 0.9, preferredVoice);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 font-extrabold active:scale-110 active:-translate-y-1 transition-all cursor-pointer shadow-sm border border-teal-500/20"
                      title="اضغط لسماع الكلمة لوحدها"
                    >
                      {w}
                    </button>
                  ))}
                </div>

                {/* Arabic Phonetic Guide */}
                <div dir="rtl" className="my-2 inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-sm font-bold text-amber-300 shadow-sm">
                  <span className="text-xs text-amber-400/80 font-normal">نطقها بحروف عربي:</span>
                  <span>{getArabicPhoneticSpelling(currentCardData.en)}</span>
                </div>

                {currentCardData.breakdownChunks && (
                  <div className="grid grid-cols-2 gap-2 text-left my-2">
                    {currentCardData.breakdownChunks.map((chunk, idx) => (
                      <div key={idx} className={`rounded-xl p-2 ${CHUNK_COLORS[chunk.role]}`}>
                        <div dir={sourceMeta.direction} style={{ fontFamily: sourceFont }} className="font-semibold">
                          {chunk.arabicText}
                        </div>
                        <div dir={targetMeta.direction} style={{ fontFamily: targetFont }} translate="no" className="font-semibold text-sm">
                          {chunk.englishText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dual Speed Audio */}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className={`${BTN_GHOST} text-xs font-bold active:translate-y-1`}
                    style={{ minHeight: 44 }}
                    onClick={e => {
                      e.stopPropagation();
                      speakWithRate(currentCardData.en, 1, preferredVoice);
                    }}
                  >
                    🔊 اسمع عادي
                  </button>
                  <button
                    type="button"
                    className={`${BTN_GHOST} text-xs font-bold text-amber-400 active:translate-y-1`}
                    style={{ minHeight: 44 }}
                    onClick={e => {
                      e.stopPropagation();
                      speakWithRate(currentCardData.en, 0.65, preferredVoice);
                    }}
                  >
                    🐢 اسمع بالبطيء حرف حرف
                  </button>
                </div>
              </div>
            }
          />

          {!cardAnswerShown ? (
            <button
              type="button"
              id="show-answer-btn"
              className={`${BTN_PRIMARY} mt-4 w-full active:scale-98`}
              style={{ minHeight: 52 }}
              onClick={handleRevealAnswer}
            >
              {t('👀 Tap to reveal answer', '👀 اضغط لإظهار الإجابة')}
            </button>
          ) : (
            <>
              {/* 3 Giant Bouncy Game Buttons */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  id="grade-btn-slow"
                  onClick={() => {
                    try { speakWithRate(currentCardData.en, 0.65, preferredVoice); } catch {}
                    onGradeCard(0);
                  }}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-700/80 to-amber-600/90 hover:from-amber-600 hover:to-amber-500 text-white font-black text-sm sm:text-base border-2 border-amber-400/40 shadow-lg active:scale-95 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-xl">🐣</span>
                  <span>قولها تاني بالراحة</span>
                </button>

                <button
                  type="button"
                  id="grade-btn-gotit"
                  onClick={() => {
                    soundFX.playComboChord(comboCount + 1);
                    if ((comboCount + 1) % 5 === 0) soundFX.playFanfare();
                    void confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } });
                    onGradeCard(2);
                  }}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base border-2 border-emerald-300/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-xl">⭐</span>
                  <span>لقطتها يا بطل! (+15 XP)</span>
                  <span>🔥</span>
                </button>

                <button
                  type="button"
                  id="grade-btn-easy"
                  onClick={() => {
                    soundFX.playExplosion();
                    void confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
                    onGradeCard(3);
                  }}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-sm sm:text-base border-2 border-pink-300/40 shadow-[0_0_25px_rgba(236,72,153,0.35)] active:scale-95 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-xl">🚀</span>
                  <span>سهلة! فجّر البطاقة (+25 XP)</span>
                </button>
              </div>

              <p className="mt-4 block rounded-xl p-3 text-center text-xs font-bold text-stone-300">
                {t(
                  'No stress! Tap to listen slow, or blast ahead to earn XP toward your 🎁 Mystery Chest.',
                  'بدون توتر! اسمع بالبطيء أو فجّر البطاقة لكسب نقاط الخبرة نحو 🎁 صندوق المكافآت!'
                )}
              </p>
            </>
          )}
          <BouncyButton
            type="button"
            id="ask-ai-about-card-btn"
            onClick={onAskAIAboutCard}
            className={`${BTN_GHOST} mt-3 w-full`}
            style={{ minHeight: 48 }}
          >
            {t('✨ Ask AI about this word', '✨ اسأل المساعد الذكي عن هذه الكلمة')}
          </BouncyButton>
        </div>
      )}
    </div>
  );
}
