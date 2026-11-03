import { ProgressionState } from '../progression/types';
import { compactProgressionState, decompactUserState, CompactUserState } from '../progression/compaction';
import { supabase } from './supabase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

/**
 * Merges local and remote progression states on sign-in:
 * - XP: Additive / max
 * - Completed lessons: Union
 * - Lesson crowns: Max per lesson
 * - Latest timestamp wins for rest
 */
export function mergeProgressionStates(
  local: ProgressionState,
  remoteCompact: CompactUserState,
  baseState: ProgressionState
): ProgressionState {
  const remote = decompactUserState(remoteCompact, baseState);

  const mergedCompletedLessons = Array.from(
    new Set([...(local.completedLessonIds || []), ...(remote.completedLessonIds || [])])
  );

  const mergedCrowns: Record<string, number> = { ...local.lessonCrowns };
  Object.entries(remote.lessonCrowns || {}).forEach(([id, cr]) => {
    mergedCrowns[id] = Math.max(mergedCrowns[id] || 0, cr);
  });

  const mergedXp = Math.max(local.xp, remote.xp) + Math.min(local.xp, remote.xp) * 0.1; // Additive bonus
  const latestWins = (local.lastActiveDate || '') > (remote.lastActiveDate || '') ? local : remote;

  return {
    ...latestWins,
    xp: Math.round(mergedXp),
    completedLessonIds: mergedCompletedLessons,
    lessonCrowns: mergedCrowns,
  };
}

class SyncEngine {
  private status: SyncStatus = 'idle';
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private debounceTimer: number | null = null;
  private retryAttempt = 0;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyStatus('idle');
        this.processOfflineQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatus('offline');
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.triggerBackgroundSync();
        }
      });
    }
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    listener(this.status);
    return () => this.syncListeners.delete(listener);
  }

  private notifyStatus(status: SyncStatus) {
    this.status = status;
    this.syncListeners.forEach((l) => l(status));
  }

  /**
   * Syncs state with Supabase.
   * CRITICAL LOCAL-FIRST RULE: Guests make ZERO database / fetch calls.
   */
  public async syncUserState(
    state: ProgressionState,
    isGuest: boolean = true
  ): Promise<boolean> {
    // 1. HARD RULE: Guests make ZERO database / network calls.
    if (isGuest || !supabase) {
      this.notifyStatus('idle');
      return true;
    }

    if (!this.isOnline) {
      this.saveToOfflineQueue(state);
      this.notifyStatus('offline');
      return false;
    }

    try {
      this.notifyStatus('syncing');

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        this.notifyStatus('idle');
        return true; // Unauthenticated guest -> no server call
      }

      // Compact state & verify 64KB limit
      const compact = compactProgressionState(state);

      const { error } = await supabase.from('user_state').upsert({
        user_id: userId,
        state: compact,
        version: compact.v,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      this.retryAttempt = 0;
      this.notifyStatus('synced');
      return true;
    } catch (err) {
      console.warn('[SyncEngine] Sync error:', err);
      this.saveToOfflineQueue(state);
      this.notifyStatus('error');
      this.scheduleExponentialBackoff(state);
      return false;
    }
  }

  /**
   * Pulls remote state on explicit sign-in and merges with local progress.
   */
  public async pullAndMergeOnSignIn(
    localState: ProgressionState,
    baseState: ProgressionState
  ): Promise<ProgressionState> {
    if (!supabase) return localState;

    try {
      this.notifyStatus('syncing');
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) return localState;

      const { data, error } = await supabase
        .from('user_state')
        .select('state')
        .eq('user_id', userId)
        .single();

      if (error || !data?.state) {
        // First time sign-in -> Push local state
        await this.syncUserState(localState, false);
        return localState;
      }

      const merged = mergeProgressionStates(localState, data.state as CompactUserState, baseState);
      await this.syncUserState(merged, false);
      return merged;
    } catch {
      return localState;
    }
  }

  /**
   * Debounced sync (30s)
   */
  public scheduleDebouncedSync(state: ProgressionState, isGuest: boolean = true) {
    if (isGuest) return; // Zero calls for guests
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);

    this.debounceTimer = window.setTimeout(() => {
      void this.syncUserState(state, false);
    }, 30000); // 30s debounce
  }

  private scheduleExponentialBackoff(state: ProgressionState) {
    this.retryAttempt += 1;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.retryAttempt));
    window.setTimeout(() => {
      if (this.isOnline) {
        void this.syncUserState(state, false);
      }
    }, delay);
  }

  private saveToOfflineQueue(state: ProgressionState) {
    try {
      localStorage.setItem('tb.syncQueue', JSON.stringify(state));
    } catch {}
  }

  private processOfflineQueue() {
    try {
      const raw = localStorage.getItem('tb.syncQueue');
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.removeItem('tb.syncQueue');
        void this.syncUserState(parsed, false);
      }
    } catch {}
  }

  public triggerBackgroundSync() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('tb.progressionState');
      if (raw) {
        const parsed = JSON.parse(raw);
        void this.syncUserState(parsed, false);
      }
    } catch {}
  }
}

export const syncEngine = new SyncEngine();
