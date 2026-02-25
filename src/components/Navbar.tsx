"use client";

import Link from "next/link";
import { useEncryptID } from "@encryptid/sdk/ui/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditDisplay } from "./CreditDisplay";
import { AppSwitcher } from "./AppSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { isAuthenticated, username, did, loading, logout } = useEncryptID();
  const pathname = usePathname();

  // Hide the main navbar on space pages — SpaceNav handles navigation there
  if (pathname.startsWith("/s/")) {
    return null;
  }

  async function handleSignOut() {
    // Clear the server-side cookie
    await fetch("/api/auth/session", { method: "DELETE" });
    // Clear client-side state
    logout();
    window.location.href = "/";
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <AppSwitcher current="vote" />
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">rVote</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/demo"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </Link>
              <Link
                href="/spaces/new"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Space
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded" />
            ) : isAuthenticated ? (
              <>
                <CreditDisplay />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {username?.[0]?.toUpperCase() ||
                            did?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {username && (
                          <p className="font-medium">{username}</p>
                        )}
                        {did && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {did}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/spaces">My Spaces</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
