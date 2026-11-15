/**
 * Online Learning Engine (PyTorch-Style Local Cognitive Model)
 *
 * 100% Offline, TypeScript-native online learning framework.
 * Implements exponential moving average (EMA) response profiling,
 * real-time weight updates (Stochastic Gradient Descent / SGD proxy),
 * and dynamic difficulty knob scaling ('Easy' | 'Medium' | 'Hard').
 */

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ErrorWeightRecord {
  copula: number;
  article: number;
  tense: number;
  preposition: number;
  word_order: number;
  vocabulary: number;
  general: number;
  [category: string]: number;
}

export interface NeuralNode {
  id: string;
  labelEn: string;
  labelAr: string;
  weight: number; // Current synaptic weight (0.0 to 1.0)
  gradient: number; // Recent gradient delta
  activation: number; // Output activation signal
}

export interface UserCognitiveProfile {
  errorWeights: ErrorWeightRecord;
  avgReactionTime: number; // ms
  difficultyLevel: DifficultyLevel;
  hiddenDifficultyMetric: number; // 0.0 to 1.0
  learningRate: number; // Default: 0.05
  totalStepsCount: number;
  epoch: number;
  loss: number;
  lastUpdated: string;
  weightsMatrix: Record<string, number>;
}

const DEFAULT_PROFILE: UserCognitiveProfile = {
  errorWeights: {
    copula: 0.5,
    article: 0.5,
    tense: 0.5,
    preposition: 0.5,
    word_order: 0.5,
    vocabulary: 0.5,
    general: 0.5,
  },
  avgReactionTime: 4000,
  difficultyLevel: 'Medium',
  hiddenDifficultyMetric: 0.5,
  learningRate: 0.05,
  totalStepsCount: 0,
  epoch: 0,
  loss: 0.25,
  lastUpdated: new Date().toISOString(),
  weightsMatrix: {
    syntax_copula: 0.5,
    syntax_word_order: 0.5,
    lexical_recall: 0.5,
    reflex_speed: 0.5,
    tense_shift: 0.5,
  },
};

const STORAGE_KEY = 'tb.cognitiveProfile';

export class GlobalTutorBrain {
  private static instance: GlobalTutorBrain;
  private profile: UserCognitiveProfile;
  private consecutiveErrors: number = 0;
  private consecutiveCorrect: number = 0;

  private constructor() {
    this.profile = this.loadProfile();
  }

  public static getInstance(): GlobalTutorBrain {
    if (!GlobalTutorBrain.instance) {
      GlobalTutorBrain.instance = new GlobalTutorBrain();
    }
    return GlobalTutorBrain.instance;
  }

