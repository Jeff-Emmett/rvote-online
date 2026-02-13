/**
 * EncryptID configuration for rvote-online
 *
 * Uses @encryptid/sdk for token verification instead of manual HTTP calls.
 */

import { verifyEncryptIDToken as sdkVerify } from '@encryptid/sdk/server';

export const ENCRYPTID_SERVER_URL =
  process.env.ENCRYPTID_SERVER_URL || 'https://encryptid.jeffemmett.com';

/**
 * Verify an EncryptID JWT token.
 * Returns claims if valid, null if invalid.
 */
export async function verifyEncryptIDToken(token: string): Promise<{
  sub: string;
  username?: string;
  did?: string;
  exp?: number;
} | null> {
  try {
    const claims = await sdkVerify(token, {
      serverUrl: ENCRYPTID_SERVER_URL,
    });
    return {
      sub: claims.sub,
      username: claims.username,
      did: claims.did,
      exp: claims.exp,
    };
  } catch {
    return null;
  }
}
