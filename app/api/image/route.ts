import { NextRequest } from "next/server";
import OpenAI from "openai";

async function getApiKey(): Promise<string> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/admin/api-key/openai`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch {
    // fall through
  }
  return process.env.OPENAI_API_KEY ?? "";
}

// Map our aspect-ratio IDs → DALL-E 3 sizes
const DALLE3_SIZE: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
  "1:1hd": "1024x1024",
  "1:1":   "1024x1024",
  "16:9":  "1792x1024",
  "4:3":   "1792x1024",
  "9:16":  "1024x1792",
  "3:4":   "1024x1792",
};

// Map our aspect-ratio IDs → gpt-image-1 sizes
const GPTIMG1_SIZE: Record<string, "1024x1024" | "1536x1024" | "1024x1536" | "auto"> = {
  "1:1hd": "1024x1024",
  "1:1":   "1024x1024",
  "16:9":  "1536x1024",
  "4:3":   "1536x1024",
  "9:16":  "1024x1536",
  "3:4":   "1024x1536",
};

// Models that map to OpenAI gpt-image-1 (supports n > 1)
const GPT_IMAGE_1_MODELS = new Set(["gpt-image-1-5", "gpt-image-1"]);

// Models that map to OpenAI dall-e-3 (n = 1 only)
const DALLE3_MODELS = new Set(["gpt-image-2", "flux-2", "grok-imagine", "nano-banana", "nano-banana-2", "recraft-v3", "ideogram-v3", "seedream-4-5", "seedream-5-0", "z-image-turbo"]);

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      model = "gpt-image-2",
      aspectRatio = "1:1hd",
      count = 1,
    } = await req.json() as {
      prompt?: string;
      model?: string;
      aspectRatio?: string;
      count?: number;
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const apiKey = await getApiKey();
    if (!apiKey) {
      return Response.json({ error: "No OpenAI API key configured." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    let urls: string[] = [];
    let revisedPrompt = prompt.trim();

    if (GPT_IMAGE_1_MODELS.has(model)) {
      // gpt-image-1 supports multiple images in one call
      const size = GPTIMG1_SIZE[aspectRatio] ?? "1024x1024";
      const result = await (client.images.generate as Function)({
        model: "gpt-image-1",
        prompt: prompt.trim(),
        n: safeCount,
        size,
        response_format: "url",
      });
      urls = (result.data ?? []).map((d: { url?: string }) => d.url ?? "").filter(Boolean);
    } else {
      // dall-e-3: n=1 only, run in parallel for count > 1
      const size = DALLE3_SIZE[aspectRatio] ?? "1024x1024";
      const requests = Array.from({ length: safeCount }, () =>
        client.images.generate({
          model: "dall-e-3",
          prompt: prompt.trim(),
          n: 1,
          size,
          quality: "hd",
          style: "vivid",
          response_format: "url",
        })
      );
      const results = await Promise.all(requests);
      revisedPrompt = results[0]?.data?.[0]?.revised_prompt ?? prompt.trim();
      urls = results.map((r) => r.data?.[0]?.url ?? "").filter(Boolean);
    }

    if (urls.length === 0) {
      return Response.json({ error: "No image returned." }, { status: 500 });
    }

    return Response.json({ urls, url: urls[0], revisedPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
