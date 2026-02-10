"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VoteChoice } from "@prisma/client";
import { Check, X, Minus, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface FinalVotePanelProps {
  proposalId: string;
  votingEndsAt?: Date | string;
  votes?: {
    yes: number;
    no: number;
    abstain: number;
    total: number;
  };
  userVote?: VoteChoice;
  isAuthenticated?: boolean;
  spaceSlug?: string;
  result?: "PASSED" | "FAILED" | null;
  onVote?: (newVotes: { yes: number; no: number; abstain: number; total: number }, userVote: VoteChoice) => void;
}

export function FinalVotePanel({
  proposalId,
  votingEndsAt,
  votes: initialVotes = { yes: 0, no: 0, abstain: 0, total: 0 },
  userVote: initialUserVote,
  isAuthenticated = true,
  spaceSlug,
  result,
  onVote,
}: FinalVotePanelProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const endDate = votingEndsAt
    ? (typeof votingEndsAt === "string" ? new Date(votingEndsAt) : votingEndsAt)
    : null;
  const isEnded = endDate ? endDate < new Date() : false;
  const canVote = !isEnded && !result;

  const yesPercentage = votes.total > 0 ? (votes.yes / votes.total) * 100 : 50;
  const noPercentage = votes.total > 0 ? (votes.no / votes.total) * 100 : 50;

  async function castVote(vote: VoteChoice) {
    setIsVoting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/final-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to vote");
      }

      const data = await res.json();
      setVotes(data.votes);
      setUserVote(vote);
      onVote?.(data.votes, vote);
      toast.success("Vote cast successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pass/Fail Vote</CardTitle>
          {result ? (
            <Badge variant={result === "PASSED" ? "default" : "destructive"}>
              {result}
            </Badge>
          ) : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {!endDate ? "Open" : isEnded ? "Voting ended" : `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vote counts */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{votes.yes}</div>
            <div className="text-sm text-muted-foreground">Yes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{votes.no}</div>
            <div className="text-sm text-muted-foreground">No</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{votes.abstain}</div>
            <div className="text-sm text-muted-foreground">Abstain</div>
          </div>
        </div>

        {/* Progress bar */}
        {votes.total > 0 && (
          <div className="space-y-1">
            <div className="h-3 rounded-full overflow-hidden bg-red-500/20 flex">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${yesPercentage}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(yesPercentage)}% Yes</span>
              <span>{Math.round(noPercentage)}% No</span>
            </div>
          </div>
        )}

        {/* Vote buttons */}
        {canVote && (
          <div className="space-y-2">
            {userVote && (
              <p className="text-sm text-muted-foreground text-center">
                You voted: <Badge variant="outline">{userVote}</Badge>
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={userVote === "YES" ? "default" : "outline"}
                className="flex-col h-auto py-3"
                onClick={() => castVote("YES")}
                disabled={isVoting}
              >
                {isVoting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                <span className="text-xs mt-1">Yes</span>
              </Button>
              <Button
                variant={userVote === "NO" ? "destructive" : "outline"}
                className="flex-col h-auto py-3"
                onClick={() => castVote("NO")}
                disabled={isVoting}
              >
                {isVoting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span className="text-xs mt-1">No</span>
              </Button>
              <Button
                variant={userVote === "ABSTAIN" ? "secondary" : "outline"}
                className="flex-col h-auto py-3"
                onClick={() => castVote("ABSTAIN")}
                disabled={isVoting}
              >
                {isVoting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Minus className="h-5 w-5" />
                )}
                <span className="text-xs mt-1">Abstain</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              One member = one vote. You can change your vote until voting ends.
            </p>
          </div>
        )}

        {!canVote && !result && (
          <p className="text-sm text-muted-foreground text-center">
            Voting has ended. Results are being tallied.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
