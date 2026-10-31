import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Exercise, Lesson, UserProgress } from '../types';
import { CLOUD_AI_VOICE_ID, speakWithRate } from '../utils/audio';
import { computeNextHintWord, MYSTERY_CHEST_THRESHOLD } from '../utils/habitPsychology';
import { normalizeSentence } from '../utils/transferLogic';
import { InteractiveArabicSentence } from './InteractiveArabicSentence';
import {
  BTN_GHOST,
  BTN_PRIMARY,
  CARD_CLASS,
  CHUNK_COLORS,
  CHUNK_LABELS
} from './uiConstants';

export interface PracticeViewProps {
  lesson: Lesson | null;
  exercise: Exercise | null;
  activeExIdx: number;
  tries: number;
  exState: 'ask' | 'ok' | 'rev';
  userAnswer: string;
  feedbackHtml: string;
  shuffledChips: string[];
  showBlueprintPeek: boolean;
  xpPopText: string | null;
  progress: UserProgress;
  voices?: SpeechSynthesisVoice[];
  chosenVoice?: SpeechSynthesisVoice;
  isRecordingPron: boolean;
  pronAudioUrl: string | null;
  pronResultText: string;
  pronWordMatches: Array<{ word: string; ok: boolean }>;
  answerInputRef: React.RefObject<HTMLInputElement | null>;
  onStartLessonOne: () => void;
  onToggleBlueprintPeek: () => void;
  onChangeAnswer: (val: string) => void;
  onAddChip: (word: string) => void;
  onRemoveWordAt: (idx: number) => void;
  onGiveNextWordHint: () => void;
  onCheckAnswer: () => void;
  onClearAnswer: () => void;
  onRevealAnswer: () => void;
  onNextExercise: () => void;
  onPronunciationPractice: () => void;
  onSelectVoice?: (voiceName: string) => void;
  onAskTutor?: (exercise: Exercise, prompt: string) => void;
  onToast: (msg: string) => void;
}

export const YOUTUBE_CHANNEL_URL = 'https://youtube.com/@SciAmrSherif';
const IDLE_HELP_MS = 15_000;

