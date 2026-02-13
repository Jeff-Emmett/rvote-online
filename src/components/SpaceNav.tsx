"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpace } from "@/components/SpaceProvider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, Users, Settings, LayoutDashboard, Coins, Menu } from "lucide-react";

export function SpaceNav() {
  const pathname = usePathname();
  const { space, membership } = useSpace();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/proposals", label: "Proposals", icon: FileText },
    { href: "/members", label: "Members", icon: Users },
    ...(membership?.role === "ADMIN"
      ? [{ href: "/settings", label: "Settings", icon: Settings }]
      : []),
  ];

  // Strip the /s/[slug] prefix to match against subdomain-style paths
  const cleanPath = pathname.replace(/^\/s\/[^/]+/, "") || "/";

  return (
    <div className="border-b bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => {
              const isActive = cleanPath === link.href || (link.href !== "/" && cleanPath.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
                <Menu className="h-4 w-4" />
                <span className="text-sm font-medium">{space.name}</span>
              </Button>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>{space.name}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-6">
                  {links.map((link) => {
                    const isActive = cleanPath === link.href || (link.href !== "/" && cleanPath.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-md text-base transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                {membership && (
                  <div className="mt-auto px-6 pb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">{membership.credits}</span>
                    <span>credits</span>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop credits */}
          {membership && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-600">{membership.credits}</span>
              <span>credits</span>
            </div>
          )}

          {/* Mobile credits (compact) */}
          {membership && (
            <div className="sm:hidden flex items-center gap-1.5 text-sm">
              <Coins className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-600">{membership.credits}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
