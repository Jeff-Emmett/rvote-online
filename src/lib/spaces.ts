import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { Space, SpaceMember } from "@prisma/client";

/**
 * Read the space slug from the x-space-slug header set by middleware.
 */
export async function getSpaceSlugFromHeaders(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get("x-space-slug");
}

/**
 * Resolve a space by its slug.
 */
export async function getSpaceBySlug(slug: string): Promise<Space | null> {
  return prisma.space.findUnique({ where: { slug } });
}

/**
 * Verify the user is a member of the space. Returns space + membership.
 * Throws if not a member.
 */
export async function requireSpaceMembership(
  userId: string,
  spaceSlug: string
): Promise<{ space: Space; membership: SpaceMember }> {
  const space = await prisma.space.findUnique({ where: { slug: spaceSlug } });
  if (!space) {
    throw new SpaceError("Space not found", 404);
  }

  const membership = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId, spaceId: space.id } },
  });
  if (!membership) {
    throw new SpaceError("You are not a member of this space", 403);
  }

  return { space, membership };
}

/**
 * Verify the user is an admin of the space. Returns space + membership.
 * Throws if not an admin.
 */
export async function requireSpaceAdmin(
  userId: string,
  spaceSlug: string
): Promise<{ space: Space; membership: SpaceMember }> {
  const { space, membership } = await requireSpaceMembership(userId, spaceSlug);
  if (membership.role !== "ADMIN") {
    throw new SpaceError("Admin access required", 403);
  }
  return { space, membership };
}

/**
 * Generate a URL-safe slug from a name, checking uniqueness.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) slug = "space";

  // Check uniqueness
  const existing = await prisma.space.findUnique({ where: { slug } });
  if (!existing) return slug;

  // Append random suffix if collision
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${suffix}`;
}

/**
 * Typed error for space operations (includes HTTP status code).
 */
export class SpaceError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "SpaceError";
    this.status = status;
  }
}
