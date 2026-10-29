import { UserProgress } from '../types';

export const LEVEL_NAMES = [
  'Silent Copula',
  'Block Builder',
  'Sentence Smith',
  'Flow Master',
  'Register Pro'
] as const;

export function calculateLevelInfo(score: number) {
  const safeScore = Math.max(0, score || 0);
  const level = Math.min(4, Math.floor(safeScore / 60));
  const levelName = LEVEL_NAMES[level];
  const nextLevelThreshold = (level + 1) * 60;
  const currentBandPoints = level === 4 ? 60 : safeScore % 60;
  const progressPercent = level === 4 ? 100 : Math.round((currentBandPoints / 60) * 100);

  return {
    level,
    levelNumber: level + 1,
    levelName,
    nextLevelThreshold,
    currentBandPoints,
    progressPercent
  };
}

export interface BadgeStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function evaluateBadges(
  progress: UserProgress,
  phase1LessonIds: string[],
  totalLessonsCount: number
): BadgeStatus[] {
  const phase1Done =
    phase1LessonIds.length > 0 &&
    phase1LessonIds.every(id => progress.completedLessonIds.includes(id));
  const allLessonsDone =
    totalLessonsCount > 0 &&
    progress.completedLessonIds.length >= totalLessonsCount;

  return [
    {
      id: 'first-win',
      title: 'First win',
      description: 'Complete your first transfer exercise',
      icon: '🌱',
      unlocked: progress.completedExerciseIds.length > 0
    },
    {
      id: 'streak-5',
      title: '5 in a row',
      description: 'Reach a streak of 5 correct sentences',
      icon: '🔥',
      unlocked: (progress.bestStreak || 0) >= 5
    },
    {
      id: 'streak-10',
      title: '10 in a row',
      description: 'Reach a streak of 10 correct sentences',
      icon: '⚡',
      unlocked: (progress.bestStreak || 0) >= 10
    },
    {
      id: 'phase-1-done',
      title: 'Phase 1 done',
      description: 'Finish all Foundations & The Skeleton lessons',
      icon: '🏛️',
      unlocked: phase1Done
    },
    {
      id: 'all-lessons-done',
      title: 'All lessons done',
      description: 'Complete all 24 lessons from A1+ to C1',
      icon: '👑',
      unlocked: allLessonsDone
    },
    {
      id: 'asked-mentor',
      title: 'Asked the mentor',
      description: 'Submit a question or voice note in Teacher Hub',
      icon: '💬',
      unlocked: Boolean(progress.askedMentor)
    }
  ];
}

export const TEACHER_WHATSAPP = '201111452785'; // country code + number, digits only
export const FEEDBACK_FORM_URL = 'https://forms.gle/QhXYEV3gEusYLnxf9'; // Google Form review link
export const DEFAULT_SHARED_APP_URL =
  'https://ais-pre-74fmo5haiiaoe46c3tfpbb-589911161083.europe-west3.run.app';

export function feedbackMessage(
  rating: number,
  text: string,
  p: UserProgress,
  lessonsTotal: number
): string {
  const weak =
    Object.entries(p.weakSpotCounts ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(x => x[0])
      .join(', ') || 'none';
  return `Thinking English feedback\nRating: ${rating ? rating + '/5' : '-'}\nLessons done: ${p.completedLessonIds.length}/${lessonsTotal} · Score: ${p.score}\nHardest: ${weak}\n\n${text}\n\nReview Form: ${FEEDBACK_FORM_URL}`;
}

export function buildFriendShareWhatsAppMessage(customAppUrl?: string): string {
  const origin =
    customAppUrl ||
    (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : DEFAULT_SHARED_APP_URL);
  return (
    `🧠 *Thinking English: Arabic-to-English Transfer Journey*\n` +
    `جرب تطبيق *Thinking English* لتعلم التفكير بالإنجليزية من منطق اللغة العربية بدون حفظ قوائم أو قواعد معقدة (من A1+ إلى C1) 🚀\n\n` +
    `✨ *Try the app here / جرب التطبيق من هنا:*\n${origin}\n\n` +
    `📝 *Share your review & feedback / شاركنا رأيك وتقييمك بعد التجربة:*\n${FEEDBACK_FORM_URL}`
  );
}

export const waLink = (msg: string) =>
  `https://wa.me/${TEACHER_WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const waFriendShareLink = (msg: string) =>
  `https://wa.me/?text=${encodeURIComponent(msg)}`;

export const mailLink = (msg: string) =>
  `mailto:?subject=${encodeURIComponent('Thinking English feedback')}&body=${encodeURIComponent(msg)}`;

export function beep(ok: boolean, soundOn: boolean) {
  if (soundOn && typeof window !== 'undefined') {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const a = new AC();
        (ok ? [523, 659, 784] : [200, 150]).forEach((f, i) => {
          const o = a.createOscillator(),
            g = a.createGain(),
            t = a.currentTime + i * 0.1;
          o.frequency.value = f;
          o.type = ok ? 'triangle' : 'sawtooth';
          o.connect(g);
          g.connect(a.destination);
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t);
          o.stop(t + 0.2);
        });
      }
    } catch {}
  }
  try {
    if (typeof navigator !== 'undefined') {
      navigator.vibrate?.(ok ? [20, 40, 20] : 80);
    }
  } catch {}
}

export function confetti() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const E = ['🎉', '⭐', '✨', '🔥', '💚'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'conf';
    s.textContent = E[i % 5];
    s.style.left = Math.random() * 95 + '%';
    s.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}

/**
 * Simplified SM-2 Spaced Repetition Scheduler.
 * g: 0 Again, 1 Hard, 2 Good, 3 Easy. Intervals are in days.
 */
export function cardSched(
  c: { ease: number; int: number; reps: number } | undefined,
  g: 0 | 1 | 2 | 3
): { ease: number; int: number; reps: number } {
  const cur = c || { ease: 2.5, int: 0, reps: 0 };
  let e = cur.ease,
    i = cur.int,
    r = cur.reps;
  if (g === 0) {
    e = Math.max(1.3, e - 0.2);
    i = 0;
    r = 0;
  } else if (g === 1) {
    e = Math.max(1.3, e - 0.15);
    i = Math.max(1, Math.round(i * 1.2));
  } else if (g === 2) {
    i = r === 0 ? 1 : r === 1 ? 3 : Math.round(i * e);
    r++;
  } else {
    e += 0.15;
    i = r === 0 ? 3 : Math.round(Math.max(i, 1) * e * 1.3);
    r++;
  }
  return { ease: e, int: i, reps: r };
}
