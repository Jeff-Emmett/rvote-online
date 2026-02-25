import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Internal seed endpoint — populates the demo space with sample proposals
 * and votes. Only reachable from Docker network.
 *
 * POST /api/internal/seed { space: "demo" }
 */
export async function POST(request: Request) {
  const body = await request.json();
  const spaceSlug: string = body.space?.trim();
  if (!spaceSlug) {
    return NextResponse.json({ error: "Missing space" }, { status: 400 });
  }

  const space = await prisma.space.findUnique({ where: { slug: spaceSlug } });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  // Check if already seeded
  const existingProposals = await prisma.proposal.count({ where: { spaceId: space.id } });
  if (existingProposals > 0) {
    return NextResponse.json({ status: "already_seeded", proposals: existingProposals });
  }

  // Create demo users (rvote requires email)
  const alice = await prisma.user.upsert({
    where: { email: "alice@demo.rspace.online" },
    update: {},
    create: { email: "alice@demo.rspace.online", name: "Alice", did: "did:demo:alice" },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@demo.rspace.online" },
    update: {},
    create: { email: "bob@demo.rspace.online", name: "Bob", did: "did:demo:bob" },
  });
  const charlie = await prisma.user.upsert({
    where: { email: "charlie@demo.rspace.online" },
    update: {},
    create: { email: "charlie@demo.rspace.online", name: "Charlie", did: "did:demo:charlie" },
  });

  // Add as space members with credits
  for (const user of [alice, bob, charlie]) {
    await prisma.spaceMember.upsert({
      where: { userId_spaceId: { userId: user.id, spaceId: space.id } },
      update: {},
      create: { userId: user.id, spaceId: space.id, role: "MEMBER", credits: 100 },
    });
  }

  const now = new Date();
  const weekFromNow = new Date(Date.now() + 7 * 86400000);

  // Proposal 1: Active voting (high engagement)
  const prop1 = await prisma.proposal.create({
    data: {
      spaceId: space.id,
      title: "Increase community meeting frequency to biweekly",
      description:
        "Monthly meetings aren't enough to keep momentum. Proposing we switch to biweekly 30-minute check-ins to stay aligned on community projects and share progress.",
      authorId: alice.id,
      status: "VOTING",
      score: 15,
      votingEndsAt: weekFromNow,
    },
  });

  await prisma.vote.createMany({
    data: [
      { proposalId: prop1.id, userId: alice.id, weight: 8, creditCost: 64 },
      { proposalId: prop1.id, userId: bob.id, weight: 5, creditCost: 25 },
      { proposalId: prop1.id, userId: charlie.id, weight: 2, creditCost: 4 },
    ],
  });

  // Proposal 2: In ranking phase (newer)
  const prop2 = await prisma.proposal.create({
    data: {
      spaceId: space.id,
      title: "Allocate $500 from treasury for public art project",
      description:
        "Let's commission a local artist to create a mural for our community space. This would make the entrance more welcoming and showcase our values. Budget covers materials + artist stipend.",
      authorId: bob.id,
      status: "RANKING",
      score: 3,
    },
  });

  await prisma.vote.createMany({
    data: [
      { proposalId: prop2.id, userId: bob.id, weight: 3, creditCost: 9 },
    ],
  });

  // Proposal 3: Passed (shows completed governance)
  const prop3 = await prisma.proposal.create({
    data: {
      spaceId: space.id,
      title: "Adopt transparent decision-making framework",
      description:
        "All community decisions over $100 should go through quadratic voting. This ensures fair representation — those who care more can express stronger preferences, while preventing whale dominance.",
      authorId: charlie.id,
      status: "PASSED",
      score: 22,
      votingEndsAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.vote.createMany({
    data: [
      { proposalId: prop3.id, userId: alice.id, weight: 10, creditCost: 100 },
      { proposalId: prop3.id, userId: bob.id, weight: 7, creditCost: 49 },
      { proposalId: prop3.id, userId: charlie.id, weight: 5, creditCost: 25 },
    ],
  });

  await prisma.finalVote.createMany({
    data: [
      { proposalId: prop3.id, userId: alice.id, vote: "YES" },
      { proposalId: prop3.id, userId: bob.id, vote: "YES" },
      { proposalId: prop3.id, userId: charlie.id, vote: "ABSTAIN" },
    ],
  });

  return NextResponse.json({
    status: "seeded",
    space: spaceSlug,
    proposals: 3,
    votes: 7,
    finalVotes: 3,
    users: 3,
  }, { status: 201 });
}
