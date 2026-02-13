"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";

const ENCRYPTID_SERVER = process.env.NEXT_PUBLIC_ENCRYPTID_SERVER_URL || "https://encryptid.jeffemmett.com";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasskeySignIn() {
    setIsPasskeyLoading(true);

    try {
      // Step 1: Get authentication options from EncryptID server
      const startRes = await fetch(`${ENCRYPTID_SERVER}/api/auth/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const { options } = await startRes.json();

      // Step 2: Trigger WebAuthn ceremony in the browser
      const challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: options.rpId,
        userVerification: options.userVerification as UserVerificationRequirement,
        timeout: options.timeout,
        allowCredentials: options.allowCredentials?.map((c: { type: string; id: string; transports?: string[] }) => ({
          type: c.type as PublicKeyCredentialType,
          id: Uint8Array.from(atob(c.id.replace(/-/g, "+").replace(/_/g, "/")), ch => ch.charCodeAt(0)),
          transports: c.transports as AuthenticatorTransport[],
        })),
      };

      const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      if (!assertion) throw new Error("Passkey authentication cancelled");

      const response = assertion.response as AuthenticatorAssertionResponse;

      // Helper to convert ArrayBuffer to base64url
      function toBase64url(buffer: ArrayBuffer): string {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      }

      // Step 3: Complete authentication with EncryptID server
      const completeRes = await fetch(`${ENCRYPTID_SERVER}/api/auth/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: options.challenge,
          credential: {
            credentialId: assertion.id,
            authenticatorData: toBase64url(response.authenticatorData),
            clientDataJSON: toBase64url(response.clientDataJSON),
            signature: toBase64url(response.signature),
            userHandle: response.userHandle ? toBase64url(response.userHandle) : null,
          },
        }),
      });

      const authResult = await completeRes.json();
      if (!authResult.success) {
        throw new Error(authResult.error || "Authentication failed");
      }

      // Step 4: Exchange EncryptID token for NextAuth session
      const result = await signIn("encryptid", {
        token: authResult.token,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Passkey verified but session creation failed");
      } else {
        toast.success("Signed in with passkey!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey authentication was cancelled");
      } else {
        toast.error(error.message || "Passkey authentication failed");
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  }

  const anyLoading = isLoading || isPasskeyLoading;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Sign in with a passkey or your email and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Passkey sign-in button */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handlePasskeySignIn}
          disabled={anyLoading}
        >
          {isPasskeyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Fingerprint className="h-4 w-4" />
          )}
          Sign in with Passkey
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={anyLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={anyLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={anyLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
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
