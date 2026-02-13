import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { MemberList } from "@/components/MemberList";
import { InviteDialog } from "@/components/InviteDialog";
import { InviteList } from "@/components/InviteList";
import { Badge } from "@/components/ui/badge";

export default async function SpaceMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const membership = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } },
  });
  if (!membership) redirect("/");

  const members = await prisma.spaceMember.findMany({
    where: { spaceId: space.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  const serializedMembers = members.map((m) => ({
    id: m.id,
    role: m.role,
    credits: m.credits,
    joinedAt: m.joinedAt.toISOString(),
    user: m.user,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {membership.role === "ADMIN" && <InviteDialog spaceSlug={slug} />}
      </div>

      <MemberList
        members={serializedMembers}
        spaceSlug={slug}
        isAdmin={membership.role === "ADMIN"}
        currentUserId={session.user.id}
      />

      {membership.role === "ADMIN" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Active Invites</h3>
          <InviteList spaceSlug={slug} />
        </div>
      )}
    </div>
  );
}
