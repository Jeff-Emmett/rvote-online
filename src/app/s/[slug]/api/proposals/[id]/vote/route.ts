import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceMembership } from "@/lib/spaces";
import { calculateAvailableCredits, calculateVoteCost } from "@/lib/credits";
import { getEffectiveWeight, shouldPromote, getVotingEndDate, DECAY_START_DAYS } from "@/lib/voting";
import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";

// POST — Cast a ranking vote (space-scoped)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id: proposalId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let space, membership;
  try {
    const result = await requireSpaceMembership(session.user.id, slug);
    space = result.space;
    membership = result.membership;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  try {
    const { weight } = await req.json();

    if (typeof weight !== "number" || weight === 0) {
      return NextResponse.json({ error: "Weight must be a non-zero number" }, { status: 400 });
    }

    // Check proposal exists, belongs to space, and is ranking
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { status: true, spaceId: true },
    });

    if (!proposal || proposal.spaceId !== space.id) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    if (proposal.status !== "RANKING") {
      return NextResponse.json({ error: "This proposal is no longer accepting ranking votes" }, { status: 400 });
    }

    // Calculate credits from SpaceMember (using space config)
    const availableCredits = calculateAvailableCredits(
      membership.credits,
      membership.lastCreditAt,
      space.creditsPerDay,
      space.maxCredits
    );
    const creditCost = calculateVoteCost(weight);

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: { userId_proposalId: { userId: session.user.id, proposalId } },
    });

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
      if (existingVote) {
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { weight, creditCost, createdAt: new Date(), decaysAt: addDays(new Date(), DECAY_START_DAYS) },
        });
      } else {
        await tx.vote.create({
          data: { userId: session.user.id, proposalId, weight, creditCost, decaysAt: addDays(new Date(), DECAY_START_DAYS) },
        });
      }

      // Update SpaceMember credits
      const newCredits = availableCredits - netCost;
      await tx.spaceMember.update({
        where: { id: membership.id },
        data: { credits: newCredits, lastCreditAt: new Date() },
      });

      // Calculate new proposal score
      const allVotes = await tx.vote.findMany({ where: { proposalId } });
      const newScore = allVotes.reduce((sum, v) => sum + getEffectiveWeight(v.weight, v.createdAt), 0);

      const updateData: { score: number; status?: "VOTING"; votingEndsAt?: Date } = { score: newScore };

      if (shouldPromote(newScore, space.promotionThreshold)) {
        updateData.status = "VOTING";
        updateData.votingEndsAt = getVotingEndDate(new Date(), space.votingPeriodDays);
      }

      await tx.proposal.update({ where: { id: proposalId }, data: updateData });

      return { newScore, promoted: shouldPromote(newScore, space.promotionThreshold) };
    });

    return NextResponse.json({ success: true, newScore: result.newScore, promoted: result.promoted, creditCost });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}

// DELETE — Remove a vote (space-scoped)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  const { slug, id: proposalId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let space, membership;
  try {
    const result = await requireSpaceMembership(session.user.id, slug);
    space = result.space;
    membership = result.membership;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 403 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { status: true, spaceId: true },
  });

  if (!proposal || proposal.spaceId !== space.id || proposal.status !== "RANKING") {
    return NextResponse.json({ error: "Cannot remove vote from this proposal" }, { status: 400 });
  }

  const existingVote = await prisma.vote.findUnique({
    where: { userId_proposalId: { userId: session.user.id, proposalId } },
  });
  if (!existingVote) {
    return NextResponse.json({ error: "No vote to remove" }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.vote.delete({ where: { id: existingVote.id } });

    const currentCredits = calculateAvailableCredits(
      membership.credits, membership.lastCreditAt, space.creditsPerDay, space.maxCredits
    );
    await tx.spaceMember.update({
      where: { id: membership.id },
      data: { credits: currentCredits + existingVote.creditCost, lastCreditAt: new Date() },
    });

    const allVotes = await tx.vote.findMany({ where: { proposalId } });
    const newScore = allVotes.reduce((sum, v) => sum + getEffectiveWeight(v.weight, v.createdAt), 0);
    await tx.proposal.update({ where: { id: proposalId }, data: { score: newScore } });

    return { newScore, returnedCredits: existingVote.creditCost };
  });

  return NextResponse.json({ success: true, newScore: result.newScore, returnedCredits: result.returnedCredits });
}
