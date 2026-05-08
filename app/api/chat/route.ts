import { NextRequest } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface DbModel {
  id: string;
  apiModelId: string;
  provider: string;
}

// OpenAI-compatible base URLs for providers that support it
const OPENAI_COMPAT_BASE_URL: Record<string, string> = {
  OpenAI: "https://api.openai.com/v1",
  Mistral: "https://api.mistral.ai/v1",
  xAI: "https://api.x.ai/v1",
  DeepSeek: "https://api.deepseek.com/v1",
  Perplexity: "https://api.perplexity.ai",
  Meta: "https://api.together.xyz/v1",
};

// Maps provider name → ai_providers.slug (= api_keys.provider column)
// These slugs come from the ai_providers table in the DB.
const PROVIDER_KEY_NAME: Record<string, string> = {
  OpenAI: "openai",
  Anthropic: "claude",    // slug in ai_providers table is "claude"
  Google: "gemini",    // slug in ai_providers table is "gemini"
  Meta: "meta",
  Mistral: "mistral",
  xAI: "xai",
  DeepSeek: "deepseek",
  Perplexity: "perplexity",
};

const BACKEND = (process.env.BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

async function getApiKey(provider: string): Promise<string> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/api-key/${provider}`, {
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
  } catch { /* fall through */ }
  return "";
}

async function resolveModel(modelId: string): Promise<DbModel> {
  const fallback: DbModel = { id: modelId, apiModelId: modelId, provider: "OpenAI" };
  try {
    const res = await fetch(`${BACKEND}/api/models`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const found = (data.models as DbModel[] | undefined)?.find((m) => m.id === modelId);
      if (found) return found;
    }
  } catch { /* fall through */ }
  return fallback;
}

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// ── Pure-stream helpers (called AFTER the initial API call succeeds) ───────

function readableFromOpenAiStream(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
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
}

function readableFromAnthropicStream(
  stream: Anthropic.MessageStreamEvent extends never ? never : AsyncIterable<Anthropic.MessageStreamEvent>,
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream as AsyncIterable<{ type: string; delta?: { type: string; text?: string } }>) {
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text ?? ""));
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

function readableFromGeminiStream(
  stream: AsyncIterable<{ text: () => string }>,
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
    }

    const dbModel = await resolveModel(model ?? "gpt-4o");
    const { apiModelId, provider } = dbModel;

    const keyName = PROVIDER_KEY_NAME[provider] ?? provider.toLowerCase();
    const apiKey = await getApiKey(keyName);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `No API key configured for provider: ${provider}. Store it in Admin → AI Providers as "${keyName}".` }),
        { status: 500 },
      );
    }

    const typedMessages = messages as ChatMessage[];
    let bodyStream: ReadableStream;

    if (provider === "Google") {
      // Await the first API call BEFORE committing the 200 response so errors
      // are returned as proper 500 JSON rather than blank streaming bodies.
      const genAI = new GoogleGenerativeAI(apiKey);
      const gemini = genAI.getGenerativeModel({ model: apiModelId });
      const history = typedMessages.slice(0, -1)
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: m.content }],
        }));
      const lastMessage = typedMessages[typedMessages.length - 1]?.content ?? "";
      const systemInstruction = typedMessages.find((m) => m.role === "system")?.content;
      const chat = gemini.startChat({
        history,
        ...(systemInstruction ? { systemInstruction } : {}),
      });
      const result = await chat.sendMessageStream(lastMessage); // throws here on bad key/model
      bodyStream = readableFromGeminiStream(result.stream);

    } else if (provider === "Anthropic") {
      const client = new Anthropic({ apiKey });
      const systemMsg = typedMessages.find((m) => m.role === "system")?.content;
      const conversation = typedMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      const stream = await client.messages.create({
        model: apiModelId,
        max_tokens: 4096,
        ...(systemMsg ? { system: systemMsg } : {}),
        messages: conversation,
        stream: true,
      }); // throws here on bad key/model
      bodyStream = readableFromAnthropicStream(stream as unknown as AsyncIterable<{ type: string; delta?: { type: string; text?: string } }>);

    } else {
      // OpenAI-compatible providers
      const baseURL = OPENAI_COMPAT_BASE_URL[provider] ?? OPENAI_COMPAT_BASE_URL.OpenAI;
      const client = new OpenAI({ apiKey, baseURL });
      const stream = await client.chat.completions.create({
        model: apiModelId,
        messages: typedMessages,
        stream: true,
      }); // throws here on bad key/model
      bodyStream = readableFromOpenAiStream(stream);
    }

    return new Response(bodyStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chat/route]", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
