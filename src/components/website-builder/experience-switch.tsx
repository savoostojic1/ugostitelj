"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function WebsiteExperienceSwitch() {
  const [mode, setMode] = useState<"booking" | "website" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/websites")
      .then(async (response) => {
        if (!response.ok) return;
        const json = await response.json();
        setMode(json.publicSiteMode === "website" ? "website" : "booking");
      })
      .catch(() => setMode("booking"));
  }, []);

  async function update(next: "booking" | "website") {
    const response = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mode", mode: next }),
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error ?? "Could not change the public website");
      return;
    }
    setMode(next);
    setMessage(next === "website" ? "Guests now see the full website." : "Guests now see the booking website.");
  }

  return (
    <section className="rounded-xl border border-white/10 p-4">
      <h2 className="text-sm font-medium text-white">What guests see</h2>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Booking website is the current simple page. Full website is the site from the website builder. Changing this does not delete either one.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={mode === "booking" ? "default" : "outline"} onClick={() => void update("booking")}>
          Booking website
        </Button>
        <Button type="button" size="sm" variant={mode === "website" ? "default" : "outline"} onClick={() => void update("website")}>
          Full website
        </Button>
      </div>
      {message ? <p className="mt-2 text-xs text-zinc-400" role="status">{message}</p> : null}
    </section>
  );
}
