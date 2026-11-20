# Patch for AI Studio: add a **Cards** tab (Anki-style) and a **Translate** tab

**How to use:** In AI Studio, open your project, then paste this whole file as the prompt. Say: *"Apply this patch exactly to `index.html`. Do not change the lessons, Firebase code or anything else. Return the complete file, no truncation."*

## What I found in your project
Your real app lives in the single file **`index.html`** (vanilla JS, 48 exercises). `src/App.tsx` is an empty stub, so this patch targets `index.html` only. It uses your existing names: `S`, `L`, `C`, `CARD`, `BTN`, `GH`, `$`, `save`, `esc`, `toast`, `speak`, `tab`, `T`, `render()`.

Result: tabs in this bottom-bar order: **Lessons, Practice, Cards, Translate, Hub, Progress**.

---

## Step 1: Tabs (replace two things)

**1a.** Replace the line `const TABS = ["Lessons", "Practice", "Teacher Hub", "Progress"];` with:

```js
const TABS = ["Lessons", "Practice", "Hub", "Progress", "Cards", "Translate"];
const NAV = [0, 1, 4, 5, 2, 3]; // display order; real tab indexes stay stable (Hub is still 2)
```

**1b.** Replace the whole `function render() { ... }` with:

```js
function render() {
  const ICONS = ["📚", "✍️", "👩‍🏫", "📊", "🃏", "🌐"];
  $("nav").innerHTML = NAV.map(
    i =>
      `<button onclick="tab=${i};render();scrollTo(0,0)" class="flex-1 flex flex-col items-center justify-center py-2 px-0.5 min-h-[56px] text-[10px] transition-colors ${
        i === tab
          ? "text-teal-700 dark:text-teal-300 font-bold border-t-2 border-teal-600"
          : "opacity-65 hover:opacity-100"
      }"><span class="text-xl leading-none mb-1">${ICONS[i]}</span><span>${TABS[i]}${i === 2 && T ? " 🔓" : ""}</span></button>`
  ).join("");
  $("v").innerHTML = [lessonsV, practiceV, hubV, progV, cardsV, translateV][tab]();
}
```

## Step 2: Paste this block immediately **before** the final `applyTheme(); render(); initFirebase();` lines

```js
// ============================================================================
// CARDS (Anki-style spaced repetition) + TRANSLATE
// Every exercise solved in Practice becomes a card. Custom cards come from Translate.
// ============================================================================
let RQ = null, RS = false, RCUR = null;

// Simplified SM-2. g: 0 Again, 1 Hard, 2 Good, 3 Easy. Intervals are in days.
function cardSched(c, g) {
  c = c || { ease: 2.5, int: 0, reps: 0 };
  let e = c.ease, i = c.int, r = c.reps;
  if (g === 0) { e = Math.max(1.3, e - 0.2); i = 0; r = 0; }
  else if (g === 1) { e = Math.max(1.3, e - 0.15); i = Math.max(1, Math.round(i * 1.2)); }
  else if (g === 2) { i = r === 0 ? 1 : r === 1 ? 3 : Math.round(i * e); r++; }
  else { e += 0.15; i = r === 0 ? 3 : Math.round(Math.max(i, 1) * e * 1.3); r++; }
  return { ease: e, int: i, reps: r };
}

function cardData(k) {
  if (k.startsWith("c:")) {
    const c = (S.custom || []).find(x => "c:" + x.id === k);
    return c ? { ar: c.ar, en: c.en, m: null } : null;
  }
  const [li, ei] = k.split("-").map(Number);
  const e = L[li] && L[li].ex[ei];
  return e ? { ar: e.ar, en: e.a[0], m: e.m } : null;
}

function cardQueue() {
  S.cards = S.cards || {};
  const now = Date.now();
  const keys = Object.keys(S.done || {}).filter(k => S.done[k]);
  (S.custom || []).forEach(c => keys.push("c:" + c.id));
  return keys
    .filter(k => cardData(k) && (!S.cards[k] || S.cards[k].due <= now))
    .sort((a, b) => ((S.cards[a] || {}).due || 0) - ((S.cards[b] || {}).due || 0))
    .slice(0, 20);
}

