/**
 * Migration script: Create a "Legacy" space and migrate existing data.
 *
 * Run on the production DB after the schema migration:
 *   npx tsx prisma/seed-spaces.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting space migration...");

  // 1. Create the legacy space
  const legacySpace = await prisma.space.upsert({
    where: { slug: "legacy" },
    update: {},
    create: {
      name: "rVote Community",
      slug: "legacy",
      description: "The original rVote community space.",
      visibility: "public_read",
      promotionThreshold: 100,
      votingPeriodDays: 7,
      creditsPerDay: 10,
      maxCredits: 500,
      startingCredits: 50,
    },
  });

  console.log(`Legacy space created/found: ${legacySpace.id}`);

  // 2. Enroll all existing users as members with their current credits
  const users = await prisma.user.findMany({
    select: { id: true, credits: true, lastCreditAt: true },
  });

  for (const user of users) {
    await prisma.spaceMember.upsert({
      where: {
        userId_spaceId: { userId: user.id, spaceId: legacySpace.id },
      },
      update: {},
      create: {
        userId: user.id,
        spaceId: legacySpace.id,
        role: "MEMBER",
        credits: user.credits,
        lastCreditAt: user.lastCreditAt,
      },
    });
  }

  console.log(`Enrolled ${users.length} users into legacy space`);

  // Make the first user an admin
  if (users.length > 0) {
    await prisma.spaceMember.update({
      where: {
        userId_spaceId: { userId: users[0].id, spaceId: legacySpace.id },
      },
      data: { role: "ADMIN" },
    });
    console.log(`Made first user admin: ${users[0].id}`);
  }

  // 3. Assign all existing proposals to the legacy space
  const result = await prisma.proposal.updateMany({
    where: { spaceId: null },
    data: { spaceId: legacySpace.id },
  });

  console.log(`Assigned ${result.count} proposals to legacy space`);

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
