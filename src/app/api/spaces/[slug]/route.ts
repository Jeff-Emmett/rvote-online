import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin, requireSpaceMembership } from "@/lib/spaces";
import { checkSpaceAccess } from "@encryptid/sdk/server/nextjs";
import { NextRequest, NextResponse } from "next/server";

// GET /api/spaces/[slug] — Get space details (respects visibility)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, proposals: true } },
    },
  });

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  // Check space visibility
  const access = await checkSpaceAccess(req, slug, {
    getSpaceConfig: async () => ({
      spaceSlug: slug,
      visibility: (space.visibility as any) || "public_read",
      ownerDID: space.ownerDid || undefined,
      app: "rvote",
    }),
  });

  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason },
      { status: access.claims ? 403 : 401 }
    );
  }

  return NextResponse.json({ ...space, readOnly: access.readOnly });
}

// PATCH /api/spaces/[slug] — Update space (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireSpaceAdmin(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const body = await req.json();
  const allowedFields = [
    "name", "description", "visibility",
    "promotionThreshold", "votingPeriodDays",
    "creditsPerDay", "maxCredits", "startingCredits",
  ];

  const data: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  const updated = await prisma.space.update({
    where: { slug },
    data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/spaces/[slug] — Delete space (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireSpaceAdmin(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  await prisma.space.delete({ where: { slug } });

  return NextResponse.json({ success: true });
}
