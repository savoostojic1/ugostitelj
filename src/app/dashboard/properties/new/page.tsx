"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Unesi naziv nekretnine");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Nisi prijavljen");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: user.id,
        name: trimmed,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Nekretnina dodata");
    router.push(`/dashboard/properties/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/properties">
          <ArrowLeft className="h-4 w-4" />
          Nazad
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Nova nekretnina</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Bungalov 1"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Dodavanje…" : "Dodaj nekretninu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
