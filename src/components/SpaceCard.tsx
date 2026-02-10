import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";
import Link from "next/link";

interface SpaceCardProps {
  space: {
    name: string;
    slug: string;
    description: string | null;
    isPublic: boolean;
    _count: {
      members: number;
      proposals: number;
    };
    role?: string;
  };
}

export function SpaceCard({ space }: SpaceCardProps) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rvote.online";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const spaceUrl = `${protocol}://${space.slug}.${rootDomain}`;

  return (
    <Link href={spaceUrl}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{space.name}</CardTitle>
            <div className="flex gap-2">
              {space.role === "ADMIN" && (
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              )}
              {space.isPublic && (
                <Badge variant="outline" className="text-xs">Public</Badge>
              )}
            </div>
          </div>
          {space.description && (
            <CardDescription className="line-clamp-2">{space.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{space._count.members} member{space._count.members !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{space._count.proposals} proposal{space._count.proposals !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
