import { PHASES_DATA } from '../data/lessons';
import { PREBUILT_DECKS } from '../data/prebuiltDecks';
import { EXPANDED_DECKS } from '../data/expandedDecks';
import { ARABIC_WORD_LEXICON } from './arabicWordLexicon';
import { DEFAULT_SHARED_APP_URL, FEEDBACK_FORM_URL, TEACHER_WHATSAPP } from './fx';

export const COPYRIGHT_HEADER = '<!-- Copyright (c) 2026 Amr Sherif. All rights reserved. -->';

export const PROVENANCE_MD_CONTENT = `# Provenance & Authorship Record

This file records the authorship and creation timeline of the
Thinking English™ project.

## Author

**Amr Sherif** — Alexandria, Egypt
GitHub: https://github.com/AmrSherifCodes
LinkedIn: https://www.linkedin.com/in/amrsherif-abdelaal-08a287349/

## Statement

I, Amr Sherif, am the original author of this repository and all of its
contents, including:

- \`Thinking-English.html\` — the interactive Arabic-to-English learning app
- \`CONSTITUTION.md\` — the channel and project constitution
- All lesson content, exercise data, and pedagogical structure
- All scripts, translations, and source materials

The commit history of this repository constitutes a chronological,
timestamped record of authorship. Every commit is permanently recorded
by GitHub and cryptographically linked to its parent commits.

## Timeline

- **First commit:** see the repository's commit history
- **Constitution added:** commit \`b824f249efc369b5788005df6fb7be7a9c563feb\`
- **This file added:** the commit that introduced \`PROVENANCE.md\`

## License

The lesson content and source code are released under **CC0 1.0
Universal Public Domain Dedication** (see \`CONSTITUTION.md\`).

The name "Thinking English" and any associated branding are claimed
as trademarks of the author (™).

## Verification

Anyone can independently verify authorship by:

1. Opening the repository's commit history
2. Confirming the commits and their timestamps
3. Comparing the file contents at any point in history

---

*Recorded in good faith. The commit history is the proof.*
`;

/**
 * Generates a 100% self-contained, offline-capable single-file HTML application
 * containing all 24 lessons (72 exercises), the Anki Multi-Deck Spaced Repetition system,
 * 150 Prebuilt Master Cards + Open-Source CC BY decks, Double-Tap Arabic Word Auto-Translator,
 * Translate tab, Teacher Hub, and Review Heatmap.
 *
 * Security & Privacy Hardened:
 * - Line 1 Copyright Header for Amr Sherif
 * - Thinking English™ trademark branding
 * - Top-of-script CONFIG block with privacy-safe empty TEACHER_WHATSAPP default
 * - Single-quote & HTML entity escaping in esc() + delegated data-* event listeners (zero self-XSS)
 * - Explicit MyMemory.net privacy disclosure on the Translate tab
 * - Subtle CSS-only Kuffiyeh & olive-knot stationery background matching the main app
 */
