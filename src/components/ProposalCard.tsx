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
  showVoting?: boolean;
}

const statusColors: Record<ProposalStatus, string> = {
  RANKING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VOTING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PASSED: "bg-green-500/10 text-green-500 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
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

  return (
    <Card className="flex">
      {showVoting && isRanking && (
        <div className="flex items-center justify-center px-4 border-r bg-muted/30">
          <VoteButtons
            proposalId={proposal.id}
            currentScore={score}
            userVote={currentVote}
            availableCredits={availableCredits}
            onVote={handleVote}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <CardHeader className="pb-2">
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
                <span>{score}/100</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
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

        <CardFooter className="pt-2 text-xs text-muted-foreground">
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
    </Card>
  );
}
