"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Minus,
  ArrowRight,
  RotateCcw,
  Coins,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";

interface DemoProposal {
  id: number;
  title: string;
  description: string;
  score: number;
  userVote: number;
  stage: "ranking" | "voting";
  yesVotes: number;
  noVotes: number;
}

const initialProposals: DemoProposal[] = [
  {
    id: 1,
    title: "Add dark mode to the dashboard",
    description: "Implement a dark theme option for better nighttime usage",
    score: 87,
    userVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 2,
    title: "Weekly community calls",
    description: "Host weekly video calls to discuss proposals and progress",
    score: 42,
    userVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 3,
    title: "Create a mobile app",
    description: "Build native iOS and Android apps for on-the-go voting",
    score: 103,
    userVote: 0,
    stage: "voting",
    yesVotes: 12,
    noVotes: 5,
  },
];

export default function DemoPage() {
  const [credits, setCredits] = useState(100);
  const [proposals, setProposals] = useState<DemoProposal[]>(initialProposals);
  const [voteWeight, setVoteWeight] = useState(1);
  const [activeProposal, setActiveProposal] = useState<number | null>(null);

  const voteCost = voteWeight * voteWeight;
  const maxWeight = Math.floor(Math.sqrt(credits));

  function castVote(proposalId: number, direction: "up" | "down") {
    const weight = direction === "up" ? voteWeight : -voteWeight;
    const cost = voteCost;

    if (cost > credits) return;

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          // Return old vote credits if changing vote
          const oldCost = p.userVote !== 0 ? p.userVote * p.userVote : 0;
          const newScore = p.score - p.userVote + weight;

          // Check if promoted
          const promoted = newScore >= 100 && p.stage === "ranking";

          return {
            ...p,
            score: newScore,
            userVote: weight,
            stage: promoted ? "voting" : p.stage,
            yesVotes: promoted ? 8 : p.yesVotes,
            noVotes: promoted ? 3 : p.noVotes,
          };
        }
        return p;
      })
    );

    // Deduct credits (simplified - doesn't return old vote credits in demo)
    setCredits((prev) => prev - cost);
    setActiveProposal(null);
  }

  function castFinalVote(proposalId: number, vote: "yes" | "no" | "abstain") {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            yesVotes: vote === "yes" ? p.yesVotes + 1 : p.yesVotes,
            noVotes: vote === "no" ? p.noVotes + 1 : p.noVotes,
          };
        }
        return p;
      })
    );
  }

  function resetDemo() {
    setCredits(100);
    setProposals(initialProposals);
    setVoteWeight(1);
    setActiveProposal(null);
  }

  const rankingProposals = proposals.filter((p) => p.stage === "ranking");
  const votingProposals = proposals.filter((p) => p.stage === "voting");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          Interactive Demo
        </Badge>
        <h1 className="text-4xl font-bold">Try Quadratic Proposal Ranking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience how rVote works without creating an account. Rank these
          sample proposals and see the quadratic cost in action.
        </p>
      </div>

      {/* Credits display */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{credits} credits</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Max vote weight: {maxWeight}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={resetDemo}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quadratic cost explainer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quadratic Ranking Cost
          </CardTitle>
          <CardDescription>
            The more votes you put on one proposal, the more each additional
            vote costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {[1, 2, 3, 4, 5].map((w) => (
              <div
                key={w}
                className={`p-3 rounded-lg border ${
                  w <= maxWeight
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted border-muted"
                }`}
              >
                <div className="font-bold text-lg">{w}</div>
                <div className="text-muted-foreground">vote{w > 1 ? "s" : ""}</div>
                <div className="font-mono text-xs mt-1">{w * w} credits</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            This prevents wealthy voters from dominating. Spreading votes across
            proposals is more efficient than concentrating them.
          </p>
        </CardContent>
      </Card>

      {/* Ranking stage */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge>Stage 1</Badge>
          <h2 className="text-xl font-semibold">Ranking</h2>
          <span className="text-muted-foreground text-sm">
            Proposals need +100 to advance
          </span>
        </div>

        {rankingProposals.map((proposal) => (
          <Card key={proposal.id}>
            <div className="flex">
              <div className="flex flex-col items-center justify-center px-4 border-r bg-muted/30 min-w-[80px]">
                <Button
                  variant={proposal.userVote > 0 ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (proposal.userVote > 0) {
                      // Remove vote (simplified)
                      setProposals((prev) =>
                        prev.map((p) =>
                          p.id === proposal.id
                            ? { ...p, score: p.score - p.userVote, userVote: 0 }
                            : p
                        )
                      );
                      setCredits((c) => c + proposal.userVote * proposal.userVote);
                    } else {
                      setActiveProposal(proposal.id);
                    }
                  }}
                  disabled={credits < 1 && proposal.userVote === 0}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <Badge variant="outline" className="font-mono text-lg my-1">
                  {proposal.score}
                </Badge>
                <Button
                  variant={proposal.userVote < 0 ? "destructive" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (proposal.userVote < 0) {
                      setProposals((prev) =>
                        prev.map((p) =>
                          p.id === proposal.id
                            ? { ...p, score: p.score - p.userVote, userVote: 0 }
                            : p
                        )
                      );
                      setCredits((c) => c + proposal.userVote * proposal.userVote);
                    } else {
                      setActiveProposal(-proposal.id); // Negative for downvote
                    }
                  }}
                  disabled={credits < 1 && proposal.userVote === 0}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-semibold">{proposal.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {proposal.description}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress to voting</span>
                    <span>{proposal.score}/100</span>
                  </div>
                  <Progress
                    value={Math.min((proposal.score / 100) * 100, 100)}
                    className="h-2"
                  />
                </div>
                {proposal.userVote !== 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Your vote: {proposal.userVote > 0 ? "+" : ""}
                    {proposal.userVote} ({Math.abs(proposal.userVote * proposal.userVote)} credits)
                  </p>
                )}
              </div>
            </div>

            {/* Vote weight selector */}
            {(activeProposal === proposal.id ||
              activeProposal === -proposal.id) && (
              <div className="border-t p-4 bg-muted/30">
                <div className="flex items-center gap-4">
                  <Label>Vote weight:</Label>
                  <Input
                    type="number"
                    min={1}
                    max={maxWeight}
                    value={voteWeight}
                    onChange={(e) =>
                      setVoteWeight(
                        Math.max(1, Math.min(maxWeight, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    Cost: {voteCost} credits
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveProposal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={activeProposal > 0 ? "default" : "destructive"}
                    onClick={() =>
                      castVote(
                        Math.abs(activeProposal),
                        activeProposal > 0 ? "up" : "down"
                      )
                    }
                    disabled={voteCost > credits}
                  >
                    {activeProposal > 0 ? "Upvote" : "Downvote"} ({voteCost} credits)
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </section>

      {/* Voting stage */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Stage 2</Badge>
          <h2 className="text-xl font-semibold">Pass/Fail Voting</h2>
          <span className="text-muted-foreground text-sm">
            One member = one vote
          </span>
        </div>

        {votingProposals.map((proposal) => {
          const total = proposal.yesVotes + proposal.noVotes;
          const yesPercent = total > 0 ? (proposal.yesVotes / total) * 100 : 50;
          return (
            <Card key={proposal.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span>6 days left</span>
                  </div>
                </div>
                <CardDescription>{proposal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vote bar */}
                <div className="space-y-2">
                  <div className="h-4 rounded-full overflow-hidden bg-red-500/20 flex">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${yesPercent}%` }}
                    />
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${100 - yesPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      {proposal.yesVotes} Yes ({Math.round(yesPercent)}%)
                    </span>
                    <span className="text-red-600">
                      {proposal.noVotes} No ({Math.round(100 - yesPercent)}%)
                    </span>
                  </div>
                </div>

                {/* Vote buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-3 hover:bg-green-500/10 hover:border-green-500"
                    onClick={() => castFinalVote(proposal.id, "yes")}
                  >
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-xs mt-1">Yes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-3 hover:bg-red-500/10 hover:border-red-500"
                    onClick={() => castFinalVote(proposal.id, "no")}
                  >
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-xs mt-1">No</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-3"
                    onClick={() => castFinalVote(proposal.id, "abstain")}
                  >
                    <Minus className="h-5 w-5" />
                    <span className="text-xs mt-1">Abstain</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* CTA */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to try it for real?</h2>
          <p className="text-muted-foreground">
            Create an account to start ranking and voting on community proposals.
            You&apos;ll get 50 credits to start and earn 10 more each day.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
