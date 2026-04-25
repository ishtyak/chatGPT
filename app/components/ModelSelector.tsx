"use client";
import { useState, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  tags: string[];
  cost: number;
  speed: number;       // 0–100
  ecoImpact: number;   // 0–100 (lower = greener, shown as inverse)
  context: string;
  icon: React.ReactNode;
}

// ── Provider icons ────────────────────────────────────────────────────────────

function OpenAIIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.28 10.74a5.7 5.7 0 0 0-.49-4.69 5.78 5.78 0 0 0-6.22-2.77A5.75 5.75 0 0 0 11.24 1a5.78 5.78 0 0 0-5.51 4 5.72 5.72 0 0 0-3.82 2.77 5.78 5.78 0 0 0 .71 6.78 5.7 5.7 0 0 0 .49 4.69 5.78 5.78 0 0 0 6.22 2.77A5.75 5.75 0 0 0 12.76 23a5.78 5.78 0 0 0 5.51-4.01 5.72 5.72 0 0 0 3.82-2.77 5.78 5.78 0 0 0-.81-6.48zM12.76 21.5a4.28 4.28 0 0 1-2.75-1c.03-.02.09-.05.13-.07l4.56-2.63a.74.74 0 0 0 .37-.65v-6.43l1.93 1.11a.07.07 0 0 1 .04.06v5.32a4.3 4.3 0 0 1-4.28 4.3zm-9.19-3.94a4.27 4.27 0 0 1-.51-2.88l.13.08 4.56 2.63a.74.74 0 0 0 .74 0l5.57-3.22v2.22a.07.07 0 0 1-.03.06L9.46 19.1a4.3 4.3 0 0 1-5.89-1.54zm-1.2-9.96A4.27 4.27 0 0 1 4.6 5.8v5.39a.74.74 0 0 0 .37.64l5.56 3.21-1.93 1.12a.07.07 0 0 1-.07 0L3.9 13.63a4.3 4.3 0 0 1-.53-6.03zm15.87 3.69-5.57-3.22 1.93-1.11a.07.07 0 0 1 .07 0l4.63 2.67a4.29 4.29 0 0 1-.66 7.74v-5.39a.74.74 0 0 0-.4-.69zm1.92-2.9-.13-.08-4.56-2.63a.74.74 0 0 0-.74 0L9.16 9.4V7.18a.07.07 0 0 1 .03-.06l4.63-2.67a4.29 4.29 0 0 1 6.34 4.44zM8.1 12.85 6.17 11.74a.07.07 0 0 1-.04-.06V6.36a4.29 4.29 0 0 1 7.04-3.29l-.13.07-4.56 2.63a.74.74 0 0 0-.37.64zm1.05-2.26 2.48-1.43 2.48 1.43v2.86l-2.48 1.43-2.48-1.43z"/>
    </svg>
  );
}

function AnthropicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.8 4.5h-3.6L4.5 19.5h3.2l1.4-3.9h6.8l1.4 3.9h3.2L13.8 4.5zm-3.9 8.6 2.1-5.9 2.1 5.9H9.9z"/>
    </svg>
  );
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MetaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 12.5C2 9 3.5 6.5 5.5 6.5c1.5 0 2.5 1 3.5 3L12 14l3-4.5c1-1.5 1.8-3 3.5-3 2 0 3.5 2.5 3.5 6s-1.5 6-3.5 6-2.5-1-3.5-2.5L12 12l-3 4.5c-1 1.5-2 2.5-3.5 2.5S2 16 2 12.5z" fill="#0082FB"/>
    </svg>
  );
}

function MistralIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="5" height="5" fill="#FF7000"/>
      <rect x="9" y="2" width="5" height="5" fill="#FF7000"/>
      <rect x="2" y="9" width="5" height="5" fill="#FF7000"/>
      <rect x="16" y="2" width="5" height="5" fill="#FF7000"/>
      <rect x="16" y="9" width="5" height="5" fill="#FF7000"/>
      <rect x="9" y="16" width="5" height="5" fill="#FF7000"/>
      <rect x="16" y="16" width="5" height="5" fill="#FF7000"/>
    </svg>
  );
}

function XAIIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.53 3H21L13.4 12.83 21.5 21h-3.63L12 14.49 5.53 21H2l8.1-9.34L2.5 3h3.63L12 9.24 17.53 3zm-1.2 16.17h2.01L7.7 4.83H5.61l10.72 14.34z"/>
    </svg>
  );
}

function DeepSeekIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#4D6FFF"/>
      <path d="M8 12a4 4 0 0 1 8 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="13" r="1" fill="white"/>
      <circle cx="14" cy="13" r="1" fill="white"/>
    </svg>
  );
}

function PerplexityIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v5c0 5.25 4.25 10.15 10 11.35C17.75 22.15 22 17.25 22 12V7L12 2zm0 2.18L20 8.09V12c0 4.34-3.39 8.42-8 9.56C7.39 20.42 4 16.34 4 12V8.09L12 4.18zM11 7v6l5 3-1-1.73-3-1.8V7h-1z"/>
    </svg>
  );
}

// ── Model data ─────────────────────────────────────────────────────────────────

export const MODELS: Model[] = [
  // OpenAI
  { id: "gpt-4o", name: "GPT-4o", description: "Flagship multimodal intelligence", provider: "OpenAI", tags: ["Vision", "Fast"], cost: 0.5, speed: 85, ecoImpact: 60, context: "128K", icon: <OpenAIIcon /> },
  { id: "gpt-4o-mini", name: "GPT-4o-mini", description: "Fast, affordable everyday assistant", provider: "OpenAI", tags: ["Fast", "Cheap"], cost: 0.05, speed: 95, ecoImpact: 30, context: "128K", icon: <OpenAIIcon /> },
  { id: "gpt-4o-audio", name: "GPT-4o Audio", description: "Experimental features", provider: "OpenAI", tags: ["Apps"], cost: 0.75, speed: 70, ecoImpact: 65, context: "128K", icon: <OpenAIIcon /> },
  { id: "gpt-4o-mini-search", name: "GPT-4o-mini Search Preview", description: "Lightweight, fast responses", provider: "OpenAI", tags: ["Fast", "Cheap"], cost: 0.2, speed: 90, ecoImpact: 30, context: "128K", icon: <OpenAIIcon /> },
  { id: "gpt-4o-search", name: "GPT-4o Search Preview", description: "Experimental features", provider: "OpenAI", tags: ["Vision"], cost: 0.75, speed: 80, ecoImpact: 60, context: "128K", icon: <OpenAIIcon /> },
  { id: "gpt-4o-2024", name: "GPT-4o (2024-11-20)", description: "OpenAI language model", provider: "OpenAI", tags: ["Vision"], cost: 0.75, speed: 80, ecoImpact: 60, context: "128K", icon: <OpenAIIcon /> },
  { id: "o1", name: "o1", description: "Advanced reasoning model", provider: "OpenAI", tags: ["Vision"], cost: 1.5, speed: 50, ecoImpact: 80, context: "200K", icon: <OpenAIIcon /> },
  { id: "o3-mini", name: "o3-mini", description: "Fast reasoning model", provider: "OpenAI", tags: ["Fast"], cost: 0.3, speed: 88, ecoImpact: 35, context: "200K", icon: <OpenAIIcon /> },
  // Anthropic
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", description: "Most intelligent model", provider: "Anthropic", tags: ["Vision", "Apps"], cost: 1.5, speed: 60, ecoImpact: 75, context: "200K", icon: <AnthropicIcon /> },
  { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", description: "Ideal balance of speed & smarts", provider: "Anthropic", tags: ["Vision", "Fast"], cost: 0.6, speed: 80, ecoImpact: 55, context: "200K", icon: <AnthropicIcon /> },
  { id: "claude-haiku-3-5", name: "Claude Haiku 3.5", description: "Fastest Claude model", provider: "Anthropic", tags: ["Fast", "Cheap"], cost: 0.08, speed: 98, ecoImpact: 20, context: "200K", icon: <AnthropicIcon /> },
  { id: "claude-3-opus", name: "Claude 3 Opus", description: "Powerful for complex tasks", provider: "Anthropic", tags: ["Vision"], cost: 1.5, speed: 55, ecoImpact: 80, context: "200K", icon: <AnthropicIcon /> },
  // Google
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Ultra-fast next-gen model", provider: "Google", tags: ["Vision", "Apps", "Private"], cost: 0.2, speed: 95, ecoImpact: 45, context: "1.0M", icon: <GoogleIcon /> },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Premium reasoning powerhouse", provider: "Google", tags: ["Vision", "Apps"], cost: 0.63, speed: 75, ecoImpact: 65, context: "1.0M", icon: <GoogleIcon /> },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast multimodal model", provider: "Google", tags: ["Vision", "Fast", "Cheap"], cost: 0.05, speed: 92, ecoImpact: 25, context: "1.0M", icon: <GoogleIcon /> },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Advanced reasoning & long context", provider: "Google", tags: ["Vision"], cost: 0.5, speed: 70, ecoImpact: 60, context: "1.0M", icon: <GoogleIcon /> },
  // Meta
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", description: "Open-source powerhouse", provider: "Meta", tags: ["Fast", "Cheap"], cost: 0.1, speed: 88, ecoImpact: 40, context: "128K", icon: <MetaIcon /> },
  { id: "llama-3.2-vision", name: "Llama 3.2 Vision", description: "Multimodal open model", provider: "Meta", tags: ["Vision"], cost: 0.2, speed: 80, ecoImpact: 45, context: "128K", icon: <MetaIcon /> },
  { id: "llama-3.1-405b", name: "Llama 3.1 405B", description: "Largest open-source model", provider: "Meta", tags: ["Apps"], cost: 0.8, speed: 50, ecoImpact: 85, context: "128K", icon: <MetaIcon /> },
  // Mistral
  { id: "mistral-large", name: "Mistral Large", description: "Top-tier reasoning", provider: "Mistral", tags: ["Vision"], cost: 0.8, speed: 72, ecoImpact: 65, context: "128K", icon: <MistralIcon /> },
  { id: "mistral-small", name: "Mistral Small", description: "Efficient everyday model", provider: "Mistral", tags: ["Fast", "Cheap"], cost: 0.1, speed: 90, ecoImpact: 30, context: "128K", icon: <MistralIcon /> },
  { id: "codestral", name: "Codestral", description: "Optimized for coding", provider: "Mistral", tags: ["Apps"], cost: 0.3, speed: 85, ecoImpact: 40, context: "256K", icon: <MistralIcon /> },
  // xAI
  { id: "grok-2", name: "Grok 2", description: "Real-time internet access", provider: "xAI", tags: ["Vision", "Fast"], cost: 0.5, speed: 82, ecoImpact: 55, context: "131K", icon: <XAIIcon /> },
  { id: "grok-2-mini", name: "Grok 2 Mini", description: "Fast & affordable Grok", provider: "xAI", tags: ["Fast", "Cheap"], cost: 0.1, speed: 93, ecoImpact: 30, context: "131K", icon: <XAIIcon /> },
  // DeepSeek
  { id: "deepseek-v3", name: "DeepSeek V3", description: "Cutting-edge open model", provider: "DeepSeek", tags: ["Fast", "Cheap"], cost: 0.07, speed: 88, ecoImpact: 35, context: "64K", icon: <DeepSeekIcon /> },
  { id: "deepseek-r1", name: "DeepSeek R1", description: "Chain-of-thought reasoning", provider: "DeepSeek", tags: ["Apps"], cost: 0.2, speed: 65, ecoImpact: 60, context: "64K", icon: <DeepSeekIcon /> },
  // Perplexity
  { id: "sonar-pro", name: "Sonar Pro", description: "Real-time web search", provider: "Perplexity", tags: ["Fast"], cost: 0.6, speed: 80, ecoImpact: 50, context: "200K", icon: <PerplexityIcon /> },
  { id: "sonar", name: "Sonar", description: "Fast online search model", provider: "Perplexity", tags: ["Fast", "Cheap"], cost: 0.1, speed: 90, ecoImpact: 30, context: "200K", icon: <PerplexityIcon /> },
];

