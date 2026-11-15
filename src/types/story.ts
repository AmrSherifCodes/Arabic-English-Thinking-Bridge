import { AgeGroup } from '../store/useAgeSliderStore';

export type LanguageCode = 'ar' | 'en' | 'de' | 'fr' | 'es' | 'ja' | 'zh';

export interface StoryChoice {
  id: string;
  text: Record<LanguageCode, string>;
  nextSceneId: string;
  nextSceneIdByAge?: Partial<Record<AgeGroup, string>>;
  isCorrect?: boolean; // For Thinking Bridge mechanic
  feedback?: Record<LanguageCode, string>;
}

export interface StoryScene {
  id: string;
  imageUrl: string;
  characterName: Record<LanguageCode, string>;
  text: Record<LanguageCode, string>;
  choices: StoryChoice[];
  requiredAgeGroups?: AgeGroup[]; // If undefined, applies to all
  isBossBattle?: boolean;
}

export interface StoryChapter {
  id: string;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  scenes: Record<string, StoryScene>;
  startSceneId: string;
}
