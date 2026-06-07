import { NextRequest, NextResponse } from 'next/server';
import { generateState } from '@/lib/auth/oauth-helpers';

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';

export function GET(req: NextRequest) {
  if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_TEAM_ID) {
    return NextResponse.json({ error: 'Apple OAuth not configured' }, { status: 503 });
  }

  const redirect = req.nextUrl.searchParams.get('redirect') || '/';
  const state = generateState(redirect);

  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/apple/callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  });

  const response = NextResponse.redirect(`${APPLE_AUTH_URL}?${params}`);
  response.cookies.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
