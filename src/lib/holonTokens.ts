/**
 * Per-Space holon-token cache. Same pattern as rcal-online/src/lib/holonTokens.ts.
 * Spec: rspace-registry/backlog/docs/holonic_ontology.md TASK-15
 */

const REGISTRY_URL = process.env.RSPACE_REGISTRY_URL ?? "https://registry.rspace.online";
const APP_NAME = process.env.HOLON_APP_NAME ?? "rvote";

interface CacheEntry { token: string; expiresAt: number; }
const cache = new Map<string, CacheEntry>();
const SAFETY_REFRESH_MS = 5 * 60 * 1000;

export interface HolonTokenSpec { holons: string[]; scopes: string[]; }

export async function getHolonTokenForSpace(
  spaceId: string,
  spec: HolonTokenSpec,
): Promise<string | null> {
  const mintToken = process.env.HOLON_MINT_API_TOKEN;
  if (!mintToken) return null;

  const cached = cache.get(spaceId);
  if (cached && cached.expiresAt > Date.now() + SAFETY_REFRESH_MS) {
    return cached.token;
  }

  try {
    const res = await fetch(`${REGISTRY_URL}/spaces/${spaceId}/holon-tokens`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mintToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ app: APP_NAME, holons: spec.holons, scopes: spec.scopes, ttl_hours: 24 }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { token: string; expires_at: number };
    cache.set(spaceId, { token: body.token, expiresAt: body.expires_at * 1000 });
    return body.token;
  } catch {
    return null;
  }
}

/**
 * Special case: tags can be 'global' scope. Mints a token bound to a
 * stub space ('_global') since the registry endpoint is per-Space.
 * Global Tag writes don't actually require space matching at the
 * holon-service side — the request body controls scope.
 */
export async function getGlobalTagToken(): Promise<string | null> {
  return getHolonTokenForSpace(process.env.HOLON_GLOBAL_SPACE ?? "demo", {
    holons: ["tag"],
    scopes: ["read", "write", "global-write"],
  });
}

const HOLON_URL = process.env.HOLON_SERVICE_URL ?? "https://holons.rspace.online";
const registeredDids = new Set<string>();

/**
 * Fold an EncryptID DID into the canonical Identity holon on login, so the same
 * rIdentity is one canonical record across rApps (not a per-app local row).
 * Reuses the per-Space mint cache. Additive + fire-and-forget; never throws.
 */
export async function registerIdentityOnLogin(
  did: string | null | undefined,
  displayName?: string | null,
): Promise<void> {
  if (!did || registeredDids.has(did)) return;
  registeredDids.add(did);
  const token = await getHolonTokenForSpace(process.env.HOLON_GLOBAL_SPACE ?? "demo", {
    holons: ["identity"],
    scopes: ["read", "write"],
  });
  if (!token) {
    registeredDids.delete(did);
    return;
  }
  try {
    const res = await fetch(`${HOLON_URL}/identities`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ did, kind: "person", display_name: displayName ?? undefined }),
    });
    if (!res.ok) registeredDids.delete(did);
  } catch {
    registeredDids.delete(did);
  }
}
