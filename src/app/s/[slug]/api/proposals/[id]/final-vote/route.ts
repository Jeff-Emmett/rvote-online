import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceMembership } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";
import { VoteChoice } from "@prisma/client";

// POST — Cast a final vote (space-scoped)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id: proposalId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let space;
  try {
    const result = await requireSpaceMembership(session.user.id, slug);
    space = result.space;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const { vote } = await req.json();

    if (!vote || !["YES", "NO", "ABSTAIN"].includes(vote)) {
      return NextResponse.json({ error: "Vote must be YES, NO, or ABSTAIN" }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { status: true, votingEndsAt: true, spaceId: true },
    });

    if (!proposal || proposal.spaceId !== space.id) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    if (proposal.status !== "VOTING") {
      return NextResponse.json({ error: "This proposal is not in the voting stage" }, { status: 400 });
    }
    if (proposal.votingEndsAt && new Date() > proposal.votingEndsAt) {
      return NextResponse.json({ error: "Voting has ended for this proposal" }, { status: 400 });
    }

    await prisma.finalVote.upsert({
      where: { userId_proposalId: { userId: session.user.id, proposalId } },
      create: { userId: session.user.id, proposalId, vote: vote as VoteChoice },
      update: { vote: vote as VoteChoice },
    });

    const voteCounts = await prisma.finalVote.groupBy({
      by: ["vote"],
      where: { proposalId },
      _count: true,
    });

    const votes = { yes: 0, no: 0, abstain: 0, total: 0 };
    voteCounts.forEach((vc) => {
      const key = vc.vote.toLowerCase() as "yes" | "no" | "abstain";
      votes[key] = vc._count;
      votes.total += vc._count;
    });

    return NextResponse.json({ success: true, votes, userVote: vote });
  } catch (error) {
    console.error("Final vote error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}

// GET — Get vote counts (space-scoped)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id: proposalId } = await params;

  const voteCounts = await prisma.finalVote.groupBy({
    by: ["vote"],
    where: { proposalId },
    _count: true,
  });

  const votes = { yes: 0, no: 0, abstain: 0, total: 0 };
  voteCounts.forEach((vc) => {
    const key = vc.vote.toLowerCase() as "yes" | "no" | "abstain";
    votes[key] = vc._count;
    votes.total += vc._count;
  });

  let userVote: VoteChoice | null = null;
  if (session?.user?.id) {
    const existing = await prisma.finalVote.findUnique({
      where: { userId_proposalId: { userId: session.user.id, proposalId } },
    });
    userVote = existing?.vote || null;
  }

  return NextResponse.json({ votes, userVote });
}
