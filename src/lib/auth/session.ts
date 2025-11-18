import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionUser } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
);

const COOKIE_NAME = 'prd-session';

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.user as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
