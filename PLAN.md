# PLAN.md — Full Build Blueprint

Portfolio for **Harshith Vijayan**. This file is the single source of truth for execution.
Read top-to-bottom once, then work phase by phase (§Build-Phases). CLAUDE.md holds the hard rules.

---

## 1. Concept

**"Quiet web-slinger energy."** A dark, cinematic, scroll-driven one-pager that positions Harshith as a
software engineer who ships AI agents to production. The Spider-Man influence is felt, never stated:
thread-like lines, a red spark, halftone grain, red/blue used the way Spider-Verse uses it — as an accent
that tracks the hero's moments, not as wallpaper.

Research takeaways baked into this plan (2026 state of the art):

- **Restraint reads as confidence.** Kinetic maximalism is dated. Few, deliberate, well-eased animations.
- **Lenis + GSAP ScrollTrigger** is the standard scroll stack; scroll experiences must work on mobile, not be desktop-only.
- Top-tier dev portfolios (Awwwards portfolio winners, staff-eng personal sites) share: giant confident display type,
  a single strong visual signature, real production metrics, fast loads, and one memorable "toy" (a 3D object,
  an easter egg, a playful footer).
- Ojas's site (the reference, NOT to be copied): giant two-word hero + cutout photo, numbered sections,
  marquee dividers, scroll-rotating project deck, french-press loader, light theme. We take the *ambition level*,
  none of the elements.

Differentiators for Harshith: **AI-agent-in-production story** (Chairside with piloting clients), a
**3D MacBook that assembles his story while scrolling**, and a **floating 3D guitar** in the fun section.

---

## 2. Stack & scaffold

```bash
npm create vite@latest . -- --template react-ts
npm i gsap @gsap/react lenis three @react-three/fiber @react-three/drei
npm i -D tailwindcss @tailwindcss/vite
# ReactBits components, one at a time as needed:
npx shadcn@latest add @react-bits/<ComponentName>-TS-TW
```

Project layout:

```
src/
  index.css          # Tailwind v4 @theme tokens (colors, fonts) — ONLY place tokens live
  data/content.ts    # every string on the site (from §Content below)
  lib/lenis.ts       # Lenis + GSAP ScrollTrigger wiring (single instance)
  components/        # shared: SectionHeading, Chip, MagneticButton, WebThreadDivider, Cursor
  sections/          # Hero.tsx, About.tsx, Experience.tsx, Projects.tsx, AgentLab.tsx,
                     # Skills.tsx, Honors.tsx, BeyondCode.tsx, Contact.tsx
  three/             # MacbookScene.tsx, GuitarScene.tsx (lazy-mounted)
public/              # models/*.glb, images/*, resume.pdf, og.png
```

Lenis wiring (once, in `lib/lenis.ts`): create Lenis, drive it from `gsap.ticker`, call
`lenis.on('scroll', ScrollTrigger.update)`. Destroy + skip entirely when `prefers-reduced-motion`.

---

## 3. Design system

### Color (Spider-Verse-informed, dark-first, no light mode in v1)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#060A14` | page background (midnight, not pure black) |
| `--color-surface` | `#0C1322` | cards, panels |
| `--color-border` | `#1C2536` | hairlines |
| `--color-text` | `#F2F4F8` | headings/body |
| `--color-muted` | `#8A94A8` | secondary text |
| `--color-red` | `#E63946` | THE accent: hovers, cursor spark, active states, key words |
| `--color-blue` | `#4F7CFF` | glows, tags, links-visited-feel, secondary accents |

Rule: ~90% neutral, ~7% red, ~3% blue. Red = interaction, blue = information. The two never gradient
into each other except in the hero Threads background at low opacity.

### Typography

- **Space Grotesk** — display/headings (700 for hero, 500 for section titles). Tight tracking on huge sizes.
- **Inter** — body, 16–18px, `--color-muted` for paragraphs.
- **JetBrains Mono** — terminal panel, tags, tiny labels (`FOUNDER`, `2026`, tech chips).
- Load via `@fontsource-variable/*` or Google Fonts `<link>` with `display=swap`; preload the display font.

### Texture & motifs (the "subtle Spidey" kit — use ALL of these, NOTHING more)

