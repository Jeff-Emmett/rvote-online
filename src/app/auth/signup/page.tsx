"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { useEncryptID } from "@encryptid/sdk/ui/react";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useEncryptID();

  const [name, setName] = useState("");
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  async function handlePasskeyRegister() {
    setIsPasskeyLoading(true);

    try {
      const username = name.trim() || `user-${Date.now().toString(36)}`;

      // SDK handles the full WebAuthn registration ceremony + stores token
      await register(username, name || username);

      // Get the token from localStorage and set it as a cookie for SSR
      const token = localStorage.getItem("encryptid_token");
      if (token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }

      toast.success("Account created with passkey! Welcome to rVote.");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey registration was cancelled");
      } else {
        toast.error(error.message || "Passkey registration failed");
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join rVote to start ranking and voting on proposals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passkey-name">Display Name</Label>
            <Input
              id="passkey-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPasskeyLoading}
            />
          </div>
          <Button
            type="button"
            className="w-full gap-2"
            onClick={handlePasskeyRegister}
            disabled={isPasskeyLoading}
          >
            {isPasskeyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4" />
            )}
            Sign up with Passkey
          </Button>
          <p className="text-sm text-muted-foreground">
            You&apos;ll start with <strong>50 credits</strong> and earn 10 more each day.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
