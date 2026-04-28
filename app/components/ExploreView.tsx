"use client";

import { useState } from "react";

interface Platform {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  badge?: string;
  tags: string[];
  url: string;
  gradient: string;
}

const PLATFORMS: Platform[] = [
  /* ── Language Models ── */
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "Language",
    icon: "💬",
    gradient: "from-green-50 to-emerald-50",
    badge: "Most Popular",
    tags: ["Chat", "Writing", "Code"],
    description: "OpenAI's flagship conversational AI for reasoning, writing, coding, and more.",
    url: "https://chat.openai.com",
  },
  {
    id: "claude",
    name: "Claude",
    category: "Language",
    icon: "🟠",
    gradient: "from-orange-50 to-amber-50",
    tags: ["Chat", "Analysis", "Long Context"],
    description: "Anthropic's AI assistant — safe, harmless, and helpful with 200K context window.",
    url: "https://claude.ai",
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "Language",
    icon: "✦",
    gradient: "from-blue-50 to-indigo-50",
    tags: ["Multimodal", "Search", "Google"],
    description: "Google's multimodal AI deeply integrated with Search, Docs, and the Google ecosystem.",
    url: "https://gemini.google.com",
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    category: "Language",
    icon: "🔍",
    gradient: "from-sky-50 to-cyan-50",
    badge: "Trending",
    tags: ["Search", "Research", "Citations"],
    description: "AI-powered search engine that gives cited, real-time answers instead of links.",
    url: "https://perplexity.ai",
  },
  {
    id: "mistral",
    name: "Mistral",
    category: "Language",
    icon: "🌬️",
    gradient: "from-violet-50 to-purple-50",
    tags: ["Open Source", "Fast", "EU"],
    description: "European open-weight language model — fast, efficient, and privacy-first.",
    url: "https://mistral.ai",
  },
  {
    id: "groq",
    name: "Groq",
    category: "Language",
    icon: "⚡",
    gradient: "from-yellow-50 to-orange-50",
    badge: "Fastest",
    tags: ["Speed", "LPU", "Open Models"],
    description: "LPU-powered inference engine running open models at record-breaking speed.",
    url: "https://groq.com",
  },

  /* ── Image AI ── */
  {
    id: "midjourney",
    name: "Midjourney",
    category: "Image",
    icon: "🎨",
    gradient: "from-pink-50 to-rose-50",
    badge: "Best Quality",
    tags: ["Art", "Design", "Creative"],
    description: "Industry-leading AI image generator known for breathtaking artistic quality.",
    url: "https://midjourney.com",
  },
  {
    id: "dalle",
    name: "DALL·E 3",
    category: "Image",
    icon: "🖼️",
    gradient: "from-fuchsia-50 to-pink-50",
    tags: ["Realistic", "OpenAI", "API"],
    description: "OpenAI's image model — great for photorealistic scenes and precise prompt following.",
    url: "https://openai.com/dall-e-3",
  },
  {
    id: "stablediffusion",
    name: "Stable Diffusion",
    category: "Image",
    icon: "🌊",
    gradient: "from-teal-50 to-cyan-50",
    tags: ["Open Source", "Local", "Custom"],
    description: "Open-source image generation model you can run locally or via cloud APIs.",
    url: "https://stability.ai",
  },
  {
    id: "firefly",
    name: "Adobe Firefly",
    category: "Image",
    icon: "🔥",
    gradient: "from-red-50 to-orange-50",
    tags: ["Commercial Safe", "Adobe", "Design"],
    description: "Adobe's generative AI trained on licensed content — safe for commercial use.",
    url: "https://firefly.adobe.com",
  },
  {
    id: "ideogram",
    name: "Ideogram",
    category: "Image",
    icon: "🅰️",
    gradient: "from-slate-50 to-zinc-50",
    tags: ["Typography", "Logos", "Text in Image"],
    description: "Best AI for generating images that include readable, styled text and logos.",
    url: "https://ideogram.ai",
  },

  /* ── Video AI ── */
  {
    id: "runway",
    name: "Runway",
    category: "Video",
    icon: "🎬",
    gradient: "from-purple-50 to-violet-50",
    badge: "Pro",
    tags: ["Text-to-Video", "Edit", "VFX"],
    description: "Creative AI suite for video generation, editing, and visual effects production.",
    url: "https://runwayml.com",
  },
  {
    id: "sora",
    name: "Sora",
    category: "Video",
    icon: "🌐",
    gradient: "from-blue-50 to-sky-50",
    tags: ["OpenAI", "Cinematic", "1080p"],
    description: "OpenAI's video model generating cinematic, high-resolution video from text.",
    url: "https://sora.com",
  },
  {
    id: "pika",
    name: "Pika",
    category: "Video",
    icon: "⚡",
    gradient: "from-yellow-50 to-amber-50",
    tags: ["Short Video", "Creative", "Fast"],
    description: "Fast, fun AI video creation for short-form creative content and social media.",
    url: "https://pika.art",
  },
  {
    id: "kling",
    name: "Kling AI",
    category: "Video",
    icon: "🎥",
    gradient: "from-rose-50 to-pink-50",
    tags: ["Realistic", "5s/10s", "Chinese"],
    description: "Kuaishou's video AI producing physically realistic motion and high fidelity.",
    url: "https://klingai.com",
  },

  /* ── Music & Audio ── */
  {
    id: "suno",
    name: "Suno",
    category: "Music",
    icon: "🎵",
    gradient: "from-emerald-50 to-green-50",
    badge: "Popular",
    tags: ["Full Songs", "Vocals", "Any Genre"],
    description: "Generate complete songs with vocals and instruments from a text prompt.",
    url: "https://suno.com",
  },
  {
    id: "udio",
    name: "Udio",
    category: "Music",
    icon: "🎶",
    gradient: "from-indigo-50 to-blue-50",
    tags: ["High Fidelity", "Extend", "Remix"],
    description: "Studio-quality AI music generation with powerful extending and remixing tools.",
    url: "https://udio.com",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "Music",
    icon: "🎙️",
    gradient: "from-cyan-50 to-teal-50",
    tags: ["Voice Clone", "TTS", "Multilingual"],
    description: "Ultra-realistic voice synthesis, cloning, and multilingual text-to-speech.",
    url: "https://elevenlabs.io",
  },

  /* ── Code AI ── */
  {
    id: "copilot",
    name: "GitHub Copilot",
    category: "Code",
    icon: "🐙",
    gradient: "from-slate-50 to-gray-50",
    badge: "Industry Standard",
    tags: ["Autocomplete", "IDE", "GitHub"],
    description: "Microsoft & OpenAI's AI pair programmer built into VS Code and GitHub.",
    url: "https://github.com/features/copilot",
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "Code",
    icon: "↗️",
    gradient: "from-zinc-50 to-neutral-50",
    tags: ["AI IDE", "Codebase Chat", "Fast"],
    description: "AI-first code editor that understands your entire codebase and writes code for you.",
    url: "https://cursor.sh",
  },
  {
    id: "v0",
    name: "v0 by Vercel",
    category: "Code",
    icon: "▲",
    gradient: "from-gray-50 to-slate-50",
    tags: ["UI Generation", "React", "Tailwind"],
    description: "Prompt-to-UI tool that generates React and Tailwind components instantly.",
    url: "https://v0.dev",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    category: "Code",
    icon: "⚡",
    gradient: "from-yellow-50 to-lime-50",
    tags: ["Full Stack", "Deploy", "StackBlitz"],
    description: "Prompt-to-full-stack app builder that writes, runs, and deploys code in browser.",
    url: "https://bolt.new",
  },

  /* ── Productivity ── */
  {
    id: "notionai",
    name: "Notion AI",
    category: "Productivity",
    icon: "📝",
    gradient: "from-amber-50 to-yellow-50",
    tags: ["Docs", "Notes", "Workspace"],
    description: "AI writing assistant built into Notion — summarize, draft, and translate docs.",
    url: "https://notion.so/product/ai",
  },
  {
    id: "genspark",
    name: "Genspark",
    category: "Productivity",
    icon: "✨",
    gradient: "from-pink-50 to-fuchsia-50",
    tags: ["Research", "Sparkpages", "Deep Dive"],
    description: "AI that generates comprehensive 'Sparkpages' — rich research summaries on any topic.",
    url: "https://genspark.ai",
  },
];

