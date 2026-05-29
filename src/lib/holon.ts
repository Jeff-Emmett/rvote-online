/**
 * holon-service identity shim (v2 — auto-re-minting).
 *
 * On EncryptID login, register the user's DID with the canonical Identity holon
 * (`POST /identities` on holon-service) so the same EncryptID rIdentity folds to
 * one canonical record across all rApps instead of staying a per-app local row.
 *
 * Token strategy (in precedence):
 *   1. HOLON_MINT_API_TOKEN  → auto-mint short-lived capability tokens from
 *      rspace-registry on demand and refresh before expiry (never silently dies).
 *   2. HOLON_IDENTITY_TOKEN  → legacy static token (no refresh).
 *   3. neither               → inert (safe to deploy before provisioning).
 *
 * Always additive: fire-and-forget, never blocks or fails login; all errors
 * swallowed (warn). Idempotent (service upserts on `did`) + in-process dedupe.
 *
 * Env (Infisical / compose):
 *   HOLON_SERVICE_URL      e.g. http://holon-service:8000
 *   HOLON_MINT_API_TOKEN   shared mint secret (claude-ops Infisical)
 *   HOLON_MINT_URL         default http://rspace_registry:8000
 *   HOLON_SPACE            default "demo"
 *   HOLON_APP              this app's name for audit (e.g. "rvote")
 *   HOLON_IDENTITY_TOKEN   legacy static fallback
 */

const SERVICE_URL = process.env.HOLON_SERVICE_URL;
const MINT_TOKEN = process.env.HOLON_MINT_API_TOKEN;
const MINT_URL = process.env.HOLON_MINT_URL || 'http://rspace_registry:8000';
const SPACE = process.env.HOLON_SPACE || 'demo';
const APP = process.env.HOLON_APP || 'rapp';
const STATIC_TOKEN = process.env.HOLON_IDENTITY_TOKEN;

let cached: { token: string; expMs: number } | null = null;
let inflight: Promise<string | null> | null = null;
const registered = new Set<string>();

async function mint(): Promise<string | null> {
  if (!MINT_TOKEN) return null;
  const res = await fetch(`${MINT_URL}/spaces/${SPACE}/holon-tokens`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${MINT_TOKEN}` },
    body: JSON.stringify({
      app: APP,
      holons: ['identity'],
      scopes: ['read', 'write'],
      ttl_hours: 24,
    }),
  });
  if (!res.ok) {
    console.warn(`[holon] mint HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  cached = { token: data.token, expMs: (data.expires_at || 0) * 1000 };
  return cached.token;
}

async function getToken(): Promise<string | null> {
  if (MINT_TOKEN) {
    const now = Date.now();
    if (cached && now < cached.expMs - 300_000) return cached.token; // refresh 5min early
    if (!inflight) inflight = mint().finally(() => { inflight = null; });
    return inflight;
  }
  return STATIC_TOKEN ?? null;
}

export function registerCanonicalIdentity(
  did: string | null | undefined,
  displayName?: string | null,
): void {
  if (!did || !SERVICE_URL || (!MINT_TOKEN && !STATIC_TOKEN)) return; // inert until provisioned
  if (registered.has(did)) return;
  registered.add(did);

  (async () => {
    const token = await getToken();
    if (!token) {
      registered.delete(did);
      return;
    }
    const res = await fetch(`${SERVICE_URL}/identities`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ did, kind: 'person', display_name: displayName ?? undefined }),
    });
    if (!res.ok) {
      registered.delete(did); // allow retry later
      console.warn(`[holon] identity register HTTP ${res.status} for ${did}`);
    }
  })().catch((err) => {
    registered.delete(did);
    console.warn(`[holon] identity register failed for ${did}:`, String(err));
  });
}
