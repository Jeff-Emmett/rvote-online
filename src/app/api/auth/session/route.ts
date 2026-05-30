import { verifyEncryptIDToken } from '@encryptid/sdk/server';
import { prisma } from '@/lib/prisma';
import { registerIdentityOnLogin } from '@/lib/holonTokens';
import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL =
  process.env.ENCRYPTID_SERVER_URL || 'https://auth.ridentity.online';

/**
 * POST /api/auth/session — Verify EncryptID token and set session cookie.
 * Called by signin/signup pages after successful WebAuthn ceremony.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const claims = await verifyEncryptIDToken(token, { serverUrl: SERVER_URL });
    const did: string | undefined = claims.did || claims.sub;
    if (!did) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Upsert user in DB
    const user = await prisma.user.upsert({
      where: { did },
      update: { name: claims.username || undefined },
      create: {
        did,
        email: `${did}@encryptid.local`,
        name: claims.username || null,
        credits: 50,
        emailVerified: new Date(),
      },
    });

    // Additive: fold this EncryptID DID into the canonical Identity holon
    // (fire-and-forget; never blocks login).
    void registerIdentityOnLogin(user.did, user.name);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        did: user.did,
      },
    });

    response.cookies.set('encryptid_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/session — Clear session cookie (sign out).
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('encryptid_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
