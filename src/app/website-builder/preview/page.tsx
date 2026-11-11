"use client";

import { useEffect, useState } from "react";
import { readLocalWebsite } from "@/lib/website-builder/local-draft";
import { mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import { WebsiteView } from "@/components/website-public/website-view";

export default function WebsitePreviewPage() {
  const [ready, setReady] = useState(false);
  const draft = ready ? readLocalWebsite() : null;
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) return <p className="p-8 text-sm text-zinc-400">Loading preview…</p>;
  if (!draft) return <p className="p-8 text-sm text-zinc-300">No draft is saved in this browser yet.</p>;
  const page = draft.document.pages.find((item) => item.isHome) ?? draft.document.pages[0];
  if (!page) return <p className="p-8">This draft has no pages.</p>;
  const model = mergeWebsiteModel({
    document: draft.document,
    properties: [],
    username: "preview",
    page,
    preview: true,
  });
  return <WebsiteView model={model} />;
}
