import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export const MIN_PASSWORD_LENGTH = 8;

/** Returns "scrypt$<salt hex>$<hash hex>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/**
 * Checks a guest's password. A NULL hash means the account still uses the
 * shared default password from GUEST_DEFAULT_PASSWORD.
 */
export async function verifyGuestPassword(password: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash) {
    const defaultPassword = process.env.GUEST_DEFAULT_PASSWORD;
    if (!defaultPassword) {
      console.error('[guest auth] GUEST_DEFAULT_PASSWORD is not set — default-password logins are disabled');
      return false;
    }
    return safeEqual(Buffer.from(password), Buffer.from(defaultPassword));
  }

  const [scheme, saltHex, hashHex] = storedHash.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const hash = await scryptAsync(password, Buffer.from(saltHex, 'hex'), KEY_LENGTH);
  return safeEqual(hash, Buffer.from(hashHex, 'hex'));
}
