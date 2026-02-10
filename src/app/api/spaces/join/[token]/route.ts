import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST — Accept an invite and join a space
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  const { token } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await prisma.spaceInvite.findUnique({
    where: { token },
    include: { space: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  // Check expiry
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  // Check max uses
  if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
    return NextResponse.json({ error: "This invite has reached its usage limit" }, { status: 410 });
  }

  // Check email restriction
  if (invite.email && invite.email !== session.user.email) {
    return NextResponse.json(
      { error: "This invite is for a different email address" },
      { status: 403 }
    );
  }

  // Check if already a member
  const existing = await prisma.spaceMember.findUnique({
    where: {
      userId_spaceId: { userId: session.user.id, spaceId: invite.spaceId },
    },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      alreadyMember: true,
      space: invite.space,
    });
  }

  // Join the space
  await prisma.$transaction([
    prisma.spaceMember.create({
      data: {
        userId: session.user.id,
        spaceId: invite.spaceId,
        role: "MEMBER",
        credits: invite.space.startingCredits,
      },
    }),
    prisma.spaceInvite.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    space: invite.space,
  });
}

// GET — Get invite info (public, for showing the join page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.spaceInvite.findUnique({
    where: { token },
    include: {
      space: {
        select: { name: true, slug: true, description: true },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  const expired = invite.expiresAt ? invite.expiresAt < new Date() : false;
  const maxedOut = invite.maxUses !== null ? invite.uses >= invite.maxUses : false;

  return NextResponse.json({
    space: invite.space,
    expired,
    maxedOut,
    valid: !expired && !maxedOut,
  });
}
