// TTLock Open API integration for TockLock (Front Gate, lockId: 32117998)
// Docs: TTLock Open Platform — same backend as webtocklockapp.com

import crypto from 'crypto';

const BASE_URL  = 'https://euopen.ttlock.com';
const CLIENT_ID = process.env.TTLOCK_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.TTLOCK_CLIENT_SECRET ?? '';
const USERNAME  = process.env.TTLOCK_USERNAME ?? '';   // TockLock account email
const PASSWORD  = process.env.TTLOCK_PASSWORD ?? '';   // TockLock account password

// Mexico City is UTC-6 (CST), UTC-5 during DST. We use noon local time so the
// code activates when the guest arrives and expires after they check out.
const CHECKIN_HOUR_UTC  = 18; // noon CST = 18:00 UTC
const CHECKOUT_HOUR_UTC = 18;

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

function dateToUnixMs(isoDate: string, utcHour: number): number {
  const d = new Date(`${isoDate}T${String(utcHour).padStart(2, '0')}:00:00Z`);
  return d.getTime();
}

interface TokenResponse {
  access_token: string;
  uid: number;
}

async function getAccessToken(): Promise<TokenResponse> {
  const params = new URLSearchParams({
    clientId:     CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    username:     USERNAME,
    password:     md5(PASSWORD),
    grant_type:   'password',
  });

  const res = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`TTLock auth failed: ${res.status}`);
  const data = await res.json();
  if (data.errcode) throw new Error(`TTLock auth error ${data.errcode}: ${data.errmsg}`);
  return data as TokenResponse;
}

export interface PasscodeResult {
  keyboardPwdId: number;
  code: string;
}

/**
 * Create a time-limited passcode on the Front Gate lock.
 * Active from check-in noon CST through check-out noon CST.
 */
export async function createTimedPasscode(
  lockId: number,
  code: string,       // 4–8 digit PIN
  guestName: string,
  checkInDate: string,  // YYYY-MM-DD
  checkOutDate: string, // YYYY-MM-DD
): Promise<PasscodeResult> {
  const { access_token } = await getAccessToken();

  const now = Date.now();
  const startDate = dateToUnixMs(checkInDate,  CHECKIN_HOUR_UTC);
  const endDate   = dateToUnixMs(checkOutDate, CHECKOUT_HOUR_UTC);

  const params = new URLSearchParams({
    clientId:        CLIENT_ID,
    accessToken:     access_token,
    lockId:          String(lockId),
    keyboardPwdType: '3',              // custom timed passcode
    keyboardPwdName: guestName,
    keyboardPwd:     code,
    startDate:       String(startDate),
    endDate:         String(endDate),
    addType:         '2',              // added via API
    date:            String(now),
  });

  const res = await fetch(`${BASE_URL}/v3/keyboardPwd/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`TTLock createPasscode failed: ${res.status}`);
  const data = await res.json();
  if (data.errcode) throw new Error(`TTLock passcode error ${data.errcode}: ${data.errmsg}`);

  return { keyboardPwdId: data.keyboardPwdId, code };
}

/**
 * Delete a passcode (called on booking cancellation or denial).
 */
export async function deletePasscode(
  lockId: number,
  keyboardPwdId: number,
): Promise<void> {
  const { access_token } = await getAccessToken();

  const params = new URLSearchParams({
    clientId:       CLIENT_ID,
    accessToken:    access_token,
    lockId:         String(lockId),
    keyboardPwdId:  String(keyboardPwdId),
    deleteType:     '2',
    date:           String(Date.now()),
  });

  const res = await fetch(`${BASE_URL}/v3/keyboardPwd/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`TTLock deletePasscode failed: ${res.status}`);
  const data = await res.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`TTLock delete error ${data.errcode}: ${data.errmsg}`);
  }
}
