import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProposalList } from "@/components/ProposalList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SpaceProposalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const [rankingProposals, votingProposals, completedProposals] = await Promise.all([
    prisma.proposal.findMany({
      where: { spaceId: space.id, status: "RANKING" },
      orderBy: { score: "desc" },
      include: { author: { select: { id: true, name: true, email: true } }, votes: true },
    }),
    prisma.proposal.findMany({
      where: { spaceId: space.id, status: "VOTING" },
      orderBy: { votingEndsAt: "asc" },
      include: { author: { select: { id: true, name: true, email: true } }, votes: true },
    }),
    prisma.proposal.findMany({
      where: { spaceId: space.id, status: { in: ["PASSED", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true } }, votes: true },
    }),
  ]);

  const allProposals = [...rankingProposals, ...votingProposals, ...completedProposals];

  let availableCredits = 0;
  let userVotes: { proposalId: string; weight: number; effectiveWeight: number }[] = [];
  let isAuthenticated = false;

  if (session?.user?.id) {
    isAuthenticated = true;
    const member = await prisma.spaceMember.findUnique({
      where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } },
    });
    if (member) {
      availableCredits = calculateAvailableCredits(
        member.credits, member.lastCreditAt, space.creditsPerDay, space.maxCredits
      );
    }
    const votes = await prisma.vote.findMany({
      where: {
        userId: session.user.id,
        proposalId: { in: allProposals.map((p) => p.id) },
      },
    });
    userVotes = votes.map((v) => ({
      proposalId: v.proposalId,
      weight: v.weight,
      effectiveWeight: getEffectiveWeight(v.weight, v.createdAt),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Proposals</h2>
        <Button asChild size="sm">
          <Link href="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="ranking">
        <TabsList>
          <TabsTrigger value="ranking">
            Ranking <Badge variant="secondary" className="ml-2 text-xs hidden sm:inline">{rankingProposals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="voting">
            Voting <Badge variant="secondary" className="ml-2 text-xs hidden sm:inline">{votingProposals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge variant="secondary" className="ml-2 text-xs hidden sm:inline">{completedProposals.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ranking">
          <ProposalList
            proposals={rankingProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            isAuthenticated={isAuthenticated}
            spaceSlug={slug}
            emptyMessage="No proposals being ranked yet."
          />
        </TabsContent>
        <TabsContent value="voting">
          <ProposalList
            proposals={votingProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            isAuthenticated={isAuthenticated}
            spaceSlug={slug}
            emptyMessage="No proposals in voting stage."
          />
        </TabsContent>
        <TabsContent value="completed">
          <ProposalList
            proposals={completedProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            isAuthenticated={isAuthenticated}
            spaceSlug={slug}
            emptyMessage="No completed proposals yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
