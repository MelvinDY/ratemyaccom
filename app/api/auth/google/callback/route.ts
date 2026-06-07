import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateOAuthUser, setAuthCookies, parseState } from '@/lib/auth/oauth-helpers';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_cancelled`);
  }

  // Verify CSRF state
  const savedState = req.cookies.get('oauth-state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_state_mismatch`);
  }

  const { r: redirectPath } = parseState(state);

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Token exchange failed');
    }
    const tokens = await tokenRes.json();

    // Fetch Google user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      throw new Error('Profile fetch failed');
    }
    const profile = await profileRes.json();

    const user = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0] || profile.email,
    });

    const dest = `${APP_URL}${redirectPath.startsWith('/') ? redirectPath : '/'}`;
    const response = NextResponse.redirect(dest);
    setAuthCookies(response, user);
    response.cookies.delete('oauth-state');
    return response;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
