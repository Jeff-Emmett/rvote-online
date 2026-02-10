import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceMembership } from "@/lib/spaces";
import { getEffectiveWeight } from "@/lib/voting";
import { NextRequest, NextResponse } from "next/server";

// GET — Get proposal details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      votes: { include: { user: { select: { id: true, name: true } } }, orderBy: { weight: "desc" } },
      finalVotes: true,
    },
  });

  if (!proposal || proposal.spaceId !== space.id) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const effectiveScore = proposal.votes.reduce(
    (sum, v) => sum + getEffectiveWeight(v.weight, v.createdAt),
    0
  );

  return NextResponse.json({ ...proposal, effectiveScore });
}

// PATCH — Update proposal (author only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireSpaceMembership(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (proposal.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit this proposal" }, { status: 403 });
  }
  if (proposal.status !== "RANKING") {
    return NextResponse.json({ error: "Can only edit proposals in ranking stage" }, { status: 400 });
  }

  const { title, description } = await req.json();
  const data: { title?: string; description?: string } = {};
  if (title) data.title = title;
  if (description) data.description = description;

  const updated = await prisma.proposal.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE — Delete proposal (author only)
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
    await requireSpaceMembership(session.user.id, slug);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (proposal.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can delete this proposal" }, { status: 403 });
  }

  await prisma.proposal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
