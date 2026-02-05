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
    title: "Allocate 15% of treasury to ecosystem grants program",
    description: "Fund community developers building tools and integrations for the ecosystem over the next 6 months",
    score: 72,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 2,
    title: "Establish a community moderation council",
    description: "Elect 7 members to handle disputes, enforce guidelines, and maintain community standards",
    score: 58,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 3,
    title: "Partner with University research lab for governance study",
    description: "Collaborate with academic researchers to analyze and improve our decision-making processes",
    score: 41,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 4,
    title: "Create bounty program for security audits",
    description: "Reward external security researchers who identify vulnerabilities in our smart contracts",
    score: 35,
    userVote: 0,
    pendingVote: 0,
    stage: "ranking",
    yesVotes: 0,
    noVotes: 0,
  },
  {
    id: 5,
    title: "Host quarterly virtual town halls",
    description: "Regular video conferences for community updates, Q&A sessions, and open discussion",
    score: 23,
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
    .sort((a, b) => b.score - a.score);
  const votingProposals = proposals.filter((p) => p.stage === "voting");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          Interactive Demo
        </Badge>
        <h1 className="text-4xl font-bold">Try Quadratic Proposal Ranking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience how rVote works without creating an account. Click the vote
          arrows to rank proposals—watch how quadratic costs scale in real-time.
        </p>
      </div>

      {/* Credits display */}
      <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-2xl text-orange-600">{credits}</span>
                <span className="text-muted-foreground">credits</span>
              </div>
              <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                Max vote: ±{maxWeight}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={resetDemo} className="border-orange-500/30 hover:bg-orange-500/10">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quadratic cost explainer */}
      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Quadratic Voting Cost
          </CardTitle>
          <CardDescription>
            Each additional vote costs exponentially more credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {[1, 2, 3, 4, 5].map((w) => (
              <div
                key={w}
                className={`p-3 rounded-lg border-2 transition-all ${
                  w <= maxWeight
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-700"
                    : "bg-muted/50 border-muted text-muted-foreground"
                }`}
              >
                <div className="font-bold text-xl">{w > 0 ? "+" : ""}{w}</div>
                <div className="text-xs opacity-70">vote{w > 1 ? "s" : ""}</div>
                <div className="font-mono text-sm mt-1 font-semibold">{w * w}¢</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking stage */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge className="bg-orange-500 hover:bg-orange-600">Stage 1</Badge>
          <h2 className="text-xl font-semibold">Quadratic Ranking</h2>
          <span className="text-muted-foreground text-sm">
            Score +100 to advance →
          </span>
        </div>

        <div className="space-y-2">
          {rankingProposals.map((proposal) => {
            const hasPending = proposal.pendingVote !== 0;
            const hasVoted = proposal.userVote !== 0;
            const pendingCost = proposal.pendingVote * proposal.pendingVote;
            const previewScore = proposal.score + proposal.pendingVote;
            const progressPercent = Math.min((proposal.score / 100) * 100, 100);
            const previewPercent = Math.min((previewScore / 100) * 100, 100);

            return (
              <Card
                key={proposal.id}
                className={`transition-all duration-200 overflow-hidden ${
                  hasPending
                    ? proposal.pendingVote > 0
                      ? "ring-2 ring-orange-500/50 bg-orange-500/5"
                      : "ring-2 ring-blue-500/50 bg-blue-500/5"
                    : hasVoted
                      ? proposal.userVote > 0
                        ? "bg-orange-500/5"
                        : "bg-blue-500/5"
                      : ""
                }`}
              >
                <div className="flex">
                  {/* Reddit-style vote column */}
                  <div className="flex flex-col items-center justify-center py-4 px-3 bg-muted/40 min-w-[70px] gap-1">
                    {/* Upvote button */}
                    <button
                      onClick={() => {
                        if (hasVoted && proposal.userVote > 0) {
                          removeVote(proposal.id);
                        } else if (!hasVoted || proposal.pendingVote >= 0) {
                          incrementVote(proposal.id);
                        }
                      }}
                      disabled={hasVoted && proposal.userVote < 0}
                      className={`p-1 rounded transition-all hover:scale-110 ${
                        (hasVoted && proposal.userVote > 0) || proposal.pendingVote > 0
                          ? "text-orange-500"
                          : "text-muted-foreground hover:text-orange-500"
                      } ${hasVoted && proposal.userVote < 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <ChevronUp className="h-8 w-8" strokeWidth={3} />
                    </button>

                    {/* Score display */}
                    <div className={`font-bold text-xl tabular-nums min-w-[3ch] text-center ${
                      hasPending
                        ? proposal.pendingVote > 0
                          ? "text-orange-500"
                          : "text-blue-500"
                        : hasVoted
                          ? proposal.userVote > 0
                            ? "text-orange-500"
                            : "text-blue-500"
                          : "text-foreground"
                    }`}>
                      {hasPending ? previewScore : proposal.score}
                    </div>

                    {/* Downvote button */}
                    <button
                      onClick={() => {
                        if (hasVoted && proposal.userVote < 0) {
                          removeVote(proposal.id);
                        } else if (!hasVoted || proposal.pendingVote <= 0) {
                          decrementVote(proposal.id);
                        }
                      }}
                      disabled={hasVoted && proposal.userVote > 0}
                      className={`p-1 rounded transition-all hover:scale-110 ${
                        (hasVoted && proposal.userVote < 0) || proposal.pendingVote < 0
                          ? "text-blue-500"
                          : "text-muted-foreground hover:text-blue-500"
                      } ${hasVoted && proposal.userVote > 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <ChevronDown className="h-8 w-8" strokeWidth={3} />
                    </button>
                  </div>

                  {/* Proposal content */}
                  <div className="flex-1 p-4 min-w-0">
                    <h3 className="font-semibold text-base leading-tight">{proposal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {proposal.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress to voting stage</span>
                        <span className={hasPending ? (proposal.pendingVote > 0 ? "text-orange-500" : "text-blue-500") : ""}>
                          {hasPending ? previewScore : proposal.score}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            hasPending
                              ? proposal.pendingVote > 0
                                ? "bg-orange-500"
                                : "bg-blue-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${hasPending ? previewPercent : progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Vote status / pending confirmation */}
                    {(hasPending || hasVoted) && (
                      <div className="mt-3 flex items-center gap-3">
                        {hasPending ? (
                          <>
                            <Badge
                              variant="outline"
                              className={proposal.pendingVote > 0
                                ? "border-orange-500/50 text-orange-600 bg-orange-500/10"
                                : "border-blue-500/50 text-blue-600 bg-blue-500/10"
                              }
                            >
                              {proposal.pendingVote > 0 ? "+" : ""}{proposal.pendingVote} vote = {pendingCost} credits
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => cancelPending(proposal.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className={`h-7 ${
                                proposal.pendingVote > 0
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              onClick={() => castVote(proposal.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          </>
                        ) : hasVoted && (
                          <Badge
                            variant="secondary"
                            className={proposal.userVote > 0
                              ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                              : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                            }
                          >
                            You voted: {proposal.userVote > 0 ? "+" : ""}{proposal.userVote}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Voting stage */}
      {votingProposals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-green-500/50 text-green-600">Stage 2</Badge>
            <h2 className="text-xl font-semibold">Pass/Fail Voting</h2>
            <span className="text-muted-foreground text-sm">
              One member = one vote
            </span>
          </div>

          {votingProposals.map((proposal) => {
            const total = proposal.yesVotes + proposal.noVotes;
            const yesPercent = total > 0 ? (proposal.yesVotes / total) * 100 : 50;
            return (
              <Card key={proposal.id} className="border-green-500/30 bg-green-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span>6 days left</span>
                    </div>
                  </div>
                  <CardDescription>{proposal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vote bar */}
                  <div className="space-y-2">
                    <div className="h-4 rounded-full overflow-hidden bg-muted flex">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${yesPercent}%` }}
                      />
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${100 - yesPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
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
                      className="flex-col h-auto py-3 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                      onClick={() => castFinalVote(proposal.id, "yes")}
                    >
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-xs mt-1">Yes</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col h-auto py-3 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
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
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to try it for real?</h2>
          <p className="text-muted-foreground">
            Create an account to start ranking and voting on community proposals.
            You&apos;ll get 50 credits to start and earn 10 more each day.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
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
