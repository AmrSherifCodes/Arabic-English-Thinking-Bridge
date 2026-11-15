# Constitution — Thinking Bridge & Thinking English™ v1.1.0

> **Motto:** 100% open source · Easy to follow · Low maintenance · High quality · Good feedback
> listening · Always replying to the highest useful comment
>
> **Preamble:**  
> Thinking Bridge (`AmrSherifCodes/Arabic-English-Thinking-Bridge`) and Thinking English™ exist to
> deliver a free, offline-first, high-quality cognitive language learning platform and educational
> channel for Arabic speakers to think directly in English and 10+ global target languages without
> internal translation. This project is built with absolute commitment to zero tracking, radical
> privacy, open-source accessibility, and inclusive pedagogy for learners of all ages. If any code,
> video, or media output ever disagrees with this document, this document wins.

---

## Part I — Software & Architecture Constitution

### Article 1 — Core Principles

1. **Offline-First by Design**: Every core feature—from flashcards, CEFR progression paths, SRS SM-2 scheduling, and phonetic transliteration to offline voice recognition—must function 100% offline without requiring active internet connectivity.
2. **Zero Tracking & Absolute Privacy**: No analytics, telemetry, user accounts, or third-party tracking scripts shall ever be introduced. All user progress, custom decks, and settings remain local on the user's device.
3. **Single-File & Component Simplicity**: Core architecture maintains minimal dependency overhead, fast bundling, and instant sub-second loading across Web, PWA, Android, and Desktop platforms.
4. **Accessible & Inclusive by Default**: The UI strictly supports high-contrast dark/light themes, RTL/LTR dynamic direction, age-tailored font sizing, and full keyboard navigation with ARIA accessibility.
5. **Additive, Non-Disruptive Easter Eggs**: Hidden features and easter eggs (such as the 8-click poem and the 99-click Captain Erwin video checkpoint) must remain strictly additive, non-blocking, and per-session without disrupting core learning.
6. **Cultural Neutrality & Respect**: Pedagogy respects all Arabic dialects (Egyptian, Levantine, Gulf, Moroccan, MSA) and global target languages with warm, encouraging, non-judgmental guidance.

### Article 2 — Technical Constraints

1. **Zero Runtime Tracking Dependencies**: External analytics libraries, telemetry trackers, or paywall gates are strictly prohibited.
2. **Service Worker PWA Integrity**: Service worker configurations must enforce `autoUpdate`, `skipWaiting: true`, `clientsClaim: true`, and `cleanupOutdatedCaches: true` to prevent stale caching.
3. **Strict Content Security Policy (CSP)**: `script-src 'self'` without `unsafe-inline` scripts in HTML; `object-src 'none'`; `frame-ancestors 'none'`.
4. **Offline Asset Safety**: External video or heavy media assets must be embedded via lightweight non-blocking embeds or lazy fallbacks without inflating the offline app bundle.

### Article 3 — Decision Authority

1. **Founder & Maintainer (Amr Sherif)**: Holds final decision authority on project scope, architecture, core pedagogical principles, and official release tags.
2. **AI Agents & Automated Tools**: Authorized to refactor code, fix bugs, optimize performance, run tests, and generate build artifacts, provided no core principle in Article 1 or 2 is violated.
3. **Community Contributors**: May propose features, report issues, and submit pull requests that align with Article 1, Article 2, and the project comment policy.

### Article 4 — Verification & Definition of Done

Any code modification or pull request is defined as **DONE** only when:
1. All automated test suites (`npm test`) pass with zero errors.
2. The TypeScript compiler (`npm run lint`) reports 0 type errors.
3. Production web build (`npm run build`) compiles cleanly without bundle errors.
4. Offline functionality, PWA installability, and accessibility guidelines remain intact.
5. This Constitution remains unchanged or is formally updated via Article 5.

### Article 5 — Amendment Process

1. **Proposal & Justification**: Amendments must be proposed with explicit justification proving alignment with user privacy, accessibility, and offline pedagogy.
2. **Approval**: Require explicit approval from the project founder.
3. **Version Bump**: Upon approval, increment the version header in the file header
   (`# Constitution — Thinking Bridge & Thinking English™ vX.Y.Z`).

---

## Part II — Channel, Media & Pedagogy Constitution

### The 10 Rules

#### 1. Radical Openness is the Brand

Everything is open: the app, the lesson data, the scripts, the transcripts, the thumbnails, the
build commands. Repo link in every description, every pinned comment, every video.

- **Promise:** What you see in a video, you can run yourself in under 60 seconds.
- **License:** CC0 1.0 Universal — content stays free, forever.

#### 2. One Idea Per Video

A 3–5 minute video that solves exactly one structural bridge. The Arabic sentence appears in the
first 5 seconds. No preamble. No 90-second intro.

- **Why:** Searchable, rewatchable, skippable. It matches the micro-step philosophy of the app.

