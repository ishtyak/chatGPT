"use client";

import { useState } from "react";

/* ── Template data ────────────────────────────────────────────────────────── */
interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: string;
  gradient: string;
  badge?: string;
}

const TEMPLATES: Template[] = [
  /* ── Image generation ── */
  {
    id: "img-product",
    category: "Image",
    icon: "🖼️",
    gradient: "from-pink-50 to-rose-50",
    badge: "Popular",
    title: "Product Photography",
    description: "Studio-quality product shots on clean backgrounds.",
    prompt: "Professional product photography of [PRODUCT], placed on a clean white marble surface, soft diffused studio lighting, ultra-sharp detail, 8K resolution, commercial photography style",
  },
  {
    id: "img-portrait",
    category: "Image",
    icon: "👤",
    gradient: "from-pink-50 to-purple-50",
    title: "AI Portrait",
    description: "Hyper-realistic portrait with professional lighting.",
    prompt: "Hyper-realistic portrait of [PERSON DESCRIPTION], professional studio lighting, shallow depth of field, 85mm lens, photograph quality, ultra-detailed",
  },
  {
    id: "img-landscape",
    category: "Image",
    icon: "🌄",
    gradient: "from-sky-50 to-indigo-50",
    title: "Fantasy Landscape",
    description: "Breathtaking fantasy world landscape art.",
    prompt: "Epic fantasy landscape with [DESCRIPTION], magical atmosphere, volumetric lighting, detailed environment, artstation quality, 4K",
  },
  {
    id: "img-logo",
    category: "Image",
    icon: "✨",
    gradient: "from-yellow-50 to-orange-50",
    title: "Logo Design",
    description: "Minimalist modern logo concept.",
    prompt: "Minimalist logo design for [BRAND NAME] in the [INDUSTRY] industry, clean vector style, modern, professional, flat design, white background",
  },
  {
    id: "img-social",
    category: "Image",
    icon: "📱",
    gradient: "from-violet-50 to-purple-50",
    title: "Social Media Banner",
    description: "Eye-catching banner for any platform.",
    prompt: "Social media banner for [BRAND/EVENT], vibrant colors, modern typography placeholders, [PLATFORM] dimensions, engaging visual composition",
  },

  /* ── Email ── */
  {
    id: "email-welcome",
    category: "Email",
    icon: "📧",
    gradient: "from-blue-50 to-cyan-50",
    badge: "Popular",
    title: "Welcome Email",
    description: "Warm onboarding email for new users.",
    prompt: "Write a warm and professional welcome email for a new user who just signed up for [PRODUCT/SERVICE]. Include a brief intro, top 3 features, and a clear call-to-action to get started. Tone: friendly, encouraging.",
  },
  {
    id: "email-newsletter",
    category: "Email",
    icon: "📰",
    gradient: "from-teal-50 to-blue-50",
    title: "Newsletter",
    description: "Engaging weekly newsletter template.",
    prompt: "Write a weekly newsletter for [BRAND] covering: 1) Top industry news this week, 2) A practical tip for [AUDIENCE], 3) A featured product/article. Keep it concise, conversational, and under 300 words.",
  },
  {
    id: "email-promo",
    category: "Email",
    icon: "🎯",
    gradient: "from-orange-50 to-amber-50",
    title: "Promotional Campaign",
    description: "High-converting sales promotion email.",
    prompt: "Write a compelling promotional email for [PRODUCT] with a [DISCOUNT]% off offer. Include: attention-grabbing subject line, urgency-driven copy, benefit-focused bullet points, and a strong CTA button text. Limited time: [DEADLINE].",
  },
  {
    id: "email-followup",
    category: "Email",
    icon: "🤝",
    gradient: "from-green-50 to-emerald-50",
    title: "Follow-up Email",
    description: "Professional post-meeting follow-up.",
    prompt: "Write a professional follow-up email after a meeting with [PERSON/COMPANY] about [TOPIC]. Recap key points discussed, outline next steps, and express appreciation. Keep it brief and action-oriented.",
  },

  /* ── Video ── */
  {
    id: "vid-explainer",
    category: "Video",
    icon: "🎬",
    gradient: "from-rose-50 to-pink-50",
    badge: "Popular",
    title: "Explainer Video Script",
    description: "60-second product explainer script.",
    prompt: "Write a 60-second explainer video script for [PRODUCT/SERVICE]. Structure: Hook (5s) → Problem (10s) → Solution (20s) → Features (15s) → CTA (10s). Conversational, energetic tone. Include [VOICEOVER] and [ON SCREEN TEXT] cues.",
  },
  {
    id: "vid-youtube",
    category: "Video",
    icon: "▶️",
    gradient: "from-red-50 to-orange-50",
    title: "YouTube Video Script",
    description: "Engaging YouTube video outline & script.",
    prompt: "Write a full YouTube video script about [TOPIC] for a [NICHE] channel. Include: compelling hook, intro, 3-5 main sections with b-roll suggestions, engagement prompts (like/subscribe), and an outro. Target length: [MINUTES] minutes.",
  },
  {
    id: "vid-reels",
    category: "Video",
    icon: "🎥",
    gradient: "from-purple-50 to-violet-50",
    title: "Instagram Reels Script",
    description: "Viral short-form video content script.",
    prompt: "Write a punchy 30-second Instagram Reels script about [TOPIC]. Hook in first 2 seconds, fast-paced cuts every 3-5 seconds, trend-driven format. Include text overlay suggestions and background music mood.",
  },
  {
    id: "vid-character",
    category: "Video",
    icon: "🤖",
    gradient: "from-indigo-50 to-blue-50",
    title: "AI Video Character",
    description: "Character brief for AI avatar videos.",
    prompt: "Create a detailed AI video character description for [BRAND]. Include: appearance (age, style, outfit), personality traits, speech pattern, background setting, and tone guidelines. This character will represent [BRAND] in promotional videos.",
  },

  /* ── Writing ── */
  {
    id: "write-blog",
    category: "Writing",
    icon: "✍️",
    gradient: "from-emerald-50 to-teal-50",
    badge: "Popular",
    title: "Blog Post",
    description: "SEO-optimised long-form blog article.",
    prompt: "Write a comprehensive, SEO-optimized blog post about [TOPIC] targeting the keyword '[KEYWORD]'. Structure: compelling H1 title, introduction with hook, 5-7 H2 sections with actionable content, key takeaways, and a conclusion with CTA. Word count: ~1500 words.",
  },
  {
    id: "write-linkedin",
    category: "Writing",
    icon: "💼",
    gradient: "from-blue-50 to-sky-50",
    title: "LinkedIn Post",
    description: "High-engagement LinkedIn thought leadership.",
    prompt: "Write a high-engagement LinkedIn post about [TOPIC/LESSON LEARNED] for a [JOB TITLE] audience. Use the hook-story-insight format. Include a question at the end to drive comments. 150-250 words, no hashtag spam.",
  },
  {
    id: "write-tweet",
    category: "Writing",
    icon: "🐦",
    gradient: "from-cyan-50 to-sky-50",
    title: "Twitter/X Thread",
    description: "Viral Twitter thread on any topic.",
    prompt: "Write a viral Twitter/X thread about [TOPIC] with 8-10 tweets. Start with a bold hook tweet, build tension/curiosity, share actionable insights, and end with a strong takeaway. Each tweet under 280 chars, numbered 1/",
  },
  {
    id: "write-ad",
    category: "Writing",
    icon: "📢",
    gradient: "from-amber-50 to-yellow-50",
    title: "Ad Copy",
    description: "Conversion-optimised ad copy.",
    prompt: "Write 3 variations of ad copy for [PRODUCT] targeting [AUDIENCE]. For each: headline (max 30 chars), description (max 90 chars), and a CTA. Focus on the main benefit: [BENEFIT]. Platform: [Google/Meta/LinkedIn].",
  },

  /* ── Code ── */
  {
    id: "code-api",
    category: "Code",
    icon: "⚡",
    gradient: "from-slate-50 to-zinc-50",
    title: "REST API Endpoint",
    description: "Generate a clean REST API endpoint.",
    prompt: "Write a [LANGUAGE] REST API endpoint for [FUNCTIONALITY]. Include: input validation, error handling, authentication check, database query, and response formatting. Follow REST best practices and include comments.",
  },
  {
    id: "code-component",
    category: "Code",
    icon: "🧩",
    gradient: "from-violet-50 to-indigo-50",
    title: "UI Component",
    description: "React/Next.js reusable component.",
    prompt: "Build a reusable React component for [COMPONENT DESCRIPTION] using TypeScript and Tailwind CSS. Include: props interface, responsive design, hover states, accessibility attributes, and a usage example.",
  },
  {
    id: "code-sql",
    category: "Code",
    icon: "🗄️",
    gradient: "from-green-50 to-emerald-50",
    title: "SQL Query",
    description: "Optimised SQL query for complex data needs.",
    prompt: "Write an optimized SQL query to [TASK DESCRIPTION]. Tables involved: [TABLE NAMES]. Requirements: [FILTERS/SORTING/AGGREGATIONS]. Include indexes to consider and explain the query logic.",
  },
];

