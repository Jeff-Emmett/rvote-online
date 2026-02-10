"use client";

import { createContext, useContext, ReactNode } from "react";

interface SpaceContextValue {
  space: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isPublic: boolean;
    promotionThreshold: number;
    votingPeriodDays: number;
    creditsPerDay: number;
    maxCredits: number;
    startingCredits: number;
  };
  membership: {
    id: string;
    role: "ADMIN" | "MEMBER";
    credits: number;
  } | null;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

export function SpaceProvider({
  space,
  membership,
  children,
}: SpaceContextValue & { children: ReactNode }) {
  return (
    <SpaceContext.Provider value={{ space, membership }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpace must be used within SpaceProvider");
  return ctx;
}
