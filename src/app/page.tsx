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
  ListOrdered,
  Target,
  Layers,
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
      <section className="relative text-center py-16 space-y-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

        <Badge variant="secondary" className="text-sm px-4 py-1 bg-primary/10 text-primary border-primary/20">
          Part of the rSpace Ecosystem
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Democratic<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Backlog Prioritization</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          rVote uses <strong className="text-foreground">Quadratic Proposal Ranking</strong> to let your community democratically
          prioritize proposals. The best ideas rise to the top through collective intelligence,
          then advance to final voting.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Link href="/demo">
              <Play className="mr-2 h-5 w-5" />
              Try the Demo
            </Link>
          </Button>
          {!session?.user ? (
            <Button asChild variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
              <Link href="/proposals">Browse Proposals</Link>
            </Button>
          )}
        </div>
      </section>

      {/* ELI5 Section */}
      <section className="py-8">
        <Card className="border-2 border-accent/30 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5">
          <CardHeader className="text-center pb-2">
            <Badge variant="secondary" className="w-fit mx-auto mb-2 bg-accent/10 text-accent-foreground border-accent/20">
              ELI5
            </Badge>
            <CardTitle className="text-2xl">rVote in 30 Seconds</CardTitle>
          </CardHeader>
          <CardContent className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong className="text-foreground">rVote</strong> is a{" "}
              <strong className="text-primary">quadratic Reddit-style ranking system</strong>{" "}
              with <strong className="text-accent">time-delayed vote decay</strong>{" "}
              for proposal prioritization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">
                <strong className="text-primary">Quadratic</strong>
                <p className="text-muted-foreground mt-1">
                  Voting more costs exponentially more credits (1→1, 2→4, 3→9), preventing any single voice from dominating.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <strong className="text-secondary">Reddit-style</strong>
                <p className="text-muted-foreground mt-1">
                  Upvote or downvote proposals. The best ideas rise to the top through collective ranking.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <strong className="text-accent-foreground">Vote Decay</strong>
                <p className="text-muted-foreground mt-1">
                  Votes fade after 30-60 days, ensuring rankings reflect current community priorities, not ancient history.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* What is Quadratic Proposal Ranking */}
      <section className="py-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30">The Core Concept</Badge>
          <h2 className="text-3xl font-bold mb-4">What is Quadratic Proposal Ranking?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A system where expressing <em>strong</em> preference costs progressively more,
            creating a fair and balanced priority list that reflects true community consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-destructive" />
                The Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Traditional priority systems let those with more time, resources, or influence
                dominate what gets attention.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Loudest voices set the agenda</li>
                <li>Important but less flashy ideas get buried</li>
                <li>No way to express intensity of preference</li>
                <li>Backlogs become political battlegrounds</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                The Solution: Quadratic Proposal Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Quadratic Proposal Ranking balances participation and conviction by making
                additional votes progressively more expensive.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>1 vote = 1 credit, 2 votes = 4, 3 = 9</li>
                <li>Everyone can participate meaningfully</li>
                <li>Express strong opinions, but at a cost</li>
                <li>Naturally surfaces community consensus</li>
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
                className="p-4 rounded-lg border-2 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="text-2xl font-bold text-primary">{votes}</div>
                <div className="text-sm text-muted-foreground">
                  vote{votes > 1 ? "s" : ""}
                </div>
                <div className="text-lg font-mono mt-2 text-accent">{votes * votes}</div>
                <div className="text-xs text-muted-foreground">credits</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Spreading votes across proposals you support is more efficient than concentrating on one.
          </p>
        </div>
      </section>

      {/* How it creates a democratic backlog */}
      <section className="py-8 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 -mx-4 px-4 rounded-xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">How It Works</Badge>
          <h2 className="text-3xl font-bold mb-4">From Chaos to Consensus</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your community&apos;s ideas into a democratically prioritized backlog
            through two simple stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-primary/20 bg-card/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <ListOrdered className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <Badge className="mb-1 bg-primary/10 text-primary">Stage 1</Badge>
                  <CardTitle>Quadratic Proposal Ranking</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>All proposals enter the ranking pool</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Upvote/downvote with quadratic cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Votes decay over 30-60 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-1 shrink-0 text-primary" />
                  <span>Creates a living priority queue</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1 bg-accent/20 text-accent-foreground">
                    Threshold
                  </Badge>
                  <CardTitle>Score +100</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                When a proposal reaches a score of <strong className="text-foreground">+100</strong>, it
                automatically advances to the final voting stage.
              </p>
              <p className="mt-2 text-sm">
                This ensures only proposals with genuine community support move
                forward for implementation decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/30 bg-card/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center">
                  <Vote className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-1 border-secondary/30">
                    Stage 2
                  </Badge>
                  <CardTitle>Pass/Fail Vote</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Vote className="h-4 w-4 mt-1 shrink-0 text-secondary" />
                  <span>Yes / No / Abstain voting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-1 shrink-0 text-secondary" />
                  <span>One member = one vote</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 shrink-0 text-secondary" />
                  <span>7-day voting period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 shrink-0 text-secondary" />
                  <span>Majority decides implementation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built for Fair Prioritization</h2>
          <p className="text-muted-foreground">Everything you need for democratic backlog management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Earn Credits Daily</h3>
              <p className="text-sm text-muted-foreground">
                Get 10 credits every day. Start with 50. Max 500.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Vote Decay</h3>
              <p className="text-sm text-muted-foreground">
                Old votes fade away, keeping rankings fresh and dynamic.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Sybil Resistant</h3>
              <p className="text-sm text-muted-foreground">
                Quadratic costs make fake account attacks expensive.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
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
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{userCount}</div>
                <p className="text-sm text-muted-foreground">Members</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-accent">{rankingCount}</div>
                <p className="text-sm text-muted-foreground">Being Ranked</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-secondary">{votingCount}</div>
                <p className="text-sm text-muted-foreground">In Voting</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{passedCount}</div>
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
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
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
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <CardContent className="py-12 text-center space-y-6 relative">
            <Badge className="bg-primary/10 text-primary border-primary/20">Join the rSpace Ecosystem</Badge>
            <h2 className="text-3xl font-bold">Ready to prioritize democratically?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Experience Quadratic Proposal Ranking firsthand. Try the interactive demo or
              create an account to start building your community&apos;s backlog together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link href="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Interactive Demo
                </Link>
              </Button>
              {!session?.user && (
                <Button asChild variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
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
