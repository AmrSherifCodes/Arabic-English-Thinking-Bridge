import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  SEED_CONCEPTS,
  selectNext,
  updateSrs,
  classifyError,
  createInitialLearnerState,
  ConceptNode,
  ConceptExample,
  LearnerState,
  ErrorType
} from '../brain';
import { speakWithRate, CLOUD_AI_VOICE_ID } from '../utils/audio';

export const LEARNER_STATE_KEY = 'tb:learner-state:v1';
export const DAILY_STATS_KEY = 'tb:daily-stats:v1';
export const DAILY_EXERCISE_LIMIT = 15;

export interface LessonEngineOptions {
  activeTrack?: 'general' | 'academic' | 'sustainability';
  preferredVoice?: string;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useLessonEngine(options: LessonEngineOptions = {}) {
  const activeTrack = options.activeTrack || 'general';

  // 1. Hydrate LearnerState from localStorage
  const [learnerStates, setLearnerStates] = useState<Record<string, LearnerState>>(() => {
    try {
      const raw = localStorage.getItem(LEARNER_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {}

    const initial: Record<string, LearnerState> = {};
    for (const c of SEED_CONCEPTS) {
      initial[c.id] = createInitialLearnerState(c.id);
    }
    return initial;
  });

  // Track daily completion limit
  const [dailyCompletedCount, setDailyCompletedCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(DAILY_STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === getTodayDateString()) {
          return Number(parsed.count) || 0;
        }
      }
    } catch {}
    return 0;
  });

