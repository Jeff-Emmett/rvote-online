import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default async function VotingPage() {
  const session = await auth();

  // Get proposals in voting stage
  const votingProposals = await prisma.proposal.findMany({
    where: { status: "VOTING" },
    orderBy: { votingEndsAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      finalVotes: {
        select: { vote: true },
      },
    },
  });

  // Get user's final votes if logged in
  let userVotes: Record<string, string> = {};
  if (session?.user?.id) {
    const votes = await prisma.finalVote.findMany({
      where: {
        userId: session.user.id,
        proposalId: { in: votingProposals.map((p) => p.id) },
      },
    });
    userVotes = Object.fromEntries(votes.map((v) => [v.proposalId, v.vote]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Voting</h1>
        <p className="text-muted-foreground">
          Proposals in the pass/fail voting stage. Vote Yes, No, or Abstain.
        </p>
      </div>

      {!session?.user && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="py-4">
            <p className="text-sm">
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to cast your vote on these proposals.
            </p>
          </CardContent>
        </Card>
      )}

      {votingProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No proposals are currently in the voting stage.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/proposals">Browse Proposals</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {votingProposals.map((proposal) => {
            const voteCounts = proposal.finalVotes.reduce(
              (acc, fv) => {
                acc[fv.vote.toLowerCase() as "yes" | "no" | "abstain"]++;
                acc.total++;
                return acc;
              },
              { yes: 0, no: 0, abstain: 0, total: 0 }
            );

            const yesPercentage =
              voteCounts.total > 0
                ? Math.round((voteCounts.yes / voteCounts.total) * 100)
                : 50;

            const hasVoted = userVotes[proposal.id];
            const timeRemaining = proposal.votingEndsAt
              ? formatDistanceToNow(proposal.votingEndsAt, { addSuffix: true })
              : "Unknown";

            return (
              <Card key={proposal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-lg">
                          {proposal.title}
                        </CardTitle>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        by{" "}
                        {proposal.author.name ||
                          proposal.author.email.split("@")[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <Clock className="h-4 w-4" />
                      Ends {timeRemaining}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {proposal.description}
                  </p>

                  {/* Vote progress bar */}
                  <div className="space-y-2">
                    <div className="h-3 rounded-full overflow-hidden bg-red-500/20 flex">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${yesPercentage}%` }}
                      />
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${100 - yesPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {voteCounts.yes} Yes ({yesPercentage}%)
                      </span>
                      <span>{voteCounts.total} total votes</span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {voteCounts.no} No ({100 - yesPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {hasVoted ? (
                      <Badge variant="secondary">
                        You voted: {hasVoted}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {session?.user
                          ? "You haven't voted yet"
                          : "Sign in to vote"}
                      </span>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/proposals/${proposal.id}`}>
                        {hasVoted ? "Change Vote" : "Vote Now"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
