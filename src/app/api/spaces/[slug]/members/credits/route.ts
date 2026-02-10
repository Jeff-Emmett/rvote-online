import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// POST — Allot credits to a member (admin only)
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

  const { userId, amount } = await req.json();

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  const member = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId, spaceId: space.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.spaceMember.update({
    where: { id: member.id },
    data: {
      credits: { increment: amount },
      lastCreditAt: new Date(),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    success: true,
    member: updated,
    newCredits: updated.credits,
  });
}
