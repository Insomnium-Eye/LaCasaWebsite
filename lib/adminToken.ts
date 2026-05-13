import { createHmac } from 'crypto';

const getSecret = () => process.env.ADMIN_TOKEN_SECRET ?? 'dev-secret-change-me';

export function generateAdminToken(bookingId: string): string {
  return createHmac('sha256', getSecret()).update(bookingId).digest('hex').slice(0, 32);
}

export function verifyAdminToken(bookingId: string, token: string): boolean {
  if (!token || token.length !== 32) return false;
  const expected = generateAdminToken(bookingId);
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
