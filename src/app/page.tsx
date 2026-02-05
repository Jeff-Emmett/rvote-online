import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalList } from "@/components/ProposalList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Vote,
  Zap,
  Users,
  Scale,
  Clock,
  Coins,
  CheckCircle,
  Shield,
  Play,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Get top ranking proposals
  const proposals = await prisma.proposal.findMany({
    where: { status: "RANKING" },
    orderBy: { score: "desc" },
    take: 5,
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
  const [rankingCount, votingCount, passedCount, userCount] = await Promise.all([
    prisma.proposal.count({ where: { status: "RANKING" } }),
    prisma.proposal.count({ where: { status: "VOTING" } }),
    prisma.proposal.count({ where: { status: "PASSED" } }),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="text-center py-16 space-y-6">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          Quadratic Voting for Communities
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Democratic Governance,{" "}
          <span className="text-primary">Reimagined</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          rVote uses quadratic voting to give every voice weight while preventing
          any single actor from dominating. Proposals are ranked by the community,
          and the best ideas rise to the top.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/demo">
              <Play className="mr-2 h-5 w-5" />
              Try the Demo
            </Link>
          </Button>
          {!session?.user ? (
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/proposals">Browse Proposals</Link>
            </Button>
          )}
        </div>
      </section>

      {/* What is Quadratic Voting */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What is Quadratic Voting?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A voting system where the cost of each additional vote increases
            quadratically, making it expensive to dominate but cheap to participate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                The Problem with Traditional Voting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                In traditional systems, those with more resources (time, money,
                influence) can easily dominate outcomes.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>One vote per person ignores intensity of preference</li>
                <li>Unlimited voting lets whales control results</li>
                <li>Small voices get drowned out</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                The Quadratic Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Quadratic voting balances participation and conviction by making
                additional votes progressively more expensive.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>1 vote = 1 credit, 2 votes = 4 credits, 3 = 9</li>
                <li>Express strong opinions, but at a cost</li>
                <li>More voices, more balanced outcomes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Visual cost table */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-4">
            Vote Cost Calculator
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map((votes) => (
              <div
                key={votes}
                className="p-4 rounded-lg border-2 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl font-bold text-primary">{votes}</div>
                <div className="text-sm text-muted-foreground">
                  vote{votes > 1 ? "s" : ""}
                </div>
                <div className="text-lg font-mono mt-2">{votes * votes}</div>
                <div className="text-xs text-muted-foreground">credits</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            It&apos;s more efficient to spread votes across proposals you support
            than to concentrate them on one.
          </p>
        </div>
      </section>

      {/* How it works - 2 stages */}
      <section className="py-8 bg-muted/30 -mx-4 px-4 rounded-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Two-Stage Voting Process</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proposals go through ranking before reaching a final vote, ensuring
            only well-supported ideas get full consideration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <Badge className="mb-1">Stage 1</Badge>
                  <CardTitle>Ranking</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-1 shrink-0" />
                  <span>Proposals start here</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 mt-1 shrink-0" />
                  <span>Upvote/downvote with quadratic cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 shrink-0" />
                  <span>Votes decay over 30-60 days</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">
                    Threshold
                  </Badge>
                  <CardTitle>Score +100</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                When a proposal reaches a score of <strong>+100</strong>, it
                automatically advances to the final voting stage.
              </p>
              <p className="mt-2 text-sm">
                This ensures only proposals with genuine community support move
                forward.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">
                    Stage 2
                  </Badge>
                  <CardTitle>Pass/Fail</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Vote className="h-4 w-4 mt-1 shrink-0" />
                  <span>Yes / No / Abstain voting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-1 shrink-0" />
                  <span>One member = one vote</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 shrink-0" />
                  <span>7-day voting period</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built for Fair Governance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Coins className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">Earn Credits Daily</h3>
              <p className="text-sm text-muted-foreground">
                Get 10 credits every day. Start with 50. Max 500.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Vote Decay</h3>
              <p className="text-sm text-muted-foreground">
                Old votes fade away, keeping rankings fresh and dynamic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">Sybil Resistant</h3>
              <p className="text-sm text-muted-foreground">
                Quadratic costs make fake account attacks expensive.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-1">Auto Promotion</h3>
              <p className="text-sm text-muted-foreground">
                Top proposals automatically advance to voting.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      {(rankingCount > 0 || userCount > 1) && (
        <section className="py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{userCount}</div>
                <p className="text-sm text-muted-foreground">Members</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{rankingCount}</div>
                <p className="text-sm text-muted-foreground">Being Ranked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{votingCount}</div>
                <p className="text-sm text-muted-foreground">In Voting</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{passedCount}</div>
                <p className="text-sm text-muted-foreground">Passed</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Active proposals */}
      {proposals.length > 0 && (
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Proposals</h2>
            <Button asChild variant="ghost">
              <Link href="/proposals">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProposalList
            proposals={proposals}
            userVotes={userVotes}
            availableCredits={availableCredits}
          />
        </section>
      )}

      {/* CTA */}
      <section className="py-12">
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to give it a try?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Experience quadratic voting firsthand. Try the interactive demo or
              create an account to start participating in community governance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Interactive Demo
                </Link>
              </Button>
              {!session?.user && (
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