1. **Halftone grain**: CSS `radial-gradient` Ben-Day dot pattern overlaid on hero + section headings at 3–4% opacity.
2. **Web threads**: ReactBits `Threads` background in the hero only — thin drifting strands, tinted `#E63946`→`#4F7CFF` at low amplitude. Reads as elegant lines; *is* a web.
3. **Thread scroll-progress**: 2px fixed line at viewport top that draws left→right with scroll, red.
4. **ClickSpark** (ReactBits) globally: tiny red spark burst on click = web-shot. Desktop only.
5. **Web-thread dividers**: between sections, an SVG path — a single thin curved line with one small node dot — drawn on scroll (GSAP `drawSVG`-style via stroke-dashoffset).
6. **Easter egg**: after 3 rapid clicks on the footer logo, a tiny CSS spider descends from the top of the viewport on a 1px thread, dangles 2s, climbs back. Pure CSS/JS, ~40 lines.
7. **Dimension glitch**: the nav logo `hv.` does a 150ms RGB-split glitch on hover (one-shot, not looping).

No masks, no spider logos, no movie references, no "with great power" quotes.

### Motion language

- Ease: `power3.out` for entrances, `expo.out` for hero. Durations 0.6–1.0s. Stagger 40–80ms.
- Everything enters once (`once: true`) except scrubbed elements (MacBook, progress thread, marquees).
- Hover states: 150–250ms, transform/opacity/color only.
- `prefers-reduced-motion`: no Lenis, no scrubs, no WebGL motion (static frame), instant content.

---

## 4. Page structure & section specs

Single page, in this order. Nav = ReactBits **PillNav** (fixed, translucent surface, blur backdrop),
links: About · Experience · Projects · Agent Lab · Beyond Code · Contact + a red "Resume" pill (downloads PDF).

### 4.0 Loader (minimal)

Full-screen `--color-bg`, the monogram `hv.` strokes itself in like a thread being spun (SVG stroke-dashoffset,
~900ms), then the page wipes in. Session-once (sessionStorage), skipped on reduced motion. HARD CAP 1.2s — no
progress bars, no scenes. (Anti-Ojas: his loader is an elaborate french-press animation; ours is a signature, not a show.)

### 4.1 Hero

- Full viewport. `Threads` background (subtle, described above) + halftone overlay + soft radial vignette.
- Top-left mono label: `PHOENIX, AZ — CS @ ASU '28` · top-right: status dot (pulsing red) `OPEN TO SWE INTERNSHIPS`.
- Center: `HARSHITH` / `VIJAYAN` in huge Space Grotesk (clamp ~ 9vw), revealed with **SplitText** (chars, 40ms stagger).
- Under it, **RotatingText**: `Software Engineer` → `AI Agent Builder` → `Founder @ Chairside` → `Full-Stack Developer`, mono, red caret.
- One-line **ShinyText** subline: "I build agents that answer phones, book calendars, and ship to production."
- Two CTAs: `View Work` (solid red, Magnet effect ≤ 0.3 strength) and `Get in Touch` (StarBorder outline).
- Bottom-center: mono `SCROLL` + animated 24px thread line.
- (Anti-Ojas: no cutout photo, no two-word job-title hero, dark not light.)

### 4.2 About — with the 3D MacBook

Two-column desktop / stacked mobile. Left column pins while right text scrolls (ScrollTrigger pin).

- **Left (pinned): MacBook scene.** R3F canvas, lazy-mounted on approach.
  - Model: MacBook/laptop GLB (see §Assets). Body material tinted **light blue** `#A7C7E7`-ish metallic
    (matching a Sky Blue MacBook Air) — override the GLB material color in code so any laptop model works.
  - Scroll-scrubbed animation across the section: closed + tilted → lid opens (rotate hinge group) → gentle
    Y-rotation (~120° total). Use `useScroll`-style mapping from the section's ScrollTrigger progress (scrub: 0.5).
  - Screen shows an emissive texture: a terminal screenshot cycling 2–3 frames (his stack booting: `fastapi ✓  retell ✓  supabase ✓`). Plain `<meshBasicMaterial map>` swap at progress thresholds.
  - Floor: `ContactShadows` from drei. Lighting: one `Environment preset="city"` — keep it cheap.
  - Mobile: no pin; a single autorotating MacBook at ~55vh between text blocks, DPR capped at 1.5.
- **Right (scrolling): 3 short paragraphs** (copy in §Content) revealed with **ScrollReveal**, plus a compact
  stat row using **CountUp**: `4.0 GPA` · `3 clients on my SaaS` · `300+ hackathon participants engaged` · `$500 top hackathon prize`.

### 4.3 Experience

