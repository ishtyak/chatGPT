import { NextRequest } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";

async function getApiKey(): Promise<string> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/admin/api-key/openai`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.message == "Feature not availiable in demo mode") {
        alert("Feature not availiable in demo mode")
        return ""
      }
      if (data.key) return data.key as string;
    }
  } catch {
    // fall through
  }
  return process.env.OPENAI_API_KEY ?? "";
}

// dall-e-2 (the only model that supports images.edit) accepts only these three sizes.
// Map our UI labels to the closest supported size.
const SIZE_MAP: Record<string, "256x256" | "512x512" | "1024x1024"> = {
  "1:1": "1024x1024",
  "4:3": "1024x1024",
  "2:3": "1024x1024",
  "16:9 HD": "1024x1024",
  "16:9 QHD": "1024x1024",
  "16:9 4K": "1024x1024",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const prompt = (formData.get("prompt") as string | null)?.trim();
    const size = (formData.get("size") as string | null) ?? "1:1";
    const count = parseInt((formData.get("count") as string | null) ?? "1", 10);

    if (!imageFile || imageFile.size === 0) {
      return Response.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!prompt) {
      return Response.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      return Response.json({ error: "No OpenAI API key configured." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });
    const apiSize = SIZE_MAP[size] ?? "1024x1024";
    const safeCount = Math.min(Math.max(1, Number(count) || 1), 4);

    // Convert to RGBA PNG — dall-e-2 requires image/png with an alpha channel
    const arrayBuffer = await imageFile.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const pngBuffer = await sharp(inputBuffer).ensureAlpha().png().toBuffer();
    const fileForApi = new File([new Uint8Array(pngBuffer)], "image.png", { type: "image/png" });

    // dall-e-2 images.edit returns b64_json; request it explicitly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (client.images.edit as any)({
      model: "dall-e-2",
      image: fileForApi,
      prompt,
      n: safeCount,
      size: apiSize,
      response_format: "b64_json",
    });

    const items: Array<{ url?: string; b64_json?: string }> = result.data ?? [];

    // Build URL list — prefer hosted URL, fall back to data URL from b64_json
    const urls: string[] = items
      .map((d) => {
        if (d.url) return d.url;
        if (d.b64_json) return `data:image/png;base64,${d.b64_json}`;
        return "";
      })
      .filter(Boolean);

    if (urls.length === 0) {
      return Response.json({ error: "No edited image returned." }, { status: 500 });
    }

    return Response.json({ urls, url: urls[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
