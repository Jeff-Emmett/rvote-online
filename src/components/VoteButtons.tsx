"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Loader2, Check, X } from "lucide-react";
import { calculateVoteCost, maxAffordableWeight } from "@/lib/credits";
import { toast } from "sonner";

interface VoteButtonsProps {
  proposalId: string;
  currentScore: number;
  userVote?: {
    weight: number;
    effectiveWeight: number;
  };
  availableCredits: number;
  isAuthenticated?: boolean;
  spaceSlug?: string;
  onVote?: (newScore: number, newWeight: number) => void;
  disabled?: boolean;
}

export function VoteButtons({
  proposalId,
  currentScore,
  userVote,
  availableCredits,
  isAuthenticated = true,
  spaceSlug,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
  const router = useRouter();
  const [isVoting, setIsVoting] = useState(false);
  const [pendingWeight, setPendingWeight] = useState(0);

  const maxWeight = maxAffordableWeight(availableCredits);
  const pendingCost = calculateVoteCost(Math.abs(pendingWeight));
  const canAfford = pendingCost <= availableCredits;

  async function submitVote() {
    if (pendingWeight === 0) return;

    setIsVoting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: pendingWeight }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to vote");
      }

      const data = await res.json();
      toast.success(`Vote cast! Cost: ${pendingCost} credits`);
      onVote?.(data.newScore, pendingWeight);
      setPendingWeight(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  }

  async function removeVote() {
    setIsVoting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove vote");
      }

      const data = await res.json();
      toast.success("Vote removed, credits returned");
      onVote?.(data.newScore, 0);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove vote"
      );
    } finally {
      setIsVoting(false);
    }
  }

  function requireAuth(): boolean {
    if (!isAuthenticated) {
      toast.error("Sign in to vote on proposals");
      router.push("/auth/signin");
      return false;
    }
    return true;
  }

  function incrementVote() {
    if (!requireAuth()) return;
    const newWeight = pendingWeight + 1;
    const newCost = calculateVoteCost(Math.abs(newWeight));
    if (newCost <= availableCredits) {
      setPendingWeight(newWeight);
    }
  }

  function decrementVote() {
    if (!requireAuth()) return;
    const newWeight = pendingWeight - 1;
    const newCost = calculateVoteCost(Math.abs(newWeight));
    if (newCost <= availableCredits) {
      setPendingWeight(newWeight);
    }
  }

  function cancelPending() {
    setPendingWeight(0);
  }

  const hasVoted = userVote && userVote.weight !== 0;
  const votedUp = hasVoted && userVote.weight > 0;
  const votedDown = hasVoted && userVote.weight < 0;
  const hasPending = pendingWeight !== 0;

  const isUpvoted = votedUp || pendingWeight > 0;
  const isDownvoted = votedDown || pendingWeight < 0;

  // Preview score with pending vote
  const previewScore = hasPending ? currentScore + pendingWeight : currentScore;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Up arrow */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 rounded-md transition-all ${
          isUpvoted
            ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20"
            : "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
        } ${(hasVoted && !votedUp) ? "opacity-30 pointer-events-none" : ""}`}
        onClick={() => {
          if (votedUp) {
            removeVote();
          } else if (!hasPending || pendingWeight > 0) {
            incrementVote();
          }
        }}
        disabled={disabled || isVoting || (hasVoted && !votedUp)}
        title={votedUp ? "Remove upvote" : "Add upvote"}
      >
        {isVoting && votedUp ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ChevronUp className="h-7 w-7" strokeWidth={2.5} />
        )}
      </Button>

      {/* Score display */}
      <span className={`font-bold text-xl tabular-nums py-1 min-w-[3ch] text-center ${
        isUpvoted ? "text-orange-500" : isDownvoted ? "text-blue-500" : "text-foreground"
      }`}>
        {previewScore}
      </span>

      {/* Down arrow */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 rounded-md transition-all ${
          isDownvoted
            ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
            : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
        } ${(hasVoted && !votedDown) ? "opacity-30 pointer-events-none" : ""}`}
        onClick={() => {
          if (votedDown) {
            removeVote();
          } else if (!hasPending || pendingWeight < 0) {
            decrementVote();
          }
        }}
        disabled={disabled || isVoting || (hasVoted && !votedDown)}
        title={votedDown ? "Remove downvote" : "Add downvote"}
      >
        {isVoting && votedDown ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ChevronDown className="h-7 w-7" strokeWidth={2.5} />
        )}
      </Button>

      {/* Existing vote display */}
      {hasVoted && !hasPending && (
        <Badge
          variant="secondary"
          className={`text-xs mt-1 ${
            votedUp
              ? "bg-orange-500/20 text-orange-600"
              : "bg-blue-500/20 text-blue-600"
          }`}
        >
          {userVote.effectiveWeight > 0 ? "+" : ""}
          {userVote.effectiveWeight}
        </Badge>
      )}

      {/* Pending vote info and confirm/cancel */}
      {hasPending && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <Badge
            variant="outline"
            className={`text-xs ${
              pendingWeight > 0
                ? "border-orange-500/50 text-orange-600 bg-orange-500/10"
                : "border-blue-500/50 text-blue-600 bg-blue-500/10"
            }`}
          >
            {pendingWeight > 0 ? "+" : ""}{pendingWeight} = {pendingCost}¢
          </Badge>
          <div className="flex gap-1 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={cancelPending}
              title="Cancel"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className={`h-6 px-2 text-xs ${
                pendingWeight > 0
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={submitVote}
              disabled={isVoting || !canAfford}
              title="Confirm vote"
            >
              {isVoting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Cast
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
