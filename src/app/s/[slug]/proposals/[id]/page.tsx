import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/VoteButtons";
import { FinalVotePanel } from "@/components/FinalVotePanel";
import { calculateAvailableCredits } from "@/lib/credits";
import { getEffectiveWeight } from "@/lib/voting";
import { formatDistanceToNow } from "date-fns";

export default async function SpaceProposalDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await auth();

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      votes: { include: { user: { select: { id: true, name: true } } }, orderBy: { weight: "desc" } },
      finalVotes: true,
    },
  });

  if (!proposal || proposal.spaceId !== space.id) notFound();

  let availableCredits = 0;
  let userVote = undefined;
  let isAuthenticated = false;
  let userFinalVote = undefined;

  if (session?.user?.id) {
    isAuthenticated = true;
    const member = await prisma.spaceMember.findUnique({
      where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } },
    });
    if (member) {
      availableCredits = calculateAvailableCredits(
        member.credits, member.lastCreditAt, space.creditsPerDay, space.maxCredits
      );
    }
    const vote = await prisma.vote.findUnique({
      where: { userId_proposalId: { userId: session.user.id, proposalId: id } },
    });
    if (vote) {
      userVote = { weight: vote.weight, effectiveWeight: getEffectiveWeight(vote.weight, vote.createdAt) };
    }
    const fv = proposal.finalVotes.find((v) => v.userId === session.user!.id);
    if (fv) userFinalVote = fv.vote;
  }

  const effectiveScore = proposal.votes.reduce(
    (sum, v) => sum + getEffectiveWeight(v.weight, v.createdAt),
    0
  );

  // Compute final vote tallies
  const finalVoteCounts = { yes: 0, no: 0, abstain: 0, total: 0 };
  proposal.finalVotes.forEach((fv) => {
    const key = fv.vote.toLowerCase() as "yes" | "no" | "abstain";
    finalVoteCounts[key]++;
    finalVoteCounts.total++;
  });

  const statusColors: Record<string, string> = {
    RANKING: "bg-orange-500",
    VOTING: "bg-blue-500",
    PASSED: "bg-green-500",
    FAILED: "bg-red-500",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        {proposal.status === "RANKING" && (
          <div className="pt-1">
            <VoteButtons
              proposalId={proposal.id}
              currentScore={effectiveScore}
              userVote={userVote}
              availableCredits={availableCredits}
              isAuthenticated={isAuthenticated}
              spaceSlug={slug}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
            {proposal.votingEndsAt && (
              <span className="text-sm text-muted-foreground">
                Voting ends {formatDistanceToNow(new Date(proposal.votingEndsAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            by {proposal.author.name || proposal.author.email} &middot;{" "}
            {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="py-6 prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{proposal.description}</p>
        </CardContent>
      </Card>

      {proposal.status === "VOTING" && (
        <FinalVotePanel
          proposalId={proposal.id}
          votingEndsAt={proposal.votingEndsAt ?? undefined}
          votes={finalVoteCounts}
          userVote={userFinalVote}
          isAuthenticated={isAuthenticated}
          spaceSlug={slug}
        />
      )}

      {/* Voters */}
      {proposal.votes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Votes ({proposal.votes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proposal.votes.map((vote) => {
                const ew = getEffectiveWeight(vote.weight, vote.createdAt);
                return (
                  <div key={vote.id} className="flex items-center justify-between text-sm">
                    <span>{vote.user.name || "Anonymous"}</span>
                    <div className="flex items-center gap-2">
                      <span className={vote.weight > 0 ? "text-orange-600" : "text-blue-600"}>
                        {vote.weight > 0 ? "+" : ""}{vote.weight}
                      </span>
                      {Math.abs(ew) < Math.abs(vote.weight) && (
                        <span className="text-muted-foreground text-xs">
                          (effective: {ew.toFixed(1)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
