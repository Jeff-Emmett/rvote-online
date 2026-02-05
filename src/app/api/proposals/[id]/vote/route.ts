import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAvailableCredits, calculateVoteCost } from "@/lib/credits";
import { getEffectiveWeight, shouldPromote, getVotingEndDate, DECAY_START_DAYS } from "@/lib/voting";
import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";

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
    const { weight } = await req.json();

    if (typeof weight !== "number" || weight === 0) {
      return NextResponse.json(
        { error: "Weight must be a non-zero number" },
        { status: 400 }
      );
    }

    // Check proposal exists and is in ranking stage
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { status: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "RANKING") {
      return NextResponse.json(
        { error: "This proposal is no longer accepting ranking votes" },
        { status: 400 }
      );
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, lastCreditAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const availableCredits = calculateAvailableCredits(user.credits, user.lastCreditAt);
    const creditCost = calculateVoteCost(weight);

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId,
        },
      },
    });

    // Calculate total credits needed (new cost minus returned credits from old vote)
    const returnedCredits = existingVote ? existingVote.creditCost : 0;
    const netCost = creditCost - returnedCredits;

    if (netCost > availableCredits) {
      return NextResponse.json(
        { error: `Not enough credits. Need ${netCost}, have ${availableCredits}` },
        { status: 400 }
      );
    }

    // Perform the vote in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create vote
      if (existingVote) {
        await tx.vote.update({
          where: { id: existingVote.id },
          data: {
            weight,
            creditCost,
            createdAt: new Date(), // Reset creation time on re-vote
            decaysAt: addDays(new Date(), DECAY_START_DAYS),
          },
        });
      } else {
        await tx.vote.create({
          data: {
            userId: session.user.id,
            proposalId,
            weight,
            creditCost,
            decaysAt: addDays(new Date(), DECAY_START_DAYS),
          },
        });
      }

      // Update user credits
      const newCredits = availableCredits - netCost;
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: newCredits,
          lastCreditAt: new Date(),
        },
      });

      // Calculate new proposal score
      const allVotes = await tx.vote.findMany({
        where: { proposalId },
      });

      const newScore = allVotes.reduce((sum, v) => {
        return sum + getEffectiveWeight(v.weight, v.createdAt);
      }, 0);

      // Update proposal score and check for promotion
      const updateData: { score: number; status?: "VOTING"; votingEndsAt?: Date } = {
        score: newScore,
      };

      if (shouldPromote(newScore)) {
        updateData.status = "VOTING";
        updateData.votingEndsAt = getVotingEndDate();
      }

      await tx.proposal.update({
        where: { id: proposalId },
        data: updateData,
      });

      return { newScore, promoted: shouldPromote(newScore) };
    });

    return NextResponse.json({
      success: true,
      newScore: result.newScore,
      promoted: result.promoted,
      creditCost,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: proposalId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check proposal is still in ranking
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { status: true },
  });

  if (!proposal || proposal.status !== "RANKING") {
    return NextResponse.json(
      { error: "Cannot remove vote from this proposal" },
      { status: 400 }
    );
  }

  // Find existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_proposalId: {
        userId: session.user.id,
        proposalId,
      },
    },
  });

  if (!existingVote) {
    return NextResponse.json({ error: "No vote to remove" }, { status: 404 });
  }

  // Remove vote and return credits
  const result = await prisma.$transaction(async (tx) => {
    // Delete vote
    await tx.vote.delete({
      where: { id: existingVote.id },
    });

    // Return credits to user
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, lastCreditAt: true },
    });

    const currentCredits = calculateAvailableCredits(user!.credits, user!.lastCreditAt);
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        credits: currentCredits + existingVote.creditCost,
        lastCreditAt: new Date(),
      },
    });

    // Recalculate proposal score
    const allVotes = await tx.vote.findMany({
      where: { proposalId },
    });

    const newScore = allVotes.reduce((sum, v) => {
      return sum + getEffectiveWeight(v.weight, v.createdAt);
    }, 0);

    await tx.proposal.update({
      where: { id: proposalId },
      data: { score: newScore },
    });

    return { newScore, returnedCredits: existingVote.creditCost };
  });

  return NextResponse.json({
    success: true,
    newScore: result.newScore,
    returnedCredits: result.returnedCredits,
  });
}
