import { differenceInHours } from "date-fns";

// Default credits earned per day (can be overridden per-space)
export const CREDITS_PER_DAY = 10;

// Default maximum credits a user can accumulate (can be overridden per-space)
export const MAX_CREDITS = 500;

/**
 * Calculate total available credits for a user.
 * Accepts optional per-space config overrides.
 */
export function calculateAvailableCredits(
  storedCredits: number,
  lastCreditAt: Date,
  creditsPerDay: number = CREDITS_PER_DAY,
  maxCredits: number = MAX_CREDITS
): number {
  const hoursSinceLastClaim = differenceInHours(new Date(), lastCreditAt);
  const earnedCredits = Math.floor((hoursSinceLastClaim / 24) * creditsPerDay);
  const totalCredits = storedCredits + earnedCredits;
  return Math.min(totalCredits, maxCredits);
}

/**
 * Calculate the quadratic cost of a vote.
 * Cost = weight^2 (1 vote = 1 credit, 2 votes = 4, 3 votes = 9, etc.)
 */
export function calculateVoteCost(weight: number): number {
  return Math.pow(Math.abs(weight), 2);
}

/**
 * Calculate the maximum vote weight a user can afford.
 */
export function maxAffordableWeight(availableCredits: number): number {
  return Math.floor(Math.sqrt(availableCredits));
}

/**
 * Calculate credits to return when a vote fully decays.
 */
export function calculateDecayedCredits(creditCost: number): number {
  return creditCost;
}
