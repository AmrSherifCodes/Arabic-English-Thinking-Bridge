import { ProgressionState } from '../progression/types';
import { compactProgressionState, decompactUserState, MAX_STATE_SIZE_BYTES } from '../progression/compaction';
import { supabase } from './supabase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

class SyncEngine {
  private status: SyncStatus = 'idle';
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private pendingSyncTimer: number | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyStatus('idle');
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatus('offline');
      });

      // Sync when app goes to background (local-first requirement)
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
   * CRITICAL LOCAL-FIRST RULE: Guests make ZERO database calls.
   */
  public async syncUserState(
    state: ProgressionState,
    isGuest: boolean = true
  ): Promise<boolean> {
    // 1. HARD RULE: Guests make ZERO database calls.
    if (isGuest || !supabase) {
      this.notifyStatus('idle');
      return true;
    }

    if (!this.isOnline) {
      this.notifyStatus('offline');
      return false;
    }

    try {
      this.notifyStatus('syncing');

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        this.notifyStatus('idle');
        return true; // Not authenticated -> no server call
      }

      // 2. Compact state & verify 64KB limit before network call
      const compact = compactProgressionState(state);

      // 3. Upsert into public.user_state
      const { error } = await supabase.from('user_state').upsert({
        user_id: userId,
        state: compact,
        version: compact.v,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      this.notifyStatus('synced');
      return true;
    } catch (err) {
      console.warn('[SyncEngine] Sync error:', err);
      this.notifyStatus('error');
      return false;
    }
  }

  /**
   * Debounced background sync trigger
   */
  public triggerBackgroundSync() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('tb.progressionState');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Fire sync asynchronously
        void this.syncUserState(parsed, false);
      }
    } catch {}
  }
}

export const syncEngine = new SyncEngine();
