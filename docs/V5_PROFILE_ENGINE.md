# Thinking Bridge v5.0 — Real Profile Engine Architecture & Generation Pipeline

## Executive Overview
In v4.0.x, Thinking Bridge established 100% honesty across all marketing claims and UI interfaces, eliminating procedurally generated mock lessons. To support true personalization across **1,440 profile matrix combinations** (16 Source Dialects/Languages × 15 Target Languages × 6 Focus Areas × CEFR Stages A0–A2) without runtime hallucinations or word-salad templates, Thinking Bridge v5.0 adopts an **offline, LLM-assisted curriculum pipeline**.

The engine compiles high-quality, linguistically verified lessons ahead of time into static JSON chunks, which are lazily loaded on demand in web and bundled into the offline Capacitor APK.

---

## 1. Unified Lesson Data Schema

To natively support multidimensional profile routing, every lesson follows the `ProfileAwareLesson` TypeScript contract:

```typescript
export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type FocusArea = 'corporate' | 'academic' | 'travel' | 'conversation' | 'dialect-immersion' | 'general';

export interface BreakdownChunk {
  /** Source sentence component in learner's native dialect (e.g., Egyptian Arabic 'عاوز اروح') */
  sourceText: string;
  /** Exact target language equivalent (e.g., German 'Ich möchte gehen') */
  targetText: string;
  /** Grammatical function in target sentence */
  role: 'subject' | 'verb' | 'object' | 'modifier' | 'connector' | 'particle';
  /** L1 transfer contrastive explanation */
  contrastiveNote: string;
}

export interface ProfileAwareExercise {
  id: string;
  /** Natural prompt in learner's source dialect */
  promptSource: string;
  /** Target sentence in destination language */
  targetSentence: string;
  /** Cognitive thinking bridge thought */
  sourceThought: string;
  /** Interactive word chips for ordering */
  wordChips: string[];
  /** Syntactical chunk breakdown */
  breakdownChunks: BreakdownChunk[];
  /** L1 interference explanation in native language */
  explanationSource: string;
  /** L1 interference explanation in English */
  explanationEn: string;
}

export interface ProfileAwareLesson {
  id: string; // Format: {targetLang}-{cefr}-{focus}-{sourceLang}-{index}
  sourceLang: string; // e.g. 'arz' (Egyptian Arabic)
  targetLang: string; // e.g. 'de' (German)
  focusArea: FocusArea;
  cefrLevel: CEFRLevel;
  lessonIndex: number;
  titleSource: string;
  titleEn: string;
  descriptionSource: string;
  descriptionEn: string;
  exercises: ProfileAwareExercise[];
  /** Provenance metadata */
  generatedAt?: string;
  modelSignature?: string;
  checksum?: string;
}
```

---

## 2. The Offline LLM-Assisted Generation Pipeline

Rather than generating lessons dynamically at runtime (which introduces latency, API costs, network dependencies, and unpredictable quality), v5.0 uses a batch generation workflow powered by **Gemini 1.5 Flash / 3.6 Flash**.

```mermaid
graph TD
    A[Matrix Generator Script] -->|Loop 1,440 Combinations| B[Gemini Flash Batch API]
    B -->|Structured JSON Output| C[Schema & Linguistic Validation]
    C -->|Pass| D[Minified Static Assets: dict-*.json]
    C -->|Fail/Malformed| E[Retry Queue with Fixed Seed]
    D --> F[Vite Lazy Chunk Loader / Capacitor Offline Assets]
```

### Key Technical Properties:
1. **Offline & Zero Latency:** Static JSON files live in `dist/assets/curriculum-data-{target}-{source}.json` and are fetched lazily via `import()` when a user selects a new target language or dialect.
2. **Deterministic Quality Gate:** Every generated chunk passes through `ts-json-schema-validator` and `checkAnswerMatch` test suites during CI before being accepted into `main`.
3. **Bandwidth Efficiency:** Chunks are compressed with Brotli/Gzip and cached in ServiceWorker `dictionary-runtime-cache` with `StaleWhileRevalidate`.

---

## 3. Gemini Generation System Prompt Template

When running offline generation for a specific matrix tuple (e.g., `sourceLang: 'arz'`, `targetLang: 'de'`, `focusArea: 'travel'`, `cefrLevel: 'A1'`), the following prompt is dispatched to Gemini:

