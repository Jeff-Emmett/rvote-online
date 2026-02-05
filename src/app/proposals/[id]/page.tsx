import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteButtons } from "@/components/VoteButtons";
import { FinalVotePanel } from "@/components/FinalVotePanel";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight, getDecayPercentage } from "@/lib/voting";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, User, Clock, TrendingUp } from "lucide-react";
import { ProposalStatus } from "@prisma/client";

const statusColors: Record<ProposalStatus, string> = {
  RANKING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VOTING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PASSED: "bg-green-500/10 text-green-500 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      votes: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { weight: "desc" },
      },
      finalVotes: true,
    },
  });

  if (!proposal) {
    notFound();
  }

  // Get user's credits and vote
  let availableCredits = 0;
  let userVote: { weight: number; effectiveWeight: number } | undefined;
  let userFinalVote: "YES" | "NO" | "ABSTAIN" | undefined;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, lastCreditAt: true },
    });

    if (user) {
      availableCredits = calculateAvailableCredits(user.credits, user.lastCreditAt);
    }

    const existingVote = proposal.votes.find((v) => v.userId === session.user.id);
    if (existingVote) {
      userVote = {
        weight: existingVote.weight,
        effectiveWeight: getEffectiveWeight(existingVote.weight, existingVote.createdAt),
      };
    }

    const existingFinalVote = proposal.finalVotes.find(
      (v) => v.userId === session.user.id
    );
    if (existingFinalVote) {
      userFinalVote = existingFinalVote.vote;
    }
  }

  // Calculate final vote counts
  const finalVoteCounts = proposal.finalVotes.reduce(
    (acc, fv) => {
      acc[fv.vote.toLowerCase() as "yes" | "no" | "abstain"]++;
      acc.total++;
      return acc;
    },
    { yes: 0, no: 0, abstain: 0, total: 0 }
  );

  // Calculate effective score
  const effectiveScore = proposal.votes.reduce((sum, v) => {
    return sum + getEffectiveWeight(v.weight, v.createdAt);
  }, 0);

  const isRanking = proposal.status === "RANKING";
  const isVoting = proposal.status === "VOTING";
  const isCompleted = proposal.status === "PASSED" || proposal.status === "FAILED";
  const progressToVoting = Math.min((effectiveScore / 100) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/proposals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                <Badge variant="outline" className={statusColors[proposal.status]}>
                  {proposal.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {proposal.author.name || proposal.author.email.split("@")[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(proposal.createdAt, { addSuffix: true })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{proposal.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Votes list for ranking stage */}
          {isRanking && proposal.votes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposal.votes.slice(0, 10).map((vote) => {
                    const effectiveWeight = getEffectiveWeight(
                      vote.weight,
                      vote.createdAt
                    );
                    const decayPct = getDecayPercentage(vote.createdAt);
                    return (
                      <div
                        key={vote.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={vote.weight > 0 ? "default" : "destructive"}
                          >
                            {vote.weight > 0 ? "+" : ""}
                            {effectiveWeight}
                          </Badge>
                          <span className="text-sm">
                            {vote.user.name || "Anonymous"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {decayPct > 0 && (
                            <span className="text-yellow-600">
                              {decayPct}% decayed •{" "}
                            </span>
                          )}
                          {formatDistanceToNow(vote.createdAt, {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ranking vote panel */}
          {isRanking && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ranking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <VoteButtons
                    proposalId={proposal.id}
                    currentScore={effectiveScore}
                    userVote={userVote}
                    availableCredits={availableCredits}
                    disabled={!session?.user}
                  />
                </div>

                {!session?.user && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link href="/auth/signin" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to vote
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Progress to voting
                    </span>
                    <span className="font-mono">{effectiveScore}/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressToVoting}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>{proposal.votes.length}</strong> votes cast
                  </p>
                  {session?.user && (
                    <p>
                      You have <strong>{availableCredits}</strong> credits
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pass/fail vote panel */}
          {isVoting && proposal.votingEndsAt && (
            <FinalVotePanel
              proposalId={proposal.id}
              votingEndsAt={proposal.votingEndsAt}
              votes={finalVoteCounts}
              userVote={userFinalVote}
            />
          )}

          {/* Completed result */}
          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge
                    variant={proposal.status === "PASSED" ? "default" : "destructive"}
                    className="text-lg px-4 py-1"
                  >
                    {proposal.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-green-500">
                      {finalVoteCounts.yes}
                    </div>
                    <div className="text-muted-foreground">Yes</div>
                  </div>
                  <div>
                    <div className="font-bold text-red-500">
                      {finalVoteCounts.no}
                    </div>
                    <div className="text-muted-foreground">No</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-500">
                      {finalVoteCounts.abstain}
                    </div>
                    <div className="text-muted-foreground">Abstain</div>
                  </div>
                </div>

                {proposal.votingEndsAt && (
                  <p className="text-xs text-muted-foreground text-center">
                    Voting ended {format(proposal.votingEndsAt, "PPP")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(proposal.createdAt, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>{format(proposal.updatedAt, "PPP")}</span>
              </div>
              {proposal.votingEndsAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isVoting ? "Voting ends" : "Voting ended"}
                  </span>
                  <span>{format(proposal.votingEndsAt, "PPP")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
