"use client";
import { useState } from "react";

// ── Shared pill button ────────────────────────────────────────────────────────

function ModelPill({ label, icon, selected, onClick }: { label: string; icon?: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        selected
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

// ── Image Generation Options ──────────────────────────────────────────────────

const IMAGE_MODELS = [
  { id: "flux-2", label: "Flux 2" },
  { id: "gpt-image-1-5", label: "GPT Image 1.5" },
  { id: "gpt-image-2", label: "GPT Image 2" },
  { id: "grok-imagine", label: "Grok Imagine" },
  { id: "nano-banana", label: "Nano Banana" },
  { id: "nano-banana-2", label: "Nano Banana 2" },
  { id: "recraft-v3", label: "Recraft V3" },
  { id: "ideogram-v3", label: "Ideogram V3" },
  { id: "seedream-4-5", label: "Seedream 4.5" },
  { id: "seedream-5-0", label: "Seedream 5.0" },
  { id: "z-image-turbo", label: "Z-Image Turbo" },
];

const ASPECT_RATIOS_IMAGE = [
  { id: "1:1hd", label: "1:1 HD", icon: (sel: boolean) => <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="2" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "1:1", label: "1:1", icon: (sel: boolean) => <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "16:9", label: "16:9", icon: (sel: boolean) => <svg width="16" height="10" viewBox="0 0 20 12" fill="none"><rect x="1" y="1" width="18" height="10" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "4:3", label: "4:3", icon: (sel: boolean) => <svg width="15" height="12" viewBox="0 0 18 14" fill="none"><rect x="1" y="1" width="16" height="12" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "9:16", label: "9:16", icon: (sel: boolean) => <svg width="10" height="14" viewBox="0 0 12 20" fill="none"><rect x="1" y="1" width="10" height="18" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "3:4", label: "3:4", icon: (sel: boolean) => <svg width="11" height="14" viewBox="0 0 14 18" fill="none"><rect x="1" y="1" width="12" height="16" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
];

export type ImageOptions = { model: string; ratio: string; count: number };

export function ImageOptionsPanel({
  onClose,
  model,
  ratio,
  count,
  onModelChange,
  onRatioChange,
  onCountChange,
}: {
  onClose: () => void;
  model: string;
  ratio: string;
  count: number;
  onModelChange: (m: string) => void;
  onRatioChange: (r: string) => void;
  onCountChange: (n: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
          <span className="text-pink-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </span>
          Image Generation Options
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 p-4">
        {/* Left: MODEL */}
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Model</p>
          <div className="flex flex-wrap gap-1.5">
            {IMAGE_MODELS.map((m) => (
              <ModelPill key={m.id} label={m.label} selected={model === m.id} onClick={() => onModelChange(m.id)} />
            ))}
          </div>
        </div>

        {/* Right: ASPECT RATIO + COUNT */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Aspect Ratio</p>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS_IMAGE.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onRatioChange(r.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    ratio === r.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {r.icon(ratio === r.id)}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Count</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => onCountChange(n)}
                  className={`h-8 w-8 rounded-full border text-sm font-medium transition-all ${
                    count === n
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Video Creation Options ────────────────────────────────────────────────────

const VIDEO_MODELS = [
  { id: "ltx-2", label: "LTX-2" },
  { id: "kandinsky-5", label: "Kandinsky 5" },
  { id: "seedance-1-5", label: "Seedance 1.5" },
  { id: "wan-2-6", label: "Wan 2.6" },
  { id: "kling-2-6", label: "Kling 2.6" },
  { id: "veo-3-1", label: "Veo 3.1" },
  { id: "kling-o1", label: "Kling O1" },
  { id: "grok-imagine", label: "Grok Imagine" },
  { id: "kling-3-0", label: "Kling 3.0" },
  { id: "kling-o3", label: "Kling O3" },
  { id: "seedance-2-0", label: "Seedance 2.0" },
  { id: "hailuo-2-3", label: "Hailuo 2.3" },
  { id: "sora-2", label: "Sora 2" },
];

const VIDEO_MODES = [
  { id: "new-video", label: "New Video" },
  { id: "transform", label: "Transform", badge: "3x" },
  { id: "continue", label: "Continue", badge: "3x" },
  { id: "animate-frames", label: "Animate Frames", badge: "2x" },
];

const ASPECT_RATIOS_VIDEO = [
  { id: "16:9", label: "16:9", icon: (sel: boolean) => <svg width="16" height="10" viewBox="0 0 20 12" fill="none"><rect x="1" y="1" width="18" height="10" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "9:16", label: "9:16", icon: (sel: boolean) => <svg width="10" height="14" viewBox="0 0 12 20" fill="none"><rect x="1" y="1" width="10" height="18" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
  { id: "1:1", label: "1:1", icon: (sel: boolean) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke={sel ? "white" : "#52525b"} strokeWidth="1.8"/></svg> },
];

export function VideoOptionsPanel({ onClose }: { onClose: () => void }) {
  const [model, setModel] = useState("kling-o3");
  const [mode, setMode] = useState("new-video");
  const [duration, setDuration] = useState(3);
  const [ratio, setRatio] = useState("16:9");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
          <span className="text-rose-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/>
            </svg>
          </span>
          Video Creation Options
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 p-4">
        {/* Left: MODEL + DURATION */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Model</p>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_MODELS.map((m) => (
                <ModelPill key={m.id} label={m.label} selected={model === m.id} onClick={() => setModel(m.id)} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Duration</p>
              <span className="text-xs font-semibold text-zinc-700">{duration}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">3s</span>
              <input
                type="range"
                min={3} max={15} step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full bg-zinc-200 accent-zinc-900 cursor-pointer"
              />
              <span className="text-xs text-zinc-400">15s</span>
            </div>
          </div>
        </div>

        {/* Right: MODE + ASPECT RATIO */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Mode</p>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    mode === m.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {m.label}
                  {m.badge && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      mode === m.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {m.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Aspect Ratio</p>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS_VIDEO.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    ratio === r.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {r.icon(ratio === r.id)}
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function PanelHeader({ icon, title, onClose }: { icon: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        {icon}
        {title}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">{children}</p>;
}

// ── Image Editing Options ─────────────────────────────────────────────────────

const EDIT_MODELS = ["Flux 2 Flex","Nano Banana","Nano Banana 2","GPT Image 2","Grok Imagine","Kling O3","Kling 3.0","Seedream 4.5","Seedream 5.0"];
const EDIT_SIZES = ["1:1","4:3","2:3","16:9 HD","16:9 QHD","16:9 4K"];

export function EditOptionsPanel({ onClose }: { onClose: () => void }) {
  const [model, setModel] = useState("GPT Image 2");
  const [size, setSize] = useState("1:1");
  const [quality, setQuality] = useState("Low");
  const [count, setCount] = useState(2);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-red-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>}
        title="Image Editing Options" />
      <div className="grid grid-cols-2 gap-6 p-4">
        <div className="flex flex-col gap-4">
          <div>
            <SectionLabel>Model</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {EDIT_MODELS.map((m) => <ModelPill key={m} label={m} selected={model===m} onClick={() => setModel(m)} />)}
            </div>
          </div>
          <div>
            <SectionLabel>Quality</SectionLabel>
            <div className="flex gap-2">
              {["Low","Medium","High"].map((q) => (
                <button key={q} onClick={() => setQuality(q)} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${quality===q?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{q}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <SectionLabel>Image Size</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {EDIT_SIZES.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${size===s?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Images</SectionLabel>
            <div className="flex gap-2">
              {[1,2,3,4].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={`h-8 w-8 rounded-full border text-sm font-medium transition-all ${count===n?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Media Upscaler Options ────────────────────────────────────────────────────

export function UpscaleOptionsPanel({ onClose }: { onClose: () => void }) {
  const [scale, setScale] = useState("2x");
  const [creativity, setCreativity] = useState(0);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-orange-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><path d="M21 3l-7 7"/><polyline points="9 21 3 21 3 15"/><path d="M3 21l7-7"/></svg></span>}
        title="Media Upscaler Options" />
      <div className="grid grid-cols-2 gap-6 p-4">
        <div>
          <SectionLabel>Scale</SectionLabel>
          <div className="flex gap-2">
            {["2x","4x"].map((s) => (
              <button key={s} onClick={() => setScale(s)} className={`rounded-full border px-5 py-1.5 text-xs font-medium transition-all ${scale===s?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Creativity: {creativity}%</SectionLabel>
          <input type="range" min={0} max={100} step={1} value={creativity} onChange={(e) => setCreativity(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full bg-zinc-200 accent-zinc-900 cursor-pointer mb-1" />
          <div className="flex justify-between text-[10px] text-zinc-400"><span>Conservative</span><span>Creative</span></div>
          <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">Creativity applies to images only. Higher values add more AI enhancement.</p>
        </div>
      </div>
    </div>
  );
}

// ── Music Generation Options ──────────────────────────────────────────────────

const MUSIC_TAGS = ["Pop","Electronic","Rock","Classical","Rap","Folk","Country","Blues","Hip hop","Jazz","Metal","Alternative rock","Dance","Indie rock","Latin","Pop rock","R&b","Soul","Ambient","Lo-fi"];

export function MusicOptionsPanel({ onClose }: { onClose: () => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState("");
  function toggleTag(t: string) {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < 3 ? [...prev, t] : prev);
  }
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-yellow-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>}
        title="Music Generation Options" />
      <div className="p-4 flex flex-col gap-4">
        <div>
          <SectionLabel>Tags (Select up to 3)</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {MUSIC_TAGS.map((t) => (
              <button key={t} onClick={() => toggleTag(t)} className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${tags.includes(t)?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Custom Lyrics (Optional)</SectionLabel>
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Enter custom lyrics or leave empty for AI-generated lyrics..." rows={3}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 resize-none" />
          <p className="mt-1 text-[11px] text-zinc-400">Leave empty for instrumental or let AI write lyrics based on your prompt.</p>
        </div>
      </div>
    </div>
  );
}

// ── Sound Effects Options ─────────────────────────────────────────────────────

export function SoundOptionsPanel({ onClose }: { onClose: () => void }) {
  const [duration, setDuration] = useState(22);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-lime-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>}
        title="Sound Effects Options" />
      <div className="p-4">
        <SectionLabel>Duration: {duration} seconds</SectionLabel>
        <input type="range" min={0.5} max={22} step={0.5} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full bg-zinc-200 accent-zinc-900 cursor-pointer mb-1" />
        <div className="flex justify-between text-[10px] text-zinc-400"><span>0.5s</span><span>22s</span></div>
      </div>
    </div>
  );
}

// ── Text to Speech Options ────────────────────────────────────────────────────

const TTS_VOICES = ["Aria","Roger","Sarah","Laura","Charlie","George","Callum","River","Liam","Charlotte","Alice","Matilda"];
const LANGUAGES = ["Auto","English","Spanish","French","German","Italian","Portuguese","Hindi","Japanese","Chinese","Korean","Arabic"];

export function SpeechOptionsPanel({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState("Auto");
  const [tab, setTab] = useState<"default"|"custom">("default");
  const [voice, setVoice] = useState("Laura");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-green-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>}
        title="Text to Speech Options" />
      <div className="p-4 flex flex-col gap-4">
        <div>
          <SectionLabel>Language</SectionLabel>
          <div className="relative">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-64 appearance-none rounded-xl border border-zinc-900 bg-white px-3 py-2 pr-8 text-sm text-zinc-800 outline-none cursor-pointer">
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Select a language for native pronunciation</p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-3">
            <SectionLabel>Voice (click play to preview)</SectionLabel>
            <div className="flex items-center gap-1 rounded-full bg-zinc-900 p-0.5 ml-2">
              <button onClick={() => setTab("default")} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${tab==="default"?"bg-white text-zinc-900":"text-zinc-400 hover:text-white"}`}>Default voices</button>
              <button onClick={() => setTab("custom")} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${tab==="custom"?"bg-white text-zinc-900":"text-zinc-400 hover:text-white"}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                Custom ID
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {TTS_VOICES.map((v) => (
              <button key={v} onClick={() => setVoice(v)} className={`flex items-center justify-between rounded-xl border px-2.5 py-2 text-xs font-medium transition-all ${voice===v?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"}`}>
                {v}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Voice Changer Options ─────────────────────────────────────────────────────

const VOICE_CHANGER_VOICES = ["Aria","Roger","Sarah","Laura","Charlie","George","Callum","River","Liam","Charlotte","Alice","Matilda","Will","Jessica","Eric","Chris","Brian","Daniel","Lily","Bill"];

export function VoiceOptionsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"default"|"custom">("default");
  const [voice, setVoice] = useState("Aria");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-emerald-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 6v12M22 12h-2"/></svg></span>}
        title="Voice Changer Options" />
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-zinc-500">Upload an audio file to change its voice. The speech content is preserved.</p>
        <div>
          <div className="mb-3 flex items-center gap-3">
            <SectionLabel>Voice</SectionLabel>
            <div className="flex items-center gap-1 rounded-full bg-zinc-900 p-0.5">
              <button onClick={() => setTab("default")} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${tab==="default"?"bg-white text-zinc-900":"text-zinc-400 hover:text-white"}`}>Default voices</button>
              <button onClick={() => setTab("custom")} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${tab==="custom"?"bg-white text-zinc-900":"text-zinc-400 hover:text-white"}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                Custom ID
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {VOICE_CHANGER_VOICES.map((v) => (
              <button key={v} onClick={() => setVoice(v)} className={`flex items-center justify-between rounded-xl border px-2.5 py-2 text-xs font-medium transition-all ${voice===v?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"}`}>
                {v}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Code Generation Options ───────────────────────────────────────────────────

const CODE_LANGUAGES = ["TypeScript","JavaScript","Python","Rust","Go","Java","C#","C++","C","Swift","Kotlin","PHP","Ruby","SQL","HTML/CSS","Bash"];

export function CodeOptionsPanel({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState("C++");
  const [comments, setComments] = useState("Minimal");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <PanelHeader onClose={onClose}
        icon={<span className="text-slate-500"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>}
        title="Code Generation Options" />
      <div className="grid grid-cols-2 gap-6 p-4">
        <div>
          <SectionLabel>Language</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {CODE_LANGUAGES.map((l) => <ModelPill key={l} label={l} selected={lang===l} onClick={() => setLang(l)} />)}
          </div>
        </div>
        <div>
          <SectionLabel>Comments</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {["No comments","Minimal","Detailed"].map((c) => (
              <button key={c} onClick={() => setComments(c)} className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all text-left ${comments===c?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



