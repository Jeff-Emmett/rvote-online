import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { MemberList } from "@/components/MemberList";
import { InviteDialog } from "@/components/InviteDialog";
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
      <div className="flex items-center justify-between">
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
    </div>
  );
}
