import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getEffectiveWeight } from "@/lib/voting";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      finalVotes: {
        select: {
          vote: true,
        },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Calculate effective scores with decay
  const effectiveScore = proposal.votes.reduce((sum, vote) => {
    return sum + getEffectiveWeight(vote.weight, vote.createdAt);
  }, 0);

  // Calculate final vote counts
  const finalVoteCounts = proposal.finalVotes.reduce(
    (acc, fv) => {
      acc[fv.vote.toLowerCase() as "yes" | "no" | "abstain"]++;
      acc.total++;
      return acc;
    },
    { yes: 0, no: 0, abstain: 0, total: 0 }
  );

  return NextResponse.json({
    ...proposal,
    effectiveScore,
    finalVoteCounts,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { authorId: true, status: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only edit your own proposals" },
      { status: 403 }
    );
  }

  if (proposal.status !== "RANKING") {
    return NextResponse.json(
      { error: "Cannot edit proposals after they enter voting" },
      { status: 400 }
    );
  }

  try {
    const { title, description } = await req.json();

    const updateData: { title?: string; description?: string } = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const updated = await prisma.proposal.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error("Update proposal error:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { authorId: true, status: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only delete your own proposals" },
      { status: 403 }
    );
  }

  if (proposal.status !== "RANKING") {
    return NextResponse.json(
      { error: "Cannot delete proposals after they enter voting" },
      { status: 400 }
    );
  }

  await prisma.proposal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
