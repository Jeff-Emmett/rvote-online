"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, LogIn } from "lucide-react";
import Link from "next/link";

export default function JoinSpacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const token = searchParams.get("token");

  const [inviteInfo, setInviteInfo] = useState<{ spaceName: string; uses: number; maxUses?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`/api/spaces/join/${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setInviteInfo(data);
          }
        })
        .catch(() => setError("Failed to load invite"));
    } else {
      setError("No invite token provided");
    }
  }, [token]);

  async function acceptInvite() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/spaces/join/${token}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Welcome to the space!");
        router.push("/");
      } else if (res.status === 401) {
        // Not logged in - redirect to signin with invite token preserved
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rvote.online";
        const protocol = window.location.protocol;
        window.location.href = `${protocol}//${rootDomain}/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
      } else {
        toast.error(data.error || "Failed to join space");
      }
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-lg text-muted-foreground">{error}</p>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteInfo) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-muted-foreground">
        Loading invite...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join {inviteInfo.spaceName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join this space.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={acceptInvite} disabled={loading} size="lg" className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? "Joining..." : "Accept Invite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
