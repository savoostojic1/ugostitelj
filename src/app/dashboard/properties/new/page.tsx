"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { toast } from "sonner";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a property name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (res.status === 402 && data.upgradeRequired) {
        setUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not add property");
      }

      toast.success("Property added");
      router.push(`/dashboard/properties/${data.property.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hostvia-dashboard-page-inset w-fit"
        >
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" />
            Properties
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>New property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bungalow 1"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Save property"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
