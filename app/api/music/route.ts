import { NextRequest } from "next/server";

// Uses Replicate's meta/musicgen model.
// Docs: https://replicate.com/meta/musicgen

async function getReplicateKey(): Promise<string> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/admin/api-key/replicate`);
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch {
    // fall through to env
  }
  return process.env.REPLICATE_API_TOKEN ?? "";
}

const MODEL_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb"; // meta/musicgen stereo-large

export async function POST(req: NextRequest) {
  try {
    const { prompt, tags, lyrics, duration = 8 } = await req.json() as {
      prompt?: string;
      tags?: string[];
      lyrics?: string;
      duration?: number;
    };

    if (!prompt || !prompt.trim()) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const REPLICATE_TOKEN = await getReplicateKey();
    if (!REPLICATE_TOKEN) {
      return Response.json({ error: "No Replicate API token configured." }, { status: 500 });
    }

    // Build the musicgen prompt: tags + user prompt + lyrics hint
    const tagStr = tags && tags.length > 0 ? tags.join(", ") + " music. " : "";
    const lyricsHint = lyrics && lyrics.trim() ? ` Lyrics: ${lyrics.trim()}` : "";
    const fullPrompt = `${tagStr}${prompt.trim()}${lyricsHint}`;

    const safeDuration = Math.min(Math.max(4, Number(duration) || 8), 30);

    // Submit prediction
    const submitRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          prompt: fullPrompt,
          duration: safeDuration,
          model_version: "stereo-large",
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }),
    });

    const result = await submitRes.json() as {
      id?: string;
      status?: string;
      output?: string | string[] | null;
      error?: string;
      urls?: { get?: string };
    };

    if (!submitRes.ok || result.error) {
      return Response.json({ error: result.error ?? "Music generation failed" }, { status: 500 });
    }

    // If Prefer:wait resolved it immediately
    if (result.status === "succeeded" && result.output) {
      const url = Array.isArray(result.output) ? result.output[0] : result.output;
      return Response.json({ url });
    }

    // Otherwise poll until done (max ~90s)
    const predictionId = result.id;
    if (!predictionId) {
      return Response.json({ error: "No prediction id returned." }, { status: 500 });
    }

    const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
      });
      const poll = await pollRes.json() as { status?: string; output?: string | string[] | null; error?: string };
      if (poll.status === "succeeded" && poll.output) {
        const url = Array.isArray(poll.output) ? poll.output[0] : poll.output;
        return Response.json({ url });
      }
      if (poll.status === "failed") {
        return Response.json({ error: poll.error ?? "Music generation failed" }, { status: 500 });
      }
    }

    return Response.json({ error: "Music generation timed out. Please try again." }, { status: 504 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
