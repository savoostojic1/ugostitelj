"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Došlo je do greške</h1>
        <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 400, textAlign: "center" }}>
          {error.message || "Restartuj dev server (Ctrl+C, zatim npm run dev)."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#818cf8",
            color: "#09090b",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Pokušaj ponovo
        </button>
      </body>
    </html>
  );
}
