import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8, createRemoteJWKSet, jwtVerify } from 'jose';
import { findOrCreateOAuthUser, setAuthCookies, parseState } from '@/lib/auth/oauth-helpers';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

async function generateAppleClientSecret(): Promise<string> {
  const privateKeyPem = (process.env.APPLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const privateKey = await importPKCS8(privateKeyPem, 'ES256');

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setIssuedAt()
    .setAudience('https://appleid.apple.com')
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setExpirationTime('5m')
    .sign(privateKey);
}

export async function POST(req: NextRequest) {
  // Apple sends a form POST
  const body = await req.formData();
  const code = body.get('code') as string | null;
  const state = body.get('state') as string | null;
  const idToken = body.get('id_token') as string | null;
  // Apple only sends user data on first sign-in
  const userJson = body.get('user') as string | null;

  if (!code || !state || !idToken) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_cancelled`);
  }

  const savedState = req.cookies.get('oauth-state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_state_mismatch`);
  }

  const { r: redirectPath } = parseState(state);

  try {
    // Verify Apple's id_token
    const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID!,
    });

    const appleSub = payload.sub as string;
    const email = payload.email as string;

    // Extract name from first-login user payload
    let name: string = email.split('@')[0] ?? '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (u?.name) {
          name = `${u.name.firstName ?? ''} ${u.name.lastName ?? ''}`.trim() || name;
        }
      } catch {}
    }

    // Exchange code for tokens (required to complete Apple's flow)
    const clientSecret = await generateAppleClientSecret();
    await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.APPLE_CLIENT_ID!,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP_URL}/api/auth/apple/callback`,
      }),
    });

    const user = await findOrCreateOAuthUser({
      provider: 'apple',
      providerId: appleSub,
      email,
      name,
    });

    const dest = `${APP_URL}${redirectPath.startsWith('/') ? redirectPath : '/'}`;
    const response = NextResponse.redirect(dest);
    setAuthCookies(response, { ...user, name: user.name ?? '' });
    response.cookies.delete('oauth-state');
    return response;
  } catch (err) {
    console.error('Apple OAuth error:', err);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
