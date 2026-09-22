const ENCRYPTION_PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';

function getCryptoModule(): any {
  if (typeof window !== 'undefined') {
    return null;
  }
  try {
    // Safely load node:crypto in Node/Serverless environment
    return typeof require !== 'undefined' ? require('crypto') : (globalThis as any).crypto;
  } catch {
    return null;
  }
}

function getBufferClass(): any {
  if (typeof window !== 'undefined') {
    return null;
  }
  try {
    return typeof globalThis !== 'undefined' && (globalThis as any).Buffer ? (globalThis as any).Buffer : null;
  } catch {
    return null;
  }
}

function getAadContext(BufferClass: any): any {
  return BufferClass ? BufferClass.from('atena-secrets-v1', 'utf8') : null;
}

/**
 * Returns a 32-byte cryptographic key for AES-256-GCM.
 * Prioritizes INTEGRATION_ENCRYPTION_KEY / ENCRYPTION_KEY.
 * Falls back deterministically to SHA-256 hash of SUPABASE_SERVICE_ROLE_KEY.
 */
export function getEncryptionKey(): any {
  const crypto = getCryptoModule();
  const BufferClass = getBufferClass();
  if (!crypto || !BufferClass) {
    return null;
  }

  const envKey =
    (typeof process !== 'undefined' && (
      process.env.INTEGRATION_ENCRYPTION_KEY ||
      process.env.ENCRYPTION_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY
    )) ||
    'atena_school_default_master_encryption_secret_key_v1';

  const trimmed = envKey.trim();

  // If 64-char hex string (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return BufferClass.from(trimmed, 'hex');
  }

  // If 44-char base64 string (32 bytes)
  if (/^[A-Za-z0-9+/]{43}=$/.test(trimmed) || /^[A-Za-z0-9+/]{44}$/.test(trimmed)) {
    try {
      const buf = BufferClass.from(trimmed, 'base64');
      if (buf.length === 32) return buf;
    } catch {
      // Fall through to hash
    }
  }

  // Derive 32-byte key via SHA-256
  return crypto.createHash('sha256').update(trimmed, 'utf8').digest();
}

/**
 * Check if a string is encrypted with the enc:v1 format
 */
export function isEncryptedSecret(val?: string | null): boolean {
  return typeof val === 'string' && val.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptSecret(plainText?: string | null): string {
  if (plainText === undefined || plainText === null) {
    return '';
  }

  const str = String(plainText);
  if (!str.trim()) {
    return '';
  }

  // If already encrypted, return as is
  if (isEncryptedSecret(str)) {
    return str;
  }

  const crypto = getCryptoModule();
  const BufferClass = getBufferClass();
  const key = getEncryptionKey();
  if (!crypto || !BufferClass || !key) {
    return str;
  }

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(getAadContext(BufferClass));

  const encrypted = BufferClass.concat([
    cipher.update(str, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // 16 bytes auth tag

  return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string (enc:v1:...).
 * If the string is not encrypted (legacy plaintext), it is returned untouched.
 */
export function decryptSecret(cipherText?: string | null): string {
  if (!cipherText || typeof cipherText !== 'string') {
    return '';
  }

  const str = cipherText.trim();
  if (!isEncryptedSecret(str)) {
    // Legacy plaintext backward compatibility
    return str;
  }

  const crypto = getCryptoModule();
  const BufferClass = getBufferClass();
  const key = getEncryptionKey();
  if (!crypto || !BufferClass || !key) {
    return str;
  }

  try {
    const parts = str.slice(ENCRYPTION_PREFIX.length).split(':');
    if (parts.length !== 3) {
      console.warn('[Encryption] Malformed encrypted secret format, expected 3 parts.');
      return '';
    }

    const [ivHex, authTagHex, dataHex] = parts;
    const iv = BufferClass.from(ivHex, 'hex');
    const authTag = BufferClass.from(authTagHex, 'hex');
    const encryptedData = BufferClass.from(dataHex, 'hex');

    if (iv.length !== 12 || authTag.length !== 16) {
      console.warn('[Encryption] Invalid IV or AuthTag length in encrypted secret.');
      return '';
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(getAadContext(BufferClass));
    decipher.setAuthTag(authTag);

    const decrypted = BufferClass.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err: any) {
    console.warn('[Encryption] Failed to decrypt secret with AES-256-GCM:', err.message);
    return '';
  }
}

