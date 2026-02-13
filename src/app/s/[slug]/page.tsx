import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Users, Vote, CheckCircle, ArrowRight, Plus } from "lucide-react";

export default async function SpaceDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const [rankingCount, votingCount, passedCount, memberCount, topProposals] = await Promise.all([
    prisma.proposal.count({ where: { spaceId: space.id, status: "RANKING" } }),
    prisma.proposal.count({ where: { spaceId: space.id, status: "VOTING" } }),
    prisma.proposal.count({ where: { spaceId: space.id, status: "PASSED" } }),
    prisma.spaceMember.count({ where: { spaceId: space.id } }),
    prisma.proposal.findMany({
      where: { spaceId: space.id, status: "RANKING" },
      orderBy: { score: "desc" },
      take: 5,
      select: { id: true, title: true, score: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{rankingCount}</div>
            <p className="text-sm text-muted-foreground">Being Ranked</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{votingCount}</div>
            <p className="text-sm text-muted-foreground">In Voting</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{passedCount}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{memberCount}</div>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Top proposals */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl font-bold">Top Proposals</h2>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/proposals">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/proposals/new">
                <Plus className="h-4 w-4 mr-1" />
                New Proposal
              </Link>
            </Button>
          </div>
        </div>

        {topProposals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No proposals yet. Be the first to create one!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {topProposals.map((proposal, i) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm font-mono w-6">#{i + 1}</span>
                      <span className="font-medium">{proposal.title}</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-500/30">
                      Score: {proposal.score}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
