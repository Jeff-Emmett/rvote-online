import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Internal provision endpoint — called by rSpace Registry when activating
 * this app for a space. No auth required (only reachable from Docker network).
 *
 * Creates Space + a system owner SpaceMember with starting credits.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const space: string = body.space?.trim();
  if (!space) {
    return NextResponse.json({ error: "Missing space name" }, { status: 400 });
  }

  const existing = await prisma.space.findUnique({ where: { slug: space } });
  if (existing) {
    return NextResponse.json({ status: "exists", id: existing.id, slug: existing.slug });
  }

  const systemEmail = `system+${space}@rspace.online`;
  const systemDid = `did:system:${space}`;

  const user = await prisma.user.upsert({
    where: { email: systemEmail },
    update: { did: systemDid },
    create: { email: systemEmail, name: `${space}-admin`, did: systemDid },
  });

  const visibility = body.public ? "public" : "public_read";

  const created = await prisma.space.create({
    data: {
      name: space.charAt(0).toUpperCase() + space.slice(1),
      slug: space,
      description: body.description || `${space} governance space`,
      visibility,
      ownerDid: systemDid,
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
          credits: 50,
        },
      },
    },
  });

  return NextResponse.json({ status: "created", id: created.id, slug: created.slug }, { status: 201 });
}
