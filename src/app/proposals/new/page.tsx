"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewProposalPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create proposal");
      }

      toast.success("Proposal created successfully!");
      router.push(`/proposals/${data.proposal.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/proposals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Proposal</CardTitle>
          <CardDescription>
            Submit a proposal for the community to rank and vote on. Proposals
            start in the ranking stage and advance to pass/fail voting when they
            reach a score of +100.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="A clear, concise title for your proposal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your proposal in detail. What problem does it solve? How would it be implemented? What are the benefits?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={10000}
                rows={10}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/10,000 characters
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your proposal starts in the <strong>Ranking</strong> stage</li>
                <li>Community members can upvote or downvote using their credits</li>
                <li>When the score reaches <strong>+100</strong>, it advances to voting</li>
                <li>In the voting stage, members vote Yes/No for 7 days</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Proposal
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
