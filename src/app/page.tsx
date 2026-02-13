import { InteractiveDemo } from "@/components/InteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="relative text-center py-8 sm:py-16 space-y-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

        <Badge variant="secondary" className="text-sm px-4 py-1 bg-primary/10 text-primary border-primary/20">
          Part of the rSpace Ecosystem
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
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
          <Button asChild variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
            <Link href="/auth/signup">Create a Space</Link>
          </Button>
        </div>
      </section>

      {/* ELI5 Section */}
      <section className="py-8">
        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-3 bg-muted text-muted-foreground">
            ELI5
          </Badge>
          <h2 className="text-2xl font-bold">rVote in 30 Seconds</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A <strong className="text-orange-500">quadratic</strong>{" "}
            <strong className="text-blue-500">Reddit-style ranking system</strong>{" "}
            with <strong className="text-purple-500">time-delayed vote decay</strong>{" "}
            for proposal prioritization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quadratic */}
          <Card className="border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-orange-500/5 overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">x&sup2;</span>
                </div>
                <h3 className="font-bold text-orange-600 text-lg">Quadratic</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Voting more costs exponentially more credits. 1 vote = 1 credit, 2 votes = 4, 3 votes = 9.
                <strong className="text-foreground block mt-2">No single voice can dominate.</strong>
              </p>
            </CardContent>
          </Card>

          {/* Reddit-style */}
          <Card className="border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <ChevronUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-blue-600 text-lg">Reddit-style</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upvote or downvote proposals. Scores aggregate from all community votes.
                <strong className="text-foreground block mt-2">Best ideas rise to the top.</strong>
              </p>
            </CardContent>
          </Card>

          {/* Vote Decay */}
          <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-purple-500/5 overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-purple-600 text-lg">Vote Decay</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votes fade after 30-60 days. Old support expires, requiring renewed interest.
                <strong className="text-foreground block mt-2">Rankings stay fresh and relevant.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Demo inline */}
      <section className="py-8">
        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-3">
            Interactive Demo
          </Badge>
          <h2 className="text-2xl font-bold">Try It Yourself</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Click the vote arrows to rank proposals. Watch how quadratic costs scale in real-time.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <InteractiveDemo />
        </div>
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map((votes) => (
              <div
                key={votes}
                className="p-3 sm:p-4 rounded-lg border-2 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
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

      {/* CTA */}
      <section className="py-12">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <CardContent className="py-12 text-center space-y-6 relative">
            <Badge className="bg-primary/10 text-primary border-primary/20">Join the rSpace Ecosystem</Badge>
            <h2 className="text-3xl font-bold">Ready to prioritize democratically?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Create a Space for your community and start using Quadratic Proposal Ranking.
              Invite members, allot credits, and let the best ideas rise to the top.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link href="/spaces/new">
                  Create a Space
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
                <Link href="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Interactive Demo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
