import { useCallback, useEffect, useState } from 'react';
import { getUserGeminiKey, setUserGeminiKey } from '../services/geminiLexicon';
import { API_QUOTA_LIMIT_EVENT, consumeDailyApiQuota } from '../utils/apiQuota';

export { API_QUOTA_LIMIT_EVENT };

export function checkDailyQuota(): boolean {
  return consumeDailyApiQuota();
}

export function useApiKeyGate() {
  const [apiKey, setApiKeyState] = useState(getUserGeminiKey);

  useEffect(() => {
    const refreshKey = () => setApiKeyState(getUserGeminiKey());
    window.addEventListener('tb:gemini-key-changed', refreshKey);
    window.addEventListener('storage', refreshKey);
    return () => {
      window.removeEventListener('tb:gemini-key-changed', refreshKey);
      window.removeEventListener('storage', refreshKey);
    };
  }, []);

  const setApiKey = useCallback((key: string) => {
    if (!setUserGeminiKey(key)) return false;
    setApiKeyState(key.trim());
    return true;
  }, []);

  return {
    hasKey: Boolean(apiKey),
    apiKey,
    setApiKey,
    checkDailyQuota,
  };
}
