import React, { useEffect, useState } from 'react';
import { MentorQuestion, TeacherBroadcast } from '../types';
import { supabase } from '../services/supabase';
import { resolveVoiceNoteFromVault } from '../utils/audioVault';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';

function DemoBadge({ label = 'Demo Only' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800 dark:text-amber-300">
      {label}
    </span>
  );
}

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
  return <audio controls src={resolvedUrl} className="mt-1.5 h-10 w-full max-w-xs" />;
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
  onUnlockTeacher: (overridePin?: string) => void;
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
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const pendingQuestions = mentorQuestions.filter(q => !q.replies || q.replies.length === 0);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (active) setHasAdminSession(Boolean(data.session));
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setHasAdminSession(Boolean(nextSession));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs opacity-75">
        <DemoBadge label="Demo Only · Local Device Sandbox" />
        <span>
          Practice Q&amp;A and broadcasts below are stored locally on this device (for live cloud inbox, use Messages).
        </span>
      </div>
      <div className={CARD_CLASS}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Ask the Mentor</h3>
          <DemoBadge />
        </div>
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
          {mentorVoiceBase64 && (
            <audio controls src={mentorVoiceBase64} className="h-10 w-full max-w-xs" />
          )}
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
              <div className="break-words">
                ❓ <strong>{m.studentName}:</strong> {m.questionText}
              </div>
              {m.voiceAudioBase64 && <VaultAudioPlayer audioRefOrBase64={m.voiceAudioBase64} />}
              <div className="mt-1 opacity-80 break-words">
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
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">👩‍🏫 Teacher Demo Mode (UI Toggle)</h3>
          <DemoBadge />
        </div>
        {!teacherUnlocked ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pinInput}
                onChange={e => onChangePinInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onUnlockTeacher();
                  }
                }}
                placeholder="Teacher PIN"
                aria-label="Teacher Demo PIN"
                className="w-36 rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2"
              />
              <button type="button" className={BTN_PRIMARY} onClick={() => onUnlockTeacher()}>
                Unlock Demo
              </button>
              {hasAdminSession && (
                <button
                  type="button"
                  className={BTN_GHOST}
                  onClick={() => onUnlockTeacher(teacherPin)}
                >
                  Unlock with Admin Session
                </button>
              )}
            </div>
            <p className="text-xs opacity-60 mt-2">
              Restricted to Teacher / Admin demo access. Replies and broadcasts in this sandbox save to local device storage only.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Open questions ({pendingQuestions.length})</h4>
                <DemoBadge label="Demo Only · Local" />
              </div>
              {pendingQuestions.map(m => (
                <div key={m.id} className="my-2 text-sm">
                  <div className="break-words">
                    <strong>{m.studentName}:</strong> {m.questionText}
                  </div>
                  {m.voiceAudioBase64 && <VaultAudioPlayer audioRefOrBase64={m.voiceAudioBase64} />}
                  <textarea
                    rows={2}
                    value={replyDrafts[m.id] || ''}
                    onChange={e => onChangeReplyDraft(m.id, e.target.value)}
                    placeholder="Reply…"
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 mt-1.5"
                  />
                  <button
                    type="button"
                    className={`${BTN_PRIMARY} mt-1.5`}
                    onClick={() => onSendTeacherReply(m.id)}
                  >
                    Reply
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Broadcast a mini-lesson</h4>
                <DemoBadge label="Demo Only · Local" />
              </div>
              <textarea
                id="bt"
                rows={2}
                value={broadcastDraft}
                onChange={e => onChangeBroadcastDraft(e.target.value)}
                placeholder="Write a quick transfer tip for learners…"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 mt-1.5"
              />
              <button
                type="button"
                className={`${BTN_PRIMARY} mt-1.5`}
                onClick={onPublishBroadcast}
              >
                Broadcast
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Most-missed structures</h4>
                <DemoBadge label="Demo Only · Local" />
              </div>
              {sortedWeakSpots.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {sortedWeakSpots.map(([tag, count]) => (
                    <div key={tag} className="flex min-w-0 items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">{tag}</span>
                      <div
                        className="h-2 shrink-0 rounded-full bg-rose-500"
                        style={{ width: `${Math.min(88, count * 12)}px` }}
                      />
                      <span className="shrink-0 font-medium tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm opacity-70">No mistakes recorded yet.</p>
              )}
            </div>

            <button type="button" className={`${BTN_GHOST} mt-2`} onClick={onLockTeacher}>
              Lock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