const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral", "xAI", "DeepSeek", "Perplexity"];
const FEATURE_TAGS = ["Fast", "Vision", "Private", "Apps", "Cheap"];

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  OpenAI: <OpenAIIcon size={14} />,
  Anthropic: <AnthropicIcon size={14} />,
  Google: <GoogleIcon size={14} />,
  Meta: <MetaIcon size={14} />,
  Mistral: <MistralIcon size={14} />,
  xAI: <XAIIcon size={14} />,
  DeepSeek: <DeepSeekIcon size={14} />,
  Perplexity: <PerplexityIcon size={14} />,
};

// ── Tooltip card ──────────────────────────────────────────────────────────────

function ModelTooltip({ model }: { model: Model }) {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] z-20 w-64 rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl">
      <p className="mb-2 font-semibold text-zinc-900">{model.name}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {model.tags.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500">
            {t === "Vision" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            {t === "Apps" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="9" height="9"/><rect x="13" y="2" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/><rect x="13" y="13" width="9" height="9"/></svg>}
            {t === "Private" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>}
            {t}
          </span>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Speed
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100">
            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${model.speed}%` }} />
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">{model.speed >= 90 ? "Very Fast" : model.speed >= 70 ? "Fast" : "Moderate"}</p>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22 12 2l10 20H2z"/></svg>
            Eco Impact
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100">
            <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${model.ecoImpact}%` }} />
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">{model.ecoImpact <= 40 ? "Low" : "Moderate"}</p>
        </div>
      </div>

      <div className="flex justify-between border-t border-zinc-100 pt-3 text-xs">
        <div>
          <p className="text-zinc-400">Context</p>
          <p className="font-semibold text-zinc-800">{model.context}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-400">Cost</p>
          <p className="font-semibold text-zinc-800">~{model.cost} credits</p>
        </div>
      </div>
    </div>
  );
}

