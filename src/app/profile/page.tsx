import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateAvailableCredits, CREDITS_PER_DAY, MAX_CREDITS } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Coins, FileText, Vote, TrendingUp, Clock } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      proposals: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          score: true,
          createdAt: true,
        },
      },
      votes: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
      finalVotes: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const availableCredits = calculateAvailableCredits(user.credits, user.lastCreditAt);
  const creditProgress = (availableCredits / MAX_CREDITS) * 100;

  // Calculate total credits spent
  const totalCreditsSpent = user.votes.reduce((sum, v) => sum + v.creditCost, 0);

  // Count stats
  const proposalCount = user.proposals.length;
  const rankingVotes = user.votes.length;
  const finalVotes = user.finalVotes.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          {user.name || user.email} • Member since{" "}
          {format(user.createdAt, "MMMM yyyy")}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCredits}</div>
            <Progress value={creditProgress} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              +{CREDITS_PER_DAY}/day (max {MAX_CREDITS})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposalCount}</div>
            <p className="text-xs text-muted-foreground">created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ranking Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankingVotes}</div>
            <p className="text-xs text-muted-foreground">
              {totalCreditsSpent} credits spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Final Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalVotes}</div>
            <p className="text-xs text-muted-foreground">pass/fail votes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your proposals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Proposals</CardTitle>
            <CardDescription>Proposals you&apos;ve created</CardDescription>
          </CardHeader>
          <CardContent>
            {user.proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any proposals yet.
              </p>
            ) : (
              <div className="space-y-3">
                {user.proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/proposals/${proposal.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm line-clamp-1">
                        {proposal.title}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {proposal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Score: {proposal.score}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(proposal.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent votes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Votes</CardTitle>
            <CardDescription>Your voting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {user.votes.length === 0 && user.finalVotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t voted on any proposals yet.
              </p>
            ) : (
              <div className="space-y-3">
                {user.votes.slice(0, 5).map((vote) => {
                  const effectiveWeight = getEffectiveWeight(
                    vote.weight,
                    vote.createdAt
                  );
                  return (
                    <Link
                      key={vote.id}
                      href={`/proposals/${vote.proposalId}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm line-clamp-1">
                          {vote.proposal.title}
                        </span>
                        <Badge
                          variant={vote.weight > 0 ? "default" : "destructive"}
                        >
                          {vote.weight > 0 ? "+" : ""}
                          {effectiveWeight}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Cost: {vote.creditCost} credits</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(vote.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}

                {user.finalVotes.slice(0, 5).map((vote) => (
                  <Link
                    key={vote.id}
                    href={`/proposals/${vote.proposalId}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm line-clamp-1">
                        {vote.proposal.title}
                      </span>
                      <Badge
                        variant={
                          vote.vote === "YES"
                            ? "default"
                            : vote.vote === "NO"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {vote.vote}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Final vote</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(vote.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credit info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Stored credits</p>
              <p className="font-mono text-lg">{user.credits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Available credits</p>
              <p className="font-mono text-lg">{availableCredits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Earn rate</p>
              <p className="font-mono text-lg">{CREDITS_PER_DAY}/day</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last claimed</p>
              <p className="text-lg">
                {formatDistanceToNow(user.lastCreditAt, { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">How voting costs work:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>1 vote = 1 credit</li>
              <li>2 votes = 4 credits (2²)</li>
              <li>3 votes = 9 credits (3²)</li>
              <li>4 votes = 16 credits (4²)</li>
              <li>
                Max affordable: {Math.floor(Math.sqrt(availableCredits))} votes
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
