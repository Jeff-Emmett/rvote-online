import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// PATCH — Update member role (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  const session = await auth();
  const { slug, userId } = await params;

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

  const { role } = await req.json();
  if (!role || !["ADMIN", "MEMBER"].includes(role)) {
    return NextResponse.json({ error: "Role must be ADMIN or MEMBER" }, { status: 400 });
  }

  const member = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId, spaceId: space.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.spaceMember.update({
    where: { id: member.id },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE — Remove member (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  const session = await auth();
  const { slug, userId } = await params;

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

  // Prevent removing yourself if you're the last admin
  if (userId === session.user.id) {
    const adminCount = await prisma.spaceMember.count({
      where: { spaceId: space.id, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin" },
        { status: 400 }
      );
    }
  }

  const member = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId, spaceId: space.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await prisma.spaceMember.delete({ where: { id: member.id } });

  return NextResponse.json({ success: true });
}
