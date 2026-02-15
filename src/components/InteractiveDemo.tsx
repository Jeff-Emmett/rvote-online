"use client";

import { useDemoSync, DemoShape } from "@/lib/demo-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  RotateCcw,
  Vote,
  Users,
  Clock,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface PollOption {
  label: string;
  votes: number;
}

interface DemoPoll extends DemoShape {
  question: string;
  options: PollOption[];
  totalVoters: number;
  status: "active" | "closed";
  endsAt: string;
}

function isPoll(shape: DemoShape): shape is DemoPoll {
  return shape.type === "demo-poll" && Array.isArray((shape as DemoPoll).options);
}

// ── Component ────────────────────────────────────────────────────────

export function InteractiveDemo() {
  const { shapes, updateShape, connected, resetDemo } = useDemoSync({
    filter: ["demo-poll"],
  });

  const polls = Object.values(shapes).filter(isPoll);
  const loading = !connected && polls.length === 0;

  function handleVote(poll: DemoPoll, optionIndex: number, delta: number) {
    const updatedOptions = poll.options.map((opt, i) => {
      if (i !== optionIndex) return opt;
      return { ...opt, votes: Math.max(0, opt.votes + delta) };
    });
    updateShape(poll.id, { options: updatedOptions });
  }

  async function handleReset() {
    try {
      await resetDemo();
    } catch (err) {
      console.error("Reset failed:", err);
    }
  }

  // Total votes across all options in a poll
  function totalVotes(poll: DemoPoll): number {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  }

  // Format the deadline
  function formatDeadline(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return "Voting closed";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? "s" : ""} left`;
  }

  return (
    <div className="space-y-6">
      {/* Connection status + Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              connected
                ? "border-green-500/50 text-green-600 bg-green-500/10"
                : "border-red-500/50 text-red-600 bg-red-500/10"
            }
          >
            {connected ? (
              <Wifi className="h-3 w-3 mr-1" />
            ) : (
              <WifiOff className="h-3 w-3 mr-1" />
            )}
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
            Live — synced across all r* demos
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-orange-500/30 hover:bg-orange-500/10"
          disabled={!connected}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Demo
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-muted-foreground">Connecting to rSpace...</p>
          </CardContent>
        </Card>
      )}

      {/* No polls found */}
      {!loading && polls.length === 0 && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-12 text-center">
            <Vote className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No polls found. Try resetting the demo.</p>
          </CardContent>
        </Card>
      )}

      {/* Poll cards */}
      {polls.map((poll) => {
        const total = totalVotes(poll);
        const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

        return (
          <Card key={poll.id} className="border-2 border-orange-500/20 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight flex items-center gap-2">
                    <Vote className="h-5 w-5 text-orange-500 shrink-0" />
                    {poll.question}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={poll.status === "active" ? "default" : "secondary"}
                    className={
                      poll.status === "active"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : ""
                    }
                  >
                    {poll.status === "active" ? "Active" : "Closed"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {poll.totalVoters} voters
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDeadline(poll.endsAt)}
                </span>
                <span className="ml-auto tabular-nums font-medium text-foreground/70">
                  {total} total vote{total !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {poll.options.map((option, idx) => {
                const pct = total > 0 ? (option.votes / total) * 100 : 0;
                const barWidth = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 group"
                  >
                    {/* Vote buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-all"
                        onClick={() => handleVote(poll, idx, -1)}
                        disabled={!connected || option.votes <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold tabular-nums text-sm">
                        {option.votes}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-all"
                        onClick={() => handleVote(poll, idx, 1)}
                        disabled={!connected}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Option label + progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate pr-2">
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300 ease-out"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