const CATEGORIES = ["All", "Image", "Email", "Video", "Writing", "Code"];

const CATEGORY_COLORS: Record<string, string> = {
  Image:   "bg-pink-100 text-pink-700 border-pink-200",
  Email:   "bg-blue-100 text-blue-700 border-blue-200",
  Video:   "bg-rose-100 text-rose-700 border-rose-200",
  Writing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Code:    "bg-slate-100 text-slate-700 border-slate-200",
};

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function TemplatesView({
  onUseTemplate,
}: {
  onUseTemplate: (prompt: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function handleCopy(t: Template) {
    navigator.clipboard.writeText(t.prompt);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="border-b border-zinc-100 px-8 py-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Templates</h1>
        <p className="text-sm text-zinc-500">Ready-to-use prompts for images, emails, video, writing &amp; code.</p>

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
              placeholder="Search templates…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                activeCategory === cat
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
            No templates match &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`group relative flex flex-col rounded-2xl border border-zinc-100 bg-gradient-to-br ${t.gradient} p-5 hover:shadow-md hover:border-zinc-200 transition-all duration-200`}
              >
                {/* Badge */}
                {t.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                    {t.badge}
                  </span>
                )}

                {/* Icon + category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl leading-none">{t.icon}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[t.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {t.category}
                  </span>
                </div>

                {/* Title + description */}
                <h3 className="text-sm font-bold text-zinc-900 mb-1">{t.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">{t.description}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onUseTemplate(t.prompt)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-700 active:scale-95 transition-all"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
                    </svg>
                    Use
                  </button>
                  <button
                    onClick={() => handleCopy(t)}
                    title="Copy prompt"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 transition-all"
                  >
                    {copiedId === t.id ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
