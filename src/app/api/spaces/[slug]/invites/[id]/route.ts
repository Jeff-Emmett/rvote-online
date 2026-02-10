import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// DELETE — Revoke an invite (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireSpaceAdmin(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const invite = await prisma.spaceInvite.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  await prisma.spaceInvite.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
