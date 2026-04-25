import { NextRequest } from "next/server";

/**
 * GET /api/video/proxy?url=<encoded-replicate-url>
 *
 * Proxies the video from Replicate's CDN through the Next.js server so the
 * browser can play or download it without CORS issues.
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new Response("url parameter is required", { status: 400 });
  }

  // Only allow Replicate CDN URLs to prevent SSRF
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  const ALLOWED_HOSTS = ["replicate.delivery", "pbxt.replicate.delivery", "replicate.com"];
  const isAllowed = ALLOWED_HOSTS.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith("." + h)
  );
  if (!isAllowed) {
    return new Response("URL not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: { "User-Agent": "SoftkeyAI/1.0" },
    });

    if (!upstream.ok) {
      return new Response("Failed to fetch video", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "video/mp4";
    const contentLength = upstream.headers.get("content-length");

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    });
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(upstream.body, { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}
