import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rVote - Quadratic Proposal Ranking for Community Governance",
  description:
    "A democratic backlog prioritization platform with quadratic proposal ranking. Proposals are ranked by members, and top proposals advance to pass/fail voting.",
  keywords: ["ranking", "governance", "quadratic proposal ranking", "proposals", "community", "backlog prioritization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://rdata.online/collect.js" data-website-id="320c5a22-9a36-4b25-b270-3c5d4033a532" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-border/50 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground/60">r* Ecosystem</span>
                <a href="https://rspace.online" className="hover:text-foreground transition-colors">🌌 rSpace</a>
                <a href="https://rmaps.online" className="hover:text-foreground transition-colors">🗺️ rMaps</a>
                <a href="https://rnotes.online" className="hover:text-foreground transition-colors">📝 rNotes</a>
                <a href="https://rvote.online" className="hover:text-foreground transition-colors font-medium text-foreground/80">🗳️ rVote</a>
                <a href="https://rfunds.online" className="hover:text-foreground transition-colors">💰 rFunds</a>
                <a href="https://rtrips.online" className="hover:text-foreground transition-colors">✈️ rTrips</a>
                <a href="https://rcart.online" className="hover:text-foreground transition-colors">🛒 rCart</a>
                <a href="https://rwallet.online" className="hover:text-foreground transition-colors">💼 rWallet</a>
                <a href="https://rfiles.online" className="hover:text-foreground transition-colors">📁 rFiles</a>
                <a href="https://rinbox.online" className="hover:text-foreground transition-colors">✉️ rInbox</a>
                <a href="https://rnetwork.online" className="hover:text-foreground transition-colors">🌐 rNetwork</a>
                <a href="https://rbooks.online" className="hover:text-foreground transition-colors">📚 rBooks</a>
                <a href="https://rdata.online" className="hover:text-foreground transition-colors">📊 rData</a>
              </div>
              <p className="text-center text-xs text-muted-foreground/60">
                Part of the r* ecosystem — collaborative tools for communities.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
