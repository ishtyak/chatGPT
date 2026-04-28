"use client";

import { useState } from "react";

interface Addition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  badge?: string;
  status: "available" | "coming-soon";
  highlights: string[];
}

const ADDITIONS: Addition[] = [
  /* ── Search & Research ── */
  {
    id: "web-search",
    name: "Web Search",
    category: "Search",
    icon: "🌐",
    gradient: "from-sky-50 to-blue-50",
    badge: "Popular",
    status: "available",
    highlights: ["Real-time web results", "Source citations", "News & trending topics"],
    description: "Connect AI to the live web — get real-time answers, news, and citations from current sources.",
  },
  {
    id: "deep-research",
    name: "Deep Research",
    category: "Search",
    icon: "🔬",
    gradient: "from-indigo-50 to-violet-50",
    badge: "New",
    status: "available",
    highlights: ["Multi-source synthesis", "Long-form reports", "Fact verification"],
    description: "Comprehensive multi-step research that synthesizes dozens of sources into detailed, cited reports.",
  },
  {
    id: "arxiv-search",
    name: "ArXiv Papers",
    category: "Search",
    icon: "📄",
    gradient: "from-teal-50 to-cyan-50",
    status: "available",
    highlights: ["2M+ research papers", "AI & ML focused", "Abstract summaries"],
    description: "Search and summarize academic papers from arXiv — instantly understand cutting-edge research.",
  },

  /* ── Documents & Files ── */
  {
    id: "pdf-chat",
    name: "Chat with PDF",
    category: "Documents",
    icon: "📑",
    gradient: "from-red-50 to-rose-50",
    badge: "Popular",
    status: "available",
    highlights: ["Upload any PDF", "Q&A over content", "Extract key points"],
    description: "Upload any PDF and ask questions, get summaries, or extract specific information from it.",
  },
  {
    id: "spreadsheet-ai",
    name: "Spreadsheet AI",
    category: "Documents",
    icon: "📊",
    gradient: "from-green-50 to-emerald-50",
    status: "available",
    highlights: ["CSV & Excel support", "Data analysis", "Chart generation"],
    description: "Upload CSV or Excel files — ask questions, run analysis, and generate charts automatically.",
  },
  {
    id: "doc-writer",
    name: "Document Writer",
    category: "Documents",
    icon: "✍️",
    gradient: "from-amber-50 to-yellow-50",
    status: "available",
    highlights: ["Word & Google Docs", "Templates", "Auto-formatting"],
    description: "Generate polished Word documents, reports, and proposals with professional formatting.",
  },

  /* ── Code & Dev ── */
  {
    id: "code-interpreter",
    name: "Code Interpreter",
    category: "Developer",
    icon: "⚙️",
    gradient: "from-slate-50 to-zinc-50",
    badge: "Powerful",
    status: "available",
    highlights: ["Run Python/JS live", "Data visualization", "File processing"],
    description: "Execute Python and JavaScript in a secure sandbox — crunch data, plot charts, process files.",
  },
  {
    id: "github-connector",
    name: "GitHub Connector",
    category: "Developer",
    icon: "🐙",
    gradient: "from-gray-50 to-neutral-50",
    status: "available",
    highlights: ["Read repos & PRs", "Code review AI", "Issue summarizer"],
    description: "Connect your GitHub repos — review PRs, analyze code quality, and summarize open issues with AI.",
  },
  {
    id: "api-builder",
    name: "API Builder",
    category: "Developer",
    icon: "🔌",
    gradient: "from-violet-50 to-purple-50",
    status: "coming-soon",
    highlights: ["REST & GraphQL", "Auto docs", "Test generation"],
    description: "Generate fully documented REST and GraphQL APIs with tests, schemas, and deployment configs.",
  },

  /* ── Image & Vision ── */
  {
    id: "image-analysis",
    name: "Image Analysis",
    category: "Vision",
    icon: "🔍",
    gradient: "from-pink-50 to-fuchsia-50",
    badge: "Popular",
    status: "available",
    highlights: ["Object detection", "OCR & text extract", "Scene description"],
    description: "Upload any image — identify objects, read text (OCR), describe scenes, or analyze charts.",
  },
  {
    id: "image-editor",
    name: "AI Image Editor",
    category: "Vision",
    icon: "🖌️",
    gradient: "from-rose-50 to-pink-50",
    status: "available",
    highlights: ["Inpainting", "Background remove", "Style transfer"],
    description: "Edit images with text instructions — remove backgrounds, inpaint objects, change styles.",
  },
  {
    id: "video-analysis",
    name: "Video Analyzer",
    category: "Vision",
    icon: "🎬",
    gradient: "from-orange-50 to-amber-50",
    status: "coming-soon",
    highlights: ["Scene detection", "Transcript & captions", "Content summary"],
    description: "Upload videos to auto-generate transcripts, chapter summaries, and scene-by-scene analysis.",
  },

  /* ── Voice & Audio ── */
  {
    id: "voice-dictation",
    name: "Voice Dictation",
    category: "Voice",
    icon: "🎙️",
    gradient: "from-cyan-50 to-teal-50",
    status: "available",
    highlights: ["99% accuracy", "50+ languages", "Real-time transcription"],
    description: "Speak and watch your words appear — Whisper-powered real-time transcription in 50+ languages.",
  },
  {
    id: "text-to-speech",
    name: "Text to Speech",
    category: "Voice",
    icon: "🔊",
    gradient: "from-blue-50 to-sky-50",
    status: "available",
    highlights: ["100+ voices", "Emotion control", "MP3 export"],
    description: "Convert any text to natural-sounding audio with 100+ voices. Export as MP3 instantly.",
  },
  {
    id: "podcast-studio",
    name: "Podcast Studio",
    category: "Voice",
    icon: "🎧",
    gradient: "from-purple-50 to-violet-50",
    status: "coming-soon",
    highlights: ["Multi-speaker", "Music beds", "Edit by text"],
    description: "AI podcast production — generate multi-speaker audio, add music, and edit by editing the transcript.",
  },

  /* ── Productivity ── */
  {
    id: "notion-sync",
    name: "Notion Sync",
    category: "Productivity",
    icon: "📝",
    gradient: "from-emerald-50 to-green-50",
    status: "coming-soon",
    highlights: ["2-way sync", "AI summaries", "Smart tagging"],
    description: "Sync your Notion workspace — summarize pages, auto-tag notes, and query your knowledge base.",
  },
  {
    id: "calendar-ai",
    name: "Calendar AI",
    category: "Productivity",
    icon: "📅",
    gradient: "from-lime-50 to-green-50",
    status: "coming-soon",
    highlights: ["Schedule parsing", "Meeting prep", "Agenda drafting"],
    description: "Connect Google/Outlook Calendar — let AI schedule meetings, prep agendas, and summarize your week.",
  },
  {
    id: "email-ai",
    name: "Email AI",
    category: "Productivity",
    icon: "📧",
    gradient: "from-yellow-50 to-amber-50",
    badge: "New",
    status: "coming-soon",
    highlights: ["Draft & reply", "Tone adjustment", "Inbox summarizer"],
    description: "AI email assistant — draft replies, adjust tone, summarize threads, and triage your inbox.",
  },
];

