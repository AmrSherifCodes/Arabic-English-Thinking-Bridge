import { ALL_LESSONS } from '../data/lessons';
import { Lesson, UserProgress } from '../types';
import type { UserProfile } from '../hooks/useUserProfile';
import {
  ensureRequiredWordBankTokens,
  normalizeAnswerForComparison,
  normalizeTileWord,
  tokenizeTargetSentence,
} from './sentenceBuilderHelper';

export interface AdaptiveRecommendation {
  lessonIndex: number;
  lesson: Lesson;
  reasonEn: string;
  reasonAr: string;
  tag: string;
}

export interface StageComplexityRules {
  maxSentenceLength: number;
  grammarFocusEn: string;
  grammarFocusAr: string;
  hasConjunctions: boolean;
  hasComplexClauses: boolean;
}

/**
 * Dynamic Level Complexity Tree (A0-B1 Tiers)
 */
export function getStageComplexityRules(stage: string): StageComplexityRules {
  const normStage = (stage || 'A0').toUpperCase();
  if (normStage === 'A0' || normStage === 'PRE-A0') {
    return {
      maxSentenceLength: 5,
      grammarFocusEn: 'Pure Vocabulary & Basic Copula (am/is/are)',
      grammarFocusAr: 'المفردات الأساسية وكوبري الكينونة البسيط',
      hasConjunctions: false,
      hasComplexClauses: false,
    };
  }
  if (normStage === 'A1' || normStage === 'A1+') {
    return {
      maxSentenceLength: 8,
      grammarFocusEn: 'Compound Sentences & Conjunctions (and, but, because)',
      grammarFocusAr: 'الجمل المركبة وأدوات الربط الأولى',
      hasConjunctions: true,
      hasComplexClauses: false,
    };
  }
  return {
    maxSentenceLength: 14,
    grammarFocusEn: 'Complex Clauses, Figurative Idioms & Abstract Register',
    grammarFocusAr: 'الجمل المعقدة، التعبيرات الاصطلاحية والسياق الرفيع',
    hasConjunctions: true,
    hasComplexClauses: true,
  };
}

/**
 * Dynamically adjusts exercise word chips and time limits based on the user's difficulty knob.
 * Guarantees that every token required by targetSentence (including duplicate counts) is
 * always preserved across Easy, Medium, and Hard modes.
 */
export function getDynamicExerciseOptions(
  options: string[],
  targetSentence: string,
  difficultyLevel: 'Easy' | 'Medium' | 'Hard'
): { wordChips: string[]; timerLimitSec?: number } {
  const safeOptions = ensureRequiredWordBankTokens(options, targetSentence);

  if (difficultyLevel === 'Hard') {
    const isCjk = /[\u3040-\u30ff\u3400-\u9fff]/u.test(targetSentence || '');

    if (isCjk) {
      const targetNorm = normalizeAnswerForComparison(targetSentence, true);
      const remainingChars = new Map<string, number>();
      for (const ch of targetNorm) {
        remainingChars.set(ch, (remainingChars.get(ch) || 0) + 1);
      }

      const protectedFlags = safeOptions.map((opt) => {
        const optNorm = normalizeAnswerForComparison(opt, true);
        if (!optNorm) return false;
        let needed = false;
        for (const ch of optNorm) {
          if ((remainingChars.get(ch) || 0) > 0) {
            needed = true;
            break;
          }
        }
        if (needed) {
          for (const ch of optNorm) {
            const left = remainingChars.get(ch) || 0;
            if (left > 0) remainingChars.set(ch, left - 1);
          }
        }
        return needed;
      });

      const distractorIndices = protectedFlags
        .map((isProtected, idx) => (isProtected ? -1 : idx))
        .filter((idx) => idx !== -1);

      if (distractorIndices.length > 2) {
        const dropSet = new Set(distractorIndices.slice(0, 2));
        const filtered = safeOptions.filter((_, idx) => !dropSet.has(idx));
        return {
          wordChips: ensureRequiredWordBankTokens(filtered, targetSentence),
          timerLimitSec: 15,
        };
      }
      return { wordChips: safeOptions, timerLimitSec: 15 };
    }

    const remainingRequired = new Map<string, number>();
    for (const token of tokenizeTargetSentence(targetSentence)) {
      const key = normalizeTileWord(token);
      if (!key) continue;
      remainingRequired.set(key, (remainingRequired.get(key) || 0) + 1);
    }

    const protectedFlags = safeOptions.map((opt) => {
      if (/\s/.test(opt)) return false;
      const key = normalizeTileWord(opt);
      const needed = remainingRequired.get(key) || 0;
      if (needed > 0) {
        remainingRequired.set(key, needed - 1);
        return true;
      }
      return false;
    });

    const distractorIndices = protectedFlags
      .map((isProtected, idx) => (isProtected ? -1 : idx))
      .filter((idx) => idx !== -1);

    if (distractorIndices.length > 2) {
      const dropSet = new Set(distractorIndices.slice(0, 2));
      const filtered = safeOptions.filter((_, idx) => !dropSet.has(idx));
      return {
        wordChips: ensureRequiredWordBankTokens(filtered, targetSentence),
        timerLimitSec: 15,
      };
    }

    return { wordChips: safeOptions, timerLimitSec: 15 };
  }

  if (difficultyLevel === 'Easy') {
    return { wordChips: safeOptions, timerLimitSec: 35 };
  }

  return { wordChips: safeOptions, timerLimitSec: 25 };
}

