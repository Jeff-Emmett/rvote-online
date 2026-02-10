"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "./VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { ProposalStatus } from "@prisma/client";
import { Clock, User, TrendingUp } from "lucide-react";

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    description: string;
    status: ProposalStatus;
    score: number;
    createdAt: Date | string;
    votingEndsAt?: Date | string | null;
    author: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  userVote?: {
    weight: number;
    effectiveWeight: number;
  };
  availableCredits: number;
  isAuthenticated?: boolean;
  spaceSlug?: string;
  showVoting?: boolean;
}

const statusColors: Record<ProposalStatus, string> = {
  RANKING: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  VOTING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  PASSED: "bg-green-500/10 text-green-600 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const statusLabels: Record<ProposalStatus, string> = {
  RANKING: "Ranking",
  VOTING: "Voting",
  PASSED: "Passed",
  FAILED: "Failed",
  ARCHIVED: "Archived",
};

export function ProposalCard({
  proposal,
  userVote,
  availableCredits,
  isAuthenticated = false,
  spaceSlug,
  showVoting = true,
}: ProposalCardProps) {
  const [score, setScore] = useState(proposal.score);
  const [currentVote, setCurrentVote] = useState(userVote);

  const createdAt =
    typeof proposal.createdAt === "string"
      ? new Date(proposal.createdAt)
      : proposal.createdAt;

  const votingEndsAt = proposal.votingEndsAt
    ? typeof proposal.votingEndsAt === "string"
      ? new Date(proposal.votingEndsAt)
      : proposal.votingEndsAt
    : null;

  function handleVote(newScore: number, newWeight: number) {
    setScore(newScore);
    setCurrentVote(
      newWeight !== 0
        ? { weight: newWeight, effectiveWeight: newWeight }
        : undefined
    );
  }

  const isRanking = proposal.status === "RANKING";
  const isVoting = proposal.status === "VOTING";
  const progressToVoting = isRanking ? Math.min((score / 100) * 100, 100) : 100;

  const hasVoted = currentVote && currentVote.weight !== 0;
  const isUpvoted = hasVoted && currentVote.weight > 0;
  const isDownvoted = hasVoted && currentVote.weight < 0;

  return (
    <div className={`flex rounded-xl border bg-card shadow-sm overflow-hidden transition-all ${
      isUpvoted ? "ring-1 ring-orange-500/30" : isDownvoted ? "ring-1 ring-blue-500/30" : ""
    }`}>
      {showVoting && isRanking && (
        <div className="flex items-center justify-center py-3 px-4 bg-muted/50 border-r min-w-[80px]">
          <VoteButtons
            proposalId={proposal.id}
            currentScore={score}
            userVote={currentVote}
            availableCredits={availableCredits}
            isAuthenticated={isAuthenticated}
            onVote={handleVote}
          />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/proposals/${proposal.id}`}
              className="hover:underline"
            >
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {proposal.title}
              </h3>
            </Link>
            <Badge variant="outline" className={statusColors[proposal.status]}>
              {statusLabels[proposal.status]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {proposal.description}
          </p>

          {isRanking && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Progress to voting
                </span>
                <span className={isUpvoted ? "text-orange-500 font-medium" : isDownvoted ? "text-blue-500 font-medium" : ""}>
                  {score}/100
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isUpvoted ? "bg-orange-500" : isDownvoted ? "bg-blue-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressToVoting}%` }}
                />
              </div>
            </div>
          )}

          {isVoting && votingEndsAt && (
            <div className="mt-3 flex items-center gap-1 text-sm text-yellow-600">
              <Clock className="h-4 w-4" />
              Voting ends {formatDistanceToNow(votingEndsAt, { addSuffix: true })}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {proposal.author.name || proposal.author.email.split("@")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