  // Persist learnerStates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(learnerStates));
    } catch {}
  }, [learnerStates]);

  // Persist daily completed count
  useEffect(() => {
    try {
      localStorage.setItem(
        DAILY_STATS_KEY,
        JSON.stringify({ date: getTodayDateString(), count: dailyCompletedCount })
      );
    } catch {}
  }, [dailyCompletedCount]);

  // Concept & Example selection
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState<number>(0);

  // Error tracking & Avatar state
  const [lastError, setLastError] = useState<ErrorType | null>(null);
  const [avatarExpression, setAvatarExpression] = useState<'happy' | 'thinking' | 'celebrating' | 'neutral'>('happy');
  const [avatarSpeech, setAvatarSpeech] = useState<string>('Ready to practice thinking in English? (جاهز نفكر بالإنجليزي؟)');
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState<boolean>(false);
  const speakingTimeoutRef = useRef<any | null>(null);

  // Call selectNext to determine current concept if none set or on advance
  const currentConcept = useMemo<ConceptNode>(() => {
    if (activeConceptId) {
      const found = SEED_CONCEPTS.find(c => c.id === activeConceptId);
      if (found) return found;
    }
    const chosen = selectNext(SEED_CONCEPTS, learnerStates, { activeTrack }) || SEED_CONCEPTS[0];
    return chosen;
  }, [activeConceptId, learnerStates, activeTrack]);

  // Keep activeConceptId synced
  useEffect(() => {
    if (!activeConceptId && currentConcept) {
      setActiveConceptId(currentConcept.id);
    }
  }, [activeConceptId, currentConcept]);

  const currentExample = useMemo<ConceptExample>(() => {
    const list = currentConcept.examples || [];
    return list[exampleIndex % Math.max(1, list.length)] || {
      source: 'أنا طالب',
      target: 'I am a student',
      blocks: ['I', 'am', 'a', 'student']
    };
  }, [currentConcept, exampleIndex]);

  // Cleanup speech timeout
  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    };
  }, []);

  // Voice narration helper triggering avatar isSpeaking bobbing
  const speak = useCallback(
    (textToSpeak?: string) => {
      const target = textToSpeak || currentExample.target;
      if (!target) return;

      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      setIsAvatarSpeaking(true);

      const ok = speakWithRate(target, 1, options.preferredVoice || CLOUD_AI_VOICE_ID);
      const wordCount = target.split(/\s+/).length;
      const durationMs = Math.max(1600, wordCount * 450);

      speakingTimeoutRef.current = setTimeout(() => {
        setIsAvatarSpeaking(false);
      }, durationMs);

      return ok;
    },
    [currentExample, options.preferredVoice]
  );

  // Submit Answer handler
  const submitAnswer = useCallback(
    (submittedText: string): { isCorrect: boolean; error: ErrorType | null } => {
      const target = currentExample.target;
      const detected = classifyError(submittedText, target);

      const conceptId = currentConcept.id;
      const currentState = learnerStates[conceptId] || createInitialLearnerState(conceptId);

      if (detected === null && normalizeCheck(submittedText, target)) {
        // SUCCESS
        const nextState = updateSrs(currentState, true, null);
        setLearnerStates(prev => ({ ...prev, [conceptId]: nextState }));
        setLastError(null);
        setAvatarExpression('celebrating');
        setAvatarSpeech('Excellent thinking! Perfect structural transfer. 🎯');
        setDailyCompletedCount(prev => prev + 1);

        // Speak target
        speak(target);
        return { isCorrect: true, error: null };
      } else {
        // FAILURE
        const actualError = detected || 'aspect_confused'; // fallback if arbitrary mismatch
        const nextState = updateSrs(currentState, false, actualError);
        setLearnerStates(prev => ({ ...prev, [conceptId]: nextState }));
        setLastError(actualError);
        setAvatarExpression('thinking');

        const errorDescriptions: Record<ErrorType, string> = {
          copula_omitted: 'Notice the missing linking verb (am/is/are)! English cannot leave the copula implicit.',
          article_missing: 'Singular countable nouns in English require an indefinite article (a/an).',
          article_spurious: 'English uses the zero article with generic and abstract nouns. Drop "the"!',
          aspect_confused: 'Pay attention to tense aspect! Stative verbs don’t take continuous -ing.',
          pronoun_dropped: 'English is not a pro-drop language; make sure to explicitly include the subject pronoun.',
          word_order_vso: 'English standard order is Subject + Verb + Object (SVO), not verb-first.',
          plural_irregular: 'This noun has an irregular plural form—do not add regular "-s".',
          preposition_transfer: 'Careful with direct Arabic preposition translation; English uses fixed verb collocations.'
        };

        const hint = errorDescriptions[actualError] || currentConcept.contrast_note;
        setAvatarSpeech(hint);
        return { isCorrect: false, error: actualError };
      }
    },
    [currentConcept, currentExample, learnerStates, speak]
  );

  // Move to next exercise / concept
  const nextExercise = useCallback(() => {
    setLastError(null);
    setAvatarExpression('happy');
    setAvatarSpeech('Let’s build the next structural habit! 🧠');

    const totalExamples = currentConcept.examples?.length || 1;
    if (exampleIndex + 1 < totalExamples) {
      setExampleIndex(prev => prev + 1);
    } else {
      // Pick next concept via selectNext
      setExampleIndex(0);
      const nextC = selectNext(SEED_CONCEPTS, learnerStates, { activeTrack });
      if (nextC) {
        setActiveConceptId(nextC.id);
      }
    }
  }, [currentConcept, exampleIndex, learnerStates, activeTrack]);

  const resetTutor = useCallback(() => {
    setAvatarExpression('happy');
    setAvatarSpeech('Ready to practice thinking in English? (جاهز نفكر بالإنجليزي؟)');
    setIsAvatarSpeaking(false);
    setLastError(null);
  }, []);

  const isDailyLimitReached = dailyCompletedCount >= DAILY_EXERCISE_LIMIT;

  return {
    concept: currentConcept,
    example: currentExample,
    exampleIndex,
    learnerStates,
    avatarExpression,
    avatarSpeech,
    isAvatarSpeaking,
    lastError,
    dailyCompletedCount,
    isDailyLimitReached,
    submitAnswer,
    nextExercise,
    speak,
    resetTutor,
    setAvatarSpeech,
    setAvatarExpression
  };
}

function normalizeCheck(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  return norm(a) === norm(b);
}
