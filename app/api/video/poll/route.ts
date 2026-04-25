import { NextRequest } from "next/server";

async function getReplicateKey(): Promise<string> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/admin/api-key/replicate`);
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch {
    // fall through
  }
  return process.env.REPLICATE_API_TOKEN ?? "";
}

/**
 * GET /api/video/poll?id=<predictionId>
 * Returns: { status, videoUrl? }
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const token = await getReplicateKey();
  if (!token) {
    return Response.json({ error: "No Replicate API key." }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch prediction" }, { status: response.status });
    }

    const prediction = await response.json() as {
      id: string;
      status: string;
      // minimax/video-01 returns a string; other models return string[]
      output?: string | string[] | null;
      error?: string | null;
    };

    if (prediction.status === "succeeded") {
      const videoUrl = Array.isArray(prediction.output)
        ? (prediction.output[0] ?? null)
        : (prediction.output ?? null);
      return Response.json({ status: "succeeded", videoUrl });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return Response.json({ status: "failed", error: prediction.error ?? "Generation failed" });
    }

    // still "starting" or "processing"
    return Response.json({ status: prediction.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
