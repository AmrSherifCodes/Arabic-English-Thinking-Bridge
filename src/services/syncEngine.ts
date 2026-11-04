import type { ProgressionState } from '../progression/types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export class SyncEngine {
  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    listener('idle');
    return () => undefined;
  }

  public async syncUserState(_state: ProgressionState, _isGuest = true): Promise<boolean> {
    return true;
  }

  public async pullAndMergeOnSignIn(localState: ProgressionState): Promise<ProgressionState> {
    return localState;
  }

  public scheduleDebouncedSync(_state: ProgressionState, _isGuest = true): void {}

  public triggerBackgroundSync(_state: ProgressionState, _isGuest = true): void {}
}

export const syncEngine = new SyncEngine();

export function scheduleDebouncedSync(_state: ProgressionState, _isGuest = false): void {}
