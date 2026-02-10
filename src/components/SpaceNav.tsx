"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSpace } from "@/components/SpaceProvider";
import { FileText, Users, Settings, LayoutDashboard, Coins } from "lucide-react";

export function SpaceNav() {
  const pathname = usePathname();
  const { space, membership } = useSpace();

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
          <div className="flex items-center gap-1">
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
          {membership && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-600">{membership.credits}</span>
              <span>credits</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
