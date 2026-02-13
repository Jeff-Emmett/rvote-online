import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SpaceProvider } from "@/components/SpaceProvider";
import { SpaceNav } from "@/components/SpaceNav";
import { calculateAvailableCredits } from "@/lib/credits";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  let membership = null;
  if (session?.user?.id) {
    const member = await prisma.spaceMember.findUnique({
      where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } },
    });
    if (member) {
      const credits = calculateAvailableCredits(
        member.credits,
        member.lastCreditAt,
        space.creditsPerDay,
        space.maxCredits
      );
      membership = { id: member.id, role: member.role, credits };
    }
  }

  return (
    <SpaceProvider
      space={{
        id: space.id,
        name: space.name,
        slug: space.slug,
        description: space.description,
        isPublic: space.isPublic,
        promotionThreshold: space.promotionThreshold,
        votingPeriodDays: space.votingPeriodDays,
        creditsPerDay: space.creditsPerDay,
        maxCredits: space.maxCredits,
        startingCredits: space.startingCredits,
      }}
      membership={membership}
    >
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg sm:text-xl font-bold">{space.name}</h1>
          {space.description && (
            <p className="text-sm text-muted-foreground">{space.description}</p>
          )}
        </div>
      </div>
      <SpaceNav />
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {children}
      </div>
    </SpaceProvider>
  );
}
