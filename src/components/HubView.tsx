import React, { useEffect, useState } from 'react';
import { MentorQuestion, TeacherBroadcast } from '../types';
import { resolveVoiceNoteFromVault } from '../utils/audioVault';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';

function VaultAudioPlayer({ audioRefOrBase64 }: { audioRefOrBase64?: string }) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!audioRefOrBase64) {
      setResolvedUrl(null);
      return;
    }
    resolveVoiceNoteFromVault(audioRefOrBase64).then(url => {
      if (active) setResolvedUrl(url);
    });
    return () => {
      active = false;
    };
  }, [audioRefOrBase64]);

  if (!resolvedUrl) return null;
  return <audio controls src={resolvedUrl} className="h-8 mt-1" />;
}

export interface HubViewProps {
  studentNameDraft: string;
  mentorDraft: string;
  mentorVoiceBase64: string | null;
  isRecordingMentorVoice: boolean;
  broadcasts: TeacherBroadcast[];
  mentorQuestions: MentorQuestion[];
  teacherUnlocked: boolean;
  pinInput: string;
  teacherPin: string;
  replyDrafts: Record<string, string>;
  broadcastDraft: string;
  sortedWeakSpots: Array<[string, number]>;
  onChangeStudentName: (val: string) => void;
  onChangeMentorDraft: (val: string) => void;
  onToggleMentorVoice: () => void;
  onSendMentorQuestion: () => void;
  onChangePinInput: (val: string) => void;
  onUnlockTeacher: () => void;
  onLockTeacher: () => void;
  onChangeReplyDraft: (qId: string, val: string) => void;
  onSendTeacherReply: (qId: string) => void;
  onChangeBroadcastDraft: (val: string) => void;
  onPublishBroadcast: () => void;
}

export function HubView({
  studentNameDraft,
  mentorDraft,
  mentorVoiceBase64,
  isRecordingMentorVoice,
  broadcasts,
  mentorQuestions,
  teacherUnlocked,
  pinInput,
  teacherPin,
  replyDrafts,
  broadcastDraft,
  sortedWeakSpots,
  onChangeStudentName,
  onChangeMentorDraft,
  onToggleMentorVoice,
  onSendMentorQuestion,
  onChangePinInput,
  onUnlockTeacher,
  onLockTeacher,
  onChangeReplyDraft,
  onSendTeacherReply,
  onChangeBroadcastDraft,
  onPublishBroadcast
}: HubViewProps) {
  const pendingQuestions = mentorQuestions.filter(q => !q.replies || q.replies.length === 0);

  return (
    <div>
      <p className="text-xs opacity-70 mb-3">
        Messages are stored on this device only; cross-device sync needs a backend (e.g. Firebase).
      </p>
      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">Ask the Mentor</h3>
        <input
          type="text"
          value={studentNameDraft}
          onChange={e => onChangeStudentName(e.target.value)}
          placeholder="Your name (optional)…"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2.5 mb-2"
        />
        <textarea
          id="q"
          rows={3}
          value={mentorDraft}
          onChange={e => onChangeMentorDraft(e.target.value)}
          placeholder="Paste a tricky sentence or question…"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3"
        />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button type="button" id="vb" className={BTN_GHOST} onClick={onToggleMentorVoice}>
            {isRecordingMentorVoice
              ? '⏹ Stop'
              : mentorVoiceBase64
              ? '🎙 Re-record'
              : '🎙 Voice note'}
          </button>
          {mentorVoiceBase64 && <audio controls src={mentorVoiceBase64} className="h-8" />}
          <button type="button" className={BTN_PRIMARY} onClick={onSendMentorQuestion}>
            Send
          </button>
        </div>
      </div>

      {broadcasts.length > 0 && (
        <div className={CARD_CLASS}>
          <h3 className="font-semibold mb-2">📢 Mini-lessons from your teacher</h3>
          {broadcasts.map(b => (
            <div
              key={b.id}
              className="text-sm mb-2.5 pb-2 border-b border-stone-100 dark:border-stone-700/60 last:border-0 last:mb-0 last:pb-0"
            >
              {b.title && b.title !== 'Teacher Mini-Lesson' && (
                <div className="font-semibold">{b.title}</div>
              )}
              <p>• {b.content}</p>
            </div>
          ))}
        </div>
      )}

      {mentorQuestions.length > 0 && (
        <div className={CARD_CLASS}>
          <h3 className="font-semibold mb-2">Your questions</h3>
          {mentorQuestions.map(m => (
            <div key={m.id} className="text-sm mb-3">
              <div>
                ❓ <strong>{m.studentName}:</strong> {m.questionText}
              </div>
              {m.voiceAudioBase64 && <VaultAudioPlayer audioRefOrBase64={m.voiceAudioBase64} />}
              <div className="mt-1 opacity-80">
                {m.replies && m.replies.length > 0
                  ? m.replies.map(r => (
                      <div key={r.id}>
                        👩‍🏫 {r.replyText}
                      </div>
                    ))
                  : '⏳ awaiting reply'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={CARD_CLASS}>
        <h3 className="font-semibold mb-2">👩‍🏫 Teacher Demo Mode (UI Toggle)</h3>
        {!teacherUnlocked ? (
          <div>
            <div className="flex gap-2">
              <input
                id="pin"
                type="password"
                value={pinInput}
                onChange={e => onChangePinInput(e.target.value)}
                placeholder="Demo PIN"
                className="rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 w-32"
              />
              <button type="button" className={BTN_PRIMARY} onClick={onUnlockTeacher}>
                Unlock Demo
              </button>
            </div>
            <p className="text-xs opacity-60 mt-2">
              Demo mode PIN: {teacherPin} (client-side UI toggle for local replies &amp; broadcasts, not a security boundary).
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold">Open questions ({pendingQuestions.length})</h4>
            {pendingQuestions.map(m => (
              <div key={m.id} className="my-2 text-sm">
                <div>
                  <strong>{m.studentName}:</strong> {m.questionText}
                </div>
                {m.voiceAudioBase64 && <VaultAudioPlayer audioRefOrBase64={m.voiceAudioBase64} />}
                <textarea
                  rows={2}
                  value={replyDrafts[m.id] || ''}
                  onChange={e => onChangeReplyDraft(m.id, e.target.value)}
                  placeholder="Reply…"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 mt-1"
                />
                <button
                  type="button"
                  className={`${BTN_PRIMARY} mt-1`}
                  onClick={() => onSendTeacherReply(m.id)}
                >
                  Reply
                </button>
              </div>
            ))}

            <h4 className="text-sm font-semibold mt-4">Broadcast a mini-lesson</h4>
            <textarea
              id="bt"
              rows={2}
              value={broadcastDraft}
              onChange={e => onChangeBroadcastDraft(e.target.value)}
              placeholder="Write a quick transfer tip for learners…"
              className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 mt-1"
            />
            <button
              type="button"
              className={`${BTN_PRIMARY} mt-1`}
              onClick={onPublishBroadcast}
            >
              Broadcast
            </button>

            <h4 className="text-sm font-semibold mt-4">Most-missed structures</h4>
            {sortedWeakSpots.length > 0 ? (
              sortedWeakSpots.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-2 text-sm my-1">
                  <span className="w-44 shrink-0 truncate">{tag}</span>
                  <div
                    className="h-2 rounded-full bg-rose-500"
                    style={{ width: `${Math.min(100, count * 12)}px` }}
                  />
                  <span>{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-70">No mistakes recorded yet.</p>
            )}

            <button type="button" className={`${BTN_GHOST} mt-3`} onClick={onLockTeacher}>
              Lock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
