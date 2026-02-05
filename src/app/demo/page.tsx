"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

interface DemoProposal {
  id: number;
  title: string;
  description: string;
  score: number;
  userVote: number;
  pendingVote: number;
  stage: "ranking" | "voting";
  yesVotes: number;
  noVotes: number;
}

const initialProposals: DemoProposal[] = [
  {
    id: 1,
    title: "Add dark mode to the dashboard",
    description: "Implement a dark theme option for better nighttime usage",
    score: 45,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 2,
    title: "Weekly community calls",
    description: "Host weekly video calls to discuss proposals and progress",
    score: 43,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 3,
    title: "Create a mobile app",
    description: "Build native iOS and Android apps for on-the-go voting",
    score: 44,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
];

export default function DemoPage() {
  const [credits, setCredits] = useState(100);
  const [proposals, setProposals] = useState<DemoProposal[]>(initialProposals);

  const maxWeight = Math.floor(Math.sqrt(credits));

  function incrementVote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const newPending = p.pendingVote + 1;
          const newCost = newPending * newPending;
          if (newCost <= credits) {
            return { ...p, pendingVote: newPending };
          }
        }
        return p;
      })
    );
  }

  function decrementVote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const newPending = p.pendingVote - 1;
          const newCost = newPending * newPending;
          if (newCost <= credits) {
            return { ...p, pendingVote: newPending };
          }
        }
        return p;
      })
    );
  }

  function cancelPending(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, pendingVote: 0 } : p))
    );
  }

  function castVote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId && p.pendingVote !== 0) {
          const cost = p.pendingVote * p.pendingVote;
          const newScore = p.score + p.pendingVote;
          const promoted = newScore >= 100 && p.stage === "ranking";

          setCredits((c) => c - cost);

          return {
            ...p,
            score: newScore,
            userVote: p.pendingVote,
            pendingVote: 0,
            stage: promoted ? "voting" : p.stage,
            yesVotes: promoted ? 8 : p.yesVotes,
            noVotes: promoted ? 3 : p.noVotes,
          };
        }
        return p;
      })
    );
  }

  function removeVote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId && p.userVote !== 0) {
          const refund = p.userVote * p.userVote;
          setCredits((c) => c + refund);
          return {
            ...p,
            score: p.score - p.userVote,
            userVote: 0,
          };
        }
        return p;
      })
    );
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
  }

  const rankingProposals = proposals
    .filter((p) => p.stage === "ranking")
    .sort((a, b) => b.score - a.score); // Sort by score descending
  const votingProposals = proposals.filter((p) => p.stage === "voting");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          Interactive Demo
        </Badge>
        <h1 className="text-4xl font-bold">Try Quadratic Proposal Ranking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience how rVote works without creating an account. Click the arrows
          to add votes and see the quadratic cost increase in real-time.
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
            Click the arrows to add votes. Each additional vote costs more!
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

        {rankingProposals.map((proposal, index) => {
          const hasPending = proposal.pendingVote !== 0;
          const hasVoted = proposal.userVote !== 0;
          const pendingCost = proposal.pendingVote * proposal.pendingVote;
          const previewScore = proposal.score + proposal.pendingVote;
          const rank = index + 1;

          return (
            <Card key={proposal.id} className="transition-all duration-300">
              <div className="flex">
                {/* Rank indicator */}
                <div className="flex items-center justify-center px-3 bg-muted/50 border-r font-bold text-2xl text-muted-foreground min-w-[50px]">
                  #{rank}
                </div>
                <div className="flex flex-col items-center justify-center px-4 border-r bg-muted/30 min-w-[100px]">
                  {/* Up arrow */}
                  <Button
                    variant={proposal.userVote > 0 ? "default" : proposal.pendingVote > 0 ? "outline" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${proposal.pendingVote > 0 ? "border-primary bg-primary/10" : ""}`}
                    onClick={() => {
                      if (proposal.userVote > 0) {
                        removeVote(proposal.id);
                      } else if (!hasPending || proposal.pendingVote > 0) {
                        incrementVote(proposal.id);
                      }
                    }}
                    disabled={hasVoted && proposal.userVote < 0}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>

                  {/* Score display */}
                  <Badge
                    variant={hasPending ? "default" : "outline"}
                    className={`font-mono text-lg my-1 min-w-[4rem] justify-center transition-all ${
                      hasPending
                        ? proposal.pendingVote > 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-destructive text-destructive-foreground"
                        : ""
                    }`}
                  >
                    {hasPending ? (
                      <span className="flex items-center gap-1 text-sm">
                        <span className="opacity-70">{proposal.score}</span>
                        <span>→</span>
                        <span>{previewScore}</span>
                      </span>
                    ) : (
                      proposal.score
                    )}
                  </Badge>

                  {/* Down arrow */}
                  <Button
                    variant={proposal.userVote < 0 ? "destructive" : proposal.pendingVote < 0 ? "outline" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${proposal.pendingVote < 0 ? "border-destructive bg-destructive/10" : ""}`}
                    onClick={() => {
                      if (proposal.userVote < 0) {
                        removeVote(proposal.id);
                      } else if (!hasPending || proposal.pendingVote < 0) {
                        decrementVote(proposal.id);
                      }
                    }}
                    disabled={hasVoted && proposal.userVote > 0}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>

                  {/* Pending vote info */}
                  {hasPending && (
                    <div className="flex flex-col items-center gap-0.5 mt-2">
                      <span className="text-xs font-medium">
                        {proposal.pendingVote > 0 ? "+" : ""}{proposal.pendingVote} vote{Math.abs(proposal.pendingVote) !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pendingCost} credit{pendingCost !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => cancelPending(proposal.id)}
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={proposal.pendingVote > 0 ? "default" : "destructive"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => castVote(proposal.id)}
                          title="Confirm vote"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Cast
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing vote display */}
                  {hasVoted && !hasPending && (
                    <span className="text-xs text-muted-foreground mt-2">
                      Your vote: {proposal.userVote > 0 ? "+" : ""}{proposal.userVote}
                    </span>
                  )}
                </div>

                <div className="flex-1 p-4">
                  <h3 className="font-semibold">{proposal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progress to voting</span>
                      <span>{hasPending ? previewScore : proposal.score}/100</span>
                    </div>
                    <Progress
                      value={Math.min(((hasPending ? previewScore : proposal.score) / 100) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Voting stage - only show if proposals have been promoted */}
      {votingProposals.length > 0 && (
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
      )}

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
