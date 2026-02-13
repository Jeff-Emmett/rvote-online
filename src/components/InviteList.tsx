"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2, Mail, Clock, Hash } from "lucide-react";

interface Invite {
  id: string;
  token: string;
  email: string | null;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
}

interface InviteListProps {
  spaceSlug: string;
}

export function InviteList({ spaceSlug }: InviteListProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/spaces/${spaceSlug}/invites`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInvites(data);
      })
      .catch(() => toast.error("Failed to load invites"))
      .finally(() => setLoading(false));
  }, [spaceSlug]);

  async function revokeInvite(id: string) {
    const res = await fetch(`/api/spaces/${spaceSlug}/invites/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== id));
      toast.success("Invite revoked");
    } else {
      toast.error("Failed to revoke invite");
    }
  }

  function copyLink(token: string) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rvote.online";
    const protocol = window.location.protocol;
    const url = `${protocol}//${spaceSlug}.${rootDomain}/join?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  }

  function isExpired(invite: Invite) {
    return invite.expiresAt ? new Date(invite.expiresAt) < new Date() : false;
  }

  function isMaxedOut(invite: Invite) {
    return invite.maxUses !== null ? invite.uses >= invite.maxUses : false;
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading invites...</div>;
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active invites. Use the button above to create one.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => {
        const expired = isExpired(invite);
        const maxed = isMaxedOut(invite);
        const inactive = expired || maxed;

        return (
          <Card key={invite.id} className={inactive ? "opacity-60" : ""}>
            <CardContent className="py-3 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {invite.token.slice(0, 8)}...
                  </code>
                  {invite.email && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {invite.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    {invite.uses}{invite.maxUses !== null ? `/${invite.maxUses}` : ""} uses
                  </span>
                  {invite.expiresAt && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {expired ? "Expired" : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                    </span>
                  )}
                  {expired && <Badge variant="destructive" className="text-xs">Expired</Badge>}
                  {maxed && <Badge variant="secondary" className="text-xs">Max uses reached</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  {!inactive && (
                    <Button size="sm" variant="ghost" onClick={() => copyLink(invite.token)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => revokeInvite(invite.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
