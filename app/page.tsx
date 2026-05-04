"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MusicOptions, VideoOptions } from "./components/ActionPanels";
import {
  CodeOptionsPanel,
  EditOptionsPanel,
  ImageOptionsPanel,
  MusicOptionsPanel,
  SoundOptionsPanel,
  SpeechOptionsPanel,
  UpscaleOptionsPanel,
  VideoOptionsPanel,
  VoiceOptionsPanel,
} from "./components/ActionPanels";
import AdditionsView from "./components/AdditionsView";
import AuthModal from "./components/AuthModal";
import ExploreView from "./components/ExploreView";
import ModelSelector, { MODELS } from "./components/ModelSelector";
import TemplatesView from "./components/TemplatesView";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name: string) {
  const h = new Date().getHours();
  const period = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${period}, ${name}!`;
}

function IconHelp() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconExplore() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconNewChat() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IconKeep() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconAdditions() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconSidebarToggle() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
// ── SpeechRecognition type shim ─────────────────────────────────────────────
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  readonly resultIndex?: number;
  item(index: number): {
    isFinal: boolean;
    length: number;
    [i: number]: SpeechRecognitionResultItem;
  };
  [index: number]: {
    isFinal: boolean;
    length: number;
    [i: number]: SpeechRecognitionResultItem;
  };
}
interface MySpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: MySpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function IconMic() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function IconWaveform() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2" />
    </svg>
  );
}
function IconAnthropicA() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z" />
    </svg>
  );
}

const VIDEO_INTENT_RE =
  /\b(generate|create|make|produce|render|animate|record)\b.{0,60}\b(video|clip|animation|reel|footage|motion|film|movie|cinematic)\b/i;
const VIDEO_NOUN_FIRST_RE =
  /\b(video|clip|animation|reel|footage|film|movie)\s+(of|showing|with|depicting|for)\b/i;
const FREE_TIER_MESSAGE_LIMIT = 2;

function isVideoRequest(text: string): boolean {
  return VIDEO_INTENT_RE.test(text) || VIDEO_NOUN_FIRST_RE.test(text);
}

// ── Video message renderer ───────────────────────────────────────────────────

function VideoMessage({ content }: { content: string }) {
  if (content.startsWith("__VIDEO_PENDING__:")) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4"
        style={{ maxWidth: "480px" }}
      >
        <span className="relative flex h-4 w-4 shrink-0">
          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
        </span>
        <div>
          <p className="text-sm font-medium text-zinc-800">Generating video…</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            This usually takes 30–90 seconds
          </p>
        </div>
      </div>
    );
  }

  if (content.startsWith("__VIDEO_ERROR__:")) {
    const msg = content.replace("__VIDEO_ERROR__:", "");
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        style={{ maxWidth: "480px" }}
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {msg || "Video generation failed"}
      </div>
    );
  }

  // __VIDEO__:<url>
  const rawUrl = content.replace("__VIDEO__:", "");
  // Route through our server proxy to avoid CORS issues with Replicate CDN
  const proxyUrl = `/api/video/proxy?url=${encodeURIComponent(rawUrl)}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "generated-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open proxy URL in new tab
      window.open(proxyUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2" style={{ maxWidth: "480px" }}>
      <div className="relative group overflow-hidden rounded-2xl border border-zinc-200 shadow-sm bg-black">
        <video
          src={proxyUrl}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
        />
        {/* Download overlay button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow transition-all"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>
      {/* Prominent download button below */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download video
      </button>
    </div>
  );
}

// ── Image intent detection ───────────────────────────────────────────────────

const IMAGE_INTENT_RE =
  /\b(generate|create|draw|make|design|produce|paint|render|illustrate|show me|give me|get me)\b.{0,60}\b(image|img|photo|picture|illustration|artwork|drawing|painting|poster|wallpaper|portrait|logo|icon|thumbnail|banner)\b/i;
const IMAGE_NOUN_FIRST_RE =
  /\b(image|img|photo|picture|illustration|artwork|drawing|painting|poster|wallpaper|portrait|logo|icon|thumbnail|banner)\s+(of|showing|with|depicting|for)\b/i;

function isImageRequest(text: string): boolean {
  return IMAGE_INTENT_RE.test(text) || IMAGE_NOUN_FIRST_RE.test(text);
}

// ── Image message renderer ───────────────────────────────────────────────────

function ImageMessage({ content }: { content: string }) {
  // format: __IMAGE__:<url1>|<url2>||<revisedPrompt>
  const raw = content.replace("__IMAGE__:", "");
  const sepIdx = raw.indexOf("||");
  const urlsPart = sepIdx === -1 ? raw : raw.slice(0, sepIdx);
  const caption = sepIdx === -1 ? "" : raw.slice(sepIdx + 2);
  const urls = urlsPart.split("|").filter(Boolean);

  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `generated-image${urls.length > 1 ? `-${idx + 1}` : ""}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`grid gap-2 ${urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        style={{ maxWidth: urls.length > 1 ? "640px" : "480px" }}
      >
        {urls.map((url, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-2xl border border-zinc-200 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={caption || `Generated image ${idx + 1}`}
              className="w-full h-auto block"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-end p-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleDownload(url, idx)}
                className="flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow transition-all"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
      {caption && (
        <p
          className="text-xs text-zinc-400 italic leading-relaxed"
          style={{ maxWidth: urls.length > 1 ? "640px" : "480px" }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

// ── Music message renderer ────────────────────────────────────────────────────

function MusicMessage({ content }: { content: string }) {
  // format: __MUSIC__:<url>||<caption>
  const raw = content.replace("__MUSIC__:", "");
  const sepIdx = raw.indexOf("||");
  const url = sepIdx === -1 ? raw : raw.slice(0, sepIdx);
  const caption = sepIdx === -1 ? "" : raw.slice(sepIdx + 2);

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "generated-music.mp3";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2" style={{ maxWidth: "480px" }}>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800">Generated Music</p>
            {caption && (
              <p className="text-xs text-zinc-400 truncate max-w-[320px]">
                {caption}
              </p>
            )}
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          controls
          src={url}
          className="w-full h-10"
          style={{ borderRadius: "8px" }}
        />
        <button
          onClick={handleDownload}
          className="self-start flex items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}

// ── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownContent({
  content,
  streaming,
}: {
  content: string;
  streaming: boolean;
}) {
  return (
    <div className="prose-ai text-sm text-zinc-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-zinc-900 mt-5 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-zinc-900 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-zinc-900 mt-4 mb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-zinc-800 mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-700">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({
            inline,
            children,
          }: {
            inline?: boolean;
            children?: React.ReactNode;
          }) =>
            inline ? (
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-700">
                {children}
              </code>
            ) : (
              <code className="block rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2.5 font-mono text-xs text-zinc-700 overflow-x-auto my-2">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="bg-transparent p-0 m-0">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-zinc-300 pl-3 italic text-zinc-500 my-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-zinc-200 my-3" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="cursor-blink" />}
    </div>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50 bg-transparent text-zinc-400"
          : active
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const userName = session?.user?.name ?? "";
  const userImage = session?.user?.image ?? "";
  const userInitial = userName.charAt(0).toUpperCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessToken = (session as any)?.accessToken as string | undefined;
  const [authModal, setAuthModal] = useState<"signup" | "signin" | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("claude-opus-4-6");

  // ── Chat state ───────────────────────────────────────────────────────────
  type Message = { id: string; role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [freeTierUsage, setFreeTierUsage] = useState(0);
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("hasPlan") === "true") {
        setHasPlan(true);
      }
    } catch (e) {}
  }, []);

  const [activeView, setActiveView] = useState<
    "templates" | "explore" | "additions" | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedId, setLikedId] = useState<string | null>(null);
  const [dislikedId, setDislikedId] = useState<string | null>(null);
  const [sharedMsgId, setSharedMsgId] = useState<string | null>(null);
  const messageIdCounterRef = useRef(0);

  // ── Conversation persistence ─────────────────────────────────────────────
  type RecentChat = { id: number; title: string; updated_at: string };
  const BACKEND_API =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const [conversationId, setConversationId] = useState<number | null>(null);
  const conversationIdRef = useRef<number | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function setActiveConversation(id: number | null) {
    conversationIdRef.current = id;
    setConversationId(id);
  }

  // Smooth streaming via requestAnimationFrame
  const fullTextRef = useRef(""); // raw text received from stream
  const displayRef = useRef(0); // how many chars are visible so far
  const streamDoneRef = useRef(false); // true once the HTTP stream closes
  const streamingIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  // Video polling
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userMessageCount = messages.filter(
    (message) => message.role === "user",
  ).length;
  const totalFreeTierUsage = Math.max(freeTierUsage, userMessageCount);
  const freeTierBlocked =
    !hasPlan && totalFreeTierUsage >= FREE_TIER_MESSAGE_LIMIT;
  const remainingFreeMessages = Math.max(
    0,
    FREE_TIER_MESSAGE_LIMIT - totalFreeTierUsage,
  );
  const chatAccessBlocked = !isLoggedIn || freeTierBlocked;
  const chatBlockedCopy = !isLoggedIn
    ? "Sign in to start chatting."
    : freeTierBlocked
      ? "Free limit reached. View plans to continue."
      : "Ask anything...";

  function goToPricing() {
    setActivePanel(null);
    setPlusMenuOpen(false);
    setPlusMenuMore(false);
    router.push("/pricing");
  }

  function requireChatAccess() {
    if (!isLoggedIn) {
      setAuthModal("signin");
      return true;
    }

    if (freeTierBlocked) {
      goToPricing();
      return true;
    }

    return false;
  }

  // ── Voice dictation ───────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startDictation = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    // Keep the text already typed so we append the transcript after it
    const baseText = inputValue.trimEnd();

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: MySpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      const appended = final || interim;
      setInputValue(baseText ? `${baseText} ${appended}` : appended);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [isRecording, inputValue]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      recognitionRef.current?.stop();
    },
    [],
  );

  // Chars revealed per animation frame (~60fps × 3 = ~180 chars/sec)
  const CHARS_PER_FRAME = 3;

  function startAnimation(aiId: string) {
    streamingIdRef.current = aiId;
    setStreamingId(aiId);

    function frame() {
      const full = fullTextRef.current;
      const done = streamDoneRef.current;

      if (displayRef.current < full.length) {
        displayRef.current = Math.min(
          displayRef.current + CHARS_PER_FRAME,
          full.length,
        );
        const visible = full.slice(0, displayRef.current);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current ? { ...m, content: visible } : m,
          ),
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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  function startVideoPoll(messageId: string, predictionId: string) {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/poll?id=${predictionId}`);
        const data = (await res.json()) as {
          status: string;
          videoUrl?: string;
          error?: string;
        };
        if (data.status === "succeeded" && data.videoUrl) {
          clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: `__VIDEO__:${data.videoUrl}` }
                : m,
            ),
          );
          // Persist now that we have the URL
          if (isLoggedIn && accessToken) {
            const text = messages.find((m) => m.role === "user")?.content ?? "";
            let convId = conversationIdRef.current;
            if (convId === null) {
              convId = await createConversation(text, accessToken);
              if (convId !== null) setActiveConversation(convId);
            }
            if (convId !== null) {
              await saveMessages(
                convId,
                [{ role: "assistant", content: `__VIDEO__:${data.videoUrl}` }],
                accessToken,
              );
            }
          }
        } else if (data.status === "failed") {
          clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: `__VIDEO_ERROR__:${data.error ?? "Generation failed"}`,
                  }
                : m,
            ),
          );
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 4000);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    if (requireChatAccess()) {
      return;
    }

    const text = inputValue.trim();
    if (!text) return;

    const nextUsage = totalFreeTierUsage + 1;
    setFreeTierUsage(nextUsage);

    const nextMessageId = () => {
      messageIdCounterRef.current += 1;
      return `msg-${messageIdCounterRef.current}`;
    };

    const userMsg: Message = {
      id: nextMessageId(),
      role: "user",
      content: text,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    const aiId = nextMessageId();
    setMessages((prev) => [
      ...prev,
      { id: aiId, role: "assistant", content: "" },
    ]);

    // ── Route by active panel first, then keyword detection ─────────────────
    // Use activePanelRef (not the closure value) to survive React 18 concurrent
    // mode where a delayed re-render might leave the closure with a stale value.
    const panel = activePanelRef.current;
    const doImage =
      panel === "image" || (panel === null && isImageRequest(text));
    const doVideo =
      panel === "video" ||
      (panel === null && isVideoRequest(text) && !isImageRequest(text));
    const doMusic = panel === "music";

    // ── Image generation ────────────────────────────────────────────────────
    if (doImage) {
      try {
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            model: imageModel,
            aspectRatio: imageRatio,
            count: imageCount,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content: `Error: ${data.error ?? "Image generation failed"}`,
                  }
                : m,
            ),
          );
          setIsTyping(false);
          return;
        }
        const urls: string[] = Array.isArray(data.urls)
          ? data.urls
          : [data.url ?? ""];
        const imageContent = `__IMAGE__:${urls.join("|")}||${data.revisedPrompt ?? ""}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: imageContent } : m,
          ),
        );
        setIsTyping(false);

        // Persist
        if (isLoggedIn && accessToken) {
          let convId = conversationIdRef.current;
          if (convId === null) {
            convId = await createConversation(text, accessToken);
            if (convId !== null) setActiveConversation(convId);
          }
          if (convId !== null) {
            await saveMessages(
              convId,
              [
                { role: "user", content: text },
                { role: "assistant", content: imageContent },
              ],
              accessToken,
            );
            void fetchRecentChats(accessToken);
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: "Network error. Please try again." }
              : m,
          ),
        );
        setIsTyping(false);
      }
      return;
    }

    // ── Video generation ─────────────────────────────────────────────────────
    if (doVideo) {
      try {
        const res = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            model: videoOpts.model,
            mode: videoOpts.mode,
            duration: videoOpts.duration,
            aspectRatio: videoOpts.ratio,
          }),
        });
        const data = (await res.json()) as {
          id?: string;
          status?: string;
          videoUrl?: string;
          error?: string;
        };
        if (!res.ok || data.error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content: `__VIDEO_ERROR__:${data.error ?? "Video generation failed"}`,
                  }
                : m,
            ),
          );
          setIsTyping(false);
          return;
        }
        // Succeeded immediately (rare but possible with Prefer: wait)
        if (data.status === "succeeded" && data.videoUrl) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: `__VIDEO__:${data.videoUrl}` }
                : m,
            ),
          );
          setIsTyping(false);
          // Persist
          if (isLoggedIn && accessToken) {
            let convId = conversationIdRef.current;
            if (convId === null) {
              convId = await createConversation(text, accessToken);
              if (convId !== null) setActiveConversation(convId);
            }
            if (convId !== null) {
              await saveMessages(
                convId,
                [
                  { role: "user", content: text },
                  { role: "assistant", content: `__VIDEO__:${data.videoUrl}` },
                ],
                accessToken,
              );
              void fetchRecentChats(accessToken);
            }
          }
          return;
        }
        // Show pending state and start polling
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: `__VIDEO_PENDING__:${data.id}` }
              : m,
          ),
        );
        setIsTyping(false);
        if (data.id) startVideoPoll(aiId, data.id);

        // Persist user message
        if (isLoggedIn && accessToken) {
          let convId = conversationIdRef.current;
          if (convId === null) {
            convId = await createConversation(text, accessToken);
            if (convId !== null) setActiveConversation(convId);
          }
          if (convId !== null) {
            await saveMessages(
              convId,
              [{ role: "user", content: text }],
              accessToken,
            );
            void fetchRecentChats(accessToken);
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content: "__VIDEO_ERROR__:Network error. Please try again.",
                }
              : m,
          ),
        );
        setIsTyping(false);
      }
      return;
    }

    // ── Music generation ─────────────────────────────────────────────────────
    if (doMusic) {
      try {
        const res = await fetch("/api/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            tags: musicOpts.tags,
            lyrics: musicOpts.lyrics,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || data.error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content: `Error: ${data.error ?? "Music generation failed"}`,
                  }
                : m,
            ),
          );
          setIsTyping(false);
          return;
        }
        const musicContent = `__MUSIC__:${data.url}||${text}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: musicContent } : m,
          ),
        );
        setIsTyping(false);
        if (isLoggedIn && accessToken) {
          let convId = conversationIdRef.current;
          if (convId === null) {
            convId = await createConversation(text, accessToken);
            if (convId !== null) setActiveConversation(convId);
          }
          if (convId !== null) {
            await saveMessages(
              convId,
              [
                { role: "user", content: text },
                { role: "assistant", content: musicContent },
              ],
              accessToken,
            );
            void fetchRecentChats(accessToken);
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: "Network error. Please try again." }
              : m,
          ),
        );
        setIsTyping(false);
      }
      return;
    }

    // Reset animation state
    fullTextRef.current = "";
    displayRef.current = 0;
    streamDoneRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModelId,
          messages: updatedMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content: `Error: ${err.error ?? "Something went wrong"}`,
                }
              : m,
          ),
        );
        setIsTyping(false);
        return;
      }

      setIsTyping(false);
      startAnimation(aiId);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullTextRef.current += decoder.decode(value, { stream: true });
      }
      // Signal animation loop that the source is exhausted
      streamDoneRef.current = true;

      // ── Persist to backend ──────────────────────────────────────────────
      if (isLoggedIn && accessToken) {
        let convId = conversationIdRef.current;
        if (convId === null) {
          convId = await createConversation(text, accessToken);
          if (convId !== null) setActiveConversation(convId);
        }
        if (convId !== null) {
          await saveMessages(
            convId,
            [
              { role: "user", content: text },
              { role: "assistant", content: fullTextRef.current },
            ],
            accessToken,
          );
          void fetchRecentChats(accessToken);
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, content: "Network error. Please try again." }
            : m,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }

  function handleLike(id: string) {
    setLikedId((prev) => (prev === id ? null : id));
    setDislikedId((d) => (d === id ? null : d));
  }

  function handleDislike(id: string) {
    setDislikedId((prev) => (prev === id ? null : id));
    setLikedId((l) => (l === id ? null : l));
  }

  function handleShareMsg(id: string, text: string) {
    // Share the message text to clipboard
    let shareText = text;
    if (text.startsWith("__IMAGE__:"))
      shareText = text.replace("__IMAGE__:", "").split("||")[0];
    else if (
      text.startsWith("__VIDEO__:") ||
      text.startsWith("__VIDEO_PENDING__:") ||
      text.startsWith("__VIDEO_ERROR__:")
    )
      shareText = window.location.href;
    else if (text.startsWith("__MUSIC__:")) shareText = window.location.href;
    navigator.clipboard.writeText(shareText);
    setSharedMsgId(id);
    setTimeout(() => setSharedMsgId(null), 1500);
  }

  function handleRegenerate(msgIndex: number) {
    if (requireChatAccess()) {
      return;
    }

    // Find the last user message before this assistant message
    const userMsg = [...messages]
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === "user");
    if (!userMsg || isTyping) return;
    // Strip the current assistant message and replay
    const trimmed = messages.slice(0, msgIndex);
    setMessages(trimmed);
    setInputValue(userMsg.content);
    setTimeout(() => handleSend(), 0);
  }

  function handleCopy(id: string, text: string) {
    let copyText = text;
    if (text.startsWith("__IMAGE__:"))
      copyText = text.replace("__IMAGE__:", "").split("||")[0];
    else if (text.startsWith("__VIDEO__:")) {
      const raw = text.replace("__VIDEO__:", "");
      copyText = `/api/video/proxy?url=${encodeURIComponent(raw)}`;
    } else if (
      text.startsWith("__VIDEO_PENDING__:") ||
      text.startsWith("__VIDEO_ERROR__:")
    )
      return;
    navigator.clipboard.writeText(copyText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  // ── Backend API helpers ─────────────────────────────────────────────────
  async function fetchRecentChats(token: string) {
    try {
      const res = await fetch(`${BACKEND_API}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRecentChats(await res.json());
    } catch {
      /* network error — silently ignore */
    }
  }

  async function createConversation(
    title: string,
    token: string,
  ): Promise<number | null> {
    try {
      const res = await fetch(`${BACKEND_API}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.slice(0, 80) }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.id as number;
    } catch {
      return null;
    }
  }

  async function saveMessages(
    convId: number,
    msgs: { role: string; content: string }[],
    token: string,
  ) {
    try {
      await fetch(`${BACKEND_API}/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: msgs }),
      });
    } catch {
      /* ignore */
    }
  }

  async function loadConversation(id: number, token: string) {
    try {
      const res = await fetch(
        `${BACKEND_API}/api/conversations/${id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;
      const msgs = await res.json();
      setMessages(
        msgs.map(
          (m: { id: number; role: "user" | "assistant"; content: string }) => ({
            id: String(m.id),
            role: m.role,
            content: m.content,
          }),
        ),
      );
      setActiveConversation(id);
      setActiveView(null);
    } catch {
      /* ignore */
    }
  }

  // Fetch recent chats whenever the user signs in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isLoggedIn && accessToken) void fetchRecentChats(accessToken);
  }, [isLoggedIn, accessToken]);

  // ── Search helper ─────────────────────────────────────────────────────────
  function groupChatsByDate(chats: RecentChat[], query: string) {
    const filtered = query.trim()
      ? chats.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
      : chats;
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOf7Days = new Date(startOfToday);
    startOf7Days.setDate(startOf7Days.getDate() - 7);
    const startOf30Days = new Date(startOfToday);
    startOf30Days.setDate(startOf30Days.getDate() - 30);

    const groups: { label: string; chats: RecentChat[] }[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Previous 7 Days", chats: [] },
      { label: "Previous 30 Days", chats: [] },
      { label: "Older", chats: [] },
    ];

    for (const chat of filtered) {
      const d = new Date(chat.updated_at);
      if (d >= startOfToday) groups[0].chats.push(chat);
      else if (d >= startOfYesterday) groups[1].chats.push(chat);
      else if (d >= startOf7Days) groups[2].chats.push(chat);
      else if (d >= startOf30Days) groups[3].chats.push(chat);
      else groups[4].chats.push(chat);
    }
    return groups.filter((g) => g.chats.length > 0);
  }

  // ── Quick-action panel state ───────────────────────────────────────
  const [activePanel, setActivePanel] = useState<
    | "image"
    | "video"
    | "edit"
    | "upscale"
    | "music"
    | "sound"
    | "speech"
    | "voice"
    | "code"
    | "visual"
    | "transcribe"
    | "search"
    | "summarize"
    | "detect"
    | "plagiarism"
    | "humanize"
    | "compare"
    | "document"
    | null
  >(null);
  const [showAllActions, setShowAllActions] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [plusMenuMore, setPlusMenuMore] = useState(false);

  // ── Active-panel ref — always current, immune to stale closures ────────────
  // useLayoutEffect fires synchronously after every committed render, guaranteeing
  // this ref is updated before the browser paints and before the next user event.
  const activePanelRef = useRef<typeof activePanel>(null);
  useLayoutEffect(() => {
    activePanelRef.current = activePanel;
  });

  const plusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(e.target as Node)
      ) {
        setPlusMenuOpen(false);
        setPlusMenuMore(false);
      }
    }
    if (plusMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [plusMenuOpen]);

  // ── Image generation options ─────────────────────────────────────────────
  const [imageModel, setImageModel] = useState("gpt-image-2");
  const [imageRatio, setImageRatio] = useState("1:1hd");
  const [imageCount, setImageCount] = useState(1);

  // ── Video generation options ─────────────────────────────────────────────
  const [videoOpts, setVideoOpts] = useState<VideoOptions>({
    model: "kling-o3",
    mode: "new-video",
    duration: 5,
    ratio: "16:9",
  });

  // ── Music generation options ─────────────────────────────────────────────
  const [musicOpts, setMusicOpts] = useState<MusicOptions>({
    tags: [],
    lyrics: "",
  });

  // ── Chat context menu (3-dot) ────────────────────────────────────────────
  const [chatMenu, setChatMenu] = useState<number | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeChatMenu(e: MouseEvent) {
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(e.target as Node)
      ) {
        setChatMenu(null);
      }
    }
    if (chatMenu !== null)
      document.addEventListener("mousedown", closeChatMenu);
    return () => document.removeEventListener("mousedown", closeChatMenu);
  }, [chatMenu]);

  async function deleteConversation(id: number) {
    if (!accessToken) return;
    setChatMenu(null);
    try {
      const res = await fetch(`http://localhost:4000/api/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      setRecentChats((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
    } catch {
      /* ignore */
    }
  }

  function shareConversation(id: number) {
    setChatMenu(null);
    const url = `${window.location.origin}/?conversation=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  }

  const PLUS_MENU_ITEMS = [
    {
      label: "Add photos & files",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      ),
      action: () => {
        const el = document.createElement("input");
        el.type = "file";
        el.accept = "image/*,.pdf,.txt,.doc,.docx";
        el.multiple = true;
        el.click();
        setPlusMenuOpen(false);
      },
    },
    {
      label: "Create image",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      action: () => {
        setActivePanel("image");
        setPlusMenuOpen(false);
      },
    },
    {
      label: "Thinking",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
      action: () => {
        setInputValue((v) => v);
        setPlusMenuOpen(false);
      },
    },
    {
      label: "Deep research",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      action: () => {
        setInputValue("/search ");
        setPlusMenuOpen(false);
      },
    },
  ];

  function renderPlusMenu() {
    return (
      <div
        className="absolute bottom-full left-0 mb-2 rounded-2xl border border-zinc-100 bg-white py-1.5 shadow-xl z-50"
        style={{ minWidth: plusMenuMore ? "320px" : "224px" }}
      >
        {!plusMenuMore ? (
          <>
            {PLUS_MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (freeTierBlocked) {
                    goToPricing();
                    return;
                  }
                  item.action();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors text-left"
              >
                <span className="text-zinc-500">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="mx-4 my-1 border-t border-zinc-100" />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setPlusMenuMore(true);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </span>
                More
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        ) : (
          <>
            {/* Back header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setPlusMenuMore(false);
                }}
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-sm font-medium text-zinc-700">
                All actions
              </span>
            </div>
            {/* All action tags in a 2-column grid */}
            <div className="p-3 grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (freeTierBlocked) {
                      goToPricing();
                      return;
                    }
                    handleActionClick(action);
                    setPlusMenuOpen(false);
                    setPlusMenuMore(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all text-left ${
                    activePanel === action.panel && action.panel
                      ? `${action.text} ${action.border} ${action.bg} ring-1 ring-current`
                      : `${action.text} ${action.border} ${action.bg} hover:opacity-80`
                  }`}
                >
                  <span className={`inline-flex shrink-0 ${action.text}`}>
                    {action.icon}
                  </span>
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  type ActionItem = {
    label: string;
    cmd: string;
    panel?: string;
    text: string;
    border: string;
    bg: string;
    icon: React.ReactNode;
  };

  const ALL_ACTIONS: ActionItem[] = [
    {
      label: "Image",
      cmd: "/image",
      panel: "image",
      text: "text-pink-600",
      border: "border-pink-200",
      bg: "bg-pink-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      label: "Video",
      cmd: "/video",
      panel: "video",
      text: "text-rose-600",
      border: "border-rose-200",
      bg: "bg-rose-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polygon points="10 9 15 12 10 15 10 9" />
        </svg>
      ),
    },
    {
      label: "Edit",
      cmd: "/edit",
      panel: "edit",
      text: "text-red-500",
      border: "border-red-200",
      bg: "bg-red-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      label: "Upscale",
      cmd: "/upscale",
      panel: "upscale",
      text: "text-orange-500",
      border: "border-orange-200",
      bg: "bg-orange-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="15 3 21 3 21 9" />
          <path d="M21 3l-7 7" />
          <polyline points="9 21 3 21 3 15" />
          <path d="M3 21l7-7" />
        </svg>
      ),
    },
    {
      label: "Visual",
      cmd: "/visual",
      panel: "visual",
      text: "text-amber-600",
      border: "border-amber-200",
      bg: "bg-amber-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "Music",
      cmd: "/music",
      panel: "music",
      text: "text-yellow-600",
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      label: "Sound",
      cmd: "/sound",
      panel: "sound",
      text: "text-lime-600",
      border: "border-lime-200",
      bg: "bg-lime-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ),
    },
    {
      label: "Speech",
      cmd: "/speech",
      panel: "speech",
      text: "text-green-600",
      border: "border-green-200",
      bg: "bg-green-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
    },
    {
      label: "Voice",
      cmd: "/voice",
      panel: "voice",
      text: "text-emerald-600",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2" />
        </svg>
      ),
    },
    {
      label: "Transcribe",
      cmd: "/transcribe",
      panel: "transcribe",
      text: "text-teal-600",
      border: "border-teal-200",
      bg: "bg-teal-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      ),
    },
    {
      label: "Search",
      cmd: "/search",
      panel: "search",
      text: "text-cyan-600",
      border: "border-cyan-200",
      bg: "bg-cyan-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      label: "Summarize",
      cmd: "/summarize",
      panel: "summarize",
      text: "text-sky-600",
      border: "border-sky-200",
      bg: "bg-sky-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="21" y1="10" x2="3" y2="10" />
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="14" x2="3" y2="14" />
          <line x1="15" y1="18" x2="3" y2="18" />
        </svg>
      ),
    },
    {
      label: "Detect",
      cmd: "/detect",
      panel: "detect",
      text: "text-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      label: "Plagiarism",
      cmd: "/plagiarism",
      panel: "plagiarism",
      text: "text-indigo-600",
      border: "border-indigo-200",
      bg: "bg-indigo-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
        </svg>
      ),
    },
    {
      label: "Humanize",
      cmd: "/humanize",
      panel: "humanize",
      text: "text-violet-600",
      border: "border-violet-200",
      bg: "bg-violet-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Compare",
      cmd: "/compare",
      panel: "compare",
      text: "text-purple-600",
      border: "border-purple-200",
      bg: "bg-purple-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
        </svg>
      ),
    },
    {
      label: "Document",
      cmd: "/document",
      panel: "document",
      text: "text-fuchsia-600",
      border: "border-fuchsia-200",
      bg: "bg-fuchsia-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      label: "Code",
      cmd: "/code",
      panel: "code",
      text: "text-slate-600",
      border: "border-slate-200",
      bg: "bg-slate-50",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
  ];

  const VISIBLE_ACTIONS = showAllActions
    ? ALL_ACTIONS
    : ALL_ACTIONS.slice(0, 7);

  function handleActionClick(action: ActionItem) {
    if (requireChatAccess()) {
      return;
    }

    if (action.panel) {
      setActivePanel((prev) =>
        prev === action.panel ? null : (action.panel as typeof prev),
      );
    } else {
      setActivePanel(null);
      setInputValue(action.cmd + " ");
    }
  }

  function renderUpgradePrompt() {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Free limit reached
            </p>
            <p className="mt-1 text-sm text-amber-800">
              You have used all {FREE_TIER_MESSAGE_LIMIT} free messages. Upgrade
              to keep chatting and using tools.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              {remainingFreeMessages === 0
                ? "No free messages remaining."
                : `${remainingFreeMessages} free message left.`}
            </p>
          </div>
          <button
            onClick={goToPricing}
            className="inline-flex items-center justify-center rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-900"
          >
            View plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* ── Share toast ── */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-white shadow-xl border border-zinc-700 pointer-events-none">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Link copied to clipboard
        </div>
      )}

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
              <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z" />
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
          <NavItem
            icon={<IconNewChat />}
            label="New chat"
            disabled={chatAccessBlocked}
            active={
              messages.length === 0 &&
              conversationId === null &&
              activeView === null
            }
            onClick={() => {
              if (requireChatAccess()) return;
              setMessages([]);
              setActiveConversation(null);
              setInputValue("");
              setActivePanel(null);
              setActiveView(null);
            }}
          />
          <NavItem
            icon={<IconKeep />}
            label="Templates"
            active={activeView === "templates"}
            onClick={() =>
              setActiveView((v) => (v === "templates" ? null : "templates"))
            }
          />
          <NavItem
            icon={<IconAdditions />}
            label="Additions"
            active={activeView === "additions"}
            onClick={() =>
              setActiveView((v) => (v === "additions" ? null : "additions"))
            }
          />
          <NavItem
            icon={<IconExplore />}
            label="Explore"
            active={activeView === "explore"}
            onClick={() =>
              setActiveView((v) => (v === "explore" ? null : "explore"))
            }
          />
          <NavItem
            icon={<IconSearch />}
            label="Search"
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(true);
            }}
          />
        </nav>

        {/* Recent chats */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {isLoggedIn && recentChats.length > 0 && (
            <div className="px-2 py-2">
              {groupChatsByDate(recentChats, "").map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 pb-1 text-xs font-medium text-zinc-500">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.chats.map((chat) => (
                      <div key={chat.id} className="relative group/item">
                        {/* Chat row */}
                        <div
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                            conversationId === chat.id
                              ? "bg-zinc-700 text-white"
                              : "text-zinc-400 hover:bg-zinc-700/60 hover:text-white"
                          }`}
                        >
                          {/* Title (clickable) */}
                          <button
                            className="flex flex-1 min-w-0 items-center gap-2 text-left"
                            onClick={() =>
                              accessToken &&
                              loadConversation(chat.id, accessToken)
                            }
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              className="shrink-0"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="truncate">{chat.title}</span>
                          </button>

                          {/* 3-dot trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatMenu(
                                chatMenu === chat.id ? null : chat.id,
                              );
                            }}
                            className="ml-auto shrink-0 opacity-0 group-hover/item:opacity-100 focus:opacity-100 rounded p-0.5 hover:bg-zinc-600 transition-opacity"
                            title="More options"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          </button>
                        </div>

                        {/* Dropdown */}
                        {chatMenu === chat.id && (
                          <div
                            ref={chatMenuRef}
                            className="absolute left-0 top-full mt-1 z-50 w-44 rounded-xl border border-zinc-700 bg-zinc-800 py-1 shadow-xl"
                          >
                            <button
                              onClick={() => shareConversation(chat.id)}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line
                                  x1="8.59"
                                  y1="13.51"
                                  x2="15.42"
                                  y2="17.49"
                                />
                                <line
                                  x1="15.41"
                                  y1="6.51"
                                  x2="8.59"
                                  y2="10.49"
                                />
                              </svg>
                              Share
                            </button>
                            <div className="mx-3 my-1 border-t border-zinc-700/60" />
                            <button
                              onClick={() => deleteConversation(chat.id)}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                <span className="truncate text-sm font-medium text-white">
                  {userName}
                </span>
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-white">
                  Sign up now
                </span>
                <span className="text-xs text-zinc-500">
                  Sign up to save your chats
                </span>
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
          {/* Upgrade button */}
          <button
            onClick={() => router.push("/pricing")}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-violet-600 hover:to-indigo-600 active:scale-95 transition-all duration-150"
            title="Upgrade plan"
          >
            {/* Zap / lightning bolt */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 1L2 7h4.5L5 11l5-6H6L7 1z" fill="currentColor" />
            </svg>
            Upgrade
          </button>
          <div className="ml-3 text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors">
            <IconHelp />
          </div>
        </header>

        {activeView === "explore" ? (
          <ExploreView />
        ) : activeView === "additions" ? (
          <AdditionsView />
        ) : activeView === "templates" ? (
          <TemplatesView
            onUseTemplate={(prompt) => {
              if (requireChatAccess()) return;
              setMessages([]);
              setActiveConversation(null);
              setConversationId(null);
              conversationIdRef.current = null;
              setActivePanel(null);
              setInputValue(prompt);
              setActiveView(null);
            }}
          />
        ) : messages.length === 0 ? (
          /* ── Empty / landing state ── */
          <main
            className="flex flex-1 flex-col items-center justify-start pt-[38vh] px-6 pb-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900">
              {isLoggedIn
                ? getGreeting(userName.split(" ")[0])
                : "What's on the agenda today?"}
            </h1>

            <div className="w-full max-w-2xl">
              {freeTierBlocked && (
                <div className="mb-4">{renderUpgradePrompt()}</div>
              )}
              {/* Input row with panel floating above it */}
              <div className="relative">
                {/* Option panel — absolutely above input, grows upward */}
                {activePanel && (
                  <div className="absolute bottom-full left-0 right-0 mb-3 z-10">
                    {activePanel === "image" && (
                      <ImageOptionsPanel
                        onClose={() => setActivePanel(null)}
                        model={imageModel}
                        ratio={imageRatio}
                        count={imageCount}
                        onModelChange={setImageModel}
                        onRatioChange={setImageRatio}
                        onCountChange={setImageCount}
                      />
                    )}
                    {activePanel === "video" && (
                      <VideoOptionsPanel
                        onClose={() => setActivePanel(null)}
                        model={videoOpts.model}
                        mode={videoOpts.mode}
                        duration={videoOpts.duration}
                        ratio={videoOpts.ratio}
                        onModelChange={(v) =>
                          setVideoOpts((o) => ({ ...o, model: v }))
                        }
                        onModeChange={(v) =>
                          setVideoOpts((o) => ({ ...o, mode: v }))
                        }
                        onDurationChange={(v) =>
                          setVideoOpts((o) => ({ ...o, duration: v }))
                        }
                        onRatioChange={(v) =>
                          setVideoOpts((o) => ({ ...o, ratio: v }))
                        }
                      />
                    )}
                    {activePanel === "edit" && (
                      <EditOptionsPanel onClose={() => setActivePanel(null)} />
                    )}
                    {activePanel === "upscale" && (
                      <UpscaleOptionsPanel
                        onClose={() => setActivePanel(null)}
                      />
                    )}
                    {activePanel === "music" && (
                      <MusicOptionsPanel
                        onClose={() => setActivePanel(null)}
                        tags={musicOpts.tags}
                        lyrics={musicOpts.lyrics}
                        onTagsChange={(t) =>
                          setMusicOpts((o) => ({ ...o, tags: t }))
                        }
                        onLyricsChange={(l) =>
                          setMusicOpts((o) => ({ ...o, lyrics: l }))
                        }
                      />
                    )}
                    {activePanel === "sound" && (
                      <SoundOptionsPanel onClose={() => setActivePanel(null)} />
                    )}
                    {activePanel === "speech" && (
                      <SpeechOptionsPanel
                        onClose={() => setActivePanel(null)}
                      />
                    )}
                    {activePanel === "voice" && (
                      <VoiceOptionsPanel onClose={() => setActivePanel(null)} />
                    )}
                    {activePanel === "code" && (
                      <CodeOptionsPanel onClose={() => setActivePanel(null)} />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-400 focus-within:shadow-md transition-all">
                  <div ref={plusMenuRef} className="relative shrink-0">
                    {plusMenuOpen && renderPlusMenu()}
                    <button
                      onClick={() => setPlusMenuOpen((v) => !v)}
                      disabled={chatAccessBlocked}
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${plusMenuOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                  {activePanel &&
                    (() => {
                      const activeAction = ALL_ACTIONS.find(
                        (a) => a.panel === activePanel,
                      );
                      if (!activeAction) return null;
                      return (
                        <>
                          <span className={`shrink-0 ${activeAction.text}`}>
                            {activeAction.icon}
                          </span>
                          <span
                            className={`shrink-0 text-sm font-medium ${activeAction.text}`}
                          >
                            {activeAction.cmd}
                          </span>
                        </>
                      );
                    })()}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={
                      chatAccessBlocked
                        ? chatBlockedCopy
                        : activePanel
                          ? ALL_ACTIONS.find((a) => a.panel === activePanel)
                              ?.label
                            ? `Describe your ${ALL_ACTIONS.find((a) => a.panel === activePanel)!.label.toLowerCase()}...`
                            : "Ask anything..."
                          : "Ask anything..."
                    }
                    disabled={chatAccessBlocked}
                    className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                  />
                  <button
                    onClick={startDictation}
                    title={isRecording ? "Stop recording" : "Dictate"}
                    disabled={chatAccessBlocked}
                    className={`flex-shrink-0 transition-colors ${chatAccessBlocked ? "text-zinc-200 cursor-not-allowed" : isRecording ? "text-red-500 animate-pulse" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    <IconMic />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={chatAccessBlocked || !inputValue.trim()}
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors ${chatAccessBlocked || !inputValue.trim() ? "opacity-40 cursor-not-allowed hover:bg-zinc-900" : isRecording ? "ring-2 ring-red-400 ring-offset-1" : ""}`}
                  >
                    <IconWaveform />
                  </button>
                </div>
              </div>
              {/* end relative wrapper */}

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {VISIBLE_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleActionClick(action)}
                    disabled={chatAccessBlocked}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      chatAccessBlocked ? "cursor-not-allowed opacity-50" : ""
                    } ${
                      action.panel && activePanel === action.panel
                        ? `${action.text} ${action.border} ${action.bg} ring-1 ring-current ring-offset-0`
                        : `${action.text} ${action.border} ${action.bg} hover:opacity-80`
                    }`}
                  >
                    <span className={`inline-flex ${action.text}`}>
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Show all / Show less */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowAllActions((v) => !v)}
                  disabled={chatAccessBlocked}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{showAllActions ? "Show less" : "Show all"}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    {showAllActions ? (
                      <polyline points="18 15 12 9 6 15" />
                    ) : (
                      <polyline points="6 9 12 15 18 9" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Sign-in CTA */}
            {!isLoggedIn && status !== "loading" && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm text-zinc-400">
                  Sign in to save your conversations
                </p>
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
                      {msg.content.startsWith("__IMAGE__:") ? (
                        <ImageMessage content={msg.content} />
                      ) : msg.content.startsWith("__VIDEO__:") ||
                        msg.content.startsWith("__VIDEO_PENDING__:") ||
                        msg.content.startsWith("__VIDEO_ERROR__:") ? (
                        <VideoMessage content={msg.content} />
                      ) : msg.content.startsWith("__MUSIC__:") ? (
                        <MusicMessage content={msg.content} />
                      ) : (
                        <MarkdownContent
                          content={msg.content}
                          streaming={streamingId === msg.id}
                        />
                      )}
                      {/* Action bar */}
                      <div className="flex items-center gap-0.5">
                        {/* Copy */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                        {/* Thumbs up */}
                        <button
                          onClick={() => handleLike(msg.id)}
                          title={likedId === msg.id ? "Liked" : "Good response"}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                            likedId === msg.id
                              ? "text-green-500 bg-green-50"
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={likedId === msg.id ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                          </svg>
                        </button>
                        {/* Thumbs down */}
                        <button
                          onClick={() => handleDislike(msg.id)}
                          title={
                            dislikedId === msg.id ? "Disliked" : "Bad response"
                          }
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                            dislikedId === msg.id
                              ? "text-red-500 bg-red-50"
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={
                              dislikedId === msg.id ? "currentColor" : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                          </svg>
                        </button>
                        {/* Share */}
                        <button
                          onClick={() => handleShareMsg(msg.id, msg.content)}
                          title={sharedMsgId === msg.id ? "Copied!" : "Share"}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                            sharedMsgId === msg.id
                              ? "text-blue-500 bg-blue-50"
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                          }`}
                        >
                          {sharedMsgId === msg.id ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                              <polyline points="16 6 12 2 8 6" />
                              <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                          )}
                        </button>
                        {/* Regenerate */}
                        {(() => {
                          const msgIndex = messages.indexOf(msg);
                          const isLast = msgIndex === messages.length - 1;
                          return (
                            <button
                              onClick={() => handleRegenerate(msgIndex)}
                              title="Regenerate"
                              disabled={isTyping}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                isTyping
                                  ? "text-zinc-200 cursor-not-allowed"
                                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                              } ${isLast ? "" : "opacity-0 group-hover:opacity-100"}`}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                              </svg>
                            </button>
                          );
                        })()}
                        {/* More */}
                        <button
                          title="More"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="5" cy="12" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="19" cy="12" r="1.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ),
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Fixed input bar at bottom */}
            <div className="border-t border-zinc-100 px-6 py-4">
              <div className="mx-auto w-full max-w-2xl">
                {freeTierBlocked && (
                  <div className="mb-4">{renderUpgradePrompt()}</div>
                )}
                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-400 focus-within:shadow-md transition-all">
                  <div ref={plusMenuRef} className="relative shrink-0">
                    {plusMenuOpen && renderPlusMenu()}
                    <button
                      onClick={() => setPlusMenuOpen((v) => !v)}
                      disabled={chatAccessBlocked}
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${plusMenuOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                  {activePanel &&
                    (() => {
                      const activeAction = ALL_ACTIONS.find(
                        (a) => a.panel === activePanel,
                      );
                      if (!activeAction) return null;
                      return (
                        <>
                          <span className={`shrink-0 ${activeAction.text}`}>
                            {activeAction.icon}
                          </span>
                          <span
                            className={`shrink-0 text-sm font-medium ${activeAction.text}`}
                          >
                            {activeAction.cmd}
                          </span>
                        </>
                      );
                    })()}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={
                      chatAccessBlocked
                        ? chatBlockedCopy
                        : activePanel
                          ? ((
                              {
                                image: "Describe your image...",
                                video: "Describe your video...",
                                edit: "Describe the edit...",
                                upscale: "Describe the upscale...",
                                music: "Describe your music...",
                                sound: "Describe the sound...",
                                speech: "Enter text to convert to speech...",
                                voice: "Describe your voice...",
                                code: "Describe your code task...",
                                visual: "Describe what to analyze visually...",
                                transcribe: "Paste audio URL or describe...",
                                search: "What would you like to search?",
                                summarize: "Paste text or URL to summarize...",
                                detect: "What would you like to detect?",
                                plagiarism:
                                  "Paste text to check for plagiarism...",
                                humanize: "Paste AI text to humanize...",
                                compare: "Describe what to compare...",
                                document: "Describe your document task...",
                              } as Record<string, string>
                            )[activePanel] ?? `Describe your ${activePanel}...`)
                          : "Ask anything..."
                    }
                    disabled={chatAccessBlocked}
                    className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={startDictation}
                    title={isRecording ? "Stop recording" : "Dictate"}
                    disabled={chatAccessBlocked}
                    className={`flex-shrink-0 transition-colors ${chatAccessBlocked ? "text-zinc-200 cursor-not-allowed" : isRecording ? "text-red-500 animate-pulse" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    <IconMic />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={chatAccessBlocked || !inputValue.trim()}
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${chatAccessBlocked || !inputValue.trim() ? "opacity-40 cursor-not-allowed hover:bg-zinc-900" : isRecording ? "ring-2 ring-red-400 ring-offset-1" : ""}`}
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
        <AuthModal defaultMode={authModal} onClose={() => setAuthModal(null)} />
      )}

      {/* ── Search modal ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "75vh" }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-zinc-400 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-base text-zinc-800 placeholder-zinc-400 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Results list */}
            <div className="overflow-y-auto flex-1">
              {/* New chat row */}
              {!searchQuery && (
                <button
                  disabled={chatAccessBlocked}
                  onClick={() => {
                    if (requireChatAccess()) return;
                    setMessages([]);
                    setActiveConversation(null);
                    setInputValue("");
                    setActivePanel(null);
                    setSearchOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                    chatAccessBlocked
                      ? "opacity-50 cursor-not-allowed text-zinc-400 bg-transparent"
                      : "text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  New chat
                </button>
              )}

              {/* Grouped chats */}
              {isLoggedIn && recentChats.length > 0 ? (
                groupChatsByDate(recentChats, searchQuery).length > 0 ? (
                  groupChatsByDate(recentChats, searchQuery).map((group) => (
                    <div key={group.label}>
                      <p className="px-5 pt-4 pb-1.5 text-xs font-medium text-zinc-400">
                        {group.label}
                      </p>
                      {group.chats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            if (accessToken)
                              loadConversation(chat.id, accessToken);
                            setSearchOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors ${
                            conversationId === chat.id
                              ? "bg-zinc-100 text-zinc-900"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            className="shrink-0 text-zinc-400"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="truncate">{chat.title}</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="px-5 py-8 text-center text-sm text-zinc-400">
                    No chats match &ldquo;{searchQuery}&rdquo;
                  </p>
                )
              ) : !isLoggedIn ? (
                <p className="px-5 py-8 text-center text-sm text-zinc-400">
                  Sign in to search your chats
                </p>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-zinc-400">
                  No chats yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