#### 3. Predictable Cadence Over Heroic Sprints

One video every 1–2 weeks. Published on the channel banner. Batch-record 3–4 at a time, release on
schedule.

- **Promise:** A schedule you can keep for five years, not five weeks.

#### 4. Audio-First, Template-Second

A good microphone before a good camera. Same intro slate, same outro card, same caption style, every
video. The voice *is* the brand.

- **Promise:** Clean audio, consistent visuals, no surprise redesigns.

#### 5. Reply to the Top Useful Comment — and Thank Corrections Publicly

One pinned reply per video to the highest-signal useful comment. When someone catches an error:
thank them publicly, fix it in the next commit, and pin their comment with the fix. Never silently
delete a correction.

- **Promise:** Public humility over private defensiveness.

#### 6. Bilingual by Default

Every video ships with **Arabic and English captions** (uploaded `.srt`, not just auto-generated).
Bilingual transcript in the description. Bilingual thumbnails. Bilingual app UI.

- **Promise:** Arabic speakers are respected, not translated-to. Non-Arabic speakers are invited,
  not excluded.

#### 7. Neutrality is a Feature

No politics. No religion. No nationalism. No dialect ranking. Say *"in Egyptian Arabic we say…"*,
never *"the right way is…"*.

- **Promise:** This channel is a refuge from the internet's usual noise.

#### 8. Credit Every Source Loudly

Mihalis Eleftheriou and *Language Transfer* in every description. Any contributor, any inspiration,
any adapted deck — named, linked, thanked. Attribution in the description **and** the pinned
comment.

- **Promise:** Open source is a promise; credit is the proof.

#### 9. Every Video Ships a Working Lesson Link

No dead links. No email gates. No "link in bio." Description contains the exact repo URL, the exact
lesson ID, and the exact commit hash.

- **Promise:** A viewer can go from watching to running the lesson in under 60 seconds.

#### 10. Public Moderation, Consistent Enforcement

The comment policy below is enforced every time, without exception, without arguing in the comments.
One URL. One pinned comment. One block button.

- **Promise:** A global comment section is either a garden or a swamp. This one is a garden.

---

## Part III — Comment Policy & Pre-Upload Checklist

### Comment Policy

**Welcome here:**

- Questions about any lesson, any language, any level
- Corrections to the app, the captions, or the explanations
- Requests for a specific structural bridge
- Kind disagreement about pedagogy

**Removed every time:**

- Harassment, slurs, or personal attacks
- Politics, religion, nationalism
- Spam, self-promotion, crypto, "DM me"
- Dialect wars ("your Arabic is wrong")
- Links to pirated or paywalled copies of the app

**How removal works:** Silent deletion for spam. Public, pinned reply for anything that deserves an
explanation.

### Privacy & Auditability Standard

*No accounts. No analytics. Local storage on-device only.*

### The 60-Second Pre-Upload Checklist

Before any video goes live:

- [ ] One idea, 3–5 minutes, Arabic sentence in first 5 seconds
- [ ] Arabic + English `.srt` captions uploaded
- [ ] Bilingual transcript in description
- [ ] Repo link + exact lesson ID + commit hash
- [ ] Attribution block (Mihalis / Language Transfer / contributors)
- [ ] Neutrality check: no politics, no religion, no dialect ranking
- [ ] Thumbnail: one word in each language, same template
- [ ] Intro/outro slates identical to last video
- [ ] Pinned comment: top useful comment replied to (or correction thanked)
- [ ] Comment policy link in description
  (`https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/blob/main/CONSTITUTION.md#comment-policy`)

---

## Attribution

This project, app, and channel would not exist without:

- **Mihalis Eleftheriou** and **[Language Transfer](https://www.languagetransfer.org/)** — for the
  *Thinking Method* that makes this pedagogy possible.
- **Amr Sherif** — the author, maintainer, and voice of Thinking English™.
- **Every contributor** listed in the repo's `CONTRIBUTORS.md`.
- **Every viewer & learner** who has ever corrected a translation, fixed a typo, or asked a harder
  question than the last one.

---

## License

All lesson content, code, scripts, transcripts, and thumbnails published under the **CC0 1.0
Universal Public Domain Dedication** — free to copy, modify, distribute, and study, with no
copyright restrictions.

*Commercial use is not restricted under CC0. The promise here is not legal — it is personal: the
content stays free.*

---

## A Note on "Bright as a Star"

A star is **visible from far away** *and* **warm up close**.

- **Visible from far:** Clean titles, bilingual thumbnails, searchable lesson names, a repo anyone
  can find in 10 seconds.
- **Warm up close:** The voice, the pinned reply, the public thank-you for a correction, the credit
  line, the refusal to take sides.
- **Bright for years:** A cadence you can keep, a template you can reuse, a promise (CC0) you can
  actually honor.

This document is the map. The videos and code are the journey.

**Think, don't memorize.**
