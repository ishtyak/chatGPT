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
 * POST /api/video
 * Body: { prompt, duration?, aspectRatio? }
 * Returns: { id } — Replicate prediction ID to poll against
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const token = await getReplicateKey();
    if (!token) {
      return Response.json(
        { error: "No Replicate API key configured. Add a 'replicate' key in the Admin Panel or set REPLICATE_API_TOKEN in .env.local." },
        { status: 500 }
      );
    }

    // Use minimax/video-01 — reliable text-to-video model on Replicate
    const body = {
      input: {
        prompt: prompt.trim(),
        prompt_optimizer: true,
      },
    };

    const response = await fetch(
      "https://api.replicate.com/v1/models/minimax/video-01/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = (err as { detail?: string }).detail;
      let msg = detail ?? `Replicate error (${response.status})`;
      if (response.status === 401) msg = "Invalid Replicate API key. Check your key in the Admin Panel.";
      if (response.status === 402) msg = "Replicate account requires payment. Add a credit card at replicate.com.";
      return Response.json({ error: msg }, { status: response.status });
    }

    const prediction = await response.json() as {
      id: string;
      status: string;
      // minimax/video-01 returns a string; other models return string[]
      output?: string | string[] | null;
      error?: string;
    };

    // If fast enough, return URL immediately
    const immediateUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output ?? null;
    if (prediction.status === "succeeded" && immediateUrl) {
      return Response.json({ id: prediction.id, status: "succeeded", videoUrl: immediateUrl });
    }
    if (prediction.status === "failed") {
      return Response.json({ error: prediction.error ?? "Video generation failed" }, { status: 500 });
    }

    // Return prediction ID so the client can poll
    return Response.json({ id: prediction.id, status: prediction.status ?? "starting" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
