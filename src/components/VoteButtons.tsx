"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voteDirection, setVoteDirection] = useState<"up" | "down">("up");
  const [voteWeight, setVoteWeight] = useState(1);

  const maxWeight = maxAffordableWeight(availableCredits);
  const voteCost = calculateVoteCost(voteWeight);

  async function submitVote() {
    setIsVoting(true);
    try {
      const weight = voteDirection === "up" ? voteWeight : -voteWeight;
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to vote");
      }

      const data = await res.json();
      toast.success(`Vote cast! Cost: ${voteCost} credits`);
      onVote?.(data.newScore, weight);
      setDialogOpen(false);
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

  function openVoteDialog(direction: "up" | "down") {
    setVoteDirection(direction);
    setVoteWeight(1);
    setDialogOpen(true);
  }

  const hasVoted = userVote && userVote.weight !== 0;
  const votedUp = hasVoted && userVote.weight > 0;
  const votedDown = hasVoted && userVote.weight < 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={votedUp ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => (votedUp ? removeVote() : openVoteDialog("up"))}
        disabled={disabled || isVoting || (!votedUp && maxWeight < 1)}
        title={votedUp ? "Remove upvote" : "Upvote"}
      >
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </Button>

      <Badge variant="outline" className="font-mono text-lg px-2 min-w-[3rem] justify-center">
        {currentScore}
      </Badge>

      <Button
        variant={votedDown ? "destructive" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => (votedDown ? removeVote() : openVoteDialog("down"))}
        disabled={disabled || isVoting || (!votedDown && maxWeight < 1)}
        title={votedDown ? "Remove downvote" : "Downvote"}
      >
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {hasVoted && (
        <span className="text-xs text-muted-foreground">
          Your vote: {userVote.effectiveWeight > 0 ? "+" : ""}
          {userVote.effectiveWeight}
        </span>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {voteDirection === "up" ? "Upvote" : "Downvote"} Proposal
            </DialogTitle>
            <DialogDescription>
              Choose your vote weight. Cost increases quadratically (weight² credits).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight
              </Label>
              <Input
                id="weight"
                type="number"
                min={1}
                max={maxWeight}
                value={voteWeight}
                onChange={(e) =>
                  setVoteWeight(
                    Math.max(1, Math.min(maxWeight, parseInt(e.target.value) || 1))
                  )
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm text-muted-foreground">
                Cost
              </span>
              <span className="col-span-3 font-mono">
                {voteCost} credits (you have {availableCredits})
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Quick reference:</p>
              <ul className="list-disc list-inside mt-1">
                <li>1 vote = 1 credit</li>
                <li>2 votes = 4 credits</li>
                <li>3 votes = 9 credits</li>
                <li>Max you can afford: {maxWeight} votes ({calculateVoteCost(maxWeight)} credits)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitVote}
              disabled={isVoting || voteWeight < 1 || voteCost > availableCredits}
              variant={voteDirection === "up" ? "default" : "destructive"}
            >
              {isVoting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {voteDirection === "up" ? "Upvote" : "Downvote"} ({voteCost} credits)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
