import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalList } from "@/components/ProposalList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProposalsPage() {
  const session = await auth();

  // Get all proposals grouped by status
  const [rankingProposals, votingProposals, completedProposals] = await Promise.all([
    prisma.proposal.findMany({
      where: { status: "RANKING" },
      orderBy: { score: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        votes: true,
      },
    }),
    prisma.proposal.findMany({
      where: { status: "VOTING" },
      orderBy: { votingEndsAt: "asc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        votes: true,
      },
    }),
    prisma.proposal.findMany({
      where: { status: { in: ["PASSED", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, name: true, email: true } },
        votes: true,
      },
    }),
  ]);

  // Get user's votes and credits if logged in
  let availableCredits = 0;
  let userVotes: { proposalId: string; weight: number; effectiveWeight: number }[] = [];

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, lastCreditAt: true },
    });

    if (user) {
      availableCredits = calculateAvailableCredits(user.credits, user.lastCreditAt);
    }

    const allProposalIds = [
      ...rankingProposals.map((p) => p.id),
      ...votingProposals.map((p) => p.id),
      ...completedProposals.map((p) => p.id),
    ];

    const votes = await prisma.vote.findMany({
      where: {
        userId: session.user.id,
        proposalId: { in: allProposalIds },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">
            Browse, rank, and vote on community proposals
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ranking">
            Ranking ({rankingProposals.length})
          </TabsTrigger>
          <TabsTrigger value="voting">
            Voting ({votingProposals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="mt-6">
          <ProposalList
            proposals={rankingProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            emptyMessage="No proposals are currently being ranked."
          />
        </TabsContent>

        <TabsContent value="voting" className="mt-6">
          <ProposalList
            proposals={votingProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            emptyMessage="No proposals are currently in voting."
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ProposalList
            proposals={completedProposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
            emptyMessage="No proposals have been completed yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
