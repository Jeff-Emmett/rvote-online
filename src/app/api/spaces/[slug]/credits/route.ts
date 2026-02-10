import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceMembership } from "@/lib/spaces";
import { calculateAvailableCredits, maxAffordableWeight } from "@/lib/credits";
import { NextRequest, NextResponse } from "next/server";

// GET — Get the current user's credits in this space
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

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

  const available = calculateAvailableCredits(
    membership.credits,
    membership.lastCreditAt,
    space.creditsPerDay,
    space.maxCredits
  );

  return NextResponse.json({
    stored: membership.credits,
    available,
    maxAffordableVote: maxAffordableWeight(available),
    creditsPerDay: space.creditsPerDay,
    maxCredits: space.maxCredits,
  });
}
