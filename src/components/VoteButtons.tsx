"use client";

import { useState } from "react";
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
  onVote?: (newScore: number, newWeight: number) => void;
  disabled?: boolean;
}

export function VoteButtons({
  proposalId,
  currentScore,
  userVote,
  availableCredits,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
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

  function incrementVote() {
    const newWeight = pendingWeight + 1;
    const newCost = calculateVoteCost(Math.abs(newWeight));
    if (newCost <= availableCredits) {
      setPendingWeight(newWeight);
    }
  }

  function decrementVote() {
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

  // Preview score with pending vote
  const previewScore = hasPending ? currentScore + pendingWeight : currentScore;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Up arrow */}
      <Button
        variant={votedUp ? "default" : pendingWeight > 0 ? "outline" : "ghost"}
        size="sm"
        className={`h-8 w-8 p-0 ${pendingWeight > 0 ? "border-primary bg-primary/10" : ""}`}
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
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </Button>

      {/* Score display */}
      <Badge
        variant={hasPending ? "default" : "outline"}
        className={`font-mono text-lg px-2 min-w-[3rem] justify-center transition-all ${
          hasPending
            ? pendingWeight > 0
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
            : ""
        }`}
      >
        {hasPending ? (
          <span className="flex items-center gap-1">
            <span className="text-xs opacity-70">{currentScore}</span>
            <span>→</span>
            <span>{previewScore}</span>
          </span>
        ) : (
          currentScore
        )}
      </Badge>

      {/* Down arrow */}
      <Button
        variant={votedDown ? "destructive" : pendingWeight < 0 ? "outline" : "ghost"}
        size="sm"
        className={`h-8 w-8 p-0 ${pendingWeight < 0 ? "border-destructive bg-destructive/10" : ""}`}
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
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {/* Existing vote display */}
      {hasVoted && !hasPending && (
        <span className="text-xs text-muted-foreground">
          Your vote: {userVote.effectiveWeight > 0 ? "+" : ""}
          {userVote.effectiveWeight}
        </span>
      )}

      {/* Pending vote info and confirm/cancel */}
      {hasPending && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="text-xs font-medium">
            {pendingWeight > 0 ? "+" : ""}{pendingWeight} vote{Math.abs(pendingWeight) !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {pendingCost} credit{pendingCost !== 1 ? "s" : ""}
          </span>
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
              variant={pendingWeight > 0 ? "default" : "destructive"}
              size="sm"
              className="h-6 px-2 text-xs"
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
