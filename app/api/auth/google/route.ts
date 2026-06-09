import { NextRequest, NextResponse } from 'next/server';
import { generateState } from '@/lib/auth/oauth-helpers';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Strip any trailing slash so the callback URL matches Google exactly
// (a trailing slash in NEXT_PUBLIC_APP_URL would produce a "//" and a
// redirect_uri_mismatch error).
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');

export function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 503 });
  }

  const redirect = req.nextUrl.searchParams.get('redirect') || '/';
  const state = generateState(redirect);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  response.cookies.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
