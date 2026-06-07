import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { generateTokenPair } from '@/lib/auth/jwt';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
}

/** Find existing OAuth user or create a new one, linking to existing email if present. */
export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  // Returning user — matched by provider + providerId
  let user = await prisma.user.findFirst({
    where: { provider: profile.provider, providerId: profile.providerId },
  });
  if (user) {
    return user;
  }

  // Existing email — link OAuth to it
  user = await prisma.user.findUnique({ where: { email: profile.email } });
  if (user) {
    return prisma.user.update({
      where: { id: user.id },
      data: { provider: profile.provider, providerId: profile.providerId, verified: true },
    });
  }

  // New user
  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      provider: profile.provider,
      providerId: profile.providerId,
      verified: true,
      role: 'USER',
    },
  });
}

/** Set the same httpOnly JWT cookies the password login route uses. */
export function setAuthCookies(
  response: NextResponse,
  user: { id: string; email: string; role: string; verified: boolean; name: string }
) {
  const { accessToken, refreshToken } = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
    verified: user.verified,
  });
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set('auth-token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  // Short-lived readable cookie so the client Zustand store can hydrate.
  response.cookies.set(
    'oauth-user',
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    }),
    { httpOnly: false, secure: isProd, sameSite: 'lax', maxAge: 120, path: '/' }
  );
}

/** Generate a random state token for CSRF protection. */
export function generateState(redirectPath = '/'): string {
  return Buffer.from(JSON.stringify({ r: redirectPath, n: Math.random().toString(36) })).toString(
    'base64url'
  );
}

export function parseState(state: string): { r: string } {
  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString());
  } catch {
    return { r: '/' };
  }
}
