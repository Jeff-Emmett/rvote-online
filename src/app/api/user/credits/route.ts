import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAvailableCredits, maxAffordableWeight } from "@/lib/credits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      credits: true,
      lastCreditAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const available = calculateAvailableCredits(user.credits, user.lastCreditAt);

  return NextResponse.json({
    stored: user.credits,
    available,
    maxAffordableVote: maxAffordableWeight(available),
  });
}

// Claim accumulated credits
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      credits: true,
      lastCreditAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const available = calculateAvailableCredits(user.credits, user.lastCreditAt);

  // Update stored credits and reset claim time
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      credits: available,
      lastCreditAt: new Date(),
    },
    select: {
      credits: true,
    },
  });

  return NextResponse.json({
    stored: updatedUser.credits,
    available: updatedUser.credits,
    maxAffordableVote: maxAffordableWeight(updatedUser.credits),
  });
}