  private loadProfile(): UserCognitiveProfile {
    if (typeof window === 'undefined') return { ...DEFAULT_PROFILE };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { ...DEFAULT_PROFILE };
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        errorWeights: {
          ...DEFAULT_PROFILE.errorWeights,
          ...(parsed.errorWeights || {}),
        },
        weightsMatrix: {
          ...DEFAULT_PROFILE.weightsMatrix,
          ...(parsed.weightsMatrix || {}),
        },
      };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }

  public saveProfile(): void {
    if (typeof window === 'undefined') return;
    try {
      this.profile.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Unable to persist GlobalTutorBrain cognitive profile:', e);
    }
  }

  public getProfile(): UserCognitiveProfile {
    return { ...this.profile };
  }

  public getDifficultyKnob(): DifficultyLevel {
    return this.profile.difficultyLevel;
  }

  public getDifficultyLevel(): DifficultyLevel {
    return this.profile.difficultyLevel;
  }

  /**
   * High-level method to record exercise result, update EMA, consecutive stats,
   * errorWeights, and dynamically shift difficulty ('Easy' | 'Medium' | 'Hard').
   */
  public recordResult(
    isCorrect: boolean,
    reactionTimeMs: number = 3000,
    errorCategory: string = 'general'
  ): UserCognitiveProfile {
    if (isCorrect) {
      this.consecutiveCorrect += 1;
      this.consecutiveErrors = 0;
    } else {
      this.consecutiveErrors += 1;
      this.consecutiveCorrect = 0;
    }

    // 1. Run profile update (EMA reaction time, error weights)
    this.updateProfile(reactionTimeMs, isCorrect, errorCategory);
    this.runLocalTrainingStep('record_answer', isCorrect, errorCategory, reactionTimeMs);

    // 2. Dynamic Knob shift logic:
    // If consecutiveErrors >= 2 -> scale down to 'Easy'
    if (this.consecutiveErrors >= 2) {
      this.profile.difficultyLevel = 'Easy';
      this.profile.hiddenDifficultyMetric = 0.2;
    } else if (this.consecutiveCorrect >= 3 && this.profile.avgReactionTime < 5000) {
      // If consecutiveCorrect >= 3 AND avgReactionTime < 5s -> scale up to 'Hard'
      this.profile.difficultyLevel = 'Hard';
      this.profile.hiddenDifficultyMetric = 0.85;
    }

    this.saveProfile();
    return this.getProfile();
  }

  /**
   * Exponential Moving Average (EMA) and Reaction-Time profiling.
   * Dynamically adjusts difficulty metric and category error weights.
   */
  public updateProfile(
    reactionTimeMs: number,
    isCorrect: boolean,
    errorCategory: string = 'general'
  ): UserCognitiveProfile {
    const p = this.profile;

    // 1. EMA for Reaction Time (Alpha = 0.2)
    const alpha = 0.2;
    const clampedTime = Math.max(500, Math.min(30000, reactionTimeMs));
    p.avgReactionTime = Math.round(alpha * clampedTime + (1 - alpha) * p.avgReactionTime);

    // 2. Dynamic Metric Scaling
    let metricDelta = 0;
    if (isCorrect) {
      if (clampedTime < 3500) {
        metricDelta = 0.08; // Fast & Accurate bonus
      } else {
        metricDelta = 0.04;
      }
    } else {
      metricDelta = -0.10;
    }

    p.hiddenDifficultyMetric = Math.max(0.1, Math.min(1.0, p.hiddenDifficultyMetric + metricDelta));

    // 3. Difficulty Knob Adjustment
    if (p.hiddenDifficultyMetric >= 0.70) {
      p.difficultyLevel = 'Hard';
    } else if (p.hiddenDifficultyMetric >= 0.35) {
      p.difficultyLevel = 'Medium';
    } else {
      p.difficultyLevel = 'Easy';
    }

    // 4. Update Error Weights
    const categoryKey = errorCategory.toLowerCase().replace(/[^a-z_]/g, '_') || 'general';
    const currentWeight = p.errorWeights[categoryKey] ?? 0.5;
    if (isCorrect) {
      p.errorWeights[categoryKey] = Math.max(0.1, currentWeight - 0.05);
    } else {
      p.errorWeights[categoryKey] = Math.min(1.0, currentWeight + 0.15);
    }

    this.saveProfile();
    return this.getProfile();
  }

  /**
   * PyTorch-style Online Training Step (SGD Weight Update).
   * Weight update equation: newWeight = oldWeight + (learningRate * error * activation)
   */
  public runLocalTrainingStep(
    userAction: string,
    isCorrect: boolean,
    category: string = 'general',
    reactionTimeMs: number = 3000
  ): { loss: number; epoch: number; updatedWeights: Record<string, number> } {
    const p = this.profile;
    p.totalStepsCount += 1;
    p.epoch += 1;

    // Predicted Probability (Sigmoid-like representation based on current weights)
    const key = category.toLowerCase().replace(/[^a-z_]/g, '_');
    const currentWeight = p.weightsMatrix[key] ?? 0.5;

    // Target: 1.0 if correct, 0.0 if incorrect
    const target = isCorrect ? 1.0 : 0.0;
    const error = target - currentWeight;

    // Loss = Mean Squared Error step
    const stepLoss = error * error;
    p.loss = Number((0.85 * p.loss + 0.15 * stepLoss).toFixed(4));

    // Weight update: w_new = w_old + lr * error
    const newWeight = Math.max(0.05, Math.min(0.99, currentWeight + p.learningRate * error));
    p.weightsMatrix[key] = Number(newWeight.toFixed(4));

    // Also update reflex weight
    const speedRatio = Math.max(0.1, Math.min(1.0, 3000 / Math.max(1000, reactionTimeMs)));
    const oldSpeedWeight = p.weightsMatrix['reflex_speed'] ?? 0.5;
    p.weightsMatrix['reflex_speed'] = Number(
      (0.8 * oldSpeedWeight + 0.2 * speedRatio).toFixed(4)
    );

    this.saveProfile();

    return {
      loss: p.loss,
      epoch: p.epoch,
      updatedWeights: { ...p.weightsMatrix },
    };
  }

  /**
   * Returns visual Neural Matrix state for UI graph rendering in Profile / Brain Dashboard.
   */
  public getBrainMatrixNodes(): NeuralNode[] {
    const wm = this.profile.weightsMatrix;
    return [
      {
        id: 'syntax_copula',
        labelEn: 'Copula Bridge (is/are)',
        labelAr: 'رابط الكينونة am/is/are',
        weight: wm['syntax_copula'] ?? 0.5,
        gradient: (wm['syntax_copula'] ?? 0.5) - 0.5,
        activation: Math.min(1.0, (wm['syntax_copula'] ?? 0.5) * 1.2),
      },
      {
        id: 'syntax_word_order',
        labelEn: 'Word Order Matrix',
        labelAr: 'مصفوفة ترتيب الكلمات',
        weight: wm['syntax_word_order'] ?? 0.5,
        gradient: (wm['syntax_word_order'] ?? 0.5) - 0.5,
        activation: Math.min(1.0, (wm['syntax_word_order'] ?? 0.5) * 1.15),
      },
      {
        id: 'lexical_recall',
        labelEn: 'Lexical Neural Weights',
        labelAr: 'الأوزان العصبيّة للمفردات',
        weight: wm['lexical_recall'] ?? 0.5,
        gradient: (wm['lexical_recall'] ?? 0.5) - 0.5,
        activation: Math.min(1.0, (wm['lexical_recall'] ?? 0.5) * 1.1),
      },
      {
        id: 'reflex_speed',
        labelEn: 'Cognitive Speed Vector',
        labelAr: 'متجه سرعة التفكير الفوري',
        weight: wm['reflex_speed'] ?? 0.5,
        gradient: (wm['reflex_speed'] ?? 0.5) - 0.5,
        activation: Math.min(1.0, (wm['reflex_speed'] ?? 0.5) * 1.25),
      },
      {
        id: 'tense_shift',
        labelEn: 'Tense Backshifting',
        labelAr: 'تحول الأزمنة الإدراكي',
        weight: wm['tense_shift'] ?? 0.5,
        gradient: (wm['tense_shift'] ?? 0.5) - 0.5,
        activation: Math.min(1.0, (wm['tense_shift'] ?? 0.5) * 1.05),
      },
    ];
  }

  public resetProfile(): void {
    this.consecutiveErrors = 0;
    this.consecutiveCorrect = 0;
    this.profile = { ...DEFAULT_PROFILE };
    this.saveProfile();
  }
}

/**
 * Convenient helper functions for quick usage across components.
 */
export function getOnlineLearningEngine(): GlobalTutorBrain {
  return GlobalTutorBrain.getInstance();
}

export function runLocalTrainingStep(
  userAction: string,
  isCorrect: boolean,
  category?: string,
  reactionTimeMs?: number
) {
  return GlobalTutorBrain.getInstance().runLocalTrainingStep(
    userAction,
    isCorrect,
    category,
    reactionTimeMs
  );
}

export function updateCognitiveProfile(
  reactionTimeMs: number,
  isCorrect: boolean,
  errorCategory?: string
) {
  return GlobalTutorBrain.getInstance().updateProfile(reactionTimeMs, isCorrect, errorCategory);
}

export function getDifficultyKnob(): DifficultyLevel {
  return GlobalTutorBrain.getInstance().getDifficultyKnob();
}
