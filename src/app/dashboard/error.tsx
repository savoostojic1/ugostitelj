"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Greška na dashboardu</h2>
      <p style={{ fontSize: 14, opacity: 0.7 }}>{error.message}</p>
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
        Pokušaj ponovo
      </button>
    </div>
  );
}