export function buildStandaloneHtmlString(): string {
  const phasesJson = JSON.stringify(PHASES_DATA);
  const prebuiltJson = JSON.stringify([...EXPANDED_DECKS, ...PREBUILT_DECKS]);
  const lexiconJson = JSON.stringify(ARABIC_WORD_LEXICON);

  return `${COPYRIGHT_HEADER}
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Thinking English™ · Arabic-to-English Transfer Journey</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script>tailwind.config={darkMode:'class'}</script>
<style>
:root{
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
  --kuffiyeh-line:rgba(67,90,45,0.055);
  --kuffiyeh-node:rgba(28,25,23,0.06);
  --sand-bg:#faf6ee;
}
html.dark{
  --kuffiyeh-line:rgba(180,201,158,0.055);
  --kuffiyeh-node:rgba(245,245,244,0.05);
  --sand-bg:#141310;
}
html{scroll-padding-top:env(safe-area-inset-top,0px);-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}
body{
  font-family:Inter,system-ui,-apple-system,sans-serif;
  background-color:var(--sand-bg);
  background-image:
    radial-gradient(circle at 50% 50%,var(--kuffiyeh-node) 1.5px,transparent 2px),
    radial-gradient(circle at 0% 0%,var(--kuffiyeh-node) 1.5px,transparent 2px),
    radial-gradient(circle at 100% 0%,var(--kuffiyeh-node) 1.5px,transparent 2px),
    radial-gradient(circle at 0% 100%,var(--kuffiyeh-node) 1.5px,transparent 2px),
    radial-gradient(circle at 100% 100%,var(--kuffiyeh-node) 1.5px,transparent 2px),
    repeating-linear-gradient(45deg,var(--kuffiyeh-line) 0px,var(--kuffiyeh-line) 1px,transparent 1px,transparent 18px),
    repeating-linear-gradient(-45deg,var(--kuffiyeh-line) 0px,var(--kuffiyeh-line) 1px,transparent 1px,transparent 18px);
  background-size:36px 36px;
  background-attachment:fixed;
  color:#1c1917;
  margin:0;
}
html.dark body{background-color:var(--sand-bg);color:#f5f5f4}
.kuffiyeh-card-watermark{
  background-image:
    repeating-linear-gradient(45deg,var(--kuffiyeh-line) 0px,var(--kuffiyeh-line) 1px,transparent 1px,transparent 14px),
    repeating-linear-gradient(-45deg,var(--kuffiyeh-line) 0px,var(--kuffiyeh-line) 1px,transparent 1px,transparent 14px);
}
.ar{font-family:Cairo,'Segoe UI',sans-serif}
button,select{min-height:44px;touch-action:manipulation;cursor:pointer}
input,textarea,select{font-size:16px}
#v{padding-bottom:92px}
#nav{position:fixed;left:0;right:0;bottom:0;z-index:20;padding-bottom:env(safe-area-inset-bottom,0px);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
details>summary{cursor:pointer}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes fall{to{transform:translateY(105vh) rotate(540deg);opacity:.2}}
.shake{animation:shake .35s;border-color:#e11d48!important}
.conf{position:fixed;top:-30px;font-size:24px;pointer-events:none;z-index:50;animation:fall 1.6s ease-in forwards}
@media (prefers-reduced-motion:reduce){.shake,.conf{animation:none}}
</style>
</head>
<body>
<div class="max-w-3xl mx-auto p-4">
  <header class="flex items-center justify-between gap-2 mb-4">
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <h1 class="text-xl font-semibold">🧠 Thinking English™</h1>
        <span id="hdr-lvl" class="text-xs font-medium text-teal-700 dark:text-teal-300"></span>
      </div>
      <p class="text-xs opacity-70">Arabic → English transfer journey · A1+ to C1 (24 Lessons · Offline Ready)</p>
    </div>
    <div class="flex items-center gap-1.5">
      <button title="Share on WhatsApp" class="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm" onclick="shareFriends()">📲</button>
      <button id="snd-btn" title="Toggle sound" class="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm" onclick="SND=!SND;save();render()">🔊</button>
      <button id="th" title="Toggle dark/light theme" class="rounded-full border border-stone-300 dark:border-stone-600 px-3 py-1 text-sm" onclick="theme()">🌓</button>
    </div>
  </header>
  <nav id="nav" class="flex border-t border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900/90"></nav>
  <main id="v"></main>
</div>
<div id="attr-modal" class="fixed inset-0 z-50 bg-stone-950/80 hidden items-center justify-center p-4"></div>
<div id="toast" class="fixed left-1/2 -translate-x-1/2 bottom-24 z-30 bg-stone-900 text-white text-sm rounded-full px-4 py-2 hidden shadow-lg"></div>
<script>
// ============================================================================
// CONFIGURATION BLOCK (Safe for public release — no personal phone numbers)
// ============================================================================
const CONFIG = {
  TEACHER_WHATSAPP: "${TEACHER_WHATSAPP}", // Leave empty for public release (opens WhatsApp contact picker)
  FEEDBACK_FORM_URL: "${FEEDBACK_FORM_URL}",
  APP_URL: "${DEFAULT_SHARED_APP_URL}",
  DEMO_PIN: "1234" // Client-side demo mode UI toggle only (not a security boundary)
};
const TEACHER = CONFIG.TEACHER_WHATSAPP;
const FORM = CONFIG.FEEDBACK_FORM_URL;
const APP_URL = CONFIG.APP_URL;

const PHASES = ${phasesJson};
const PREBUILT_DECKS = ${prebuiltJson};
const LEXICON = ${lexiconJson};

// Build flat lessons L compatible with both formats
const L = [];
PHASES.forEach((p, pi) => {
  p.lessons.forEach(lesson => {
    L.push({
      id: lesson.id,
      pi,
      num: lesson.number,
      t: lesson.title,
      tAr: lesson.titleAr,
      w: lesson.transferConcept,
      wAr: lesson.transferConceptAr,
      g: lesson.weakSpotTag,
      ex: lesson.exercises.map(e => ({
        id: e.id,
        ar: e.arabicThought,
        ctx: e.arabicContext || "",
        a: [e.englishTarget, ...(e.acceptableAlternatives || [])],
        x: e.wordChips || [],
        h: (e.specificMisconceptions || []).map(m => [new RegExp(m.pattern, "i"), m.diagnosis]),
        m: (e.breakdownChunks || []).map(ch => [
          ch.arabicText,
          ch.englishText,
          ch.role === "subject" ? "s" : (ch.role === "verb" || ch.role === "auxiliary") ? "v" : ch.role === "object" ? "o" : "c"
        ]),
        g: lesson.weakSpotTag
      }))
    });
  });
});

const C={s:"bg-sky-100 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800",v:"bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800",o:"bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800",c:"bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"};
const CARD="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-800/95 p-4 mb-3 shadow-xs";
const BTN="rounded-full bg-teal-700 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-800 disabled:opacity-45";
const GH="rounded-full border border-stone-300 dark:border-stone-600 px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40";
const $=id=>document.getElementById(id);
// Security Fix #1: Escape &, <, >, ", and single quote ' (&#39;) to prevent attribute/handler breakout
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const D=()=>({done:{},score:0,streak:0,best:0,wrong:{},notes:"",msgs:[],bc:[],dark:null,cards:{},custom:[],importedDecks:[],reviewHistory:{},free:false});
let S;try{S=Object.assign(D(),JSON.parse(localStorage.getItem("te_standalone_v2")||"{}"))}catch(e){S=D()}
let SND=true, tab=0, cur=null, T=false, mvoice=null, FR=0, FT="";
const save=()=>{try{localStorage.setItem("te_standalone_v2",JSON.stringify(S))}catch(e){toast("Couldn’t save (storage full or blocked)")}};
function toast(m){const t=$("toast");t.textContent=m;t.classList.remove("hidden");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add("hidden"),2600)}
function theme(){S.dark=!document.documentElement.classList.contains("dark");save();applyTheme()}
function applyTheme(){const d=S.dark===null?matchMedia("(prefers-color-scheme: dark)").matches:S.dark;document.documentElement.classList.toggle("dark",d)}
const norm=s=>String(s||"").toLowerCase().replace(/[’‘]/g,"'").replace(/won't/g,"will not").replace(/can't/g,"cannot").replace(/n't/g," not").replace(/'m\\b/g," am").replace(/'re\\b/g," are").replace(/'s\\b/g," is").replace(/'ve\\b/g," have").replace(/'ll\\b/g," will").replace(/'d\\b/g," would").replace(/[^a-z0-9 ]/g," ").replace(/\\s+/g," ").trim();
const stripAr=s=>String(s||"").replace(/[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]/g,"").replace(/[.,?!،؛؟"«»()\\[\\]{}:—\\-]/g,"").replace(/[إأآٱ]/g,"ا").replace(/ى/g,"ي").trim();
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const dn=li=>L[li].ex.filter((_,i)=>S.done[li+"-"+i]).length;
const comp=li=>dn(li)==L[li].ex.length;
const LV=["Silent Copula","Block Builder","Sentence Smith","Flow Master","Register Pro"];
const lvl=()=>Math.min(4,Math.floor((S.score||0)/60));

const TABS = ["Lessons", "Practice", "Hub", "Progress", "Cards", "Translate"];
const NAV = [0, 1, 4, 5, 2, 3];

// Security Fix #2: Event delegation with data-* attributes (never interpolate user data into inline JS handlers)
document.addEventListener("click", function(ev) {
  const arEl = ev.target.closest("[data-ar-word]");
  if (arEl) {
    tapArWord(arEl.getAttribute("data-ar-word") || "", arEl.getAttribute("data-ar-key") || "");
    return;
  }
  const spkEl = ev.target.closest("[data-speak]");
  if (spkEl) {
    speak(spkEl.getAttribute("data-speak") || "", parseFloat(spkEl.getAttribute("data-rate") || "1"));
    return;
  }
  const chipEl = ev.target.closest("[data-chip]");
  if (chipEl) {
    add(chipEl.getAttribute("data-chip") || "");
    return;
  }
});

document.addEventListener("dblclick", function(ev) {
  const arEl = ev.target.closest("[data-ar-word]");
  if (arEl) {
    dblArWord(arEl.getAttribute("data-ar-word") || "");
  }
});

// Double-tap Arabic word lookup state
let popWord = null, popEntry = null, lastTapTime = 0, lastTapKey = "";
function lookupArWord(rawWord) {
  const clean = stripAr(rawWord);
  if (!clean) return null;
  if (LEXICON[clean]) return LEXICON[clean];
  const prefixes = ["و","ف","ب","ل","ك","ال","وال","بال","لل"];
  for (const pre of prefixes) {
    if (clean.startsWith(pre) && clean.length > pre.length + 1) {
      const stem = clean.slice(pre.length);
      if (LEXICON[stem]) return LEXICON[stem];
      if (LEXICON["ال" + stem]) return LEXICON["ال" + stem];
    }
  }
  return { en: rawWord, grammar: "Arabic Token", tip: "Compare how this word maps into the English sentence skeleton." };
}
function tapArWord(word, key) {
  const now = Date.now();
  if (lastTapKey === key && now - lastTapTime < 340) {
    lastTapTime = 0;
    lastTapKey = "";
    popWord = word;
    popEntry = lookupArWord(word);
    render();
  } else {
    lastTapTime = now;
    lastTapKey = key;
  }
}
function dblArWord(word) {
  popWord = word;
  popEntry = lookupArWord(word);
  render();
}
function renderInteractiveAr(sentence, prefixKey) {
  const words = String(sentence || "").split(/\\s+/).filter(Boolean);
  let h = \`<div dir="rtl" class="ar text-3xl leading-relaxed font-semibold">\${words.map((w, idx) => {
    const k = esc(prefixKey + "-" + idx);
    const active = popWord === w;
    return \`<span role="button" tabindex="0" data-ar-word="\${esc(w)}" data-ar-key="\${k}" class="inline-block select-none cursor-pointer rounded-lg px-1.5 py-0.5 mx-0.5 transition border \${active ? 'bg-emerald-500/25 border-emerald-500 ring-2 ring-emerald-500/40' : 'border-transparent hover:bg-emerald-500/15'}">\${esc(w)}</span>\`;
  }).join(" ")}</div>
  <div class="mt-1.5 text-[11px] opacity-70 flex flex-wrap items-center justify-between gap-1">
    <span>💡 Double-tap any Arabic word to translate it</span>
    <span dir="rtl" class="ar">(اضغط مرتين على أي كلمة لترجمتها)</span>
  </div>\`;
  if (popWord && popEntry) {
    const cleanSpeak = String(popEntry.en || "").replace(/\\(.*?\\)/g, "").split("/")[0].trim();
    h += \`<div class="mt-3 p-3.5 rounded-2xl bg-emerald-950/95 text-white border border-emerald-500/40 shadow-xl text-left">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span dir="rtl" class="ar font-bold text-xl text-emerald-400">\${esc(popWord)}</span>
          <span class="text-stone-400">→</span>
          <span translate="no" class="font-bold text-base text-white">\${esc(popEntry.en)}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1 rounded-lg bg-emerald-600 text-xs font-bold !min-h-[34px]" data-speak="\${esc(cleanSpeak)}" data-rate="0.95">🔊 Listen</button>
          <button class="px-2.5 py-1 rounded-lg bg-stone-800 text-xs !min-h-[34px]" onclick="popWord=null;popEntry=null;render()">✕</button>
        </div>
      </div>
      <div class="text-[11px] text-emerald-300 font-semibold mt-1">\${esc(popEntry.grammar)}</div>
      <p class="text-xs text-stone-200 mt-1">💡 \${esc(popEntry.tip)}</p>
    </div>\`;
  }
  return h;
}

function render() {
  const ICONS = ["📚", "✍️", "👩‍🏫", "📊", "🃏", "🌐"];
  const hl = $("hdr-lvl");
  if (hl) hl.textContent = "· Lv." + (lvl() + 1) + " " + LV[lvl()];
  const sb = $("snd-btn");
  if (sb) sb.textContent = SND ? "🔊" : "🔇";
  $("nav").innerHTML = NAV.map(
    i =>
      \`<button onclick="tab=\${i};popWord=null;render();scrollTo(0,0)" class="flex-1 flex flex-col items-center justify-center py-2 px-0.5 min-h-[56px] text-[10px] transition-colors \${
        i === tab
          ? "text-teal-700 dark:text-teal-300 font-bold border-t-2 border-teal-600"
          : "opacity-65 hover:opacity-100"
      }"><span class="text-xl leading-none mb-1">\${ICONS[i]}</span><span>\${TABS[i]}\${i === 2 && T ? " 🔓" : ""}</span></button>\`
  ).join("");
  $("v").innerHTML = [lessonsV, practiceV, hubV, progV, cardsV, translateV][tab]();
}

function lessonsV(){
  let h=\`<div class="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
    <div class="font-bold text-amber-800 dark:text-amber-300 text-sm">🌟 Crafted with Hours of Effort by Amr Sherif — God Willing, You Will Succeed!</div>
    <p class="text-xs sm:text-sm opacity-95 mt-1 leading-relaxed">This entire platform is the result of hours of dedicated effort by Amr Sherif to help you think in English naturally, step by step, without stress. Trust the process and take it one sentence at a time — God willing (إن شاء الله), you will succeed!</p>
    <p dir="rtl" class="ar text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 font-semibold mt-1 text-right">هذا التطبيق ثمرة ساعات طويلة من الجهد المخلص من عمرو شريف لمساعدتك على التفكير بالإنجليزية ببساطة وبدون تعقيد. خذها خطوة بخطوة — وبإذن الله ستنجح وتتفوق!</p>
  </div>
  <div class="\${CARD} kuffiyeh-card-watermark flex flex-wrap items-center justify-between gap-3">
    <div><div class="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">Interactive Thinking Journey · Thinking English™</div>
    <div class="text-sm opacity-80 mt-0.5">⭐ \${S.score} XP · 🔥 \${S.streak} streak · \${L.filter((_,i)=>comp(i)).length}/\${L.length} lessons mastered</div></div>
    <button class="\${GH} !text-xs" onclick="S.free=!S.free;save();render()">\${S.free?"🔓 All Lessons Unlocked":"🔒 Sequential Mode (Tap to Unlock All)"}</button>
  </div>\`;
  PHASES.forEach((p,pi)=>{
    h+=\`<h2 class="font-semibold mt-4 mb-2">Phase \${p.id} (\${p.level}) · \${esc(p.title)}</h2>\`;
    L.forEach((l,li)=>{
      if(l.pi!=pi)return;
      const lock=!S.free && li>0 && !comp(li-1);
      h+=\`<div class="\${CARD} flex items-center justify-between gap-3 \${lock?"opacity-50":""}">
        <div><div class="font-semibold">\${lock?"🔒":comp(li)?"✅":"▶️"} \${l.num}. \${esc(l.t)}</div>
        <div dir="rtl" class="ar text-xs opacity-75 mt-0.5">\${esc(l.tAr)}</div>
        <div class="text-xs opacity-70 mt-0.5">\${dn(li)}/\${l.ex.length} exercises</div></div>
        <button \${lock?"disabled":""} class="\${BTN}" onclick="go(\${li})">\${comp(li)?"Review":"Start"}</button>
      </div>\`;
    });
  });
  return h+\`<p class="text-xs opacity-70 mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 text-center">🌊 Crafted in <strong>Alexandria, Egypt</strong> by <strong>Amr Sherif</strong> · Gratefully inspired by <strong>Mihalis Eleftheriou</strong> &amp; <em>The Thinking Method</em> · 100% Free &amp; Ad-Free (CC0 1.0 · Thinking English™)</p>\`;
}

function go(li){let ei=L[li].ex.findIndex((_,i)=>!S.done[li+"-"+i]);if(ei<0)ei=0;setEx(li,ei);tab=1;render()}
function setEx(li,ei){const e=L[li].ex[ei];popWord=null;cur={li,ei,tries:0,st:"ask",fb:"",chips:shuffle(Array.from(new Set([...e.a[0].replace(/[.,?!]/g,"").split(" "),...e.x])))}}

function practiceV(){
  if(!cur)return \`<div class="\${CARD}"><p class="mb-3">Pick a lesson in the Lessons tab to begin.</p><button class="\${BTN}" onclick="go(0)">Start Lesson 1 →</button></div>\`;
  const l=L[cur.li],e=l.ex[cur.ei],open=cur.st=="ask";
  let h=\`<div class="flex justify-between text-sm mb-2"><span>\${l.num}. \${esc(l.t)} · \${cur.ei+1}/\${l.ex.length}</span><span id="sc">⭐ \${S.score} · 🔥 \${S.streak}</span></div>
  <div class="h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 mb-3"><div class="h-1.5 rounded-full bg-teal-600" style="width:\${100*(cur.ei+(cur.st=="ask"?0:1))/l.ex.length}%"></div></div>
  <div class="\${CARD}"><div class="text-xs uppercase opacity-60 mb-1">Say this thought in English</div>\${renderInteractiveAr(e.ar, "pr-"+cur.li+"-"+cur.ei)}</div>\`;
  if(open){
    h+=\`<div class="\${CARD}"><input id="ans" translate="no" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3" placeholder="Type or tap the blocks…" autocomplete="off" onkeydown="if(event.key=='Enter')check()">
    <div class="flex flex-wrap gap-2 mt-3">\${cur.chips.map(c=>\`<button class="\${GH} !px-4 text-base" translate="no" data-chip="\${esc(c)}">\${esc(c)}</button>\`).join("")}</div>
    <div id="fb" class="mt-3 text-sm">\${cur.fb}</div>
    <div class="flex gap-2 mt-3"><button class="\${BTN} flex-1" onclick="check()">Check</button><button class="\${GH}" onclick="$('ans').value=''">Clear</button><button class="\${GH}" onclick="reveal()">Reveal</button></div></div>\`;
  }else{
    h+=\`<div class="\${CARD}"><div translate="no" class="text-lg font-semibold mb-3">\${esc(e.a[0])}\${cur.st=="ok"?" ✅":""}</div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">\${e.m.map(([a,b,t])=>\`<div class="rounded-xl p-2 text-center \${C[t]}"><div dir="rtl" class="ar font-semibold">\${esc(a)}</div><div translate="no" class="font-semibold text-sm">\${esc(b)}</div></div>\`).join("")}</div>
    <p class="text-sm mt-3">💡 \${esc(l.w)}</p>
    <p dir="rtl" class="ar text-sm mt-1 opacity-85">\${esc(l.wAr)}</p>
    <div class="flex flex-wrap gap-2 mt-3"><button class="\${GH}" data-speak="\${esc(e.a[0])}" data-rate="1">🔊 Hear</button><button class="\${GH}" data-speak="\${esc(e.a[0])}" data-rate="0.6">🐢 Slow</button></div>
    <button class="\${BTN} mt-4 w-full" onclick="nextEx()">Next →</button></div>\`;
  }
  return h;
}
function add(w){const i=$("ans");if(i)i.value=(i.value.trim()+" "+w).trim()}
function check(){
  const e=L[cur.li].ex[cur.ei],n=norm($("ans").value);if(!n)return;
  if(e.a.some(x=>norm(x)==n)){
    const k=cur.li+"-"+cur.ei;if(!S.done[k]){S.score+=cur.tries?5:10;S.done[k]=1}
    S.streak++;S.best=Math.max(S.best,S.streak);RQ=null;save();beep(1);confetti();if([3,5,10].includes(S.streak))toast("🔥 "+S.streak+" in a row!");cur.st="ok";render();speak(e.a[0],1);return;
  }
  cur.tries++;S.streak=0;S.wrong[e.g]=(S.wrong[e.g]||0)+1;save();
  const hit=e.h.find(([r])=>r.test(n));
  cur.fb=\`<span class="text-rose-600 dark:text-rose-400">🧭 \${hit?esc(hit[1]):"Compare with the Arabic thought: make sure Subject → conjugated Verb → Object are all in place."}</span>\`;
  beep(0);{const a=$("ans");if(a){a.classList.remove("shake");void a.offsetWidth;a.classList.add("shake")}}if($("fb"))$("fb").innerHTML=cur.fb;if($("sc"))$("sc").textContent=\`⭐ \${S.score} · 🔥 \${S.streak}\`;
}
function reveal(){S.streak=0;save();cur.st="rev";render()}
function nextEx(){
  const l=L[cur.li];
  if(cur.ei<l.ex.length-1){setEx(cur.li,cur.ei+1)}
  else{toast(comp(cur.li)?"Lesson complete! 🎉":"Lesson finished. Retry skipped items to unlock the next.");tab=0}
  render();
}

let VO=[];
function loadV(){try{VO=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang))}catch(e){}}
try{loadV();speechSynthesis.onvoiceschanged=loadV}catch(e){}
function best(){
  const p=S.voice&&VO.find(v=>v.name==S.voice);if(p)return p;
  const sc=v=>(/natural|neural|online/i.test(v.name)?50:0)+(/aria|jenny|guy|ava|andrew|emma|samantha|allison|serena|daniel|karen|google/i.test(v.name)?20:0)+(/en-US/i.test(v.lang)?10:/en-GB/i.test(v.lang)?6:0);
  return [...VO].sort((a,b)=>sc(b)-sc(a))[0];
}
function speak(t,r){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),v=best();if(v){u.voice=v;u.lang=v.lang}else u.lang="en-US";u.rate=(r||1)*.92;u.pitch=1;speechSynthesis.speak(u)}catch(e){toast("Speech not supported here")}}

// ============================================================================
// ANKI MULTI-DECK CARDS + OPEN SOURCE DECKS + UNDO + SM-2
// ============================================================================
let activeDeck = null, RQ = null, RS = false, RCUR = null, UNDO = null;

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

function getDeckKeys(deckId) {
  S.custom = S.custom || [];
  S.importedDecks = S.importedDecks || [];
  const phaseKeys = pi => {
    const arr = [];
    L.forEach((l, li) => {
      if (l.pi === pi) l.ex.forEach((_, ei) => arr.push(li + "-" + ei));
    });
    return arr.sort((a, b) => (S.done[b] ? 1 : 0) - (S.done[a] ? 1 : 0));
  };
  if (deckId === "phase-1") return phaseKeys(0);
  if (deckId === "phase-2") return phaseKeys(1);
  if (deckId === "phase-3") return phaseKeys(2);
  if (deckId === "custom") return S.custom.filter(c => !c.deckId || c.deckId === "custom").map(c => "c:" + c.id);
  const pb = PREBUILT_DECKS.find(d => d.id === deckId);
  if (pb) {
    if (!S.importedDecks.includes(pb.id)) return [];
    return S.custom.filter(c => c.deckId === pb.id).map(c => "c:" + c.id);
  }
  return [...S.custom.map(c => "c:" + c.id), ...phaseKeys(0), ...phaseKeys(1), ...phaseKeys(2)];
}

function deckStats(deckId) {
  S.cards = S.cards || {};
  const keys = getDeckKeys(deckId);
  const now = Date.now();
  let n = 0, l = 0, d = 0;
  keys.forEach(k => {
    const c = S.cards[k];
    if (!c) n++;
    else if (c.reps === 0 || c.int < 1) l++;
    else if (c.due <= now) d++;
  });
  return { n, l, d, total: keys.length };
}

function cardQueue(deckId) {
  S.cards = S.cards || {};
  const now = Date.now();
  return getDeckKeys(deckId || activeDeck)
    .filter(k => {
      if (!cardData(k)) return false;
      const c = S.cards[k];
      if (!c) return true;
      if (c.reps === 0 || c.int < 1) return true;
      return c.due <= now;
    })
    .slice(0, 40);
}

function openDeck(id) {
  activeDeck = id;
  RQ = cardQueue(id);
  RS = false;
  UNDO = null;
  popWord = null;
  render();
}

function downloadPrebuilt(id) {
  const pb = PREBUILT_DECKS.find(d => d.id === id);
  if (!pb) return;
  S.importedDecks = S.importedDecks || [];
  if (!S.importedDecks.includes(pb.id)) S.importedDecks.push(pb.id);
  S.custom = S.custom || [];
  const existing = new Set(S.custom.map(c => c.id));
  pb.cards.forEach((c, idx) => {
    const cid = pb.id + "-" + idx;
    if (!existing.has(cid)) S.custom.push({ id: cid, ar: c.ar, en: c.en, deckId: pb.id });
  });
  save();
  toast("Downloaded “" + pb.name + "” (" + pb.cards.length + " cards) ✓");
  render();
}

function showAttr(id) {
  const pb = PREBUILT_DECKS.find(d => d.id === id);
  if (!pb) return;
  const m = $("attr-modal");
  m.classList.remove("hidden");
  m.classList.add("flex");
  m.innerHTML = \`<div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
    <div class="flex items-center justify-between"><h2 class="font-bold text-base">ⓘ Open-Source Deck Attribution</h2><button class="\${GH} !px-3 !py-1" onclick="closeAttr()">✕</button></div>
    <div class="text-sm space-y-1"><div><span class="opacity-65">Deck:</span> <strong>\${esc(pb.name)}</strong></div><div><span class="opacity-65">Author:</span> <strong>\${esc(pb.author)}</strong></div><div><span class="opacity-65">License:</span> <strong>\${esc(pb.license)}</strong></div></div>
    <p class="text-xs rounded-xl bg-stone-100 dark:bg-stone-800 p-3 border border-stone-200 dark:border-stone-700 leading-relaxed">\${esc(pb.disclaimer)}</p>
    <div class="flex justify-end"><button class="\${BTN}" onclick="closeAttr()">Got it</button></div>
  </div>\`;
}
function closeAttr() {
  const m = $("attr-modal");
  m.classList.add("hidden");
  m.classList.remove("flex");
}

function cardsV() {
  S.cards = S.cards || {};
  S.importedDecks = S.importedDecks || [];
  if (!activeDeck) {
    const allSt = deckStats("all");
    const totDue = allSt.n + allSt.l + allSt.d;
    const core = [
      ["phase-1", "Phase 1: Foundations", "Lessons 1–8 · Copula, Possession & SVO Skeleton"],
      ["phase-2", "Phase 2: Flow & Nuance", "Lessons 9–16 · Relative Clauses, Conditionals & Phrasal Verbs"],
      ["phase-3", "Phase 3: Mastery & Register", "Lessons 17–24 · Inversion, Clefts & C1 Collocations"],
      ["custom", "My Custom Translations", "Saved from the Translate tab"]
    ];
    let h = \`<div class="\${CARD} flex flex-wrap items-center justify-between gap-3">
      <div><div class="text-xs uppercase font-semibold text-teal-700 dark:text-teal-300">Anki Spaced Repetition Decks</div>
      <div class="text-sm mt-0.5">New: <strong class="text-sky-600 dark:text-sky-400">\${allSt.n}</strong> · Learning: <strong class="text-red-600 dark:text-red-400">\${allSt.l}</strong> · Due: <strong class="text-emerald-600 dark:text-emerald-400">\${allSt.d}</strong></div></div>
      <button class="\${BTN}" \${totDue===0?"disabled":""} onclick="openDeck('all')">⚡ Study All Due Cards (\${totDue})</button>
    </div>
    <div class="flex items-center justify-between px-2 mb-2 text-xs font-semibold uppercase opacity-65"><span>Core Decks</span><div class="grid grid-cols-3 gap-3 text-right w-36"><span class="text-sky-600 dark:text-sky-400">New</span><span class="text-red-600 dark:text-red-400">Learn</span><span class="text-emerald-600 dark:text-emerald-400">Due</span></div></div>\`;
    core.forEach(([id, name, sub]) => {
      const st = deckStats(id);
      h += \`<button onclick="openDeck('\${esc(id)}')" class="\${CARD} w-full text-left flex items-center justify-between gap-3 hover:border-teal-600">
        <div><div class="font-semibold">\${esc(name)}</div><div class="text-xs opacity-70">\${esc(sub)}</div></div>
        <div class="grid grid-cols-3 gap-3 text-right w-36 font-bold text-sm tabular-nums">
          <span class="\${st.n ? 'text-sky-600 dark:text-sky-400' : 'opacity-40'}">\${st.n}</span>
          <span class="\${st.l ? 'text-red-600 dark:text-red-400' : 'opacity-40'}">\${st.l}</span>
          <span class="\${st.d ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-40'}">\${st.d}</span>
        </div>
      </button>\`;
    });
    h += \`<div class="px-2 mt-4 mb-2 text-xs font-semibold uppercase opacity-65">Open Source Decks (CC BY)</div>\`;
    PREBUILT_DECKS.forEach(pb => {
      const dl = S.importedDecks.includes(pb.id);
      const st = deckStats(pb.id);
      h += \`<div class="\${CARD} flex items-center justify-between gap-3">
        <div class="flex-1"><div class="flex items-center gap-1.5"><span class="font-semibold">\${esc(pb.name)}</span><button class="text-xs px-2 py-0.5 rounded-lg border border-stone-300 dark:border-stone-600 !min-h-[30px]" onclick="showAttr('\${esc(pb.id)}')">ⓘ</button></div>
        <p class="text-xs opacity-75 mt-0.5">\${esc(pb.description)}</p>
        <div class="text-[11px] opacity-60 mt-1">\${esc(pb.author)} · \${esc(pb.license)} · \${pb.cards.length} cards</div></div>
        \${dl ? \`<div class="flex items-center gap-3"><div class="grid grid-cols-3 gap-2 text-right w-24 font-bold text-sm"><span class="text-sky-600 dark:text-sky-400">\${st.n}</span><span class="text-red-600 dark:text-red-400">\${st.l}</span><span class="text-emerald-600 dark:text-emerald-400">\${st.d}</span></div><button class="\${BTN}" onclick="openDeck('\${esc(pb.id)}')">Study</button></div>\` : \`<button class="\${BTN}" onclick="downloadPrebuilt('\${esc(pb.id)}')">⬇ Download</button>\`}
      </div>\`;
    });
    return h;
  }

  if (!RQ) RQ = cardQueue(activeDeck);
  const st = deckStats(activeDeck);
  let hdr = \`<div class="flex items-center justify-between gap-2 mb-3">
    <div class="flex items-center gap-2"><button class="\${GH} !px-3 !py-1 text-xs" onclick="activeDeck=null;RQ=null;render()">← Decks</button>
    <div class="text-xs font-bold"><span class="text-sky-600 dark:text-sky-400">\${st.n}</span> + <span class="text-red-600 dark:text-red-400">\${st.l}</span> + <span class="text-emerald-600 dark:text-emerald-400">\${st.d}</span></div></div>
    <button class="\${GH} !px-3 !py-1 text-xs" \${UNDO?"":"disabled"} onclick="undoCard()">↩️ Undo</button>
  </div>\`;

  if (!RQ.length) {
    return hdr + \`<div class="\${CARD} text-center py-8"><div class="text-4xl mb-2">🎉</div><p class="font-semibold">All caught up in this deck!</p><button class="\${BTN} mt-4" onclick="activeDeck=null;RQ=null;render()">← Back to Decks</button></div>\`;
  }
  const k = RQ[0], d = cardData(k), c = S.cards[k];
  RCUR = d;
  let h = hdr + \`<div class="\${CARD} text-center py-8">\${renderInteractiveAr(d.ar, "card-"+k)}\`;
  if (!RS) return h + \`</div><button class="\${BTN} w-full" onclick="RS=true;render()">Show answer</button>\`;
  h += \`<hr class="my-4 border-stone-200 dark:border-stone-700"><div translate="no" class="text-xl font-semibold mb-3">\${esc(d.en)}</div>\`;
  if (d.m) {
    h += \`<div class="grid grid-cols-2 gap-2 text-left">\${d.m
      .map(([a, b, t]) => \`<div class="rounded-xl p-2 \${C[t] || ""}"><div dir="rtl" class="ar font-semibold">\${esc(a)}</div><div translate="no" class="font-semibold text-sm">\${esc(b)}</div></div>\`)
      .join("")}</div>\`;
  }
  h += \`<button class="\${GH} mt-3" data-speak="\${esc(d.en)}" data-rate="1">🔊 Hear</button></div>\`;
  const B = [["Again", "bg-red-600"], ["Hard", "bg-amber-600"], ["Good", "bg-emerald-600"], ["Easy", "bg-sky-600"]];
  return h + \`<div class="grid grid-cols-4 gap-2">\${B.map(([n, cl], g) =>
    \`<button class="\${cl} text-white rounded-xl py-2.5 text-xs font-semibold min-h-[50px]" onclick="cardGrade(\${g})"><div class="font-bold text-sm">\${n}</div><div class="opacity-90 font-normal">\${g ? cardSched(c, g).int + "d" : "<10m"}</div></button>\`).join("")}</div>
    <p class="text-xs opacity-60 mt-3 text-center">How well did you recall it? Harder cards come back sooner.</p>\`;
}

function cardGrade(g) {
  const k = RQ.shift(), prev = S.cards[k] ? { ...S.cards[k] } : undefined;
  const today = new Date().toISOString().split("T")[0];
  S.reviewHistory = S.reviewHistory || {};
  UNDO = { k, prev, q: [k, ...RQ], score: S.score || 0, today, prevCnt: S.reviewHistory[today] || 0 };
  const s = cardSched(S.cards[k], g);
  S.cards[k] = { ...s, due: g ? Date.now() + s.int * 864e5 : Date.now() + 6e4 };
  if (g === 0) RQ.splice(Math.min(3, RQ.length), 0, k);
  else S.score = (S.score || 0) + 2;
  S.reviewHistory[today] = (S.reviewHistory[today] || 0) + 1;
  save();
  beep(g > 0);
  RS = false;
  popWord = null;
  if (!RQ.length) confetti();
  render();
}

function undoCard() {
  if (!UNDO) return;
  if (UNDO.prev === undefined) delete S.cards[UNDO.k];
  else S.cards[UNDO.k] = UNDO.prev;
  S.score = UNDO.score;
  if (UNDO.prevCnt <= 0) delete S.reviewHistory[UNDO.today];
  else S.reviewHistory[UNDO.today] = UNDO.prevCnt;
  RQ = UNDO.q;
  UNDO = null;
  RS = false;
  save();
  toast("Undid last card review ↩️");
  render();
}

// ---------------- TRANSLATE (auto-detect Arabic/English, translates as you type) ----------------
let TR = { src: "", out: "", from: "", to: "", busy: false }, trTimer = null;
const trIsAr = s => /[\\u0600-\\u06FF]/.test(s);

function translateV() {
  return \`<div class="\${CARD}"><div class="text-xs uppercase opacity-60 mb-2">Type or paste Arabic or English. It detects the language and translates automatically.</div>
    <textarea id="tri" rows="3" class="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent p-3" style="font-size:16px" oninput="trType(this.value)" placeholder="اكتب هنا… / Type here…">\${esc(TR.src)}</textarea>
    <p class="text-[11px] opacity-70 mt-2">🔒 <strong>Privacy note:</strong> Translations are sent to MyMemory.net. Don’t paste anything private.</p>
    <div class="flex gap-2 mt-2"><button class="\${GH} flex-1" onclick="trPaste()">📋 Paste</button><button class="\${GH} flex-1" onclick="trClear()">Clear</button></div></div>
    <div class="\${CARD}" id="tro">\${trOut()}</div>
    <p class="text-xs opacity-60">Machine translation can be wrong. Check new sentences with your teacher before you learn them.</p>\`;
}

function trOut() {
  if (TR.busy) return \`<p class="text-sm opacity-70">Translating…</p>\`;
  if (!TR.out) return \`<p class="text-sm opacity-60">Your translation appears here.</p>\`;
  const ar = TR.to === "ar";
  return \`<div translate="no" \${ar ? 'dir="rtl" class="ar text-2xl leading-relaxed font-semibold"' : 'class="text-xl font-semibold"'}>\${esc(TR.out)}</div>
    <div class="text-xs opacity-60 mt-1">\${TR.from === "ar" ? "Arabic → English" : "English → Arabic"}</div>
    <div class="flex flex-wrap gap-2 mt-3"><button class="\${GH}" onclick="trHear()">🔊 Hear English</button><button class="\${GH}" onclick="trCopy()">Copy</button><button class="\${BTN}" onclick="trSave()">➕ Save as card</button></div>\`;
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
  (S.custom = S.custom || []).push({ id: Date.now().toString(36), ar: arS.trim(), en: enS.trim(), deckId: "custom" });
  save(); RQ = null; toast("Saved to Cards ✓");
}

function hubV(){
  const pend=S.msgs.map((m,i)=>[m,i]).filter(([m])=>!m.r);
  let h=\`<p class="text-xs opacity-70 mb-3">Messages are stored on this device only; cross-device sync needs a backend (e.g. Firebase).</p>
  <div class="\${CARD}"><h3 class="font-semibold mb-2">Ask the Mentor</h3>
  <textarea id="q" rows="3" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3" placeholder="Paste a tricky sentence or question…"></textarea>
  <div class="flex flex-wrap items-center gap-2 mt-2"><button class="\${BTN}" onclick="send()">Send</button></div></div>\`;
  if(S.bc.length)h+=\`<div class="\${CARD}"><h3 class="font-semibold mb-2">📢 Mini-lessons from your teacher</h3>\${S.bc.map(b=>\`<p class="text-sm mb-2">• \${esc(b)}</p>\`).join("")}</div>\`;
  if(S.msgs.length)h+=\`<div class="\${CARD}"><h3 class="font-semibold mb-2">Your questions</h3>\${S.msgs.map(m=>\`<div class="text-sm mb-3"><div>❓ \${esc(m.q)}</div><div class="mt-1 opacity-80">\${m.r?"👩‍🏫 "+esc(m.r):"⏳ awaiting reply"}</div></div>\`).join("")}</div>\`;
  h+=\`<div class="\${CARD}"><h3 class="font-semibold mb-2">👩‍🏫 Teacher Demo Mode (UI Toggle)</h3>\`;
  if(!T)h+=\`<div class="flex gap-2"><input id="pin" type="password" placeholder="Demo PIN" class="rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 w-32"><button class="\${BTN}" onclick="if($('pin').value==CONFIG.DEMO_PIN){T=true;render()}else toast('Wrong demo PIN')">Unlock Demo</button></div><p class="text-xs opacity-60 mt-2">Demo mode PIN: \${CONFIG.DEMO_PIN} (client-side UI toggle for local replies &amp; broadcasts)</p>\`;
  else{
    h+=\`<h4 class="text-sm font-semibold">Open questions (\${pend.length})</h4>\`+pend.map(([m,i])=>\`<div class="my-2 text-sm"><div>\${esc(m.q)}</div><textarea id="r\${i}" rows="2" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2 mt-1" placeholder="Reply…"></textarea><button class="\${BTN} mt-1" onclick="reply(\${i})">Reply</button></div>\`).join("");
    h+=\`<h4 class="text-sm font-semibold mt-4">Broadcast a mini-lesson</h4><textarea id="bt" rows="2" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-2"></textarea><button class="\${BTN} mt-1" onclick="bcast()">Broadcast</button>
    <h4 class="text-sm font-semibold mt-4">Most-missed structures</h4>\${weakV()}<button class="\${GH} mt-3" onclick="T=false;render()">Lock Demo Mode</button>\`;
  }
  return h+"</div>";
}
function send(){const q=$("q").value.trim();if(!q)return toast("Write a question first");S.msgs.push({q,r:""});save();render();toast("Sent to your mentor")}
function reply(i){const r=$("r"+i).value.trim();if(!r)return;S.msgs[i].r=r;save();render()}
function bcast(){const b=$("bt").value.trim();if(!b)return;S.bc.unshift(b);save();render();toast("Broadcast published")}
function weakV(){const w=Object.entries(S.wrong).sort((a,b)=>b[1]-a[1]);
  return w.length?w.map(([k,v])=>\`<div class="flex items-center gap-2 text-sm my-1"><span class="w-44 shrink-0 truncate">\${esc(k)}</span><div class="h-2 rounded-full bg-rose-500" style="width:\${Math.min(100,v*12)}px"></div><span>\${v}</span></div>\`).join(""):\`<p class="text-sm opacity-70">No mistakes recorded yet.</p>\`}

function heatmapV() {
  S.reviewHistory = S.reviewHistory || {};
  const cells = [];
  const today = new Date();
  for (let i = 139; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000).toISOString().split("T")[0];
    const cnt = S.reviewHistory[d] || 0;
    const cl = cnt <= 0 ? "bg-stone-200 dark:bg-stone-700/70" : cnt < 5 ? "bg-emerald-200 dark:bg-emerald-900" : cnt < 10 ? "bg-emerald-400 dark:bg-emerald-700" : cnt < 20 ? "bg-emerald-500" : "bg-emerald-700 dark:bg-emerald-300";
    cells.push(\`<div title="\${d}: \${cnt} reviews" class="w-3 h-3 rounded-[3px] \${cl}"></div>\`);
  }
  return \`<div class="\${CARD}"><h3 class="font-semibold mb-1">Review Heatmap (Last 20 Weeks)</h3><div class="overflow-x-auto pb-1 mt-2"><div class="grid grid-rows-7 grid-flow-col gap-1 w-max">\${cells.join("")}</div></div></div>\`;
}

function progV(){
  const BG=[["🌱","First win",S.score>0],["🔥","5 in a row",S.best>=5],["⚡","10 in a row",S.best>=10],["🏛️","Phase 1 done",[0,1,2,3,4,5,6,7].every(comp)],["👑","All 24 lessons",L.every((_,i)=>comp(i))],["💬","Asked the mentor",S.msgs.length>0]];
  let h=\`<div class="\${CARD} grid grid-cols-3 text-center"><div><div class="text-2xl font-semibold">\${S.score}</div><div class="text-xs opacity-70">score</div></div><div><div class="text-2xl font-semibold">\${S.streak}</div><div class="text-xs opacity-70">streak</div></div><div><div class="text-2xl font-semibold">\${S.best}</div><div class="text-xs opacity-70">best streak</div></div></div>\`;
  h += heatmapV();
  h += \`<div class="\${CARD}"><div class="flex justify-between text-sm mb-2"><span class="font-semibold">🏆 Level \${lvl()+1} · \${LV[lvl()]}</span><button class="text-xs underline" onclick="SND=!SND;render()">Sound \${SND?"on":"off"}</button></div><div class="h-2 rounded-full bg-stone-200 dark:bg-stone-700"><div class="h-2 rounded-full bg-teal-600" style="width:\${lvl()>3?100:S.score%60/60*100}%"></div></div></div>
  <div class="\${CARD}"><h3 class="font-semibold mb-2">Badges</h3><div class="grid grid-cols-3 gap-3 text-center">\${BG.map(([e,n,ok])=>\`<div class="\${ok?"":"opacity-30 grayscale"}"><div class="text-3xl">\${e}</div><div class="text-xs">\${n}</div></div>\`).join("")}</div></div>
  <div class="\${CARD}">\`;
  PHASES.forEach((p,pi)=>{let t=0,d=0;L.forEach((l,li)=>{if(l.pi==pi){t+=l.ex.length;d+=dn(li)}});const pc=Math.round(100*d/Math.max(1,t));
  h+=\`<div class="mb-3"><div class="text-sm mb-1">Phase \${p.id} · \${esc(p.title)} · \${pc}%</div><div class="h-2 rounded-full bg-stone-200 dark:bg-stone-700"><div class="h-2 rounded-full bg-teal-600" style="width:\${pc}%"></div></div></div>\`});
  h+=\`</div><div class="\${CARD}"><h3 class="font-semibold mb-2">Weak spots</h3>\${weakV()}</div>
  <div class="\${CARD}"><h3 class="font-semibold mb-2">My notes</h3><textarea rows="4" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3" oninput="S.notes=this.value;save()" placeholder="Habits to watch, new ideas…">\${esc(S.notes)}</textarea></div>
  <div class="\${CARD}"><h3 class="font-semibold mb-2">Feedback for your teacher</h3><div class="flex mb-3">\${[1,2,3,4,5].map(n=>\`<button onclick="FR=\${n};render()" class="\${n==FR?BTN:GH} flex-1 mx-0.5 !px-0">\${['😕','🙁','😐','🙂','😍'][n-1]}</button>\`).join("")}</div><textarea rows="3" class="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent p-3" oninput="FT=this.value" placeholder="What helped? What was confusing?">\${esc(FT)}</textarea><div class="flex gap-2 mt-2"><button class="\${BTN} flex-1" onclick="window.open(fbLink(),'_blank')">WhatsApp</button><button class="\${GH} flex-1" onclick="window.open('mailto:?subject='+encodeURIComponent('Thinking English™ feedback')+'&body='+encodeURIComponent(fbMsg()))">Email</button><button class="\${GH} flex-1" onclick="copyFb()">Copy</button></div><button class="\${GH} w-full mt-2" onclick="window.open(FORM,'_blank')">📝 Full feedback form (forms.gle)</button></div>
  <div class="\${CARD}"><h3 class="font-semibold mb-1">Recap: the \${L.length} mental shifts</h3><p class="text-xs opacity-60 mb-2">Tap a shift to expand it.</p>\${L.map((l,i)=>\`<details class="border-t border-stone-200 dark:border-stone-700"><summary class="py-3 text-sm font-semibold">\${l.num}. \${esc(l.t)}</summary><p class="text-sm opacity-85 pb-2">\${esc(l.w)}</p><p dir="rtl" class="ar text-sm opacity-85 pb-3">\${esc(l.wAr)}</p></details>\`).join("")}</div>
  <button class="\${GH}" onclick="if(confirm('Reset all progress?')){S=D();save();cur=null;RQ=null;render()}">Reset progress</button>\`;
  return h;
}
function shareFriends(){
  const msg=\`🧠 *Thinking English™: Arabic-to-English Transfer Journey*\\nجرب تطبيق *Thinking English™* لتعلم التفكير بالإنجليزية من منطق اللغة العربية بدون حفظ قوائم أو قواعد معقدة 🚀\\n\\n✨ *Try the app here / جرب التطبيق من هنا:*\\n\${APP_URL}\\n\\n📝 *Share your review & feedback / شاركنا رأيك وتقييمك بعد التجربة:*\\n\${FORM}\`;
  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
}
function fbMsg(){const d=L.filter((_,i)=>comp(i)).length,w=Object.entries(S.wrong).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join(", ")||"none";return \`Thinking English™ feedback\\nRating: \${FR?FR+"/5":"-"}\\nLessons done: \${d}/\${L.length} · Score: \${S.score}\\nHardest: \${w}\\n\\n\${FT}\\n\\nReview Form: \${FORM}\`}
function fbLink(){return (TEACHER?"https://wa.me/"+TEACHER:"https://wa.me/")+"?text="+encodeURIComponent(fbMsg())}
function copyFb(){try{navigator.clipboard.writeText(fbMsg()).then(()=>toast("Copied. Paste it to your teacher"))}catch(e){toast("Couldn’t copy")}}
function beep(ok){
  if(SND){try{const a=new (window.AudioContext||window.webkitAudioContext)();(ok?[523,659,784]:[200,150]).forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.1;o.frequency.value=f;o.type=ok?"triangle":"sawtooth";o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.2)})}catch(e){}}
  try{navigator.vibrate&&navigator.vibrate(ok?[20,40,20]:80)}catch(e){}
}
function confetti(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const E=["🎉","⭐","✨","🔥","💚"];
  for(let i=0;i<26;i++){const s=document.createElement("span");s.className="conf";s.textContent=E[i%5];s.style.left=Math.random()*95+"%";s.style.animationDelay=Math.random()*.4+"s";document.body.appendChild(s);setTimeout(()=>s.remove(),2200)}
}

applyTheme();
render();
</script>
</body>
</html>`;
}

/**
 * Triggers a pure client-side Blob download of Thinking-English.html
 * so the browser never makes a network request to the AI Studio Cloud Run cookie gate.
 */
export function triggerStandaloneHtmlDownload(): void {
  const htmlContent = buildStandaloneHtmlString();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Thinking-English.html';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

/**
 * Triggers a pure client-side Blob download of PROVENANCE.md
 */
export function triggerProvenanceMdDownload(): void {
  const blob = new Blob([PROVENANCE_MD_CONTENT], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PROVENANCE.md';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
