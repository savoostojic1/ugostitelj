"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { chooseDraft } from "@/lib/website-builder/draft-store";
import { normalizeDocument, prepareNewDocument, switchTheme } from "@/lib/website-builder/document-ops";
import { readLocalWebsite, writeLocalWebsite } from "@/lib/website-builder/local-draft";
import { collectLocalImageRefs, mapDocumentImages } from "@/lib/website-builder/local-images";
import { deleteLocalImages, loadLocalImages, readLocalImage, saveLocalImage } from "@/components/website-builder/local-image-store";
import type { LivePropertySnapshot, WebsiteDocument, WebsiteThemeId } from "@/lib/website-builder/types";
import { WEBSITE_THEMES } from "@/lib/website-builder/types";

export type SaveState = "loading" | "idle" | "saving" | "saved" | "local" | "error";
export type DraftSource = "local" | "project" | "account";

export interface ClaimOutcome {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  unauthenticated?: boolean;
  /** Photos that are still only in this browser because their upload failed. */
  photosPending?: number;
}

export interface LocalUploadOutcome {
  uploaded: number;
  failed: number;
  error: string | null;
}

export interface PublishOutcome {
  ok: boolean;
  url?: string | null;
  error?: string;
}

function rowsToProperties(rows: unknown): LivePropertySnapshot[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.name !== "string") return [];
    const price = Number(item.starting_price);
    return [
      {
        id: item.id,
        slug: typeof item.slug === "string" ? item.slug : null,
        name: item.name,
        shortDescription: typeof item.short_description === "string" ? item.short_description : null,
        description: typeof item.description === "string" ? item.description : null,
        address: typeof item.address === "string" ? item.address : null,
        imageUrl: typeof item.image_url === "string" ? item.image_url : null,
        galleryUrls: Array.isArray(item.gallery_urls)
          ? item.gallery_urls.filter((url): url is string => typeof url === "string")
          : [],
        capacity: typeof item.capacity === "number" ? item.capacity : null,
        amenities: Array.isArray(item.amenities)
          ? item.amenities.filter((amenity): amenity is string => typeof amenity === "string")
          : [],
        startingPrice: Number.isFinite(price) && price > 0 ? price : null,
        currencyCode: currencyCodeFromUnknown(item.currency_code),
      },
    ];
  });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const HISTORY_LIMIT = 60;
const COALESCE_MS = 900;

