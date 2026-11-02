"use client";

import { trackHostviaEvent } from "@/lib/analytics/track";

export function GuideQrPrint({
  title,
  url,
  qrImageSrc,
}: {
  title: string;
  url: string;
  qrImageSrc: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-zinc-900 print:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Guest guide
      </p>
      <h1 className="text-center text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageSrc}
          alt={`QR code linking to ${title}`}
          className="h-56 w-56"
        />
      </div>
      <p className="max-w-sm text-center text-sm text-zinc-600 break-all" translate="no">
        {url}
      </p>
      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <a
          href={qrImageSrc}
          download={`${title.replace(/\s+/g, "-").toLowerCase()}-qr.png`}
          onClick={() =>
            trackHostviaEvent("guest_guide_qr_download", { location: "print_page" })
          }
          className="inline-flex h-10 items-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white"
        >
          Download PNG
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold"
        >
          Print
        </button>
      </div>
      <p className="text-xs text-zinc-400">Powered by Hostvia</p>
    </main>
  );
}
