"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Link, UserPlus } from "lucide-react";

interface InviteDialogProps {
  spaceSlug: string;
}

export function InviteDialog({ spaceSlug }: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function createInvite() {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (email) body.email = email;
      if (maxUses) body.maxUses = parseInt(maxUses);
      if (expiresIn) {
        const hours = parseInt(expiresIn);
        body.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      const res = await fetch(`/api/spaces/${spaceSlug}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setInviteUrl(data.inviteUrl);
        toast.success("Invite created");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create invite");
      }
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Copied to clipboard");
  }

  function reset() {
    setEmail("");
    setMaxUses("");
    setExpiresIn("");
    setInviteUrl("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="sm:size-default">
          <UserPlus className="h-4 w-4 mr-2" />
          Create Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invite Link</DialogTitle>
          <DialogDescription>
            Generate a link that lets people join this space.
          </DialogDescription>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Restrict to email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                If set, only this email address can use the invite link.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Max uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expiresIn">Expires in (hours)</Label>
                <Input
                  id="expiresIn"
                  type="number"
                  min="1"
                  placeholder="Never"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createInvite} disabled={loading}>
                {loading ? "Creating..." : "Create Invite"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <Link className="h-4 w-4 shrink-0 text-muted-foreground" />
              <code className="text-sm break-all flex-1">{inviteUrl}</code>
              <Button size="sm" variant="ghost" onClick={copyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
