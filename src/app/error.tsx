"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 400 }}>
        {error.message || "Try again or restart the dev server."}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#818cf8",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #27272a",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
