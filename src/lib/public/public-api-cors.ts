import { NextResponse } from "next/server";
import { isAllowedPublicApiBrowserOrigin } from "@/lib/public/browser-origin";

export function getPublicApiCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && isAllowedPublicApiBrowserOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

export function jsonWithPublicCors(
  request: Request,
  body: unknown,
  init?: { status?: number }
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: getPublicApiCorsHeaders(request),
  });
}

export function publicApiOptionsResponse(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getPublicApiCorsHeaders(request),
  });
}
