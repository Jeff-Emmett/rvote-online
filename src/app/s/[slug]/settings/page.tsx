"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSpace } from "@/components/SpaceProvider";
import { Save } from "lucide-react";

export default function SpaceSettingsPage() {
  const { space, membership } = useSpace();
  const router = useRouter();

  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description || "");
  const [promotionThreshold, setPromotionThreshold] = useState(space.promotionThreshold.toString());
  const [votingPeriodDays, setVotingPeriodDays] = useState(space.votingPeriodDays.toString());
  const [creditsPerDay, setCreditsPerDay] = useState(space.creditsPerDay.toString());
  const [maxCredits, setMaxCredits] = useState(space.maxCredits.toString());
  const [startingCredits, setStartingCredits] = useState(space.startingCredits.toString());
  const [loading, setLoading] = useState(false);

  if (membership?.role !== "ADMIN") {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Only admins can access space settings.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/spaces/${space.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          promotionThreshold: parseInt(promotionThreshold),
          votingPeriodDays: parseInt(votingPeriodDays),
          creditsPerDay: parseInt(creditsPerDay),
          maxCredits: parseInt(maxCredits),
          startingCredits: parseInt(startingCredits),
        }),
      });

      if (res.ok) {
        toast.success("Settings saved");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Space Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Space Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voting Configuration</CardTitle>
            <CardDescription>Controls how proposals are ranked and promoted</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Promotion Threshold</Label>
              <Input id="threshold" type="number" value={promotionThreshold} onChange={(e) => setPromotionThreshold(e.target.value)} />
              <p className="text-xs text-muted-foreground">Score needed to advance to voting</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Voting Period (days)</Label>
              <Input id="period" type="number" value={votingPeriodDays} onChange={(e) => setVotingPeriodDays(e.target.value)} />
              <p className="text-xs text-muted-foreground">Duration of pass/fail voting</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
            <CardDescription>Controls credit allocation for members</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpd">Credits Per Day</Label>
              <Input id="cpd" type="number" value={creditsPerDay} onChange={(e) => setCreditsPerDay(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mc">Max Credits</Label>
              <Input id="mc" type="number" value={maxCredits} onChange={(e) => setMaxCredits(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc">Starting Credits</Label>
              <Input id="sc" type="number" value={startingCredits} onChange={(e) => setStartingCredits(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
