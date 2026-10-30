import React from 'react';
import { Lesson, Phase, UserProgress } from '../types';
import {
  buildFriendShareWhatsAppMessage,
  calculateLevelInfo,
  evaluateBadges,
  FEEDBACK_FORM_URL,
  feedbackMessage,
  mailLink,
  waFriendShareLink,
  waLink
} from '../utils/fx';
import { InteractiveArabicSentence } from './InteractiveArabicSentence';
import { ReviewHeatmapCard } from './ReviewHeatmapCard';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';
import { SocialLinks } from './SocialLinks';

export interface ProgressViewProps {
  progress: UserProgress;
  levelInfo: ReturnType<typeof calculateLevelInfo>;
  badges: ReturnType<typeof evaluateBadges>;
  phases: Phase[];
  allLessons: Lesson[];
  sortedWeakSpots: Array<[string, number]>;
  feedbackRating: number;
  feedbackText: string;
  getCompletedCountForLesson: (lesson: Lesson) => number;
  onToggleSound: () => void;
  onOpenLesson: (lessonIdx: number) => void;
  onChangeNotes: (val: string) => void;
  onDownloadOfflineHtml: () => void;
  onSetFeedbackRating: (rating: number) => void;
  onChangeFeedbackText: (val: string) => void;
  onCopyFeedback: () => void;
  onOpenPresentation: () => void;
  onResetProgress: () => void;
  onToast: (msg: string) => void;
}

