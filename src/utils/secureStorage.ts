const ENCRYPTION_KEY_NAME = 'tb_secure_key';

async function getOrCreateKey(): Promise<CryptoKey> {
  const existingKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (existingKey) {
    const rawKey = Uint8Array.from(atob(existingKey), c => c.charCodeAt(0));
    return await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  localStorage.setItem(ENCRYPTION_KEY_NAME, exportedAsBase64);
  return key;
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined' || !window.crypto) {
    localStorage.setItem(key, value);
    return;
  }
  try {
    const cryptoKey = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    localStorage.setItem(key, `${ivBase64}:${encryptedBase64}`);
  } catch (e) {
    localStorage.setItem(key, value); // fallback
  }
}

export async function secureGet(key: string): Promise<string | null> {
  const data = localStorage.getItem(key);
  if (!data || typeof window === 'undefined' || !window.crypto || !data.includes(':')) {
    return data;
  }
  try {
    const [ivBase64, encryptedBase64] = data.split(':');
    const cryptoKey = await getOrCreateKey();
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return data; // Return raw data as fallback in case it was stored unencrypted
  }
}
