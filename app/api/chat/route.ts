import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL_MAP: Record<string, string> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4o-audio": "gpt-4o-audio-preview",
  "gpt-4o-mini-search": "gpt-4o-mini-search-preview",
  "gpt-4o-search": "gpt-4o-search-preview",
  "gpt-4o-2024": "gpt-4o-2024-11-20",
  "o1": "o1",
  "o3-mini": "o3-mini",
};

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
    }

    const openaiModel = MODEL_MAP[model] ?? "gpt-4o";

    const stream = await openai.chat.completions.create({
      model: openaiModel,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) {
              controller.enqueue(encoder.encode(token));
            }
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

