import { NextRequest } from "next/server";
import OpenAI from "openai";

interface DbModel {
  id: string;
  apiModelId: string;
  provider: string;
}

// OpenAI-compatible base URLs for each provider
const PROVIDER_BASE_URL: Record<string, string> = {
  OpenAI:     "https://api.openai.com/v1",
  Anthropic:  "https://api.anthropic.com/v1",
  Google:     "https://generativelanguage.googleapis.com/v1beta/openai",
  Meta:       "https://api.together.xyz/v1",
  Mistral:    "https://api.mistral.ai/v1",
  xAI:        "https://api.x.ai/v1",
  DeepSeek:   "https://api.deepseek.com/v1",
  Perplexity: "https://api.perplexity.ai",
};

// Maps provider name → api_keys table provider value
const PROVIDER_KEY_NAME: Record<string, string> = {
  OpenAI:     "openai",
  Anthropic:  "anthropic",
  Google:     "google",
  Meta:       "meta",
  Mistral:    "mistral",
  xAI:        "xai",
  DeepSeek:   "deepseek",
  Perplexity: "perplexity",
};

/** Fetch the active API key for a provider from the backend DB. */
async function getApiKey(provider: string): Promise<string> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/api-key/${provider}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch { /* fall through */ }
  return "";
}

/** Resolve the DB model record (apiModelId + provider) for a given model_id. */
async function resolveModel(modelId: string): Promise<DbModel> {
  const fallback: DbModel = { id: modelId, apiModelId: modelId, provider: "OpenAI" };
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/models`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const found = (data.models as DbModel[] | undefined)?.find((m) => m.id === modelId);
      if (found) return found;
    }
  } catch { /* fall through */ }
  return fallback;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
    }

    const dbModel = await resolveModel(model ?? "gpt-4o");
    const { apiModelId, provider } = dbModel;

    const keyName = PROVIDER_KEY_NAME[provider] ?? provider.toLowerCase();
    const apiKey  = await getApiKey(keyName);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `No API key configured for provider: ${provider}` }),
        { status: 500 },
      );
    }

    const baseURL = PROVIDER_BASE_URL[provider] ?? PROVIDER_BASE_URL.OpenAI;
    const client  = new OpenAI({ apiKey, baseURL });

    const stream = await client.chat.completions.create({
      model: apiModelId,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

