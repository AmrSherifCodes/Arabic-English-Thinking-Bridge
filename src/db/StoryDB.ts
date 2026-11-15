import Dexie, { Table } from 'dexie';

export interface StoryProgress {
  id?: number;
  chapterId: string;
  sceneId: string;
  choicesMade: Record<string, string>;
  lastUpdated: number;
}

export class StoryDatabase extends Dexie {
  progress!: Table<StoryProgress, number>;

  constructor() {
    super('ThinkingBridgeStoryDB');
    this.version(1).stores({
      progress: '++id, chapterId, lastUpdated'
    });
  }
}

export const storyDb = new StoryDatabase();