Section title: "Where I've built." (**ScrollFloat** on the title.)
Vertical timeline: a 1px thread line on the left that draws downward with scroll (scrub), a red node lights
up per entry as it enters. Entries (content §Content) fade/slide in with 60ms stagger; tech chips in mono.
Card hover = **GlareHover**. No pinning here — keep it light. 3 entries: Tekplanit, ACM at ASU, Publicis Sapient.

### 4.4 Projects

Title: "Things I've shipped."

- **Flagship spotlight — Chairside.** Full-width **SpotlightCard**: left = name, story, metrics
  (`$297 MRR/client`, `3 practices onboarded`, `voice-AI booking end-to-end`), chips, GitHub link; right = product
  visual (screenshot or stylized terminal mock). A small red `LIVE / IN PRODUCTION` pulsing badge.
- **Grid of 4** below in **MagicBento** (or 2×2 SpotlightCards if MagicBento fights the theme):
  Google Calendar MCP · AI Sales Calling Agent · EPICS-AR Garden App · GoHealthy CV.
  Each: one-liner, 3 chips, GitHub arrow. Hover: subtle lift + red border glow.
- (Anti-Ojas: grid + spotlight, NOT a scroll-rotating deck.)

### 4.5 Agent Lab (the differentiator section)

Short section, terminal aesthetic. A mono panel styled like a TUI:
`~/agents $` prompt where **TextType** types a real-looking agent trace (from §Content), including a
`[tool] calendar.check_availability ✓` line — showcasing MCP/tool-calling literacy. Right side (or below):
**LogoLoop** marquee of the agent stack: MCP · LangChain · FastMCP · Claude · Retell · n8n · Twilio · Supabase · FastAPI.
One sentence of positioning copy above it. Keep the whole section under 80vh.

### 4.6 Skills + Honors (one combined band)

- Skills: 3 **LogoLoop** rows (Languages / Frameworks / Tools — real logos via `simple-icons` SVGs or text chips),
  alternating direction, pause-on-hover.
- Honors strip beneath: 4 compact cards — Kiro Spark AI Challenge winner ($500) · Principled Innovation Hack ($250)
  · DevHacks "Best Beginner Hack" · 4× Dean's List. Mono labels + **CountUp** for the dollar values.

### 4.7 Beyond Code (fun facts)

Title: "When the laptop closes." Bento grid (CSS grid, mixed spans):

- **Hiking/Bouldering** card (2×2): user's hiking photo, grayscale→color on hover, caption "happiest above 2,000ft — or 15ft up a wall."
- **Guitar** card (2×2): the second 3D toy — low-poly **electric guitar GLB** in a tiny R3F canvas, drei `<Float>` +
  slow `<PresentationControls>` rotation; user can drag-spin it. Caption "currently torturing my neighbors with riffs."
- **Movies** card (1×1): film-grain background, "will defend the Spider-Verse movies in any argument." ← the ONE explicit-ish theme nod, kept as a joke.
- **Gym** card (1×1): CountUp joke, e.g. "hours debugging : hours lifting — 10 : 1, working on it."
- Cards use TiltedCard-style hover (small rotateX/Y) — cap tilt at 6°.

### 4.8 Contact + footer

- Huge SplitText line: "Let's build something." with "something" in red.
- Email as a giant mono link (Magnet, red underline draw), copy-to-clipboard with a ClickSpark burst + "copied" toast.
- Row: GitHub · LinkedIn · Resume PDF.
- Footer: `hv.` logo (glitch hover, triple-click = spider easter egg), `© 2026 Harshith Vijayan`,
  mono microcopy: "Handcrafted with React, GSAP & an unhealthy number of web threads."

---

## 5. ReactBits shopping list (install exactly these, TS-Tailwind variants)

`PillNav`, `SplitText`, `RotatingText`, `ShinyText`, `Threads`, `ClickSpark`, `Magnet`, `StarBorder`,
`ScrollReveal`, `ScrollFloat`, `CountUp`, `GlareHover`, `SpotlightCard`, `MagicBento`, `TextType`, `LogoLoop`, `GlitchText` (logo only).

Rules: max ONE background component (Threads). If a component's default styling fights the tokens, restyle it —
don't stack another component on top. Anything else from the catalog requires a deliberate reason.

---

## 6. 3D specs (r3f)

Shared rules: `<Canvas frameloop="demand"` where possible, `dpr={[1, 1.75]}`, lazy `React.lazy` +
IntersectionObserver mount, `gl={{ antialias: true, powerPreference: 'high-performance' }}`, suspense fallback =
static poster image. Pause rendering when tab hidden or canvas off-screen. Reduced motion → static hero frame.

