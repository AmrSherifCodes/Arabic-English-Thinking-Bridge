/**
 * KeyVault.ts
 * Implements local-only, AES-GCM encryption for BYOK Gemini API Keys.
 */

export class KeyVault {
  // Exported for testing so we can verify 'extractable: false'
  public static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, // MUST BE FALSE FOR SECURITY
      ['encrypt', 'decrypt']
    );
  }

  public static async encryptAndStore(apiKey: string, passphrase: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passphrase, salt);

    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(apiKey)
    );

    const bundle = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext))
    };

    localStorage.setItem('tb_secure_vault', JSON.stringify(bundle));
  }

  public static async decrypt(passphrase: string): Promise<string | null> {
    const data = localStorage.getItem('tb_secure_vault');
    if (!data) return null;

    try {
      const bundle = JSON.parse(data);
      const salt = new Uint8Array(bundle.salt);
      const iv = new Uint8Array(bundle.iv);
      const ciphertext = new Uint8Array(bundle.ciphertext);

      const key = await this.deriveKey(passphrase, salt);
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch (e) {
      console.error('Decryption failed. Incorrect passphrase or corrupted vault.');
      return null; // Do not throw
    }
  }

  public static isVaultConfigured(): boolean {
    return localStorage.getItem('tb_secure_vault') !== null;
  }
}