export function PracticeView({
  lesson,
  exercise,
  activeExIdx,
  tries,
  exState,
  userAnswer,
  feedbackHtml,
  shuffledChips,
  showBlueprintPeek,
  xpPopText,
  progress,
  isRecordingPron,
  pronAudioUrl,
  pronResultText,
  pronWordMatches,
  answerInputRef,
  onStartLessonOne,
  onToggleBlueprintPeek,
  onChangeAnswer,
  onAddChip,
  onRemoveWordAt,
  onGiveNextWordHint,
  onCheckAnswer,
  onClearAnswer,
  onRevealAnswer,
  onNextExercise,
  onPronunciationPractice,
  onAskTutor,
  onToast
}: PracticeViewProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLostPrompt, setShowLostPrompt] = useState(false);
  const [lostDismissedFor, setLostDismissedFor] = useState<string | null>(null);

  const exerciseId = exercise?.id ?? null;
  const isAskState = exState === 'ask';

  // Proactive tutor: after 15s with no block tapped on the current sentence, offer help.
  useEffect(() => {
    setShowLostPrompt(false);
    if (!exerciseId || !isAskState || !onAskTutor || lostDismissedFor === exerciseId) return;
    const timer = window.setTimeout(() => setShowLostPrompt(true), IDLE_HELP_MS);
    return () => window.clearTimeout(timer);
  }, [exerciseId, isAskState, userAnswer, lostDismissedFor, onAskTutor]);

  useEffect(() => {
    if (!showTutorial) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowTutorial(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showTutorial]);

  if (!lesson || !exercise) {
    return (
      <div className={CARD_CLASS}>
        <p className="mb-3">Pick a lesson in the Lessons tab to begin.</p>
        <button type="button" className={BTN_PRIMARY} onClick={onStartLessonOne}>
          Start Lesson 1 →
        </button>
      </div>
    );
  }

  const isAsk = exState === 'ask';
  const progressPct = (100 * (activeExIdx + (isAsk ? 0 : 1))) / lesson.exercises.length;
  const currentWords = userAnswer.trim() ? userAnswer.trim().split(/\s+/).filter(Boolean) : [];
  const beginnerOn = progress.beginnerMode !== false;
  const { nextWord } = computeNextHintWord(exercise.englishTarget, userAnswer);
  const normNextWord = nextWord ? normalizeSentence(nextWord) : '';
  const combo = (progress.comboCount ?? 0) % MYSTERY_CHEST_THRESHOLD;
  const winsLeftForChest = MYSTERY_CHEST_THRESHOLD - combo;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <span className="min-w-0 font-semibold leading-snug">
          {lesson.number}. {lesson.title} · {activeExIdx + 1}/{lesson.exercises.length}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 tabular-nums sm:justify-end">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="rounded-full border border-orange-400/60 bg-orange-50 px-3.5 py-2 text-xs font-bold text-orange-800 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-950/30 dark:text-orange-200 dark:hover:bg-orange-950/50"
          >
            🎥 Watch Tutorial
          </button>          <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold">
            {tries === 0 ? '+10 XP first try' : '+5 XP retry'}
            {progress.streak >= 2 ? ' · 🔥 Combo +5 XP' : ''}
          </span>
          <span id="sc" className="relative font-semibold shrink-0">
            ⭐ {progress.score} · 🔥 {progress.streak}
            {xpPopText && (
              <span className="xp-pop absolute -top-5 right-0 text-xs font-bold text-teal-600 dark:text-teal-400">
                {xpPopText}
              </span>
            )}
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPct)}
        className="mb-3 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
      >
        <div
          className="h-full rounded-full bg-teal-600 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Collapsible Transfer Concept Reminder */}
      <details className="mb-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 px-3 py-1 sm:px-4">
        <summary className="py-2 text-xs font-semibold flex items-center justify-between">
          <span className="pr-2">💡 Easy Thinking Secret (السر الذهني ببساطة — اضغط للعرض)</span>
          <span className="opacity-60">▼</span>
        </summary>
        <div className="pb-3 pt-1 border-t border-stone-200 dark:border-stone-700 space-y-1.5 text-xs">
          <p className="leading-relaxed">{lesson.transferConcept}</p>
          <p
            dir="rtl"
            className="ar text-sm text-teal-700 dark:text-teal-300 font-semibold text-right"
          >
            {lesson.transferConceptAr}
          </p>
        </div>
      </details>

      {/* Arabic Prompt Card with Double-Tap Word Auto-Translator */}
      <div key={exercise.id} className={`${CARD_CLASS} practice-card-enter !mb-0 !p-6 sm:!p-8`}>
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Say this thought in English
          </span>
          <button
            type="button"
            onClick={onToggleBlueprintPeek}
            className="self-start text-xs font-semibold text-teal-700 underline decoration-teal-500/50 underline-offset-2 dark:text-teal-300 sm:self-auto"
          >
            {showBlueprintPeek ? 'Hide Structure Peek' : '🔍 Structure Peek'}
          </button>
        </div>

        <InteractiveArabicSentence
          sentence={exercise.arabicThought}
          exercise={exercise}
          preferredVoice={progress.preferredVoice}
          className="ar text-2xl leading-relaxed font-semibold sm:text-3xl"
          showCaption={true}
          resetKey={exercise.id}
        />

        {exercise.arabicContext && (
          <div dir="rtl" className="ar text-xs opacity-70 mt-1">
            {exercise.arabicContext}
          </div>
        )}

        {(showBlueprintPeek || beginnerOn) && (
          <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700 flex flex-wrap gap-1.5 items-center text-xs">
            <span className="opacity-70 mr-1"> Step-by-Step Blocks:</span>
            {exercise.breakdownChunks.map((ch, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-lg font-medium ${CHUNK_COLORS[ch.role]}`}
              >
                {CHUNK_LABELS[ch.role]} ({ch.arabicText})
              </span>
            ))}
          </div>
        )}
      </div>

      {isAsk ? (
        <div className={`${CARD_CLASS} practice-card-enter !mb-0 !p-6 sm:!p-8`}>
          {/* Beginner Scaffolding Banner */}
          {beginnerOn && nextWord && (
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs">
              <span>
                🐣 <strong>Beginner Assist:</strong> Tap the highlighted green word block{' '}
                <strong translate="no" className="text-emerald-700 dark:text-emerald-300">
                  “{nextWord}”
                </strong>{' '}
                next, or click <strong>🪄 Next Word Hint</strong>!
              </span>
              <span className="text-[11px] opacity-75">
                🎁 {winsLeftForChest} win{winsLeftForChest === 1 ? '' : 's'} to Mystery Chest
              </span>
            </div>
          )}

          {currentWords.length > 0 && (
            <div
              role="group"
              aria-label="Your sentence so far; tap a word to remove it"
              className="mb-3 flex flex-wrap gap-2 rounded-xl bg-stone-100/80 p-3 dark:bg-stone-900/50"
            >
              {currentWords.map((w, idx) => (
                <button
                  key={`${w}-${idx}`}
                  type="button"
                  translate="no"
                  onClick={() => onRemoveWordAt(idx)}
                  title="Tap to remove word"
                  className="chip-btn rounded-full bg-teal-700/15 px-3 py-1 text-sm font-medium text-teal-900 hover:bg-rose-500/20 dark:bg-teal-400/20 dark:text-teal-200"
                >
                  {w} ×
                </button>
              ))}
            </div>
          )}

          <label
            htmlFor="ans"
            className="mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300"
          >
            Build your English sentence
          </label>
          <input
            ref={answerInputRef}
            id="ans"
            type="text"
            translate="no"
            value={userAnswer}
            onChange={e => onChangeAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onCheckAnswer();
            }}
            placeholder="Tap the words below or type here…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="min-h-[52px] w-full rounded-xl border border-stone-300 bg-white/70 p-3 shadow-inner outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-stone-600 dark:bg-stone-900/50"
          />

          <div
            role="group"
            aria-label="Available English words"
            className="mt-4 flex flex-wrap gap-3"
          >
            {shuffledChips.map((chip, idx) => {
              const isSuggestedNext =
                beginnerOn && normNextWord.length > 0 && normalizeSentence(chip) === normNextWord;
              return (
                <button
                  key={`${chip}-${idx}`}
                  type="button"
                  translate="no"
                  onClick={() => onAddChip(chip)}
                  className={`chip-btn ${BTN_GHOST} min-h-[52px] !px-5 !py-3 text-lg transition-all ${
                    isSuggestedNext
                      ? '!border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30'
                      : ''
                  }`}
                >
                  {isSuggestedNext ? `✨ ${chip}` : chip}
                </button>
              );
            })}
          </div>

          {feedbackHtml && (
            <div
              id="fb"
              role="status"
              aria-live="polite"
              className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 font-medium leading-relaxed"
            >
              🧭 {feedbackHtml}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              id="check-answer-btn"
              className={`${BTN_PRIMARY} col-span-2 min-h-[48px] w-full sm:col-span-1 sm:w-auto sm:flex-1`}
              onClick={onCheckAnswer}
            >
              ✅ Check Answer
            </button>
            <button
              type="button"
              id="next-word-hint-btn"
              disabled={!nextWord}
              onClick={onGiveNextWordHint}
              title="Fill in the exact next English word for me"
              className={`${BTN_GHOST} col-span-2 min-h-[48px] whitespace-normal border-emerald-500/50 text-emerald-800 dark:text-emerald-300 sm:col-span-1`}
            >
              🪄 Next Word (كلمة مساعدة)
            </button>
            <button
              type="button"
              title="Clear and reshuffle word blocks"
              className={`${BTN_GHOST} min-h-[48px]`}
              onClick={onClearAnswer}
            >
              ↺ Reset
            </button>
            <button type="button" className={`${BTN_GHOST} min-h-[48px]`} onClick={onRevealAnswer}>
              Reveal
            </button>
          </div>
        </div>
      ) : (
        <div className={`${CARD_CLASS} practice-card-enter !mb-0 !p-6 sm:!p-8`}>
          <div translate="no" className="text-lg font-semibold mb-3">
            {exercise.englishTarget}
            {exState === 'ok' ? ' ✅' : ''}
          </div>

          <div className="flex flex-wrap gap-2">
            {exercise.breakdownChunks.map((chunk, idx) => (
              <div
                key={idx}
                className={`flex-1 min-w-[130px] rounded-xl p-2.5 text-center ${CHUNK_COLORS[chunk.role]}`}
              >
                <div className="text-[10px] tracking-wider opacity-70 font-semibold">
                  {CHUNK_LABELS[chunk.role]}
                </div>
                <div dir="rtl" className="ar text-base font-semibold mt-0.5">
                  {chunk.arabicText}
                </div>
                <div translate="no" className="font-semibold text-sm mt-0.5">
                  {chunk.englishText}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm mt-3 leading-relaxed">💡 {lesson.transferConcept}</p>
          <p dir="rtl" className="ar text-sm mt-1.5 opacity-85 leading-relaxed text-right">
            {lesson.transferConceptAr}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <button
              type="button"
              className={`${BTN_GHOST} min-h-[52px] text-base`}
              onClick={() => {
                const ok = speakWithRate(exercise.englishTarget, 1, CLOUD_AI_VOICE_ID);
                if (!ok) onToast('Speech not supported here');
              }}
            >
              🔊 Hear
            </button>
            <button
              type="button"
              className={`${BTN_GHOST} min-h-[52px] text-base`}
              onClick={() => {
                const ok = speakWithRate(exercise.englishTarget, 0.75, CLOUD_AI_VOICE_ID);
                if (!ok) onToast('Speech not supported here');
              }}
            >
              🐢 Slow
            </button>
            <button
              type="button"
              id="rb"
              className={`${BTN_GHOST} col-span-2 min-h-[52px] text-base sm:col-span-1`}
              onClick={onPronunciationPractice}
            >
              {isRecordingPron ? '⏹ Stop' : '🎙 Record yourself'}
            </button>
          </div>

          {(pronAudioUrl || pronResultText || pronWordMatches.length > 0) && (
            <div id="pr" aria-live="polite" className="mt-3 space-y-1.5 text-sm">
              {pronAudioUrl && (
                <div>
                  Yours:{' '}
                  <audio
                    controls
                    src={pronAudioUrl}
                    className="inline-block align-middle h-8"
                  />
                </div>
              )}
              {pronResultText && <div>{pronResultText}</div>}
              {pronWordMatches.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {pronWordMatches.map((item, idx) => (
                    <span
                      key={`${item.word}-${idx}`}
                      translate="no"
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        item.ok
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Zeigarnik Effect Nudge on the Next Button */}
          <button
            type="button"
            id="next-exercise-btn"
            className={`${BTN_PRIMARY} mt-4 min-h-[52px] w-full`}
            onClick={onNextExercise}
          >
            Next Sentence ({winsLeftForChest} more win{winsLeftForChest === 1 ? '' : 's'} to 🎁
            Mystery Chest) →
          </button>
        </div>
      )}

      {/* Proactive "Are you lost?" tutor nudge */}
      {showLostPrompt && isAsk && onAskTutor && (
        <div
          role="dialog"
          aria-label="Need help?"
          className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom,0px))] right-4 z-[990] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-orange-300/60 bg-white p-4 text-slate-900 shadow-2xl dark:border-orange-500/40 dark:bg-slate-900 dark:text-slate-100"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setShowLostPrompt(false);
              setLostDismissedFor(exercise.id);
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <p className="pr-6 text-sm font-semibold leading-snug">
            🤔 Are you lost? Do you need help with this sentence?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`${BTN_PRIMARY} min-h-[44px]`}
              onClick={() => {
                setShowLostPrompt(false);
                setLostDismissedFor(exercise.id);
                onAskTutor(
                  exercise,
                  `The user is stuck on the sentence "${exercise.arabicThought}". Explain it to them step-by-step in Egyptian Arabic.`
                );
              }}
            >
              Yes, guide me
            </button>
            <button
              type="button"
              className={`${BTN_GHOST} min-h-[44px]`}
              onClick={() => {
                setShowLostPrompt(false);
                setLostDismissedFor(exercise.id);
              }}
            >
              No, I'm good
            </button>
          </div>
        </div>
      )}

      {/* Tutorial modal */}
      {showTutorial && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowTutorial(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-8"
          >
            <button
              type="button"
              aria-label="Close tutorial"
              onClick={() => setShowTutorial(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <h2 id="tutorial-title" className="pr-10 text-xl font-bold">
              🎥 How to practice
            </h2>
            <ol className="mt-5 space-y-4">
              {[
                'Read the Arabic sentence.',
                'Tap the blocks to build the English.',
                'Hit Check and listen to the audio.'
              ].map((text, index) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-base leading-snug">
                    <strong>Step {index + 1}:</strong> {text}
                  </span>
                </li>
              ))}
            </ol>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex min-h-[52px] items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-center text-base font-bold text-white transition hover:bg-red-700"
            >
              ▶ Watch the full video on YouTube
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
