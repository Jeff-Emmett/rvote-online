import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SpaceCard } from "@/components/SpaceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SpacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const memberships = await prisma.spaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      space: {
        include: {
          _count: { select: { members: true, proposals: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const spaces = memberships.map((m) => ({
    ...m.space,
    role: m.role,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Spaces</h1>
          <p className="text-muted-foreground mt-1">
            Communities you belong to
          </p>
        </div>
        <Button asChild>
          <Link href="/spaces/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Space
          </Link>
        </Button>
      </div>

      {spaces.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-lg text-muted-foreground">
            You haven&apos;t joined any spaces yet.
          </p>
          <Button asChild size="lg">
            <Link href="/spaces/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Space
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}