function cardsV() {
  S.cards = S.cards || {};
  if (!RQ || !RQ.length) RQ = cardQueue();
  const total = Object.keys(S.done || {}).filter(k => S.done[k]).length + (S.custom || []).length;
  if (!RQ.length) {
    return `<div class="${CARD} text-center"><div class="text-4xl mb-2">${total ? "🎉" : "🃏"}</div>
      <p class="font-semibold">${total ? "All caught up!" : "No cards yet"}</p>
      <p class="text-sm opacity-70 mt-1">${total ? "Come back later. Cards return just before you would forget them." : "Solve exercises in Practice, or save translations from the Translate tab. Each one becomes a card."}</p>
      <p class="text-xs opacity-60 mt-3">Cards in deck: ${total}</p></div>`;
  }
  const k = RQ[0], d = cardData(k), c = S.cards[k];
  RCUR = d;
  let h = `<div class="flex justify-between text-sm mb-2"><span>${RQ.length} to review</span><span>${c ? "Review" : "New"}</span></div>
    <div class="${CARD} text-center py-8"><div dir="rtl" class="text-3xl leading-relaxed" style="font-family:Cairo,'Segoe UI',sans-serif">${esc(d.ar)}</div>`;
  if (!RS) return h + `</div><button class="${BTN} w-full" onclick="RS=true;render()">Show answer</button>`;
  h += `<hr class="my-4 border-stone-200 dark:border-stone-700"><div class="text-xl font-semibold mb-3">${esc(d.en)}</div>`;
  if (d.m) {
    h += `<div class="grid grid-cols-2 gap-2 text-left">${d.m
      .map(([a, b, t]) => `<div class="rounded-xl p-2 ${C[t] || ""}"><div dir="rtl">${esc(a)}</div><div class="font-semibold text-sm">${esc(b)}</div></div>`)
      .join("")}</div>`;
  }
  h += `<button class="${GH} mt-3" onclick="speak(RCUR.en,1)">🔊 Hear</button></div>`;
  const B = [["Again", "bg-rose-600"], ["Hard", "bg-amber-600"], ["Good", "bg-emerald-600"], ["Easy", "bg-sky-600"]];
  return h + `<div class="grid grid-cols-4 gap-2">${B.map(([n, cl], g) =>
    `<button class="${cl} text-white rounded-xl py-2 text-xs font-semibold min-h-[48px]" onclick="cardGrade(${g})"><div>${n}</div><div class="opacity-80 font-normal">${g ? cardSched(c, g).int + "d" : "1m"}</div></button>`).join("")}</div>
    <p class="text-xs opacity-60 mt-3 text-center">How well did you recall it? Harder cards come back sooner.</p>`;
}

function cardGrade(g) {
  const k = RQ.shift(), s = cardSched(S.cards[k], g);
  S.cards[k] = { ...s, due: g ? Date.now() + s.int * 864e5 : Date.now() + 6e4 };
  if (g === 0) RQ.splice(Math.min(3, RQ.length), 0, k);
  else S.score = (S.score || 0) + 2;
  save();
  if (typeof beep === "function") beep(g > 0);
  try { navigator.vibrate && navigator.vibrate(g ? 15 : 60); } catch (e) {}
  RS = false;
  render();
}

// ---------------- TRANSLATE (auto-detect Arabic/English, translates as you type) ----------------
let TR = { src: "", out: "", from: "", to: "", busy: false }, trTimer = null;
const trIsAr = s => /[\u0600-\u06FF]/.test(s);

function translateV() {
  return `<div class="${CARD}"><div class="text-xs uppercase opacity-60 mb-2">Type or paste Arabic or English. It detects the language and translates automatically.</div>
    <textarea id="tri" rows="3" class="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent p-3" style="font-size:16px" oninput="trType(this.value)" placeholder="اكتب هنا… / Type here…">${esc(TR.src)}</textarea>
    <div class="flex gap-2 mt-2"><button class="${GH} flex-1" onclick="trPaste()">📋 Paste</button><button class="${GH} flex-1" onclick="trClear()">Clear</button></div></div>
    <div class="${CARD}" id="tro">${trOut()}</div>
    <p class="text-xs opacity-60">Machine translation can be wrong. Check new sentences with your teacher before you learn them.</p>`;
}