```text
SYSTEM PROMPT: You are a PhD Senior Contrastive Linguist and Curriculum Architect specializing in L1 Transfer and Cognitive Language Acquisition.

TASK: Generate 5 authentic, pedagogically rigorous lessons for the following learner profile:
- Native Language/Dialect (L1): Egyptian Arabic (arz)
- Target Language (L2): German (de)
- Focus Area: Travel & Mobility (travel)
- CEFR Stage: A1 (Elementary)

REQUIREMENTS:
1. All source thoughts MUST be written in natural, authentic Egyptian Arabic (arz) as spoken in everyday conversation in Alexandria/Cairo.
2. Target sentences MUST be grammatically flawless German (de) appropriate for A1 travel scenarios (hotels, trains, airports).
3. Do NOT use word-salad or random vocabulary lists. Every exercise MUST form a complete, meaningful, real-world sentence.
4. Highlight L1 transfer pitfalls (e.g., V2 verb position in German vs SVO/VSO in Egyptian Arabic, German noun genders, accusative prepositions).
5. Output ONLY a valid JSON array matching the following schema:

[
  {
    "id": "de-a1-travel-arz-1",
    "sourceLang": "arz",
    "targetLang": "de",
    "focusArea": "travel",
    "cefrLevel": "A1",
    "lessonIndex": 1,
    "titleSource": "الوصول للفندق وحجز الغرفة",
    "titleEn": "Hotel Check-In & Booking",
    "descriptionSource": "تعلم كيفية طلب غرفة والتعامل مع الفندق بالخيارات الأساسية",
    "descriptionEn": "Learn how to ask for a room and handle basic hotel interactions in German",
    "exercises": [
      {
        "id": "de-a1-travel-arz-1-ex1",
        "promptSource": "عاوز أحجز أوضة لشخصين لو سمحت.",
        "targetSentence": "Ich möchte bitte ein Doppelzimmer buchen.",
        "sourceThought": "أنا بريد لو سمحت غرفة مزدوجة أحجز",
        "wordChips": ["Ich", "möchte", "bitte", "ein", "Doppelzimmer", "buchen."],
        "breakdownChunks": [
          {
            "sourceText": "عاوز",
            "targetText": "Ich möchte",
            "role": "verb",
            "contrastiveNote": "In German, modal verb 'möchte' takes position 2, and the main verb 'buchen' goes to the very end."
          },
          {
            "sourceText": "أوضة لشخصين",
            "targetText": "ein Doppelzimmer",
            "role": "object",
            "contrastiveNote": "Neuter noun 'das Doppelzimmer' in accusative direct object position."
          },
          {
            "sourceText": "أحجز",
            "targetText": "buchen",
            "role": "verb",
            "contrastiveNote": "Infinitive verb pushed to end of clause in German modal construction."
          }
        ],
        "explanationSource": "في الألماني، الفعل المساعد (möchte) بييجي في المركز التاني، والفعل الأساسي (buchen) بييجي في آخر الجملة خالص في المصدر.",
        "explanationEn": "In German, the modal verb occupies position 2, while the infinitive verb 'buchen' moves to the clause end."
      }
    ]
  }
]
```

---

## 4. Graceful Fallback & Curriculum Routing Logic

If a specific dialect or language pair chunk is not yet present on disk or fails to load, `buildCourseStructure` falls back gracefully without breaking the user experience:

```typescript
export async function loadProfileCurriculumAsync(
  targetLang: TargetLanguage,
  sourceLang: SourceLanguage,
  focusArea: FocusArea,
  cefrLevel: CefrStage
): Promise<StageNode[]> {
  try {
    // 1. Attempt dynamic load of dedicated profile chunk
    const chunkModule = await import(
      `../data/curriculum/generated/curriculum-${targetLang}-${sourceLang}.json`
    );
    const profileLessons: ProfileAwareLesson[] = chunkModule.default;

    const filtered = profileLessons.filter(
      (l) => l.focusArea === focusArea && l.cefrLevel === cefrLevel
    );

    if (filtered.length >= 9) {
      return buildStageNodesFromLessons(filtered);
    }
  } catch (err) {
    console.info(
      `[CurriculumRouter] Custom profile chunk (${targetLang}-${sourceLang}) not cached. Serving canonical foundation path.`
    );
  }

  // 2. Honest Fallback to Canonical Curriculum + User Goal Personalization
  return buildCanonicalCourseStructure(targetLang, sourceLang);
}
```

---

## Summary
With this architecture in place for v5.0:
- **No Hallucinations:** Zero procedural string concatenation or word-salad.
- **Offline Perfection:** Fully pre-compiled JSON chunks bundled into web asset bundles and the Android Capacitor APK.
- **100% Honesty:** Users receive exact, human-reviewed/LLM-verified content tailored to their precise dialect and goals.
