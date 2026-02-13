"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Minus,
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
    title: "Add dark mode toggle to the dashboard",
    description: "Implement a system-aware dark/light theme switch so users can choose their preferred viewing mode",
    score: 72, userVote: 0, pendingVote: 0, stage: "ranking", yesVotes: 0, noVotes: 0,
  },
  {
    id: 2,
    title: "Build mobile-responsive voting interface",
    description: "Redesign the voting UI to work seamlessly on phones and tablets so members can vote on the go",
    score: 58, userVote: 0, pendingVote: 0, stage: "ranking", yesVotes: 0, noVotes: 0,
  },
  {
    id: 3,
    title: "Add email notifications for promoted proposals",
    description: "Send members an email when a proposal they voted on advances to the pass/fail voting stage",
    score: 41, userVote: 0, pendingVote: 0, stage: "ranking", yesVotes: 0, noVotes: 0,
  },
  {
    id: 4,
    title: "Create public API for proposal data",
    description: "Expose a read-only REST API so external tools and dashboards can display proposal rankings",
    score: 35, userVote: 0, pendingVote: 0, stage: "ranking", yesVotes: 0, noVotes: 0,
  },
  {
    id: 5,
    title: "Add proposal tagging and filtering",
    description: "Let authors tag proposals by category (feature, bug, process) and allow users to filter the list",
    score: 23, userVote: 0, pendingVote: 0, stage: "ranking", yesVotes: 0, noVotes: 0,
  },
];