function trOut() {
  if (TR.busy) return `<p class="text-sm opacity-70">Translating…</p>`;
  if (!TR.out) return `<p class="text-sm opacity-60">Your translation appears here.</p>`;
  const ar = TR.to === "ar";
  return `<div ${ar ? 'dir="rtl" class="text-2xl leading-relaxed" style="font-family:Cairo,sans-serif"' : 'class="text-xl font-semibold"'}>${esc(TR.out)}</div>
    <div class="text-xs opacity-60 mt-1">${TR.from === "ar" ? "Arabic → English" : "English → Arabic"}</div>
    <div class="flex flex-wrap gap-2 mt-3"><button class="${GH}" onclick="trHear()">🔊 Hear English</button><button class="${GH}" onclick="trCopy()">Copy</button><button class="${BTN}" onclick="trSave()">➕ Save as card</button></div>`;
}
function trShow() { const o = $("tro"); if (o) o.innerHTML = trOut(); }
function trType(v) { TR.src = v; clearTimeout(trTimer); trTimer = setTimeout(trRun, 600); }
function trClear() { TR = { src: "", out: "", from: "", to: "", busy: false }; render(); }
async function trPaste() {
  try { TR.src = await navigator.clipboard.readText(); const i = $("tri"); if (i) i.value = TR.src; trRun(); }
  catch (e) { toast("Paste blocked. Long-press the box and paste instead."); }
}
async function trRun() {
  const q = TR.src.trim();
  if (!q) { TR.out = ""; trShow(); return; }
  TR.from = trIsAr(q) ? "ar" : "en"; TR.to = TR.from === "ar" ? "en" : "ar"; TR.busy = true; trShow();
  try {
    const r = await fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(q) + "&langpair=" + TR.from + "|" + TR.to);
    const j = await r.json(), t = j && j.responseData && j.responseData.translatedText;
    if (!t || /MYMEMORY WARNING/i.test(t)) throw new Error("quota");
    TR.out = t;
  } catch (e) { TR.out = ""; toast("Couldn’t translate right now. Try again in a moment."); }
  TR.busy = false; trShow();
}
function trHear() { speak(TR.to === "en" ? TR.out : TR.src, 1); }
function trCopy() { try { navigator.clipboard.writeText(TR.out).then(() => toast("Copied")); } catch (e) { toast("Couldn’t copy"); } }
function trSave() {
  if (!TR.out) return;
  const arS = TR.from === "ar" ? TR.src : TR.out, enS = TR.from === "ar" ? TR.out : TR.src;
  (S.custom = S.custom || []).push({ id: Date.now().toString(36), ar: arS.trim(), en: enS.trim() });
  save(); RQ = null; toast("Saved to Cards ✓");
}
```

## Step 3: Quality checks
- [ ] Bottom bar shows 6 tabs in this order: Lessons, Practice, Cards, Translate, Hub, Progress; the Hub lock icon still appears when the teacher is unlocked.
- [ ] Solving an exercise in Practice adds it to Cards; Show answer, then Again / Hard / Good / Easy shows intervals and re-queues "Again" cards within the session.
- [ ] Typing Arabic gives English and typing English gives Arabic after about 0.6 seconds, without losing keyboard focus.
- [ ] "Save as card" adds a card that appears in Cards.
- [ ] Nothing else in the file changed; the 48 exercises and the Firebase code are untouched.

## Notes
- **Translation service:** The Translate tab uses the free MyMemory API (no key, a daily limit for anonymous use, sometimes imperfect). For better quality, call Gemini from your Express server (`@google/genai` and `GEMINI_API_KEY` are already in your project). **Do not put the key in `index.html`**, because anyone could copy it.
- **Sync:** Cards and saved translations are stored on each device. Firebase sync still covers only what it covered before.
- **Browser auto-translate:** If students also use their phone's own page translation, it can translate the English answers in Practice. Add `translate="no"` to the answer input, the word chips and the revealed answer.
