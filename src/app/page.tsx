import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalList } from "@/components/ProposalList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import Link from "next/link";
import { ArrowRight, TrendingUp, Vote, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Get top ranking proposals
  const proposals = await prisma.proposal.findMany({
    where: { status: "RANKING" },
    orderBy: { score: "desc" },
    take: 10,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      votes: true,
    },
  });

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

    const votes = await prisma.vote.findMany({
      where: {
        userId: session.user.id,
        proposalId: { in: proposals.map((p) => p.id) },
      },
    });

    userVotes = votes.map((v) => ({
      proposalId: v.proposalId,
      weight: v.weight,
      effectiveWeight: getEffectiveWeight(v.weight, v.createdAt),
    }));
  }

  // Get counts for stats
  const [rankingCount, votingCount, passedCount] = await Promise.all([
    prisma.proposal.count({ where: { status: "RANKING" } }),
    prisma.proposal.count({ where: { status: "VOTING" } }),
    prisma.proposal.count({ where: { status: "PASSED" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Community-Driven Governance
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Rank proposals using quadratic voting. Top proposals advance to pass/fail voting.
          Your voice matters more when you concentrate your votes.
        </p>
        {!session?.user && (
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/proposals">Browse Proposals</Link>
            </Button>
          </div>
        )}
        {session?.user && (
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/proposals/new">Create Proposal</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/voting">View Active Votes</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankingCount}</div>
            <p className="text-xs text-muted-foreground">proposals being ranked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Voting</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{votingCount}</div>
            <p className="text-xs text-muted-foreground">proposals in pass/fail voting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedCount}</div>
            <p className="text-xs text-muted-foreground">proposals approved</p>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2">Stage 1</Badge>
              <CardTitle>Ranking</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Proposals start in the ranking stage. Use your credits to upvote or
                downvote. <strong>Quadratic voting</strong>: 1 vote costs 1 credit,
                2 votes cost 4 credits, 3 votes cost 9 credits.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2" variant="secondary">
                Threshold
              </Badge>
              <CardTitle>Score +100</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                When a proposal reaches a score of <strong>+100</strong>, it
                automatically advances to the pass/fail voting stage. Old votes
                decay over time, keeping rankings fresh.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2" variant="outline">
                Stage 2
              </Badge>
              <CardTitle>Pass/Fail</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                In the final stage, members vote <strong>Yes, No, or Abstain</strong>.
                Voting is open for 7 days. Simple majority wins. One member = one vote.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top proposals */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Proposals</h2>
          <Button asChild variant="ghost">
            <Link href="/proposals">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {proposals.length > 0 ? (
          <ProposalList
            proposals={proposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No proposals yet. Be the first to create one!</p>
              {session?.user && (
                <Button asChild className="mt-4">
                  <Link href="/proposals/new">Create Proposal</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
