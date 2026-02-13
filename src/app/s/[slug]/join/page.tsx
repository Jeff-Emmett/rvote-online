"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, LogIn, CheckCircle2, AlertCircle, Clock, UserCheck } from "lucide-react";
import Link from "next/link";

interface InviteInfo {
  space: { name: string; slug: string; description: string | null; startingCredits?: number };
  expired: boolean;
  maxedOut: boolean;
  valid: boolean;
}

type PageState =
  | { type: "loading" }
  | { type: "error"; message: string; icon: typeof AlertCircle }
  | { type: "invite"; info: InviteInfo }
  | { type: "joined"; spaceName: string; startingCredits: number }
  | { type: "already_member"; spaceName: string };

export default function JoinSpacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>({ type: "loading" });
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({ type: "error", message: "No invite token provided.", icon: AlertCircle });
      return;
    }

    fetch(`/api/spaces/join/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setState({ type: "error", message: data.error, icon: AlertCircle });
        } else if (data.expired) {
          setState({ type: "error", message: "This invite link has expired.", icon: Clock });
        } else if (data.maxedOut) {
          setState({ type: "error", message: "This invite link has reached its maximum number of uses.", icon: Users });
        } else if (data.valid) {
          setState({ type: "invite", info: data });
        } else {
          setState({ type: "error", message: "This invite link is not valid.", icon: AlertCircle });
        }
      })
      .catch(() => setState({ type: "error", message: "Failed to load invite. Please try again.", icon: AlertCircle }));
  }, [token]);

  async function acceptInvite() {
    if (!token) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/spaces/join/${token}`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.alreadyMember) {
        setState({ type: "already_member", spaceName: data.space.name });
      } else if (res.ok) {
        setState({
          type: "joined",
          spaceName: data.space.name,
          startingCredits: data.space.startingCredits ?? 0,
        });
      } else if (res.status === 401) {
        // Not logged in — redirect to signin with invite URL preserved
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rvote.online";
        const protocol = window.location.protocol;
        window.location.href = `${protocol}//${rootDomain}/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
      } else {
        toast.error(data.error || "Failed to join space");
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-16 px-4">
      {state.type === "loading" && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="animate-pulse space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
              <div className="h-6 bg-muted rounded w-48 mx-auto" />
              <div className="h-4 bg-muted rounded w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {state.type === "error" && (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <state.icon className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-lg text-muted-foreground">{state.message}</p>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {state.type === "invite" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Join {state.info.space.name}</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join this space.
            </CardDescription>
            {state.info.space.description && (
              <p className="text-sm text-muted-foreground mt-2">{state.info.space.description}</p>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button onClick={acceptInvite} disabled={joining} size="lg" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              {joining ? "Joining..." : "Accept Invite"}
            </Button>
          </CardContent>
        </Card>
      )}

      {state.type === "joined" && (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Welcome to {state.spaceName}!</h2>
            <p className="text-muted-foreground">
              You&apos;ve been given <span className="font-semibold text-orange-600">{state.startingCredits} credits</span> to start voting on proposals.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {state.type === "already_member" && (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Already a member</h2>
            <p className="text-muted-foreground">
              You&apos;re already a member of {state.spaceName}.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