- **MacBook**: target < 2MB GLB (draco). Tint body light blue via `material.color.set('#A7C7E7')` traversal;
  screen = separate mesh with swapped emissive texture. Scroll mapping: section progress 0→1 drives
  lid angle (0→110°) over first 40%, then Y-rotation over remaining 60%.
- **Guitar**: target < 1MB GLB, low-poly electric guitar. `<Float speed={1.2} rotationIntensity={0.6}>` + slow
  constant yaw; `<PresentationControls>` for drag. Accent: red rim light so it sits in the palette.

---

## 7. Content (verbatim source of truth — do not paraphrase numbers)

**Identity**: Harshith Vijayan · Phoenix/Tempe, AZ · hvijayan@asu.edu · github.com/Harshith241 ·
linkedin.com/in/harshithvijayan · B.S. Computer Science, ASU, expected May 2028 · 4.0 GPA, 4× Dean's List.

**About paragraphs (tone: confident, concrete, no buzzword soup):**
1. "I'm a CS sophomore at ASU who'd rather ship than speculate. I founded Chairside, a voice-AI platform that answers missed calls for dental practices and books appointments on its own — 3 piloting clients and counting."
2. "My lane is AI agents that touch the real world: MCP servers, tool-calling pipelines, LangChain reasoning layers, and the unglamorous production work (idempotency, timezones, caller-ID truth) that makes them reliable."
3. "Before that: full-stack work at Publicis Sapient, an AR navigation app used by 500+ botanical-garden visitors, and an SWE internship at Tekplanit building calendar MCP tooling and an AI sales agent."

**Experience entries:**
- **Tekplanit — Software Engineering Intern** · Remote · Dec 2025 – Feb 2026
  - Built a dynamic MCP server with FastMCP exposing Google Calendar tools (scheduling, rescheduling, cancellations, availability).
  - Architected an AI sales-calling agent with LangChain: tool-driven reasoning, conversational memory, separated LLM reasoning/execution layers.
  - Designed agent workflows for meeting orchestration and follow-ups; explored AWS (EC2/S3) containerized deployment.
  - Chips: `FastMCP` `LangChain` `Python` `AWS` `Next.js`
- **ACM at ASU — Industry Coordinator** · Tempe · Jan 2026 – Present
  - Intern → Contributor → Coordinator in 3 months; ran end-to-end industry outreach.
  - Contributed to GlobeHack (300+ participants); secured 5+ industry speakers and sponsors.
  - Chips: `Outreach` `Leadership` `Events`
- **Publicis Sapient (GCA) — Full-Stack Developer** · Remote · Mar 2025 – May 2025
  - Personalized booking flows for 3 user archetypes (Vanilla JS, Bootstrap 5, OpenLayers); reduced first-click friction for 65% of undecided travelers.
  - Converted wireframes into reusable JS modules, 100% unit-test pass rate, cut prototyping time 50%.
  - Chips: `JavaScript` `Bootstrap` `OpenLayers` `Testing`

**Projects:**
- **Chairside — AI Missed-Call Recovery & Booking SaaS** (flagship) · Jun 2026–present · github.com/Harshith241/Chairside-API
  Multi-tenant voice-AI platform for dental practices: Retell AI voice agent + Cal.com availability + Twilio SMS +
  FastAPI on Railway + Supabase, per-client isolation on one deployment. 3 clients onboarded, $297 MRR/client.
  Production war stories: fixed UTC↔Phoenix timezone bug, idempotent booking, caller-ID as source of truth.
  Chips: `FastAPI` `Retell AI` `Twilio` `Supabase` `n8n` `Railway`
- **Google Calendar MCP** · github.com/Harshith241/google-calendar-mcp — FastMCP server connecting Claude to Google
  Calendar: NL scheduling, free-slot detection, Meet links, OAuth 2.0, Dockerized. Chips: `MCP` `FastMCP` `Docker` `OAuth`
- **AI Sales Calling Agent** (Tekplanit) — LangChain agent with tool-driven reasoning + conversational memory for
  outbound sales calls. Chips: `LangChain` `Python` `Tool Calling`
- **EPICS-AR Garden Navigator** · github.com/Harshith241/EPICS-AR — Flutter AR app for 500+ visitors of Kebun Raya
  Balikpapan; offline GPS navigation, −30% wayfinding errors; 8-person international Agile team. Chips: `Flutter` `Dart` `GPS/AR`
- **GoHealthy** · github.com/Harshith241/GoHealthy--AI-capstone-project — CV model predicting BMI from a photo + diet
  recommendations. Chips: `Python` `Computer Vision`

