import { fetchPublicHost } from "@/lib/public/fetch";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const host = await fetchPublicHost(username);
  const coverUrl = host?.cover_image_url;

  if (!coverUrl) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(coverUrl, {
    next: { revalidate: 3600 },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Cover unavailable", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
