/**
 * Space Role bridge for rVote
 *
 * Bridges EncryptID auth + SDK SpaceRole system.
 * Resolves the user's effective SpaceRole in the current space
 * by querying the EncryptID membership server.
 */

import { prisma } from './prisma';
import {
  SpaceRole,
  hasCapability,
  type ResolvedRole,
} from '@encryptid/sdk/types';
import { RVOTE_PERMISSIONS } from '@encryptid/sdk/types/modules';

const ENCRYPTID_SERVER = process.env.ENCRYPTID_SERVER_URL || 'https://encryptid.jeffemmett.com';

// In-memory cache (5 minute TTL)
const roleCache = new Map<string, { role: ResolvedRole; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Resolve a user's SpaceRole in a given rVote space.
 * First checks local rVote membership, then falls back to EncryptID server.
 */
export async function resolveUserSpaceRole(
  userId: string,
  spaceSlug: string,
): Promise<ResolvedRole> {
  const cacheKey = `${userId}:${spaceSlug}`;
  const cached = roleCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.role;
  }

  // Check local rVote space membership first
  const space = await prisma.space.findUnique({
    where: { slug: spaceSlug },
    include: {
      members: { where: { userId }, take: 1 },
    },
  });

  if (!space) {
    const result: ResolvedRole = { role: SpaceRole.VIEWER, source: 'default' };
    roleCache.set(cacheKey, { role: result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  // Fetch user once for DID-based lookups
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Check if owner (via DID match)
  if (space.ownerDid && user?.did && space.ownerDid === user.did) {
    const result: ResolvedRole = { role: SpaceRole.ADMIN, source: 'owner' };
    roleCache.set(cacheKey, { role: result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  // Check local membership
  const membership = space.members[0];
  if (membership) {
    const roleMap: Record<string, SpaceRole> = {
      ADMIN: SpaceRole.ADMIN,
      MODERATOR: SpaceRole.MODERATOR,
      MEMBER: SpaceRole.PARTICIPANT,
      VIEWER: SpaceRole.VIEWER,
    };
    const role = roleMap[membership.role] || SpaceRole.PARTICIPANT;
    const result: ResolvedRole = { role, source: 'membership' };
    roleCache.set(cacheKey, { role: result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  // Fall back to EncryptID server for cross-module membership
  try {
    if (user?.did) {
      const url = `${ENCRYPTID_SERVER}/api/spaces/${encodeURIComponent(spaceSlug)}/members/${encodeURIComponent(user.did)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json() as { role: string };
        const result: ResolvedRole = { role: data.role as SpaceRole, source: 'membership' };
        roleCache.set(cacheKey, { role: result, expires: Date.now() + CACHE_TTL });
        return result;
      }
    }
  } catch {
    // Network error — use visibility default
  }

  // Default based on space visibility
  const isPublic = space.visibility === 'PUBLIC' || space.visibility === 'public';
  const result: ResolvedRole = {
    role: isPublic ? SpaceRole.PARTICIPANT : SpaceRole.VIEWER,
    source: 'default',
  };
  roleCache.set(cacheKey, { role: result, expires: Date.now() + CACHE_TTL });
  return result;
}

/**
 * Check if the current session user has a specific rVote capability.
 */
export async function checkVoteCapability(
  session: { user: { id: string } } | null,
  spaceSlug: string,
  capability: keyof typeof RVOTE_PERMISSIONS.capabilities,
): Promise<boolean> {
  if (!session?.user?.id) return false;
  const resolved = await resolveUserSpaceRole(session.user.id, spaceSlug);
  return hasCapability(resolved.role, capability, RVOTE_PERMISSIONS);
}

/**
 * Invalidate cached role for a user in a space.
 */
export function invalidateSpaceRoleCache(userId?: string, spaceSlug?: string): void {
  if (userId && spaceSlug) {
    roleCache.delete(`${userId}:${spaceSlug}`);
  } else {
    roleCache.clear();
  }
}
