/**
 * EncryptID configuration for rvote-online
 */

export const ENCRYPTID_SERVER_URL =
  process.env.ENCRYPTID_SERVER_URL || 'https://encryptid.jeffemmett.com';

/**
 * Verify an EncryptID JWT token by calling the EncryptID server.
 * Returns claims if valid, null if invalid.
 */
export async function verifyEncryptIDToken(token: string): Promise<{
  sub: string;
  username?: string;
  did?: string;
  exp?: number;
} | null> {
  try {
    const res = await fetch(`${ENCRYPTID_SERVER_URL}/api/session/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (data.valid) {
      return {
        sub: data.userId,
        username: data.username,
        did: data.did,
        exp: data.exp,
      };
    }
    return null;
  } catch {
    return null;
  }
}
