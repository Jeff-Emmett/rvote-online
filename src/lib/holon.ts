/**
 * holon-service identity shim.
 *
 * On EncryptID login, register the user's DID with the canonical Identity holon
 * (`POST /identities` on holon-service) so the same EncryptID rIdentity folds to
 * one canonical record across all rApps instead of staying a per-app local row.
 *
 * Design constraints:
 *  - ADDITIVE: never blocks or fails the login path. Fire-and-forget; all errors
 *    are swallowed (logged at warn).
 *  - INERT until provisioned: if HOLON_SERVICE_URL / HOLON_IDENTITY_TOKEN are not
 *    set, it does nothing — safe to deploy before the capability token exists.
 *  - Idempotent + cheap: holon-service upserts on `did`; an in-process cache
 *    avoids re-POSTing the same DID every request.
 *
 * Env (injected via Infisical at deploy):
 *  - HOLON_SERVICE_URL    e.g. http://holon-service:8000 (internal) or
 *                         https://holons.rspace.online
 *  - HOLON_IDENTITY_TOKEN capability token granting identity:write, minted by
 *                         rspace-registry (POST /spaces/{space}/holon-tokens)
 */

const HOLON_URL = process.env.HOLON_SERVICE_URL;
const HOLON_TOKEN = process.env.HOLON_IDENTITY_TOKEN;

const registered = new Set<string>();

export function registerCanonicalIdentity(
  did: string | null | undefined,
  displayName?: string | null,
): void {
  if (!did || !HOLON_URL || !HOLON_TOKEN) return; // inert until provisioned
  if (registered.has(did)) return;
  registered.add(did);

  fetch(`${HOLON_URL}/identities`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${HOLON_TOKEN}`,
    },
    body: JSON.stringify({
      did,
      kind: 'person',
      display_name: displayName ?? undefined,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        registered.delete(did); // allow retry on a later request
        console.warn(`[holon] identity register HTTP ${res.status} for ${did}`);
      }
    })
    .catch((err) => {
      registered.delete(did);
      console.warn(`[holon] identity register failed for ${did}:`, String(err));
    });
}
