import { InteractiveDemo } from "@/components/InteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          Interactive Demo
        </Badge>
        <h1 className="text-4xl font-bold">Try Quadratic Proposal Ranking</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience how rVote works without creating an account. Click the vote
          arrows to rank proposals—watch how quadratic costs scale in real-time.
        </p>
      </div>

      <InteractiveDemo />

      {/* CTA */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to try it for real?</h2>
          <p className="text-muted-foreground">
            Create a Space for your community to start ranking and voting on proposals.
            Invite members and allot credits to get started.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/signup">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
