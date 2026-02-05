import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { VoteChoice } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: proposalId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vote } = await req.json();

    if (!vote || !["YES", "NO", "ABSTAIN"].includes(vote)) {
      return NextResponse.json(
        { error: "Vote must be YES, NO, or ABSTAIN" },
        { status: 400 }
      );
    }

    // Check proposal exists and is in voting stage
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { status: true, votingEndsAt: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "VOTING") {
      return NextResponse.json(
        { error: "This proposal is not in the voting stage" },
        { status: 400 }
      );
    }

    // Check if voting has ended
    if (proposal.votingEndsAt && new Date() > proposal.votingEndsAt) {
      return NextResponse.json(
        { error: "Voting has ended for this proposal" },
        { status: 400 }
      );
    }

    // Upsert the vote
    await prisma.finalVote.upsert({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId,
        },
      },
      create: {
        userId: session.user.id,
        proposalId,
        vote: vote as VoteChoice,
      },
      update: {
        vote: vote as VoteChoice,
      },
    });

    // Get updated vote counts
    const voteCounts = await prisma.finalVote.groupBy({
      by: ["vote"],
      where: { proposalId },
      _count: true,
    });

    const votes = {
      yes: 0,
      no: 0,
      abstain: 0,
      total: 0,
    };

    voteCounts.forEach((vc) => {
      const key = vc.vote.toLowerCase() as "yes" | "no" | "abstain";
      votes[key] = vc._count;
      votes.total += vc._count;
    });

    return NextResponse.json({
      success: true,
      votes,
      userVote: vote,
    });
  } catch (error) {
    console.error("Final vote error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: proposalId } = await params;

  // Get vote counts
  const voteCounts = await prisma.finalVote.groupBy({
    by: ["vote"],
    where: { proposalId },
    _count: true,
  });

  const votes = {
    yes: 0,
    no: 0,
    abstain: 0,
    total: 0,
  };

  voteCounts.forEach((vc) => {
    const key = vc.vote.toLowerCase() as "yes" | "no" | "abstain";
    votes[key] = vc._count;
    votes.total += vc._count;
  });

  // Get user's vote if authenticated
  let userVote: VoteChoice | null = null;
  if (session?.user?.id) {
    const existingVote = await prisma.finalVote.findUnique({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId,
        },
      },
    });
    userVote = existingVote?.vote || null;
  }

  return NextResponse.json({
    votes,
    userVote,
  });
}
