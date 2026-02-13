"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";

const ENCRYPTID_SERVER = process.env.NEXT_PUBLIC_ENCRYPTID_SERVER_URL || "https://encryptid.jeffemmett.com";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in automatically
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created but failed to sign in. Please try signing in manually.");
        router.push("/auth/signin");
      } else {
        toast.success("Account created! Welcome to rVote.");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasskeyRegister() {
    setIsPasskeyLoading(true);

    try {
      const username = name || `user-${Date.now().toString(36)}`;

      // Step 1: Get registration options from EncryptID server
      const startRes = await fetch(`${ENCRYPTID_SERVER}/api/register/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName: name || username }),
      });
      const { options, userId } = await startRes.json();

      // Step 2: Trigger WebAuthn registration ceremony in the browser
      function fromBase64url(str: string): Uint8Array {
        return Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      }

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: fromBase64url(options.challenge).buffer as ArrayBuffer,
        rp: options.rp,
        user: {
          id: fromBase64url(options.user.id).buffer as ArrayBuffer,
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: options.authenticatorSelection,
        timeout: options.timeout,
        attestation: options.attestation as AttestationConveyancePreference,
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      if (!credential) throw new Error("Passkey registration cancelled");

      const response = credential.response as AuthenticatorAttestationResponse;

      function toBase64url(buffer: ArrayBuffer): string {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      }

      // Step 3: Complete registration with EncryptID server
      const completeRes = await fetch(`${ENCRYPTID_SERVER}/api/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: options.challenge,
          userId,
          username,
          credential: {
            credentialId: credential.id,
            publicKey: toBase64url(response.getPublicKey?.() || response.attestationObject),
            attestationObject: toBase64url(response.attestationObject),
            clientDataJSON: toBase64url(response.clientDataJSON),
            transports: (response as any).getTransports?.() || [],
          },
        }),
      });

      const regResult = await completeRes.json();
      if (!regResult.success) {
        throw new Error(regResult.error || "Registration failed");
      }

      // Step 4: Exchange EncryptID token for NextAuth session
      const result = await signIn("encryptid", {
        token: regResult.token,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Passkey registered but session creation failed");
        router.push("/auth/signin");
      } else {
        toast.success("Account created with passkey! Welcome to rVote.");
        router.push("/");
        router.refresh();
      }
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

  const anyLoading = isLoading || isPasskeyLoading;

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
          {/* Passkey registration */}
          <div className="space-y-2">
            <Label htmlFor="passkey-name">Display Name</Label>
            <Input
              id="passkey-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={anyLoading}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handlePasskeyRegister}
            disabled={anyLoading}
          >
            {isPasskeyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4" />
            )}
            Sign up with Passkey
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={anyLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={anyLoading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You&apos;ll start with <strong>50 credits</strong> and earn 10 more each day.
            </p>
            <Button type="submit" className="w-full" disabled={anyLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
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