**Agent Lab terminal trace (TextType script):**
```
~/agents $ chairside handle-call --from (480) 555-0198
[agent]  missed call detected → dialing back with voice agent
[tool]   calendar.check_availability(date="tomorrow")  ✓ 3 slots
[agent]  "I can do 10:30, 1:00, or 3:15 — what works?"
[tool]   booking.create(slot="10:30", patient="+14805550198")  ✓ confirmed
[tool]   sms.send(confirmation)  ✓ delivered
~/agents $ █   // this happens ~40×/month without me
```

**Skills** (rows): Python · Java · TypeScript · JavaScript · C++ · C# · Swift · Kotlin · Dart · SQL //
React · LangChain · Node.js · FastAPI · .NET · Angular · Flutter // MCP · Supabase · Twilio · n8n · Docker · AWS · Railway · Git · Linux

**Honors:** Kiro Spark AI Challenge Track Winner — $500 (Apr 2026) · Principled Innovation Hack — $250 (Apr 2025) ·
DevHacks×Strategy "Best Beginner Hack" (Mar 2025) · 4× Dean's List.

**Contact:** hvijayan@asu.edu · GitHub `Harshith241` · LinkedIn `harshithvijayan` · resume.pdf.

---

## 8. Assets

| Asset | Source | Status |
|---|---|---|
| `public/resume.pdf` | user provides (export the .docx to PDF) | ❌ ask user |
| Headshot / portrait (about section optional) | user provides | ❌ ask user |
| Hiking photo | user provides | ❌ ask user |
| MacBook GLB | free/CC laptop model — e.g. pmndrs market (`market.pmnd.rs`) laptop, or Sketchfab CC-BY MacBook Air; draco-compress with `gltf-transform` | executor sources; MUST verify license allows use + credit in footer if CC-BY |
| Electric guitar GLB | Sketchfab CC0/CC-BY low-poly electric guitar; draco-compress | executor sources; same license rule |
| Terminal screen textures (3 PNG frames) | generate: dark terminal, mono text of his stack | executor generates |
| `public/og.png` (1200×630) | generate: dark bg, halftone, "Harshith Vijayan — Software Engineer" | executor generates |
| Project screenshot for Chairside | user provides OR stylized terminal mock | fallback exists |

Missing user asset ⇒ documented placeholder + `TODO(asset)` comment. Never block.

---

## 9. Build phases (execute in order; verify each in browser before next)

1. **Scaffold**: Vite+TS+Tailwind v4, tokens in `@theme`, fonts, Lenis+ScrollTrigger wiring, empty section shells with correct copy rendered plain, `content.ts` fully populated. Deploy-ready skeleton. Create `PROGRESS.md`.
2. **Hero + Nav + global effects**: Threads bg, SplitText/RotatingText/ShinyText, CTAs, PillNav, ClickSpark, scroll-progress thread, halftone overlay.
3. **About (text + stats)**: ScrollReveal paragraphs, CountUp stats. (MacBook placeholder box for now.)
4. **Experience + Projects**: timeline w/ drawn thread, flagship SpotlightCard, MagicBento grid.
5. **MacBook 3D**: source+compress GLB, scene, scroll scrub, screen textures, mobile fallback.
6. **Agent Lab + Skills + Honors**: TextType terminal, LogoLoop rows, honors cards.
7. **Beyond Code + Contact + Loader**: bento grid, guitar 3D, contact section, `hv.` loader, easter eggs.
8. **Polish pass**: 375px mobile audit, reduced-motion audit, keyboard/focus states, meta/OG/favicon (a tiny abstract web-node mark, NOT a spider logo), Lighthouse ≥90 perf/a11y/SEO, bundle check, deploy to Vercel.

Definition of done per phase: builds clean, looks right at 1440px and 375px, no console errors,
scroll at 60fps (check DevTools performance), PROGRESS.md updated.

---

## 10. Anti-clone checklist (vs ojas-patil.vercel.app) — verify at the end

- [ ] No loading-screen "scene" (his: french press) — ours is a ≤1.2s monogram stroke.
- [ ] No giant two-word role title with cutout body photo — ours is name + rotating roles, dark.
- [ ] No `/ 01 — SECTION` numbered labels or word-marquee dividers — ours are web-thread SVG dividers.
- [ ] No scroll-rotating project deck — ours is spotlight + bento.
- [ ] No light-theme-first — ours is dark-only v1.
- [ ] Overall: side-by-side, a stranger should not say "same template."