export function useWebsiteStudio() {
  const [document, setDocument] = useState<WebsiteDocument | null>(null);
  const [properties, setProperties] = useState<LivePropertySnapshot[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [source, setSource] = useState<DraftSource>("local");
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState<string>("draft");
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  // Bumped when photos kept in this browser get their preview URLs.
  const [localImagesVersion, setLocalImagesVersion] = useState(0);
  const authenticatedRef = useRef(false);

  const past = useRef<WebsiteDocument[]>([]);
  const future = useRef<WebsiteDocument[]>([]);
  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);
  const skipSave = useRef(true);
  const saveSeq = useRef(0);
  const current = useRef<WebsiteDocument | null>(null);

  /** Apply a change. Rapid edits sharing a coalesce key (typing in one field) form one undo step. */
  const change = useCallback((next: WebsiteDocument, options?: { coalesce?: string; history?: boolean }) => {
    const previous = current.current;
    if (previous && options?.history !== false) {
      const now = Date.now();
      const sameBurst =
        options?.coalesce &&
        lastCoalesce.current?.key === options.coalesce &&
        now - lastCoalesce.current.at < COALESCE_MS;
      if (!sameBurst) {
        past.current = [...past.current.slice(-HISTORY_LIMIT + 1), previous];
        future.current = [];
      }
      lastCoalesce.current = options?.coalesce ? { key: options.coalesce, at: now } : null;
      setHistoryTick((tick) => tick + 1);
    }
    // Update the ref immediately so a second change in the same tick builds on this one.
    current.current = next;
    setDocument(next);
  }, []);

  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (!previous || !current.current) return;
    future.current.push(current.current);
    lastCoalesce.current = null;
    current.current = previous;
    setDocument(previous);
    setHistoryTick((tick) => tick + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next || !current.current) return;
    past.current.push(current.current);
    lastCoalesce.current = null;
    current.current = next;
    setDocument(next);
    setHistoryTick((tick) => tick + 1);
  }, []);

  const applyServer = useCallback((json: Record<string, unknown>) => {
    const src = json.source === "account" || json.source === "project" ? json.source : "local";
    setSource(src);
    const signedIn = typeof json.authenticated === "boolean" ? json.authenticated : src === "account" ? true : null;
    if (signedIn !== null) {
      setAuthenticated(signedIn);
      authenticatedRef.current = signedIn;
    }
    if (typeof json.status === "string") setStatus(json.status);
    if (Array.isArray(json.properties)) setProperties(rowsToProperties(json.properties));
  }, []);

  const load = useCallback(async (options?: { preferServer?: boolean }) => {
    const local = readLocalWebsite();
    const params = new URLSearchParams(window.location.search);
    const requestedTheme = params.get("theme");
    try {
      const response = await fetch("/api/website-builder/draft", { cache: "no-store" });
      const json = await readJson(response);
      const server = json.document
        ? { document: normalizeDocument(json.document), updatedAt: String(json.updatedAt ?? "") }
        : null;
      const chosen =
        (json.source === "account" || options?.preferServer) && server ? server : chooseDraft(local, server);
      let initial = chosen?.document ?? prepareNewDocument("luxe");
      const fresh = !chosen;
      if (fresh && requestedTheme && (WEBSITE_THEMES as readonly string[]).includes(requestedTheme)) {
        initial = switchTheme(initial, requestedTheme as WebsiteThemeId);
      }
      applyServer(json);
      skipSave.current = true;
      past.current = [];
      future.current = [];
      current.current = initial;
      setDocument(initial);
      setSaveState(json.persisted ? "saved" : "local");
      void loadLocalImages(collectLocalImageRefs(initial)).then((ready) => ready && setLocalImagesVersion((v) => v + 1));
      return { fresh, json };
    } catch {
      let initial = local?.document ?? prepareNewDocument("luxe");
      if (!local && requestedTheme && (WEBSITE_THEMES as readonly string[]).includes(requestedTheme)) {
        initial = switchTheme(initial, requestedTheme as WebsiteThemeId);
      }
      skipSave.current = true;
      current.current = initial;
      setDocument(initial);
      setSaveState("local");
      void loadLocalImages(collectLocalImageRefs(initial)).then((ready) => ready && setLocalImagesVersion((v) => v + 1));
      return { fresh: !local, json: {} as Record<string, unknown> };
    }
  }, [applyServer]);

  const persist = useCallback(async (doc: WebsiteDocument) => {
    const seq = ++saveSeq.current;
    setSaveState("saving");
    try {
      writeLocalWebsite(doc);
    } catch {
      /* storage full or blocked: the server copy still saves */
    }
    try {
      const response = await fetch("/api/website-builder/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc }),
      });
      const json = await readJson(response);
      if (seq !== saveSeq.current) return;
      if (!response.ok) {
        setSaveState("error");
        setSaveError(typeof json.error === "string" ? json.error : "Could not save");
        return;
      }
      applyServer(json);
      setSaveState(json.persisted ? "saved" : "local");
      setSaveError(null);
      setLastSavedAt(new Date());
    } catch {
      if (seq !== saveSeq.current) return;
      setSaveState("local");
    }
  }, [applyServer]);

  // Debounced autosave.
  useEffect(() => {
    if (!document) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    setSaveState((state) => (state === "saving" ? state : "idle"));
    const handle = window.setTimeout(() => void persist(document), 850);
    return () => window.clearTimeout(handle);
  }, [document, persist]);

  // Keep the newest copy on this device even if the tab closes mid-debounce.
  useEffect(() => {
    const flush = () => {
      if (current.current) {
        try {
          writeLocalWebsite(current.current);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const retrySave = useCallback(() => {
    if (current.current) void persist(current.current);
  }, [persist]);

  const serverUpload = useCallback(async (file: Blob, name = "photo.jpg"): Promise<{ url?: string; error?: string }> => {
    const body = new FormData();
    body.set("file", file, file instanceof File ? file.name : name);
    try {
      const response = await fetch("/api/website-builder/upload", { method: "POST", body });
      const json = await readJson(response);
      if (!response.ok || typeof json.url !== "string") {
        const error =
          response.status === 503
            ? "Photo uploads are unavailable right now. Use the photo library or paste an image link."
            : typeof json.error === "string"
              ? json.error
              : "Could not upload this photo";
        return { error };
      }
      return { url: json.url };
    } catch {
      return { error: "Could not reach the server. Check your connection and try again." };
    }
  }, []);

  /**
   * Adds a photo. Without an account it stays in this browser and nothing is uploaded;
   * signed-in hosts upload straight to Hostvia storage.
   */
  const upload = useCallback(
    async (file: File): Promise<{ url?: string; error?: string }> => {
      if (authenticatedRef.current) return serverUpload(file);
      try {
        const ref = await saveLocalImage(file);
        setLocalImagesVersion((v) => v + 1);
        return { url: ref };
      } catch {
        return { error: "This browser could not keep the photo. Free some space or try another browser." };
      }
    },
    [serverUpload]
  );

  /** Uploads every photo kept in this browser and puts its URL into the website. */
  const uploadLocalImages = useCallback(async (): Promise<LocalUploadOutcome> => {
    const doc = current.current;
    const refs = doc ? collectLocalImageRefs(doc) : [];
    const urls = new Map<string, string>();
    let error: string | null = null;
    for (const ref of refs) {
      const blob = await readLocalImage(ref).catch(() => null);
      if (!blob) {
        error = "Some photos are no longer in this browser. Add them again in the Photos step.";
        continue;
      }
      const result = await serverUpload(blob, `${ref.slice(6)}.jpg`);
      if (result.url) urls.set(ref, result.url);
      else error = result.error ?? "Could not upload a photo";
    }
    if (urls.size && current.current) {
      change(mapDocumentImages(current.current, (url) => urls.get(url) ?? url), { history: false });
    }
    return { uploaded: urls.size, failed: refs.length - urls.size, error };
  }, [change, serverUpload]);

  const claim = useCallback(async (replaceDraft = false): Promise<ClaimOutcome> => {
    // Now that the host is registered, upload the photos kept in this browser first.
    const before = current.current ? collectLocalImageRefs(current.current) : [];
    const photos = before.length ? await uploadLocalImages() : null;
    // Make sure the newest version is on the server before it moves to the account.
    if (current.current) await persist(current.current);
    const response = await fetch("/api/website-builder/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replaceDraft }),
    });
    const json = await readJson(response);
    if (response.status === 401) return { ok: false, unauthenticated: true };
    if (json.error === "account_has_website") return { ok: false, conflict: true };
    if (!response.ok) {
      const map: Record<string, string> = {
        not_found: "This draft could not be found. It may already be saved to an account.",
        expired: "This draft expired before it was saved to an account.",
        claimed_by_other: "This draft belongs to another account.",
      };
      const code = typeof json.error === "string" ? json.error : "";
      return { ok: false, error: map[code] ?? (code || "Could not save the website to your account") };
    }
    await load({ preferServer: true });
    const left = current.current ? collectLocalImageRefs(current.current) : [];
    void deleteLocalImages(before.filter((ref) => !left.includes(ref)));
    return { ok: true, photosPending: photos?.failed ?? 0 };
  }, [load, persist, uploadLocalImages]);

  const publish = useCallback(async (): Promise<PublishOutcome> => {
    if (current.current) await persist(current.current);
    const response = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    const json = await readJson(response);
    if (!response.ok) {
      return { ok: false, error: typeof json.error === "string" ? json.error : "Could not publish" };
    }
    setStatus("published");
    const url = typeof json.url === "string" ? json.url : null;
    setPublishedUrl(url);
    return { ok: true, url };
  }, [persist]);

  /** Link or create Hostvia properties for each stay through the existing import route. */
  const connectStays = useCallback(
    async (
      decisions: ({ accommodationId: string } & (
        | { action: "link"; propertyId: string }
        | { action: "create"; acknowledgeDuplicate: boolean }
        | { action: "skip" }
      ))[]
    ): Promise<{ ok: boolean; error?: string; upgradeRequired?: boolean }> => {
      if (current.current) await persist(current.current);
      const response = await fetch("/api/websites/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisions }),
      });
      const json = await readJson(response);
      if (!response.ok) {
        return {
          ok: false,
          error: typeof json.error === "string" ? json.error : "Could not connect properties",
          upgradeRequired: json.upgradeRequired === true,
        };
      }
      await load({ preferServer: true });
      return { ok: true };
    },
    [load, persist]
  );

  const getDocument = useCallback(() => current.current, []);
  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return useMemo(
    () => ({
      document,
      properties,
      saveState,
      saveError,
      source,
      authenticated,
      status,
      publishedUrl,
      lastSavedAt,
      canUndo,
      canRedo,
      historyTick,
      change,
      undo,
      redo,
      load,
      retrySave,
      upload,
      uploadLocalImages,
      localImagesVersion,
      claim,
      publish,
      connectStays,
      getDocument,
    }),
    [getDocument, document, properties, saveState, saveError, source, authenticated, status, publishedUrl, lastSavedAt, canUndo, canRedo, historyTick, change, undo, redo, load, retrySave, upload, uploadLocalImages, localImagesVersion, claim, publish, connectStays]
  );
}

export type WebsiteStudioApi = ReturnType<typeof useWebsiteStudio>;
