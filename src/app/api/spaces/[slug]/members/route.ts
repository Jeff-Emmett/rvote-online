import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin, requireSpaceMembership } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// GET — List members of a space
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireSpaceMembership(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const space = await prisma.space.findUnique({ where: { slug } });
  const members = await prisma.spaceMember.findMany({
    where: { spaceId: space!.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

// POST — Add a member by email (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let space;
  try {
    const result = await requireSpaceAdmin(session.user.id, slug);
    space = result.space;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const { email, role = "MEMBER" } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No user found with this email. They must create an account first." },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId: space.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  const member = await prisma.spaceMember.create({
    data: {
      userId: user.id,
      spaceId: space.id,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      credits: space.startingCredits,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(member, { status: 201 });
}
