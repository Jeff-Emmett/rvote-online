import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Look up the proposal's space and redirect to the space-scoped URL
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { space: { select: { slug: true } } },
  });

  if (!proposal) notFound();

  if (proposal.space) {
    const rootDomain = process.env.ROOT_DOMAIN || "rvote.online";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    redirect(`${protocol}://${proposal.space.slug}.${rootDomain}/proposals/${id}`);
  }

  // Fallback: redirect to spaces list if no space assigned
  redirect("/spaces");
}