const CATEGORIES = ["All", "Search", "Documents", "Developer", "Vision", "Voice", "Productivity"];

const CATEGORY_COLORS: Record<string, string> = {
  Search:       "bg-sky-100 text-sky-700 border-sky-200",
  Documents:    "bg-red-100 text-red-700 border-red-200",
  Developer:    "bg-slate-100 text-slate-700 border-slate-200",
  Vision:       "bg-pink-100 text-pink-700 border-pink-200",
  Voice:        "bg-cyan-100 text-cyan-700 border-cyan-200",
  Productivity: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function AdditionsView() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ADDITIONS.filter((a) => {
    const matchCat = active === "All" || a.category === active;
    const q = search.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const available = filtered.filter((a) => a.status === "available");
  const comingSoon = filtered.filter((a) => a.status === "coming-soon");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="border-b border-zinc-100 px-8 py-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Additions</h1>
        <p className="text-sm text-zinc-500">Supercharge your AI experience — add web search, document reading, code execution & more.</p>

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
              placeholder="Search additions…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {available.length} available
            <span className="ml-2 w-2 h-2 rounded-full bg-zinc-300 inline-block" />
            {comingSoon.length} coming soon
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

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-400 text-sm gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            No additions match &ldquo;{search}&rdquo;
          </div>
        ) : (
          <>
            {/* Available */}
            {available.length > 0 && (
              <>
                {comingSoon.length > 0 && (
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Available</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {available.map((item) => (
                    <AdditionCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}

            {/* Coming soon */}
            {comingSoon.length > 0 && (
              <>
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Coming Soon</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {comingSoon.map((item) => (
                    <AdditionCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AdditionCard({ item }: { item: Addition }) {
  const [added, setAdded] = useState(false);
  const isCS = item.status === "coming-soon";

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${item.gradient} p-5 transition-all duration-200 ${isCS ? "border-zinc-100 opacity-70" : "border-zinc-100 hover:shadow-md hover:border-zinc-200"}`}>
      {item.badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
          {item.badge}
        </span>
      )}

      {/* Icon + category */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl leading-none">{item.icon}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category] ?? "bg-zinc-100 text-zinc-600"}`}>
          {item.category}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-bold text-zinc-900 mb-1">{item.name}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-3">{item.description}</p>

      {/* Highlights */}
      <ul className="mb-4 flex flex-col gap-1">
        {item.highlights.map((h) => (
          <li key={h} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-zinc-400 flex-shrink-0">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {h}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCS ? (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-xs text-zinc-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block flex-shrink-0" />
          Coming Soon
        </div>
      ) : (
        <button
          onClick={() => setAdded((v) => !v)}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95 ${
            added
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-zinc-900 text-white hover:bg-zinc-700"
          }`}
        >
          {added ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Added
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </>
          )}
        </button>
      )}
    </div>
  );
}
