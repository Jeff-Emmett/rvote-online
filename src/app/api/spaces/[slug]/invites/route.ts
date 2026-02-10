import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceAdmin } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";

// GET — List invites for a space (admin only)
export async function GET(
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

  const invites = await prisma.spaceInvite.findMany({
    where: { spaceId: space.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

// POST — Create an invite (admin only)
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

  const { email, maxUses, expiresAt } = await req.json();

  const invite = await prisma.spaceInvite.create({
    data: {
      spaceId: space.id,
      email: email || null,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: session.user.id,
    },
  });

  const rootDomain = process.env.ROOT_DOMAIN || "rvote.online";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const inviteUrl = `${protocol}://${slug}.${rootDomain}/join?token=${invite.token}`;

  return NextResponse.json({ ...invite, inviteUrl }, { status: 201 });
}
