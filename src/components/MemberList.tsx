"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Crown, UserMinus, Coins, Shield } from "lucide-react";

interface Member {
  id: string;
  role: "ADMIN" | "MEMBER";
  credits: number;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MemberListProps {
  members: Member[];
  spaceSlug: string;
  isAdmin: boolean;
  currentUserId: string;
}

export function MemberList({ members: initialMembers, spaceSlug, isAdmin, currentUserId }: MemberListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [creditAmount, setCreditAmount] = useState<Record<string, string>>({});

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    const res = await fetch(`/api/spaces/${spaceSlug}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role: newRole as "ADMIN" | "MEMBER" } : m))
      );
      toast.success(`Role updated to ${newRole}`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update role");
    }
  }

  async function removeMember(userId: string) {
    const res = await fetch(`/api/spaces/${spaceSlug}/members/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success("Member removed");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to remove member");
    }
  }

  async function allotCredits(userId: string) {
    const amount = parseInt(creditAmount[userId] || "0");
    if (!amount || amount <= 0) {
      toast.error("Enter a positive number of credits");
      return;
    }
    const res = await fetch(`/api/spaces/${spaceSlug}/members/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    });
    if (res.ok) {
      const data = await res.json();
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, credits: data.newCredits } : m))
      );
      setCreditAmount((prev) => ({ ...prev, [userId]: "" }));
      toast.success(`Allotted ${amount} credits`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to allot credits");
    }
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {(member.user.name || member.user.email)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.user.name || member.user.email}</span>
                    {member.role === "ADMIN" && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{member.user.email}</span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-orange-500" />
                      {member.credits} credits
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && member.user.id !== currentUserId && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Credits"
                      className="w-20 h-8 text-sm"
                      value={creditAmount[member.user.id] || ""}
                      onChange={(e) =>
                        setCreditAmount((prev) => ({ ...prev, [member.user.id]: e.target.value }))
                      }
                    />
                    <Button size="sm" variant="outline" className="h-8" onClick={() => allotCredits(member.user.id)}>
                      <Coins className="h-3 w-3 mr-1" />
                      Allot
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleRole(member.user.id, member.role)}
                    title={member.role === "ADMIN" ? "Demote to member" : "Promote to admin"}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeMember(member.user.id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
