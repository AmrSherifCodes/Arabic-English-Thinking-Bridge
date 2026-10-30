# Upgrade brief: "Thinking English" (for Google AI Studio)

**How to use:** Upload your existing project (the Vite/React zip) plus `thinking-english.html` (a working reference build) to AI Studio, then paste this whole file as the prompt. Ask for **complete files, no truncation**.

## Goal
Keep the existing project, lesson data (`src/data/lessons.ts`), types and `transferLogic.ts` exactly as they are. **Add** the mobile polish, game layer, better voice, feedback channel and recap view described below. Do not shorten or rewrite the lesson content.

`thinking-english.html` is a working single-file version of every feature below. Match its behavior and feel; port it into the React/TypeScript structure.

---

## 1. Mobile-first shell
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- **Fixed bottom tab bar** (Lessons, Practice, Teacher Hub, Progress) with icon + label, `padding-bottom: env(safe-area-inset-bottom)`, translucent blur background. Main content gets ~84px bottom padding.
- All buttons, selects and chips: `min-height: 44px`, `touch-action: manipulation`.
- All inputs/textareas: `font-size: 16px` (prevents iOS zoom).
- Arabic prompt large (`text-3xl`, Cairo font, `dir="rtl"`), plus a thin progress bar showing position within the lesson.
- Install Tailwind **properly through the Vite/PostCSS build**, not the CDN script (the CDN warns "should not be used in production").

## 2. Game layer
Add `src/utils/fx.ts`:

```ts
export function beep(ok: boolean, soundOn: boolean) {
  if (soundOn) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const a = new AC();
      (ok ? [523, 659, 784] : [200, 150]).forEach((f, i) => {
        const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * 0.1;
        o.frequency.value = f; o.type = ok ? 'triangle' : 'sawtooth';
        o.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
      });
    } catch {}
  }
  try { navigator.vibrate?.(ok ? [20, 40, 20] : 80); } catch {}
}

export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const E = ['🎉', '⭐', '✨', '🔥', '💚'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'conf'; s.textContent = E[i % 5];
    s.style.left = Math.random() * 95 + '%';
    s.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}
```

CSS (add to `index.css`, with a `prefers-reduced-motion` guard that disables both):

```css
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes fall{to{transform:translateY(105vh) rotate(540deg);opacity:.2}}
.shake{animation:shake .35s;border-color:#e11d48!important}
.conf{position:fixed;top:-30px;font-size:24px;pointer-events:none;z-index:50;animation:fall 1.6s ease-in forwards}
```

Behavior:
- **Correct answer:** `beep(true)`, `confetti()`, advance. **Wrong answer:** `beep(false)`, add `.shake` to the input (remove, force reflow, re-add), show the existing misconception diagnosis / habit hint.
- **Streak toasts** at 3, 5 and 10 correct in a row: "🔥 N in a row!"
- **Points:** 10 for a first-try correct answer, 5 after a retry. Revealing the answer resets the streak.
- **Levels:** `level = min(4, floor(score / 60))`, names: Silent Copula, Block Builder, Sentence Smith, Flow Master, Register Pro. Level card on the Progress tab with a progress bar and a **Sound on/off** toggle (persisted).
- **Badges** (grid, locked ones greyed out): First win, 5 in a row, 10 in a row, Phase 1 done, All lessons done, Asked the mentor.
- Persist `score`, `streak`, `bestStreak`, `soundOn` through the existing `storage.ts` (try/catch on every access).

## 3. Better voice
- Load voices with `speechSynthesis.getVoices()` and refresh on `onvoiceschanged`; keep only `en-*` voices.
- Score voices: +50 if the name matches `/natural|neural|online/i`, +20 for `/aria|jenny|guy|ava|andrew|emma|samantha|allison|serena|daniel|karen|google/i`, +10 for `en-US`, +6 for `en-GB`. Use the top one unless the learner picked another.
- Voice picker `<select>` beside the Hear / Slow buttons; saves the choice and plays a short sample when changed.
- Utterance rate = requested rate × 0.92 (Slow button uses 0.6).
- Keep the existing record-and-compare pronunciation practice (MediaRecorder + SpeechRecognition with graceful fallback).

## 4. Feedback channel (no backend)
Progress tab card **"Feedback for your teacher"**: 5 emoji rating buttons (😕 🙁 😐 🙂 😍), a textarea, and three buttons: **WhatsApp**, **Email**, **Copy**.

```ts
const TEACHER_WHATSAPP = '201111452785'; // country code + number, digits only
const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf6eHUa4iLP-2pcivw8KCLyWdcU1BD73cMtrtMmttLv09fGuQ/viewform'; // show a "Full feedback form" button under the three buttons

function feedbackMessage(rating: number, text: string, p: UserProgress, lessonsTotal: number) {
  const weak = Object.entries(p.weakSpots ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]).join(', ') || 'none';
  return `Thinking English feedback\nRating: ${rating ? rating + '/5' : '-'}\nLessons done: ${p.completedLessonIds.length}/${lessonsTotal} · Score: ${p.score}\nHardest: ${weak}\n\n${text}`;
}
const waLink = (msg: string) => `https://wa.me/${TEACHER_WHATSAPP}?text=${encodeURIComponent(msg)}`;
const mailLink = (msg: string) => `mailto:?subject=${encodeURIComponent('Thinking English feedback')}&body=${encodeURIComponent(msg)}`;
```
Copy uses `navigator.clipboard.writeText` with a toast and a try/catch fallback. Adapt `p.weakSpots` / `p.score` to the field names in `UserProgress` (`types.ts`).

## 5. Recap view for the training meeting
Progress tab, collapsible `<details>` list, one item per lesson: lesson title (English and Arabic), and `transferConcept` (and `transferConceptAr`) as the body. Large tap targets (`py-3`). Optional: a "Presentation mode" that shows one lesson concept per screen with very large text.

## 6. Teacher Hub (keep, with honest limits)
Keep Ask the Mentor (text + voice note), teacher PIN view, broadcast mini-lessons, and most-missed stats. Add a visible note: *"Messages are stored on this device only; cross-device sync needs a backend (e.g. Firebase)."* Make the PIN a constant at the top of the file, not hard-coded inline.

## 7. Quality bar
- Complete, runnable project; no truncated files; keep the existing tests passing (`transferLogic.test.ts`, `lessons.test.ts`).
- No localStorage access outside `storage.ts`; every access wrapped in try/catch.
- Dark/light mode still works; all new components use both themes.
- Text uses typographic apostrophes (’) in anything learners read.
- Teacher-reviewed content: do **not** invent new lessons or change existing English/Arabic text.

## Checklist for the result
- [ ] Bottom tab bar works on a 375px-wide phone, clear of the home bar
- [ ] Correct = sound + confetti; wrong = shake + diagnosis
- [ ] Levels, badges and sound toggle on Progress, persisted
- [ ] Voice picker with a natural default
- [ ] Feedback card opens WhatsApp / email / copy with progress included
- [ ] Recap list on Progress
- [ ] Existing lessons and tests untouched
