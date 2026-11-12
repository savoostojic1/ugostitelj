"use client";

import { STEP } from "@/components/website-builder/steps";
import { collectLocalImageRefs } from "@/lib/website-builder/local-images";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, Check, Circle, Copy, Globe, Link2, Loader2, LogIn, Rocket, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Button, SectionTitle, Select } from "@/components/website-builder/ui";
import type { StepProps } from "@/components/website-builder/wizard-steps";
import { WEBSITE_BUILDER_PATH, WEBSITE_MANAGEMENT_PATH } from "@/lib/website-builder/limits";
import { findEquivalentProperties } from "@/lib/website-builder/property-match";
import { cn } from "@/lib/utils";

const CLAIM_RETURN = `${WEBSITE_BUILDER_PATH}?claim=1`;

function Checklist({ items }: { items: { label: string; done: boolean; hint?: string; action?: () => void }[] }) {
  return (
    <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 px-4 py-3">
          {item.done ? (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
              <Check className="h-3 w-3" />
            </span>
          ) : (
            <Circle className="h-5 w-5 text-zinc-600" />
          )}
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[13.5px]", item.done ? "text-zinc-300" : "text-zinc-100")}>{item.label}</span>
            {!item.done && item.hint ? <span className="block text-[12px] text-zinc-500">{item.hint}</span> : null}
          </span>
          {!item.done && item.action ? (
            <button type="button" onClick={item.action} className="text-[12.5px] font-medium text-violet-300 hover:text-violet-200">
              Fix
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type Choice = string; // "link:<id>" | "create" | "skip"

export function LaunchStep({ studio, document, goTo }: StepProps & { goTo: (step: number) => void }) {
  const [busy, setBusy] = useState<null | "claim" | "connect" | "publish" | "photos">(null);
  const [conflict, setConflict] = useState(false);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [published, setPublished] = useState<string | null>(studio.publishedUrl);

  const owned = studio.properties;
  const ownedIds = new Set(owned.map((property) => property.id));
  const unconnected = document.accommodations.filter((stay) => !stay.propertyId || !ownedIds.has(stay.propertyId));

  useEffect(() => {
    // Suggest an existing property with the same name instead of creating a duplicate.
    setChoices((current) => {
      const next = { ...current };
      for (const stay of unconnected) {
        if (next[stay.id]) continue;
        const match = findEquivalentProperties(stay.name, owned)[0];
        next[stay.id] = match ? `link:${match.id}` : "create";
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owned.length, unconnected.length]);

  const checklist = useMemo(
    () => [
      { label: "Property name", done: Boolean(document.profile.name.trim()), hint: "Required to publish", action: () => goTo(STEP.place) },
      { label: "Photographs", done: document.gallery.length >= 3, hint: "Add at least three", action: () => goTo(STEP.photos) },
      { label: "At least one stay", done: document.accommodations.length > 0, hint: "Guests need something to ask about", action: () => goTo(STEP.stays) },
      { label: "Contact email", done: Boolean(document.profile.contactEmail), hint: "Shown on your contact page", action: () => goTo(STEP.place) },
    ],
    [document, goTo]
  );
  const canPublish = Boolean(document.profile.name.trim());
  const isAccount = studio.source === "account";
  const pendingPhotos = collectLocalImageRefs(document).length;

  async function claim(replace = false) {
    setBusy("claim");
    const result = await studio.claim(replace);
    setBusy(null);
    if (result.unauthenticated) {
      window.location.href = `/login?next=${encodeURIComponent(CLAIM_RETURN)}`;
      return;
    }
    if (result.conflict) {
      setConflict(true);
      return;
    }
    if (!result.ok) {
      toast.error(result.error ?? "Could not save to your account");
      return;
    }
    setConflict(false);
    if (result.photosPending) toast.warning(`Saved to your account. ${result.photosPending} photos did not upload yet; use “Upload photos” below.`);
    else toast.success("Saved to your Hostvia account");
  }

  async function uploadPendingPhotos() {
    setBusy("photos");
    const result = await studio.uploadLocalImages();
    setBusy(null);
    if (result.failed) toast.error(result.error ?? `${result.failed} photos could not be uploaded`);
    else toast.success(`${result.uploaded} ${result.uploaded === 1 ? "photo" : "photos"} uploaded`);
  }

  async function connect() {
    setBusy("connect");
    const decisions = unconnected.map((stay) => {
      const choice = choices[stay.id] ?? "create";
      if (choice.startsWith("link:")) return { accommodationId: stay.id, action: "link" as const, propertyId: choice.slice(5) };
      if (choice === "skip") return { accommodationId: stay.id, action: "skip" as const };
      return {
        accommodationId: stay.id,
        action: "create" as const,
        acknowledgeDuplicate: findEquivalentProperties(stay.name, owned).length > 0,
      };
    });
    const result = await studio.connectStays(decisions);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.upgradeRequired ? "Your plan's property limit is reached. Link an existing property or upgrade." : result.error ?? "Could not connect");
      return;
    }
    toast.success("Stays connected to Hostvia");
  }

  async function publish() {
    setBusy("publish");
    const result = await studio.publish();
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error ?? "Could not publish");
      return;
    }
    setPublished(result.url ?? "");
  }

  if (published !== null && studio.status === "published") {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" aria-hidden />
        <div className="relative text-center">
          <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_20px_50px_-10px_rgba(168,85,247,0.8)] animate-[wbx-rise_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
            <Rocket className="h-7 w-7" />
          </span>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-white">Your website is live.</h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-zinc-400">Guests can open it now and send booking inquiries straight to your Hostvia inbox.</p>
          {published ? (
            <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pl-3.5">
              <Globe className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate text-left text-[13.5px] text-zinc-100">{published.replace(/^https?:\/\//, "")}</span>
              <Button
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(published);
                  toast.success("Link copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {published ? (
              <a href={published} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-zinc-950 hover:bg-zinc-200">
                Open website <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
            <Link href={WEBSITE_MANAGEMENT_PATH} className="inline-flex h-11 items-center rounded-xl border border-white/10 px-5 text-[14px] font-semibold text-zinc-100 hover:bg-white/5">
              Website settings
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-zinc-500">Keep editing any time. Changes go live when you publish again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Launch"
        title={isAccount ? "Connect and go live." : "Your website is ready."}
        description={
          isAccount
            ? "Connect each stay to a Hostvia property so prices, availability and booking inquiries work, then publish."
            : "Create a free Hostvia account to publish. Everything you made moves with you."
        }
      />

      <Checklist items={checklist} />

      {studio.authenticated && pendingPhotos ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-amber-100/80">
            <strong className="text-amber-100">{pendingPhotos} {pendingPhotos === 1 ? "photo is" : "photos are"} still only in this browser.</strong> Upload {pendingPhotos === 1 ? "it" : "them"} so guests can see {pendingPhotos === 1 ? "it" : "them"} on your published website.
          </p>
          <Button size="sm" onClick={uploadPendingPhotos} disabled={busy !== null}>
            {busy === "photos" ? "Uploading…" : "Upload photos"}
          </Button>
        </div>
      ) : null}

      {!studio.authenticated ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" /> Free account, no card needed
          </p>
          <ul className="space-y-1.5 text-[12.5px] text-zinc-400">
            <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Publish on your own Hostvia address</li>
            <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Receive booking inquiries with live prices and availability</li>
            <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Your design, pages and photos are kept exactly as they are</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> Until then your photos stay in this browser and are not uploaded anywhere</li>
          </ul>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Link href={`/register?next=${encodeURIComponent(CLAIM_RETURN)}`} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:brightness-110">
              <UserPlus className="h-4 w-4" /> Create free account
            </Link>
            <Link href={`/login?next=${encodeURIComponent(CLAIM_RETURN)}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-[14px] font-semibold text-zinc-100 hover:bg-white/5">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
          </div>
          {studio.saveState === "local" ? (
            <p className="text-[12px] leading-relaxed text-amber-200/80">This draft is saved in this browser. Finish signing up on this device so it can be moved to your account.</p>
          ) : null}
        </div>
      ) : !isAccount ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[14px] font-semibold text-white">Save this website to your account</p>
          <p className="text-[12.5px] leading-relaxed text-zinc-400">You are signed in. Move this draft to your account to connect your properties and publish.</p>
          {conflict ? (
            <div className="space-y-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <p className="text-[13px] leading-relaxed text-amber-100">
                Your account already has a website. Replace its draft with this design? Its published version stays online until you publish again.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" disabled={busy !== null} onClick={() => void claim(true)}>
                  Replace the draft
                </Button>
                <Link href={WEBSITE_MANAGEMENT_PATH} className="inline-flex h-8 items-center rounded-xl px-3 text-[12.5px] font-semibold text-zinc-300 hover:bg-white/5">
                  Keep my existing website
                </Link>
              </div>
            </div>
          ) : (
            <Button variant="primary" size="lg" className="w-full" disabled={busy !== null} onClick={() => void claim(false)}>
              {busy === "claim" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save to my account
            </Button>
          )}
        </div>
      ) : (
        <>
          {unconnected.length ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
                <Link2 className="h-4 w-4 text-violet-300" /> Connect your stays
              </p>
              <p className="text-[12.5px] leading-relaxed text-zinc-400">
                Booking inquiries need a Hostvia property. Use one you already have, or create it from this stay. Hostvia never creates a duplicate without asking.
              </p>
              <ul className="space-y-2.5">
                {unconnected.map((stay) => {
                  const matches = findEquivalentProperties(stay.name, owned);
                  return (
                    <li key={stay.id} className="rounded-xl bg-black/20 p-3">
                      <p className="mb-2 text-[13px] font-medium text-zinc-100">
                        {stay.name}
                        {matches.length ? <span className="ml-2 text-[11.5px] font-normal text-amber-200/80">matches “{matches[0].name}”</span> : null}
                      </p>
                      <Select value={choices[stay.id] ?? "create"} onChange={(event) => setChoices((current) => ({ ...current, [stay.id]: event.target.value }))}>
                        {owned.map((property) => (
                          <option key={property.id} value={`link:${property.id}`}>
                            Use my property “{property.name}”
                          </option>
                        ))}
                        <option value="create">{matches.length ? "Create another new property anyway" : "Create a new Hostvia property"}</option>
                        <option value="skip">Leave unconnected for now</option>
                      </Select>
                    </li>
                  );
                })}
              </ul>
              <Button className="w-full" disabled={busy !== null} onClick={() => void connect()}>
                {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Connect stays
              </Button>
            </div>
          ) : document.accommodations.length ? (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-400/[0.06] p-3 text-[13px] text-emerald-100/90">
              <Check className="h-4 w-4" /> All stays are connected to Hostvia properties.
            </p>
          ) : null}

          <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-b from-violet-500/[0.12] to-transparent p-5">
            <p className="text-[14px] font-semibold text-white">{studio.status === "published" ? "Publish your changes" : "Publish your website"}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">
              Guests see this website at your Hostvia address. Your simple booking page stays saved, and you can switch back in Website settings.
            </p>
            <Button variant="primary" size="lg" className="mt-4 w-full" disabled={!canPublish || busy !== null} onClick={() => void publish()}>
              {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {studio.status === "published" ? "Publish changes" : "Publish website"}
            </Button>
            {!canPublish ? <p className="mt-2 text-[12px] text-amber-200/80">Add a property name first.</p> : null}
          </div>
        </>
      )}
    </div>
  );
}
