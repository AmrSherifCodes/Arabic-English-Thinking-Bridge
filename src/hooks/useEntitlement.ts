import { useState, useEffect, useCallback } from 'react';
import {
  ENTITLEMENT_STORAGE_KEY,
  ENTITLEMENT_UPDATED_EVENT,
  EntitlementState,
  RedeemVoucherResult,
} from '../types/entitlement';
import {
  getRemainingEntitlementDays,
  hasAcademyTeacherAccess,
  hasProAccess,
  loadCachedEntitlement,
  redeemVoucherCode,
  refreshEntitlementFromServer,
} from '../services/entitlementService';

export function useEntitlement() {
  const [entitlement, setEntitlement] = useState<EntitlementState>(() => loadCachedEntitlement());
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const handleCustomUpdate = (event: Event) => {
      const detail = (event as CustomEvent<EntitlementState>).detail;
      if (detail && detail.tier) {
        setEntitlement(detail);
      } else {
        setEntitlement(loadCachedEntitlement());
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ENTITLEMENT_STORAGE_KEY) {
        setEntitlement(loadCachedEntitlement());
      }
    };

    window.addEventListener(ENTITLEMENT_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(ENTITLEMENT_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Silent background revalidation only for already-activated non-free devices
  useEffect(() => {
    if (entitlement.tier === 'free') return;
    let active = true;
    refreshEntitlementFromServer().then((updated) => {
      if (active) setEntitlement(updated);
    });
    return () => {
      active = false;
    };
  }, []);

  const redeemCode = useCallback(
    async (code: string, displayName?: string): Promise<RedeemVoucherResult> => {
      setIsRedeeming(true);
      try {
        const result = await redeemVoucherCode(code, { displayName });
        if (result.ok && result.entitlement) {
          setEntitlement(result.entitlement);
        }
        return result;
      } finally {
        setIsRedeeming(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    const updated = await refreshEntitlementFromServer();
    setEntitlement(updated);
    return updated;
  }, []);

  return {
    entitlement,
    tier: entitlement.tier,
    cohortCode: entitlement.cohortCode,
    expiresAt: entitlement.expiresAt,
    remainingDays: getRemainingEntitlementDays(entitlement),
    // V10 is 100% Free Forever — zero paywalls, zero Pro lockups
    isPro: true,
    isAcademyStudent: entitlement.tier === 'academy_student',
    isAcademyTeacher: hasAcademyTeacherAccess(entitlement),
    isRedeeming,
    redeemCode,
    refresh,
  };
}