/**
 * Safely extracts user age group ('child' | 'teen' | 'adult') from profile.
 * Defaults to 'adult' if profile is null, missing, or invalid.
 */
export function getUserAgeGroup(profile?: UserProfile | null): 'child' | 'teen' | 'adult' {
  if (!profile) return 'adult';

  try {
    let numericAge: number | null = null;

    if (typeof profile.age === 'number' && !Number.isNaN(profile.age)) {
      numericAge = profile.age;
    } else if (typeof profile.age === 'string') {
      const parsed = parseInt(profile.age, 10);
      if (!Number.isNaN(parsed)) {
        numericAge = parsed;
      }
    }

    if (numericAge !== null) {
      if (numericAge < 13) return 'child';
      if (numericAge < 18) return 'teen';
      return 'adult';
    }

    const ageBand = (profile.ageBand || '') as string;
    if (ageBand === '4-11' || ageBand === 'kids' || ageBand === 'child') return 'child';
    if (ageBand === '12-14' || ageBand === '15-18' || ageBand === 'teen') return 'teen';
    if (ageBand === '18-30' || ageBand === '30+' || ageBand === '19-24' || ageBand === '25+' || ageBand === 'adult') return 'adult';

    const level = (profile.level || '') as string;
    const track = (profile.learnerTrack || '') as string;
    if (level === 'kids' || level === 'middle' || track === 'kg_primary') return 'child';
    if (track === 'prep_stage' || track === 'thanawiya_igcse') return 'teen';
  } catch (err) {
    console.warn('Error parsing user age group, defaulting to adult:', err);
  }

  return 'adult';
}

/**
 * Returns relevance weight (1 to 10) for a given lesson based on user's goal and focus area.
 */
