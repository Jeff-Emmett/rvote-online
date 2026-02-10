import { differenceInDays, addDays } from "date-fns";

// Votes start decaying after this many days
export const DECAY_START_DAYS = 30;

// Votes are fully decayed (0 weight) after this many days
export const DECAY_END_DAYS = 60;

// Score threshold to promote proposal to voting stage
export const PROMOTION_THRESHOLD = 100;

// Voting period duration in days
export const VOTING_PERIOD_DAYS = 7;

/**
 * Calculate the effective weight of a vote after decay
 * Returns a value between 0 and the original weight
 */
export function getEffectiveWeight(
  originalWeight: number,
  createdAt: Date
): number {
  const age = differenceInDays(new Date(), createdAt);

  // No decay if vote is younger than decay start
  if (age < DECAY_START_DAYS) {
    return originalWeight;
  }

  // Fully decayed if older than decay end
  if (age >= DECAY_END_DAYS) {
    return 0;
  }

  // Linear decay between start and end
  const decayProgress =
    (age - DECAY_START_DAYS) / (DECAY_END_DAYS - DECAY_START_DAYS);
  return Math.round(originalWeight * (1 - decayProgress));
}

/**
 * Calculate the decay percentage (0-100) for display
 */
export function getDecayPercentage(createdAt: Date): number {
  const age = differenceInDays(new Date(), createdAt);

  if (age < DECAY_START_DAYS) {
    return 0;
  }

  if (age >= DECAY_END_DAYS) {
    return 100;
  }

  const decayProgress =
    (age - DECAY_START_DAYS) / (DECAY_END_DAYS - DECAY_START_DAYS);
  return Math.round(decayProgress * 100);
}

/**
 * Calculate when a vote will start decaying
 */
export function getDecayStartDate(createdAt: Date): Date {
  return addDays(createdAt, DECAY_START_DAYS);
}

/**
 * Calculate when a vote will be fully decayed
 */
export function getFullDecayDate(createdAt: Date): Date {
  return addDays(createdAt, DECAY_END_DAYS);
}

/**
 * Check if a proposal should be promoted to voting stage
 */
export function shouldPromote(score: number, threshold: number = PROMOTION_THRESHOLD): boolean {
  return score >= threshold;
}

/**
 * Calculate the voting end date from promotion time
 */
export function getVotingEndDate(promotedAt: Date = new Date(), periodDays: number = VOTING_PERIOD_DAYS): Date {
  return addDays(promotedAt, periodDays);
}

/**
 * Calculate the result of a pass/fail vote
 */
export function calculateVoteResult(
  yesVotes: number,
  noVotes: number
): "PASSED" | "FAILED" | "TIE" {
  if (yesVotes > noVotes) {
    return "PASSED";
  }
  if (noVotes > yesVotes) {
    return "FAILED";
  }
  return "TIE";
}
