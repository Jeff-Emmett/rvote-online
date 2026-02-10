import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// GET /api/spaces — List the user's spaces
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.spaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      space: {
        include: {
          _count: { select: { members: true, proposals: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const spaces = memberships.map((m) => ({
    ...m.space,
    role: m.role,
    memberCount: m.space._count.members,
    proposalCount: m.space._count.proposals,
  }));

  return NextResponse.json(spaces);
}

// POST /api/spaces — Create a new space
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, slug: requestedSlug } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (name.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
  }

  const slug = requestedSlug
    ? requestedSlug.toLowerCase().replace(/[^a-z0-9-]/g, "")
    : await generateUniqueSlug(name);

  // Check slug uniqueness
  const existing = await prisma.space.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "This slug is already taken" }, { status: 409 });
  }

  // Create space + admin membership in a transaction
  const space = await prisma.$transaction(async (tx) => {
    const newSpace = await tx.space.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    await tx.spaceMember.create({
      data: {
        userId: session.user.id,
        spaceId: newSpace.id,
        role: "ADMIN",
        credits: newSpace.startingCredits,
      },
    });

    return newSpace;
  });

  return NextResponse.json(space, { status: 201 });
}
