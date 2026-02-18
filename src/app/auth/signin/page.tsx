"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { useEncryptID } from "@encryptid/sdk/ui/react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { login } = useEncryptID();

  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  async function handlePasskeySignIn() {
    setIsPasskeyLoading(true);

    try {
      // SDK handles the full WebAuthn ceremony + stores token in localStorage
      await login();

      // Get the token from localStorage and set it as a cookie for SSR
      const token = localStorage.getItem("encryptid_token");
      if (token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }

      toast.success("Signed in with passkey!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("No passkey found. Create an account first.");
        router.push("/auth/signup");
      } else {
        toast.error(error.message || "Passkey authentication failed");
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Sign in with your passkey to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full gap-2"
          onClick={handlePasskeySignIn}
          disabled={isPasskeyLoading}
        >
          {isPasskeyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Fingerprint className="h-4 w-4" />
          )}
          Sign in with Passkey
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