export function getLessonRelevanceScore(lesson: Lesson, profile?: UserProfile | null): number {
  const goal = profile?.goal || 'general';
  const focus = (profile?.focusArea || '').toLowerCase();
  let score = 5; // Base score

  // 1. Chemistry & Academic Focus
  if (focus === 'chemistry' || focus.includes('chem') || focus.includes('science') || goal === 'academic') {
    // Academic Hedging & Scientific Nuance
    if (lesson.id === 'p3-l11' || lesson.number === 27) score += 5;
    // Advanced Logical Connectors
    if (lesson.id === 'p3-l10' || lesson.number === 26) score += 5;
    // Passive voice (crucial for lab reports & scientific papers)
    if (lesson.id === 'l-flow-8' || lesson.number === 16) score += 5;
    // Subjunctive & Formal Directives
    if (lesson.id === 'l-mas-5' || lesson.number === 21) score += 5;
    // Discourse Markers in High Register
    if (lesson.id === 'l-mas-6' || lesson.number === 22) score += 4;
    // The Hidden Copula (for scientific definitions & properties)
    if (lesson.id === 'l-found-1' || lesson.number === 1) score += 4;
    // Countable vs Uncountable Mass Nouns
    if (lesson.id === 'l-flow-6' || lesson.number === 14) score += 4;
    // Contrast & Cause
    if (lesson.id === 'l-flow-4' || lesson.number === 12) score += 3;
    // Cleft Sentences & Structural Highlighting
    if (lesson.id === 'l-mas-4' || lesson.number === 20) score += 3;
    // Negative Inversion
    if (lesson.id === 'l-mas-1' || lesson.number === 17) score += 3;
  }

  // 2. Travel Goal
  if (goal === 'travel') {
    // Idiomatic Expressions (practical colloquial understanding)
    if (lesson.id === 'p3-l9' || lesson.number === 25) score += 3;
    // Questions with Do / Does (asking for directions, schedules)
    if (lesson.id === 'l-found-5' || lesson.number === 5) score += 5;
    // Prepositions: In, On, At (airports, locations, transit)
    if (lesson.id === 'l-found-8' || lesson.number === 8) score += 5;
    // Modals: Can / Want to / Need to (bookings, orders)
    if (lesson.id === 'l-found-6' || lesson.number === 6) score += 4;
    // Possession: Have vs عند (reservations, tickets)
    if (lesson.id === 'l-found-3' || lesson.number === 3) score += 4;
    // Negation with Don't
    if (lesson.id === 'l-found-4' || lesson.number === 4) score += 3;
  }

  // 3. Business & Workplace Goal
  if (goal === 'business' || goal === 'work') {
    // Advanced Logical Connectors (executive emails, reports)
    if (lesson.id === 'p3-l10' || lesson.number === 26) score += 5;
    // Idiomatic Expressions & Metaphorical Transfer
    if (lesson.id === 'p3-l9' || lesson.number === 25) score += 4;
    // Reported Speech & Tense Backshifting (updates, meetings)
    if (lesson.id === 'l-mas-2' || lesson.number === 18) score += 5;
    // Discourse Markers (professional emails, discussions)
    if (lesson.id === 'l-mas-6' || lesson.number === 22) score += 5;
    // Modals: Deduction & Regret
    if (lesson.id === 'l-mas-3' || lesson.number === 19) score += 4;
    // Phrasal Verbs (office & customer retention idioms)
    if (lesson.id === 'l-flow-5' || lesson.number === 13) score += 4;
    // Conditionals (negotiations, agreements)
    if (lesson.id === 'l-flow-3' || lesson.number === 11) score += 3;
  }

  // 4. Daily Speech Focus
  if (focus === 'daily-speech' || focus.includes('daily') || focus.includes('slang')) {
    // Idiomatic Expressions & Figurative Transfer
    if (lesson.id === 'p3-l9' || lesson.number === 25) score += 5;
    // Phrasal Verbs & Spatial Particle Logic
    if (lesson.id === 'l-flow-5' || lesson.number === 13) score += 5;
    // Questions with Do / Does
    if (lesson.id === 'l-found-5' || lesson.number === 5) score += 4;
    // Modals: Can / Want to
    if (lesson.id === 'l-found-6' || lesson.number === 6) score += 4;
    // Adjective Placement
    if (lesson.id === 'l-found-7' || lesson.number === 7) score += 3;
    // Zero Relative Clauses
    if (lesson.id === 'l-flow-2' || lesson.number === 10) score += 3;
  }

  // 5. Age & Demographics Adaptive Factors
  const ageGroup = getUserAgeGroup(profile);
  const isKidOrMiddle = ageGroup === 'child' || profile?.level === 'kids' || profile?.level === 'middle' || profile?.learnerTrack === 'kg_primary' || profile?.learnerTrack === 'prep_stage';
  const isAdultOrCareer = ageGroup === 'adult' || profile?.level === 'career' || profile?.level === 'high' || profile?.learnerTrack === 'uni_career' || profile?.learnerTrack === 'thanawiya_igcse';

  if (isKidOrMiddle) {
    // Younger learners: boost core building blocks, visual patterns & foundational sentence structures
    if (lesson.id === 'l-found-1' || lesson.number === 1) score += 4;
    if (lesson.id === 'l-found-2' || lesson.number === 2) score += 4;
    if (lesson.id === 'l-found-7' || lesson.number === 7) score += 4;
    if (lesson.id === 'l-found-8' || lesson.number === 8) score += 3;
    if (lesson.id === 'l-found-5' || lesson.number === 5) score += 3;
  } else if (isAdultOrCareer && goal !== 'travel') {
    // Adult learners: boost high-register business, reported speech & analytical structures
    if (lesson.id === 'l-mas-2' || lesson.number === 18) score += 3;
    if (lesson.id === 'p3-l10' || lesson.number === 26) score += 3;
    if (lesson.id === 'l-mas-6' || lesson.number === 22) score += 3;
  }

  return score;
}

