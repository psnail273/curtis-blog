import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is not set.');
  }
  return password;
}

export async function createSessionToken(): Promise<string> {
  const secret = getAdminPassword();
  const timestamp = Date.now().toString();
  const signature = await hmacSign(timestamp, secret);
  return `${btoa(timestamp)}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = getAdminPassword();
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const timestamp = atob(parts[0]);
    const signature = parts[1];

    // Verify HMAC signature
    const valid = await hmacVerify(timestamp, signature, secret);
    if (!valid) return false;

    // Check expiry
    const created = parseInt(timestamp, 10);
    if (isNaN(created)) return false;
    const age = (Date.now() - created) / 1000;
    if (age > SESSION_MAX_AGE || age < 0) return false;

    return true;
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  // Constant-time comparison
  if (expected.length !== password.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return result === 0;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}

export async function verifyAdminSessionFromHeader(cookieHeader: string | null): Promise<boolean> {
  if (!cookieHeader) return false;
  // Parse cookie header manually
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!sessionCookie) return false;
  const raw = sessionCookie.substring(COOKIE_NAME.length + 1);
  const token = decodeURIComponent(raw);
  return verifySessionToken(token);
}

export { COOKIE_NAME, SESSION_MAX_AGE };
