import { Proposal, User, Vote, FinalVote, ProposalStatus, VoteChoice } from "@prisma/client";

// Extended types with relations
export type ProposalWithAuthor = Proposal & {
  author: Pick<User, "id" | "name" | "email">;
};

export type ProposalWithVotes = Proposal & {
  votes: Vote[];
  finalVotes: FinalVote[];
  author: Pick<User, "id" | "name" | "email">;
};

export type VoteWithUser = Vote & {
  user: Pick<User, "id" | "name">;
};

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Vote request types
export interface CastVoteRequest {
  weight: number; // Positive for upvote, negative for downvote
}

export interface CastFinalVoteRequest {
  vote: VoteChoice;
}

// User credit info
export interface UserCredits {
  stored: number;
  available: number;
  earnedSinceLastClaim: number;
  maxAffordableVote: number;
}

// Proposal list filters
export interface ProposalFilters {
  status?: ProposalStatus;
  authorId?: string;
  sortBy?: "score" | "createdAt" | "votingEndsAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Vote summary for a proposal
export interface VoteSummary {
  totalScore: number;
  upvotes: number;
  downvotes: number;
  voterCount: number;
  userVote?: {
    weight: number;
    creditCost: number;
    effectiveWeight: number;
    decayPercentage: number;
  };
}

// Final vote summary
export interface FinalVoteSummary {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  userVote?: VoteChoice;
  timeRemaining?: number; // milliseconds
  result?: "PASSED" | "FAILED" | "TIE" | "PENDING";
}

// Re-export Prisma types for convenience
export { ProposalStatus, VoteChoice } from "@prisma/client";
export type { Proposal, User, Vote, FinalVote };