/**
 * Returns whether a lesson is considered a primary focus shift for the given profile.
 */
export function isPriorityLessonForProfile(lesson: Lesson, profile: UserProfile): boolean {
  return getLessonRelevanceScore(lesson, profile) >= 8;
}

/**
 * Returns human-readable track title and badge icon for the profile.
 */
export function getProfileTrackInfo(profile?: UserProfile | null): { titleEn: string; titleAr: string; icon: string } {
  const focus = (profile?.focusArea || '').toLowerCase();
  const goal = profile?.goal || 'general';

  if (focus === 'chemistry' || focus.includes('chem') || focus.includes('science')) {
    return {
      titleEn: 'Chemistry & Academic STEM Track',
      titleAr: 'مسار الكيمياء والعلوم الأكاديمية',
      icon: '⚗️'
    };
  }
  if (goal === 'academic') {
    return {
      titleEn: 'Academic & Formal Register Track',
      titleAr: 'المسار الأكاديمي واللغة الرسمية',
      icon: '🎓'
    };
  }
  if (goal === 'travel') {
    return {
      titleEn: 'Travel & Navigation Track',
      titleAr: 'مسار السفر والمواقف العملية',
      icon: '✈️'
    };
  }
  if (goal === 'business' || goal === 'work') {
    return {
      titleEn: 'Business & Professional Track',
      titleAr: 'مسار الأعمال والتواصل المهني',
      icon: '💼'
    };
  }
  if (focus === 'daily-speech') {
    return {
      titleEn: 'Daily Speech & Natural Flow Track',
      titleAr: 'مسار التحدث اليومي والطلاقة التلقائية',
      icon: '🗣️'
    };
  }

  return {
    titleEn: 'Cognitive Structural Transfer Track',
    titleAr: 'مسار التحول الإدراكي الشامل',
    icon: '🧠'
  };
}

/**
 * Determines the adaptive next lesson recommendation tailored to the user profile.
 */