export function InteractiveDemo() {
  const [credits, setCredits] = useState(100);
  const [proposals, setProposals] = useState<DemoProposal[]>(initialProposals);

  const maxWeight = Math.floor(Math.sqrt(credits));

  function handleUpvote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        if (p.userVote > 0) {
          const refund = p.userVote * p.userVote;
          setCredits((c) => c + refund);
          return { ...p, score: p.score - p.userVote, userVote: 0, pendingVote: 0 };
        }
        if (p.userVote < 0) return p;
        const newPending = p.pendingVote + 1;
        const newCost = newPending * newPending;
        if (newCost <= credits && newPending <= maxWeight) {
          return { ...p, pendingVote: newPending };
        }
        return p;
      })
    );
  }

  function handleDownvote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        if (p.userVote < 0) {
          const refund = p.userVote * p.userVote;
          setCredits((c) => c + refund);
          return { ...p, score: p.score - p.userVote, userVote: 0, pendingVote: 0 };
        }
        if (p.userVote > 0) return p;
        const newPending = p.pendingVote - 1;
        const newCost = newPending * newPending;
        if (newCost <= credits && Math.abs(newPending) <= maxWeight) {
          return { ...p, pendingVote: newPending };
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

  function confirmVote(proposalId: number) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId || p.pendingVote === 0) return p;
        const cost = p.pendingVote * p.pendingVote;
        const newScore = p.score + p.pendingVote;
        const promoted = newScore >= 100 && p.stage === "ranking";
        setCredits((c) => c - cost);
        return {
          ...p, score: newScore, userVote: p.pendingVote, pendingVote: 0,
          stage: promoted ? "voting" : p.stage,
          yesVotes: promoted ? 8 : p.yesVotes, noVotes: promoted ? 3 : p.noVotes,
        };
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

  const rankingProposals = proposals.filter((p) => p.stage === "ranking").sort((a, b) => b.score - a.score);
  const votingProposals = proposals.filter((p) => p.stage === "voting");

  return (
    <div className="space-y-6">
      {/* Credits display */}
      <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <span className="font-bold text-xl sm:text-2xl text-orange-600">{credits}</span>
                <span className="text-muted-foreground text-sm sm:text-base">credits</span>
              </div>
              <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                Max vote: &plusmn;{maxWeight}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={resetDemo} className="border-orange-500/30 hover:bg-orange-500/10">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
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
          <CardDescription>Each additional vote costs exponentially more credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-sm">
            {[1, 2, 3, 4, 5].map((w) => (
              <div
                key={w}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                  w <= maxWeight
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-700"
                    : "bg-muted/50 border-muted text-muted-foreground"
                }`}
              >
                <div className="font-bold text-xl">+{w}</div>
                <div className="text-xs opacity-70">vote{w > 1 ? "s" : ""}</div>
                <div className="font-mono text-sm mt-1 font-semibold">{w * w}&cent;</div>
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
          <span className="text-muted-foreground text-sm">Score +100 to advance &rarr;</span>
        </div>

        <div className="space-y-2">
          {rankingProposals.map((proposal) => {
            const hasPending = proposal.pendingVote !== 0;
            const hasVoted = proposal.userVote !== 0;
            const pendingCost = proposal.pendingVote * proposal.pendingVote;
            const displayScore = hasPending ? proposal.score + proposal.pendingVote : proposal.score;
            const progressPercent = Math.min((displayScore / 100) * 100, 100);
            const isUpvoted = (hasVoted && proposal.userVote > 0) || proposal.pendingVote > 0;
            const isDownvoted = (hasVoted && proposal.userVote < 0) || proposal.pendingVote < 0;

            return (
              <div
                key={proposal.id}
                className={`flex rounded-xl border bg-card shadow-sm overflow-hidden transition-all duration-200 ${
                  hasPending
                    ? proposal.pendingVote > 0 ? "ring-2 ring-orange-500/50" : "ring-2 ring-blue-500/50"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center justify-center py-3 px-4 bg-muted/50 border-r min-w-[72px]">
                  <Button
                    variant="ghost" size="sm"
                    className={`h-10 w-10 p-0 rounded-md transition-all ${
                      isUpvoted ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20"
                        : "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
                    } ${hasVoted && proposal.userVote < 0 ? "opacity-30 pointer-events-none" : ""}`}
                    onClick={() => handleUpvote(proposal.id)}
                  >
                    <ChevronUp className="h-7 w-7" strokeWidth={2.5} />
                  </Button>
                  <span className={`font-bold text-xl tabular-nums py-1 ${
                    isUpvoted ? "text-orange-500" : isDownvoted ? "text-blue-500" : "text-foreground"
                  }`}>{displayScore}</span>
                  <Button
                    variant="ghost" size="sm"
                    className={`h-10 w-10 p-0 rounded-md transition-all ${
                      isDownvoted ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                        : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                    } ${hasVoted && proposal.userVote > 0 ? "opacity-30 pointer-events-none" : ""}`}
                    onClick={() => handleDownvote(proposal.id)}
                  >
                    <ChevronDown className="h-7 w-7" strokeWidth={2.5} />
                  </Button>
                </div>

                <div className="flex-1 p-4 min-w-0">
                  <h3 className="font-semibold text-base leading-tight">{proposal.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proposal.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress to voting stage</span>
                      <span className={isUpvoted ? "text-orange-500 font-medium" : isDownvoted ? "text-blue-500 font-medium" : ""}>
                        {displayScore}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUpvoted ? "bg-orange-500" : isDownvoted ? "bg-blue-500" : "bg-primary"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  {hasPending && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className={proposal.pendingVote > 0
                        ? "border-orange-500/50 text-orange-600 bg-orange-500/10"
                        : "border-blue-500/50 text-blue-600 bg-blue-500/10"
                      }>
                        {proposal.pendingVote > 0 ? "+" : ""}{proposal.pendingVote} vote = {pendingCost} credits
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => cancelPending(proposal.id)}>
                        <X className="h-4 w-4 mr-1" />Cancel
                      </Button>
                      <Button
                        size="sm"
                        className={`h-7 ${proposal.pendingVote > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"}`}
                        onClick={() => confirmVote(proposal.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />Confirm
                      </Button>
                    </div>
                  )}
                  {hasVoted && !hasPending && (
                    <div className="mt-3">
                      <Badge variant="secondary" className={proposal.userVote > 0
                        ? "bg-orange-500/20 text-orange-600" : "bg-blue-500/20 text-blue-600"
                      }>
                        You voted: {proposal.userVote > 0 ? "+" : ""}{proposal.userVote}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
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
            <span className="text-muted-foreground text-sm">One member = one vote</span>
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
                      <Clock className="h-4 w-4" /><span>6 days left</span>
                    </div>
                  </div>
                  <CardDescription>{proposal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 rounded-full overflow-hidden bg-muted flex">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - yesPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-600">{proposal.yesVotes} Yes ({Math.round(yesPercent)}%)</span>
                      <span className="text-red-600">{proposal.noVotes} No ({Math.round(100 - yesPercent)}%)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="flex-col h-auto py-3 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                      onClick={() => castFinalVote(proposal.id, "yes")}>
                      <Check className="h-5 w-5 text-green-500" /><span className="text-xs mt-1">Yes</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
                      onClick={() => castFinalVote(proposal.id, "no")}>
                      <X className="h-5 w-5 text-red-500" /><span className="text-xs mt-1">No</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3"
                      onClick={() => castFinalVote(proposal.id, "abstain")}>
                      <Minus className="h-5 w-5" /><span className="text-xs mt-1">Abstain</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
