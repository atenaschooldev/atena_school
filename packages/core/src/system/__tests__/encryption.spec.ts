import { describe, it, expect } from 'vitest';
import {
  encryptSecret,
  decryptSecret,
  isEncryptedSecret,
  getEncryptionKey,
} from '../encryption';

describe('Encryption Utilities (AES-256-GCM)', () => {
  it('should derive a 32-byte key consistently', () => {
    const key = getEncryptionKey();
    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it('should encrypt and decrypt plaintext correctly', () => {
    const original = 'sk_live_51M0abcdef1234567890TEST_KEY';
    const encrypted = encryptSecret(original);

    expect(encrypted).not.toBe(original);
    expect(isEncryptedSecret(encrypted)).toBe(true);
    expect(encrypted.startsWith('enc:v1:')).toBe(true);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should return legacy plaintext untouched for backward compatibility', () => {
    const legacyKey = 're_1234567890abcdef_plain';
    expect(isEncryptedSecret(legacyKey)).toBe(false);
    expect(decryptSecret(legacyKey)).toBe(legacyKey);
  });

  it('should avoid double-encrypting already encrypted secrets', () => {
    const original = 'bot_token_secret_12345';
    const encryptedOnce = encryptSecret(original);
    const encryptedTwice = encryptSecret(encryptedOnce);

    expect(encryptedTwice).toBe(encryptedOnce);
    expect(decryptSecret(encryptedTwice)).toBe(original);
  });

  it('should safely handle empty/null inputs', () => {
    expect(encryptSecret('')).toBe('');
    expect(encryptSecret(null as any)).toBe('');
    expect(decryptSecret('')).toBe('');
    expect(decryptSecret(null as any)).toBe('');
  });

  it('should fail gracefully and return empty string if ciphertext is tampered with', () => {
    const original = 'sensitive_stripe_webhook_whsec_123';
    const encrypted = encryptSecret(original);

    // Tamper with payload
    const parts = encrypted.split(':');
    parts[parts.length - 1] = 'ffff' + parts[parts.length - 1].slice(4);
    const tampered = parts.join(':');

    const decrypted = decryptSecret(tampered);
    expect(decrypted).toBe('');
  });
});
