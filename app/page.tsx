"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import AuthModal from "./components/AuthModal";
import ModelSelector, { MODELS } from "./components/ModelSelector";
import { ImageOptionsPanel, VideoOptionsPanel, EditOptionsPanel, UpscaleOptionsPanel, MusicOptionsPanel, SoundOptionsPanel, SpeechOptionsPanel, VoiceOptionsPanel, CodeOptionsPanel } from "./components/ActionPanels";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name: string) {
  const h = new Date().getHours();
  const period = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${period}, ${name}!`;
}

function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconExplore() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconNewChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function IconKeep() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconAdditions() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconSidebarToggle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}
function IconWaveform() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2"/>
    </svg>
  );
}
function IconAnthropicA() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z"/>
    </svg>
  );
}

// ── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownContent({ content, streaming }: { content: string; streaming: boolean }) {
  return (
    <div className="prose-ai text-sm text-zinc-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-zinc-900 mt-5 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-zinc-900 mt-4 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-zinc-900 mt-4 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-zinc-800 mt-3 mb-1">{children}</h4>,
          p:  ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-700">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
            inline
              ? <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-700">{children}</code>
              : <code className="block rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2.5 font-mono text-xs text-zinc-700 overflow-x-auto my-2">{children}</code>,
          pre: ({ children }) => <pre className="bg-transparent p-0 m-0">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-zinc-300 pl-3 italic text-zinc-500 my-2">{children}</blockquote>,
          hr: () => <hr className="border-zinc-200 my-3" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="cursor-blink" />}
    </div>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-700 text-white"
          : "text-zinc-400 hover:bg-zinc-700/60 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const userName = session?.user?.name ?? "";
  const userImage = session?.user?.image ?? "";
  const userInitial = userName.charAt(0).toUpperCase();
  const [authModal, setAuthModal] = useState<"signup" | "signin" | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("claude-opus-4-6");

  // ── Chat state ───────────────────────────────────────────────────────────
  type Message = { id: string; role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Smooth streaming via requestAnimationFrame
  const fullTextRef      = useRef("");       // raw text received from stream
  const displayRef       = useRef(0);        // how many chars are visible so far
  const streamDoneRef    = useRef(false);    // true once the HTTP stream closes
  const streamingIdRef   = useRef<string | null>(null);
  const rafRef           = useRef<number | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  // Chars revealed per animation frame (~60fps × 3 = ~180 chars/sec)
  const CHARS_PER_FRAME = 3;

  function startAnimation(aiId: string) {
    streamingIdRef.current = aiId;
    setStreamingId(aiId);

    function frame() {
      const full = fullTextRef.current;
      const done = streamDoneRef.current;

      if (displayRef.current < full.length) {
        displayRef.current = Math.min(displayRef.current + CHARS_PER_FRAME, full.length);
        const visible = full.slice(0, displayRef.current);
        setMessages((prev) =>
          prev.map((m) => (m.id === streamingIdRef.current ? { ...m, content: visible } : m))
        );
      }

      if (!done || displayRef.current < full.length) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Stream fully consumed
        streamingIdRef.current = null;
        setStreamingId(null);
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    const aiId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: "" }]);

    // Reset animation state
    fullTextRef.current = "";
    displayRef.current  = 0;
    streamDoneRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModelId,
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: `Error: ${err.error ?? "Something went wrong"}` } : m
          )
        );
        setIsTyping(false);
        return;
      }

      setIsTyping(false);
      startAnimation(aiId);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullTextRef.current += decoder.decode(value, { stream: true });
      }
      // Signal animation loop that the source is exhausted
      streamDoneRef.current = true;
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: "Network error. Please try again." } : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  // ── Quick-action panel state ───────────────────────────────────────
  const [activePanel, setActivePanel] = useState<"image"|"video"|"edit"|"upscale"|"music"|"sound"|"speech"|"voice"|"code"|null>(null);
  const [showAllActions, setShowAllActions] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    }
    if (plusMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [plusMenuOpen]);

  const PLUS_MENU_ITEMS = [
    {
      label: "Add photos & files",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
      action: () => { const el = document.createElement("input"); el.type="file"; el.accept="image/*,.pdf,.txt,.doc,.docx"; el.multiple=true; el.click(); setPlusMenuOpen(false); },
    },
    {
      label: "Create image",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
      action: () => { setActivePanel("image"); setPlusMenuOpen(false); },
    },
    {
      label: "Thinking",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
      action: () => { setInputValue((v) => v); setPlusMenuOpen(false); },
    },
    {
      label: "Deep research",
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
      action: () => { setInputValue("/search "); setPlusMenuOpen(false); },
    },
  ];

  function renderPlusMenu() {
    return (
      <div className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl border border-zinc-100 bg-white py-1.5 shadow-xl z-50">
        {PLUS_MENU_ITEMS.map((item) => (
          <button key={item.label} onMouseDown={(e) => { e.preventDefault(); item.action(); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors text-left">
            <span className="text-zinc-500">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="mx-4 my-1 border-t border-zinc-100" />
        <button onMouseDown={(e) => e.preventDefault()}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></span>
            More
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    );
  }

  type ActionItem = {
    label: string;
    cmd: string;
    panel?: "image"|"video"|"edit"|"upscale"|"music"|"sound"|"speech"|"voice"|"code";
    text: string; border: string; bg: string;
    icon: React.ReactNode;
  };

  const ALL_ACTIONS: ActionItem[] = [
    { label: "Image",     cmd: "/image",     panel: "image",
      text: "text-pink-600",    border: "border-pink-200",    bg: "bg-pink-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
    { label: "Video",     cmd: "/video",     panel: "video",
      text: "text-rose-600",    border: "border-rose-200",    bg: "bg-rose-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg> },
    { label: "Edit",      cmd: "/edit",      panel: "edit",
      text: "text-red-500",     border: "border-red-200",     bg: "bg-red-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { label: "Upscale",   cmd: "/upscale",   panel: "upscale",
      text: "text-orange-500",  border: "border-orange-200",  bg: "bg-orange-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><path d="M21 3l-7 7"/><polyline points="9 21 3 21 3 15"/><path d="M3 21l7-7"/></svg> },
    { label: "Visual",    cmd: "/visual",
      text: "text-amber-600",   border: "border-amber-200",   bg: "bg-amber-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg> },
    { label: "Music",     cmd: "/music",     panel: "music",
      text: "text-yellow-600",  border: "border-yellow-200",  bg: "bg-yellow-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
    { label: "Sound",     cmd: "/sound",     panel: "sound",
      text: "text-lime-600",    border: "border-lime-200",    bg: "bg-lime-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> },
    { label: "Speech",    cmd: "/speech",    panel: "speech",
      text: "text-green-600",   border: "border-green-200",   bg: "bg-green-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
    { label: "Voice",     cmd: "/voice",     panel: "voice",
      text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2"/></svg> },
    { label: "Transcribe",cmd: "/transcribe",
      text: "text-teal-600",    border: "border-teal-200",    bg: "bg-teal-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg> },
    { label: "Search",    cmd: "/search",
      text: "text-cyan-600",    border: "border-cyan-200",    bg: "bg-cyan-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { label: "Summarize", cmd: "/summarize",
      text: "text-sky-600",     border: "border-sky-200",     bg: "bg-sky-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg> },
    { label: "Detect",    cmd: "/detect",
      text: "text-blue-600",    border: "border-blue-200",    bg: "bg-blue-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { label: "Plagiarism",cmd: "/plagiarism",
      text: "text-indigo-600",  border: "border-indigo-200",  bg: "bg-indigo-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg> },
    { label: "Humanize",  cmd: "/humanize",
      text: "text-violet-600",  border: "border-violet-200",  bg: "bg-violet-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: "Compare",   cmd: "/compare",
      text: "text-purple-600",  border: "border-purple-200",  bg: "bg-purple-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg> },
    { label: "Document",  cmd: "/document",
      text: "text-fuchsia-600", border: "border-fuchsia-200", bg: "bg-fuchsia-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label: "Code",      cmd: "/code",      panel: "code",
      text: "text-slate-600",   border: "border-slate-200",   bg: "bg-slate-50",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  ];

  const VISIBLE_ACTIONS = showAllActions ? ALL_ACTIONS : ALL_ACTIONS.slice(0, 7);

  function handleActionClick(action: ActionItem) {
    if (action.panel) {
      setActivePanel((prev) => prev === action.panel ? null : action.panel!);
    } else {
      setActivePanel(null);
      setInputValue(action.cmd + " ");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col bg-[#1a1a1a] transition-all duration-300 ${
          sidebarOpen ? "w-64 min-w-[256px]" : "w-0 overflow-hidden"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a1a1a">
              <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z"/>
            </svg>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <IconSidebarToggle />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2 py-3">
          <NavItem icon={<IconNewChat />} label="New chat" active />
          <NavItem icon={<IconKeep />} label="Keep" />
          <NavItem icon={<IconAdditions />} label="Additions" />
          <NavItem icon={<IconExplore />} label="Explore" />
          <NavItem icon={<IconSearch />} label="Search" />
        </nav>

        <div className="flex-1" />

        {/* Bottom: user info or sign-up */}
        <div className="border-t border-zinc-700/50 px-4 py-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={32}
                    height={32}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-semibold">
                    {userInitial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1a1a1a] bg-green-400" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-white">{userName}</span>
                <button
                  onClick={() => signOut()}
                  className="text-left text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAuthModal("signup")}
              className="flex w-full items-center gap-3 rounded-lg px-1 py-1 hover:bg-zinc-700/40 transition-colors group"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 group-hover:bg-zinc-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-white">Sign up now</span>
                <span className="text-xs text-zinc-500">Sign up to save your chats</span>
              </div>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {/* Top bar */}
        <header className="flex items-center px-6 pt-4 pb-2">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-3 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <IconSidebarToggle />
            </button>
          )}
          <div className="relative">
            {(() => {
              const active = MODELS.find((m) => m.id === selectedModelId);
              return (
                <button
                  onClick={() => setModelSelectorOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  {active ? active.icon : <IconAnthropicA />}
                  <span>{active ? active.name : "Claude Opus 4.6"}</span>
                  <IconChevronDown />
                </button>
              );
            })()}
          </div>
          {modelSelectorOpen && (
            <ModelSelector
              selectedModel={selectedModelId}
              onSelect={(id) => setSelectedModelId(id)}
              onClose={() => setModelSelectorOpen(false)}
            />
          )}
          <div className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors">
            <IconHelp />
          </div>
        </header>

        {messages.length === 0 ? (
          /* ── Empty / landing state ── */
          <main className="flex flex-1 flex-col items-center justify-start pt-[38vh] px-6 pb-4 overflow-y-auto" style={{scrollbarWidth:"none"} as React.CSSProperties}>
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900">
              {isLoggedIn
                ? getGreeting(userName.split(" ")[0])
                : "What's on the agenda today?"}
            </h1>

            <div className="w-full max-w-2xl">
              {/* Input row with panel floating above it */}
              <div className="relative">
                {/* Option panel — absolutely above input, grows upward */}
                {activePanel && (
                  <div className="absolute bottom-full left-0 right-0 mb-3 z-10">
                    {activePanel === "image" && <ImageOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "video" && <VideoOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "edit" && <EditOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "upscale" && <UpscaleOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "music" && <MusicOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "sound" && <SoundOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "speech" && <SpeechOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "voice" && <VoiceOptionsPanel onClose={() => setActivePanel(null)} />}
                    {activePanel === "code" && <CodeOptionsPanel onClose={() => setActivePanel(null)} />}
                  </div>
                )}

              <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-400 focus-within:shadow-md transition-all">
                <div ref={plusMenuRef} className="relative shrink-0">
                  {plusMenuOpen && renderPlusMenu()}
                  <button
                    onClick={() => setPlusMenuOpen((v) => !v)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${plusMenuOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                {activePanel && (() => {
                  const colorMap: Record<string,string> = { image:"text-pink-500", video:"text-rose-500", edit:"text-red-500", upscale:"text-orange-500", music:"text-yellow-500", sound:"text-lime-500", speech:"text-green-500", voice:"text-emerald-500", code:"text-slate-500" };
                  const iconMap: Record<string,React.ReactNode> = {
                    image: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
                    video: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg>,
                    edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
                    upscale: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><path d="M21 3l-7 7"/><polyline points="9 21 3 21 3 15"/><path d="M3 21l7-7"/></svg>,
                    music: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
                    sound: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
                    speech: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
                    voice: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2"/></svg>,
                    code: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
                  };
                  const c = colorMap[activePanel] ?? "text-zinc-500";
                  return (<><span className={`shrink-0 ${c}`}>{iconMap[activePanel]}</span><span className={`shrink-0 text-sm font-medium ${c}`}>/{activePanel}</span></>);
                })()}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={activePanel ? `Describe your ${activePanel}...` : "Ask anything..."}
                  className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                />
                <button className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <IconMic />
                </button>
                <button
                  onClick={handleSend}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                >
                  <IconWaveform />
                </button>
              </div>
              </div>{/* end relative wrapper */}

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {VISIBLE_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleActionClick(action)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      (action.panel && activePanel === action.panel)
                        ? `${action.text} ${action.border} ${action.bg} ring-1 ring-current ring-offset-0`
                        : `${action.text} ${action.border} ${action.bg} hover:opacity-80`
                    }`}
                  >
                    <span className={`inline-flex ${action.text}`}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Show all / Show less */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowAllActions((v) => !v)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <span>{showAllActions ? "Show less" : "Show all"}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    {showAllActions
                      ? <polyline points="18 15 12 9 6 15" />
                      : <polyline points="6 9 12 15 18 9" />
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Sign-in CTA */}
            {!isLoggedIn && status !== "loading" && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm text-zinc-400">Sign in to save your conversations</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAuthModal("signup")}
                    className="flex items-center gap-2.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-all"
                  >
                    Create account
                  </button>
                  <button
                    onClick={() => setAuthModal("signin")}
                    className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}
          </main>
        ) : (
          /* ── Chat view ── */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Messages scroll area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto flex max-w-2xl flex-col gap-6">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    /* User bubble – right aligned */
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[70%] rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* AI message – left aligned */
                    <div key={msg.id} className="flex flex-col gap-2">
                      <MarkdownContent
                        content={msg.content}
                        streaming={streamingId === msg.id}
                      />
                      {/* Action bar */}
                      <div className="flex items-center gap-0.5">
                        {/* Copy */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          )}
                        </button>
                        {/* Thumbs up */}
                        <button title="Good response" className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        </button>
                        {/* Thumbs down */}
                        <button title="Bad response" className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                        </button>
                        {/* Share */}
                        <button title="Share" className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        </button>
                        {/* Regenerate */}
                        <button title="Regenerate" className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        </button>
                        {/* More */}
                        <button title="More" className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]"/>
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]"/>
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]"/>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Fixed input bar at bottom */}
            <div className="border-t border-zinc-100 px-6 py-4">
              <div className="mx-auto w-full max-w-2xl">
                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-400 focus-within:shadow-md transition-all">
                  <div ref={plusMenuRef} className="relative shrink-0">
                    {plusMenuOpen && renderPlusMenu()}
                    <button
                      onClick={() => setPlusMenuOpen((v) => !v)}
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${plusMenuOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                    autoFocus
                  />
                  <button className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <IconMic />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <IconWaveform />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  );
}