export function ProgressView({
  progress,
  levelInfo,
  badges,
  phases,
  allLessons,
  sortedWeakSpots,
  feedbackRating,
  feedbackText,
  getCompletedCountForLesson,
  onToggleSound,
  onOpenLesson,
  onChangeNotes,
  onDownloadOfflineHtml,
  onSetFeedbackRating,
  onChangeFeedbackText,
  onCopyFeedback,
  onOpenPresentation,
  onResetProgress,
  onToast
}: ProgressViewProps) {
  return (
    <div>
      {/* Score / Streak / Best Streak */}
      <div className={`${CARD_CLASS} grid grid-cols-3 text-center`}>
        <div>
          <div className="text-2xl font-semibold">{progress.score}</div>
          <div className="text-xs opacity-70">score</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{progress.streak}</div>
          <div className="text-xs opacity-70">streak</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{progress.bestStreak || 0}</div>
          <div className="text-xs opacity-70">best streak</div>
        </div>
      </div>

      {/* Anki-Style Review Heatmap (7 rows x 20 columns) */}
      <ReviewHeatmapCard reviewHistory={progress.reviewHistory || {}} />

      {/* Level Card + Sound Toggle */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <div className="text-xs uppercase opacity-60">
              Level {levelInfo.levelNumber} of 5
            </div>
            <div className="text-lg font-semibold">🏆 {levelInfo.levelName}</div>
          </div>
          <button type="button" onClick={onToggleSound} className={BTN_GHOST}>
            {progress.soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>
        <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
          <div
            className="h-2 rounded-full bg-teal-600 transition-all"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <div className="text-xs opacity-70 mt-1.5">
          {levelInfo.level < 4
            ? `${progress.score} / ${levelInfo.nextLevelThreshold} XP to next level`
            : 'Maximum level achieved!'}
        </div>
      </div>

      {/* Badges Grid */}
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badges.map(b => (
            <div
              key={b.id}
              className={`rounded-xl border p-3 text-center transition-all ${
                b.unlocked
                  ? 'border-teal-500/50 bg-teal-50/60 dark:bg-teal-950/30'
                  : 'border-stone-200 dark:border-stone-700 opacity-45 grayscale'
              }`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-sm font-semibold">{b.title}</div>
              <div className="text-[11px] opacity-75 mt-0.5">{b.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Completion */}
      <div className={CARD_CLASS}>
        {phases.map(phase => {
          let totalEx = 0;
          let doneEx = 0;
          phase.lessons.forEach(l => {
            totalEx += l.exercises.length;
            doneEx += getCompletedCountForLesson(l);
          });
          const pct = Math.round((100 * doneEx) / Math.max(1, totalEx));
          return (
            <div key={phase.id} className="mb-3 last:mb-0">
              <div className="text-sm mb-1">
                Phase {phase.id} · {phase.title} · {pct}%
              </div>
              <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-teal-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weak Spots */}
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">Weak spots</h3>
        {sortedWeakSpots.length > 0 ? (
          sortedWeakSpots.map(([tag, count]) => {
            const targetLessonIdx = allLessons.findIndex(l => l.weakSpotTag === tag);
            return (
              <div
                key={tag}
                className="flex items-center justify-between gap-2 text-sm my-1.5"
              >
                <span className="w-40 shrink-0 truncate">{tag}</span>
                <div className="flex-1 bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-rose-500"
                    style={{ width: `${Math.min(100, count * 15)}%` }}
                  />
                </div>
                <span className="w-6 text-right font-medium">{count}</span>
                {targetLessonIdx >= 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenLesson(targetLessonIdx)}
                    className="text-xs text-teal-700 dark:text-teal-300 underline px-2 !min-h-[36px]"
                  >
                    Drill →
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm opacity-70">No mistakes recorded yet.</p>
        )}
      </div>

      {/* My Notes */}
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">My notes</h3>
        <textarea
          rows={4}
          value={progress.generalNotes || ''}
          onChange={e => onChangeNotes(e.target.value)}
          placeholder="Habits to watch, new ideas…"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3"
        />
      </div>

      {/* Share with Friends on WhatsApp */}
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-1">📲 Share with friends on WhatsApp</h3>
        <p className="text-xs opacity-75 mb-2.5">
          Send your friends the live app link along with the review form (
          <span className="underline">{FEEDBACK_FORM_URL}</span>) in one tap:
        </p>
        <pre className="whitespace-pre-wrap text-xs rounded-xl bg-stone-100 dark:bg-stone-900/70 p-3 border border-stone-200 dark:border-stone-700 mb-2.5 leading-relaxed">
          {buildFriendShareWhatsAppMessage()}
        </pre>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            id="download-html-progress-btn"
            onClick={onDownloadOfflineHtml}
            className={`${BTN_PRIMARY} w-full text-center flex items-center justify-center cursor-pointer`}
          >
            📥 Download Thinking-English.html File (Attach in WhatsApp)
          </button>
          <a
            href={waFriendShareLink(buildFriendShareWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_GHOST} flex-1 text-center flex items-center justify-center`}
          >
            📲 Send Link on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                ?.writeText(buildFriendShareWhatsAppMessage())
                .then(() => onToast('WhatsApp message copied ✓'))
                .catch(() => onToast('Copy not supported here'));
            }}
            className={`${BTN_GHOST} flex-1`}
          >
            📋 Copy Message
          </button>
        </div>
      </div>

      {/* Feedback for your teacher */}
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">Feedback for your teacher</h3>
        <div className="flex mb-3">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onSetFeedbackRating(n)}
              aria-label={`Rate ${n} out of 5`}
              className={`${
                n === feedbackRating ? BTN_PRIMARY : BTN_GHOST
              } flex-1 mx-0.5 !px-0`}
            >
              {['😕', '🙁', '😐', '🙂', '😍'][n - 1]}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={feedbackText}
          onChange={e => onChangeFeedbackText(e.target.value)}
          placeholder="What helped? What was confusing?"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <a
            href={waLink(
              feedbackMessage(feedbackRating, feedbackText, progress, allLessons.length)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_PRIMARY} flex-1 text-center flex items-center justify-center`}
          >
            WhatsApp
          </a>
          <a
            href={mailLink(
              feedbackMessage(feedbackRating, feedbackText, progress, allLessons.length)
            )}
            className={`${BTN_GHOST} flex-1 text-center flex items-center justify-center`}
          >
            Email
          </a>
          <button type="button" onClick={onCopyFeedback} className={`${BTN_GHOST} flex-1`}>
            Copy
          </button>
        </div>
        {FEEDBACK_FORM_URL && (
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_GHOST} w-full mt-2 text-center flex items-center justify-center`}
          >
            📝 Full feedback form (forms.gle)
          </a>
        )}
      </div>

      {/* Recap View for Training Meeting */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold">Recap: the {allLessons.length} mental shifts</h3>
          <button
            type="button"
            onClick={onOpenPresentation}
            className={BTN_GHOST + ' !text-xs'}
          >
            🖥️ Presentation mode
          </button>
        </div>
        <p className="text-xs opacity-60 mb-2">
          Tap a shift to expand it, or double-tap any Arabic word inside to translate.
        </p>
        {allLessons.map(l => {
          const sampleEx = l.exercises[0];
          return (
            <details key={l.id} className="border-t border-stone-200 dark:border-stone-700">
              <summary className="py-3 text-sm font-semibold">
                <span>
                  {l.number}. {l.title}
                </span>
                <span dir="rtl" className="ar text-xs opacity-75 block mt-0.5">
                  {l.titleAr}
                </span>
              </summary>
              <div className="pb-3 space-y-2">
                <p className="text-sm opacity-85 leading-relaxed">{l.transferConcept}</p>
                <p dir="rtl" className="ar text-sm opacity-85 leading-relaxed text-right">
                  {l.transferConceptAr}
                </p>
                {sampleEx && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 dark:border-stone-700/70">
                    <InteractiveArabicSentence
                      sentence={sampleEx.arabicThought}
                      exercise={sampleEx}
                      preferredVoice={progress.preferredVoice}
                      className="ar text-lg font-semibold text-right"
                      showCaption={false}
                      resetKey={`recap-${l.id}`}
                    />
                    <div
                      translate="no"
                      className="text-xs text-teal-700 dark:text-teal-300 font-semibold mt-1"
                    >
                      → {sampleEx.englishTarget}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      <button type="button" className={BTN_GHOST} onClick={onResetProgress}>
        Reset progress
      </button>
      <div className="mt-5">
        <SocialLinks />
      </div>
    </div>
  );
}
