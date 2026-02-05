"use client";

import { ProposalCard } from "./ProposalCard";
import { ProposalStatus } from "@prisma/client";

interface Proposal {
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
}

interface UserVote {
  proposalId: string;
  weight: number;
  effectiveWeight: number;
}

interface ProposalListProps {
  proposals: Proposal[];
  userVotes?: UserVote[];
  availableCredits: number;
  emptyMessage?: string;
}

export function ProposalList({
  proposals,
  userVotes = [],
  availableCredits,
  emptyMessage = "No proposals found.",
}: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const voteMap = new Map(userVotes.map((v) => [v.proposalId, v]));

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          userVote={voteMap.get(proposal.id)}
          availableCredits={availableCredits}
        />
      ))}
    </div>
  );
}