const CATEGORIES = ["All", "Language", "Image", "Video", "Music", "Code", "Productivity"];

const CATEGORY_COLORS: Record<string, string> = {
  Language:     "bg-green-100 text-green-700 border-green-200",
  Image:        "bg-pink-100 text-pink-700 border-pink-200",
  Video:        "bg-purple-100 text-purple-700 border-purple-200",
  Music:        "bg-emerald-100 text-emerald-700 border-emerald-200",
  Code:         "bg-slate-100 text-slate-700 border-slate-200",
  Productivity: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function ExploreView() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = PLATFORMS.filter((p) => {
    const matchCat = active === "All" || p.category === active;
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="border-b border-zinc-100 px-8 py-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Explore AI Platforms</h1>
        <p className="text-sm text-zinc-500">Discover the best AI tools across every category — language, image, video, music, code & more.</p>

        {/* Search */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search platforms…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                active === cat
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-400 text-sm gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            No results for &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col rounded-2xl border border-zinc-100 bg-gradient-to-br ${p.gradient} p-5 hover:shadow-md hover:border-zinc-200 transition-all duration-200 cursor-pointer no-underline`}
              >
                {p.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                    {p.badge}
                  </span>
                )}

                {/* Icon + category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl leading-none">{p.icon}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {p.category}
                  </span>
                </div>

                {/* Name + description */}
                <h3 className="text-sm font-bold text-zinc-900 mb-1">{p.name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">{p.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-zinc-200 text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Visit button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 group-hover:underline">Visit platform</span>
                  <svg className="text-zinc-400 group-hover:text-zinc-700 transition-colors" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
