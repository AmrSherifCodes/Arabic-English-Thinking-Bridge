import { useCallback } from 'react';

export function useSubscriptionUnlock(unlock: () => void, _active?: boolean) {
  const verify = useCallback(async () => {
    unlock();
  }, [unlock]);

  return { verify, verifying: false, error: null as string | null, needsSignIn: false };
}
