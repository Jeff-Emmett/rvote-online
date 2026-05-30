import { verifyEncryptIDToken } from '@encryptid/sdk/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { registerIdentityOnLogin } from './holonTokens';

const SERVER_URL =
  process.env.ENCRYPTID_SERVER_URL || 'https://auth.ridentity.online';

interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    did: string | null;
  };
}

/**
 * Get the current user session.
 * Works in both server components and API route handlers.
 * Reads the encryptid_token cookie, verifies it, and upserts the user.
 *
 * Drop-in replacement for the old NextAuth `auth()` function.
 */
export async function auth(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('encryptid_token')?.value;
  if (!token) return null;

  try {
    const claims = await verifyEncryptIDToken(token, { serverUrl: SERVER_URL });
    const did: string | undefined = claims.did || claims.sub;
    if (!did) return null;

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

    // Additive: fold this EncryptID DID into the canonical Identity holon.
    // Fire-and-forget; never blocks or fails the auth path.
    void registerIdentityOnLogin(user.did, user.name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        did: user.did,
      },
    };
  } catch {
    return null;
  }
}