// ── Model row ─────────────────────────────────────────────────────────────────

function ModelRow({ model, selected, onSelect }: { model: Model; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 ${selected ? "bg-zinc-50" : ""}`}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
        {model.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800">{model.name}</p>
        <p className="text-xs text-zinc-400">{model.description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-amber-500 font-medium shrink-0">
        {hovered && (
          <button className="mr-1 text-zinc-300 hover:text-red-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        ~{model.cost}
      </div>
      {hovered && <ModelTooltip model={model} />}
    </button>
  );
}

// ── Main ModelSelector ────────────────────────────────────────────────────────

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

export default function ModelSelector({ selectedModel, onSelect, onClose }: ModelSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeProvider, setActiveProvider] = useState("OpenAI");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = MODELS.filter((m) => {
    const matchesProvider = m.provider === activeProvider;
    const matchesTag = activeTag ? m.tags.includes(activeTag) : true;
    const matchesSearch = search
      ? m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesProvider && matchesTag && matchesSearch;
  });

  const total = MODELS.filter((m) => {
    if (!search) return true;
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    );
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        ref={ref}
        className="relative z-10 w-[680px] h-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl flex flex-col"
      >
      {/* Search */}
      <div className="flex items-center gap-2.5 border-b border-zinc-100 px-4 py-3">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-zinc-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search models... (${total})`}
          className="flex-1 bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Provider tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-100 px-3 py-2" style={{scrollbarWidth:'none',msOverflowStyle:'none'} as React.CSSProperties}>
        {PROVIDERS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveProvider(p)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeProvider === p
                ? "border border-zinc-800 bg-white text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {PROVIDER_ICONS[p]}
            {p}
          </button>
        ))}
      </div>

      {/* Feature tags */}
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-4 py-2">
        {FEATURE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeTag === tag
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {tag === "Fast" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
            {tag === "Vision" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            {tag === "Private" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
            {tag === "Apps" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="9" height="9"/><rect x="13" y="2" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/></svg>}
            {tag === "Cheap" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            {tag}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          Sort
        </button>
      </div>

      {/* Model list */}
      <div className="overflow-y-auto px-2 py-2" style={{scrollbarWidth:'none',msOverflowStyle:'none'} as React.CSSProperties}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No models found</p>
        ) : (
          filtered.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              selected={selectedModel === model.id}
              onSelect={() => { onSelect(model.id); onClose(); }}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
}
