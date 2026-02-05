"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

interface CreditInfo {
  available: number;
  stored: number;
}

export function CreditDisplay() {
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          setCredits(data);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
    // Refresh every minute to show earned credits
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Badge variant="secondary" className="h-7 px-3 animate-pulse">
        <Coins className="h-3 w-3 mr-1" />
        ...
      </Badge>
    );
  }

  if (!credits) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="h-7 px-3 font-mono"
      title={`${credits.available} credits available (${credits.stored} stored)`}
    >
      <Coins className="h-3 w-3 mr-1" />
      {credits.available}
    </Badge>
  );
}
