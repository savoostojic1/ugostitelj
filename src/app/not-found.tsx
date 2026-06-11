import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Page not found</h2>
      <Link href="/" style={{ color: "#818cf8" }}>
        Back to home
      </Link>
    </div>
  );
}
