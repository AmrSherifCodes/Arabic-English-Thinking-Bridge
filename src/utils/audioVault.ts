/**
 * IndexedDB Voice Note Vault
 * Prevents Base64 audio payloads from exhausting the 5MB localStorage quota.
 * Stores raw audio data in IndexedDB ('thinking_english_audio_idb') and returns
 * a lightweight reference key ('idb:vn-...') for MentorQuestion records.
 */

const IDB_NAME = 'thinking_english_audio_idb';
const IDB_STORE = 'voice_notes';
const IDB_VERSION = 1;

const memoryAudioCache: Record<string, string> = {};

function openAudioDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise(resolve => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveVoiceNoteToVault(base64Audio: string): Promise<string> {
  if (!base64Audio) return '';
  const refKey = `idb:vn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  memoryAudioCache[refKey] = base64Audio;

  const db = await openAudioDatabase();
  if (!db) return refKey;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(base64Audio, refKey);
      tx.oncomplete = () => {
        db.close();
        resolve(refKey);
      };
      tx.onerror = () => {
        db.close();
        resolve(refKey);
      };
    } catch {
      resolve(refKey);
    }
  });
}

export async function resolveVoiceNoteFromVault(refOrBase64?: string): Promise<string | null> {
  if (!refOrBase64) return null;
  if (!refOrBase64.startsWith('idb:')) {
    return refOrBase64;
  }
  if (memoryAudioCache[refOrBase64]) {
    return memoryAudioCache[refOrBase64];
  }

  const db = await openAudioDatabase();
  if (!db) return null;

  return new Promise(resolve => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(refOrBase64);
      getReq.onsuccess = () => {
        const result = typeof getReq.result === 'string' ? getReq.result : null;
        if (result) {
          memoryAudioCache[refOrBase64] = result;
        }
        db.close();
        resolve(result);
      };
      getReq.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}
