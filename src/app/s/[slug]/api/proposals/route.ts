import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSpaceMembership } from "@/lib/spaces";
import { NextRequest, NextResponse } from "next/server";
import { ProposalStatus } from "@prisma/client";

// GET — List proposals in this space
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ProposalStatus | null;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  const where: { spaceId: string; status?: ProposalStatus } = { spaceId: space.id };
  if (status) where.status = status;

  const orderBy: Record<string, string> = {};
  if (["score", "createdAt", "votingEndsAt"].includes(sortBy)) {
    orderBy[sortBy] = sortOrder;
  } else {
    orderBy.createdAt = "desc";
  }

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { votes: true, finalVotes: true } },
      },
    }),
    prisma.proposal.count({ where }),
  ]);

  return NextResponse.json({
    proposals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST — Create a proposal in this space
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

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

  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }
  if (title.length > 200) {
    return NextResponse.json({ error: "Title must be 200 characters or less" }, { status: 400 });
  }
  if (description.length > 10000) {
    return NextResponse.json({ error: "Description must be 10,000 characters or less" }, { status: 400 });
  }

  const proposal = await prisma.proposal.create({
    data: {
      title,
      description,
      authorId: session.user.id,
      spaceId: space.id,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ proposal }, { status: 201 });
}