export function getAdaptiveRecommendation(
  progress: UserProgress,
  profile: UserProfile
): AdaptiveRecommendation {
  const completed = new Set(progress.completedLessonIds || []);

  // 1. Find incomplete lessons scored by relevance
  const scoredLessons = ALL_LESSONS.map((lesson, idx) => ({
    lessonIndex: idx,
    lesson,
    score: getLessonRelevanceScore(lesson, profile),
    isCompleted: completed.has(lesson.id)
  }));

  // Incomplete priority lessons first
  const incompletePriority = scoredLessons
    .filter(item => !item.isCompleted && item.score >= 8)
    .sort((a, b) => b.score - a.score || a.lessonIndex - b.lessonIndex);

  if (incompletePriority.length > 0) {
    const top = incompletePriority[0];
    const focus = (profile.focusArea || '').toLowerCase();
    let reasonEn = `High-impact concept aligned with your ${profile.goal} goal.`;
    let reasonAr = `مفهوم عالي الأهمية يتطابق مع هدفك (${profile.goal}).`;

    if (focus === 'chemistry' || focus.includes('chem')) {
      if (top.lesson.number === 27) {
        reasonEn = 'Master academic hedging (e.g. "evidence suggests", "widely believed") for rigorous research papers.';
        reasonAr = 'إتقان أسلوب التحوط الأكاديمي (Hedging) لكتابة أوراق بحثية وعلمية دقيقة.';
      } else if (top.lesson.number === 26) {
        reasonEn = 'Connect scientific hypotheses with high-order logic: nevertheless, consequently, furthermore.';
        reasonAr = 'ربط الفرضيات العلمية بروابط منطقية رفيعة: ومع ذلك، وبناءً على ذلك، وعلاوة على ذلك.';
      } else if (top.lesson.number === 16) {
        reasonEn = 'Essential for chemistry & lab reports: describe actions clearly without focusing on who did them (passive voice).';
        reasonAr = 'أساسي لأوراق الأبحاث وتجارب المختبر: إزاي توصف اللي حصل من غير ما تركز على مين عمله (المبني للمجهول).';
      } else if (top.lesson.number === 1) {
        reasonEn = 'Crucial for chemical compound definitions: understand required linking verbs in English.';
        reasonAr = 'جوهري لتعريفات المركبات الكيميائية: فهم رابط الجملة الإنجليزية الإلزامي.';
      }
    } else if (top.lesson.number === 25) {
      reasonEn = 'Master figurative English idioms (break the ice, piece of cake) without literal translation traps.';
      reasonAr = 'إتقان التعبيرات الاصطلاحية والمجازية الإنجليزية دون الوقوع في فخ الترجمة الحرفية.';
    } else if (top.lesson.number === 26) {
      reasonEn = 'Elevate professional discourse: master nevertheless, consequently, and furthermore.';
      reasonAr = 'الارتقاء بالحوار المهني والأكاديمي باستخدام روابط الربط المنطقي المتقدمة.';
    } else if (profile.goal === 'travel') {
      reasonEn = 'Essential travel pattern: master clear questions & location prepositions.';
      reasonAr = 'نمط أساسي للسفر: إتقان طرح الأسئلة وحروف الجر المكانية في المطار والمدينة.';
    }

    return {
      lessonIndex: top.lessonIndex,
      lesson: top.lesson,
      reasonEn,
      reasonAr,
      tag: 'Tailored Match'
    };
  }

  // 2. Next uncompleted lesson overall
  const firstIncomplete = scoredLessons.find(item => !item.isCompleted);
  if (firstIncomplete) {
    return {
      lessonIndex: firstIncomplete.lessonIndex,
      lesson: firstIncomplete.lesson,
      reasonEn: 'Next structural step in your core English foundation.',
      reasonAr: 'الخطوة الهيكلية التالية في بناء تفكيرك بالإنجليزية.',
      tag: 'Next Step'
    };
  }

  // 3. If all complete, suggest lesson with highest weak spots or first lesson
  const attentionLesson = scoredLessons.find(
    item => (progress.weakSpotCounts?.[item.lesson.weakSpotTag] || 0) > 0
  );
  const target = attentionLesson || scoredLessons[0];
  return {
    lessonIndex: target.lessonIndex,
    lesson: target.lesson,
    reasonEn: 'Reinforce this structural shift to maintain fluency.',
    reasonAr: 'عزز هذا التحول الإدراكي للحفاظ على الطلاقة والتركيز.',
    tag: 'Reinforcement'
  };
}

/**
 * Randomly samples up to `count` completed exercise IDs from lessons the user has completed,
 * ensuring they aren't already present in `existingQueue`.
 */
export function getRetentionExerciseKeys(
  progress: UserProgress,
  existingQueue: string[],
  count: number = 2
): string[] {
  const existingSet = new Set(existingQueue);
  const candidateIds: string[] = [];

  // 1. First, search completed lessons
  for (const lesson of ALL_LESSONS) {
    if (progress.completedLessonIds?.includes(lesson.id)) {
      for (const ex of lesson.exercises) {
        if (!existingSet.has(ex.id)) {
          candidateIds.push(ex.id);
        }
      }
    }
  }

  // 2. Fallback to any completed exercises if needed
  if (candidateIds.length < count) {
    for (const exId of progress.completedExerciseIds || []) {
      if (!existingSet.has(exId) && !candidateIds.includes(exId)) {
        candidateIds.push(exId);
      }
    }
  }

  if (candidateIds.length === 0) return [];

  // Shuffle candidate IDs and select up to `count`
  const shuffled = [...candidateIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Mixes retention review exercises from completed lessons into a due card queue.
 */
export function mixRetentionIntoDueQueue(
  dueQueue: string[],
  progress: UserProgress,
  retentionCount: number = 2
): string[] {
  const retentionKeys = getRetentionExerciseKeys(progress, dueQueue, retentionCount);
  if (retentionKeys.length === 0) return dueQueue;

  if (dueQueue.length === 0) return retentionKeys;

  const result = [...dueQueue];
  for (const key of retentionKeys) {
    const insertIdx = Math.min(
      result.length,
      Math.max(1, Math.floor(Math.random() * (result.length + 1)))
    );
    result.splice(insertIdx, 0, key);
  }
  return result;
}

