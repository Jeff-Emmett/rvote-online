import { differenceInDays, differenceInHours } from "date-fns";

// Credits earned per day
export const CREDITS_PER_DAY = 10;

// Maximum credits a user can accumulate
export const MAX_CREDITS = 500;

/**
 * Calculate total available credits for a user
 * Includes stored credits plus earned credits since last claim
 */
export function calculateAvailableCredits(
  storedCredits: number,
  lastCreditAt: Date
): number {
  const hoursSinceLastClaim = differenceInHours(new Date(), lastCreditAt);
  const earnedCredits = Math.floor((hoursSinceLastClaim / 24) * CREDITS_PER_DAY);
  const totalCredits = storedCredits + earnedCredits;
  return Math.min(totalCredits, MAX_CREDITS);
}

/**
 * Calculate the quadratic cost of a vote
 * Cost = weight^2 (1 vote = 1 credit, 2 votes = 4, 3 votes = 9, etc.)
 */
export function calculateVoteCost(weight: number): number {
  return Math.pow(Math.abs(weight), 2);
}

/**
 * Calculate the maximum vote weight a user can afford
 */
export function maxAffordableWeight(availableCredits: number): number {
  return Math.floor(Math.sqrt(availableCredits));
}

/**
 * Calculate credits to return when a vote fully decays
 */
export function calculateDecayedCredits(creditCost: number): number {
  // Return the full credit cost when vote decays
  return creditCost;
}
