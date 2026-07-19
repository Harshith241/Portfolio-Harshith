# Harshith Vijayan — Portfolio Website

Personal portfolio for Harshith Vijayan (CS @ ASU, SWE + AI-agent builder, founder of Chairside).
Dark, cinematic, scroll-driven single-page site with a **subtle** Spider-Man undertone.

**The complete build spec lives in [PLAN.md](PLAN.md). Read it before writing any code.**
All resume content, section-by-section specs, component choices, and build phases are there.
Do not invent content — use `PLAN.md` §Content verbatim.

**v2 IN PROGRESS on branch `feat/cinematic-intro`: scroll-triggered cinematic intro ("The Swing").**
Spec = [PLAN-INTRO.md](PLAN-INTRO.md) (storyboard beats B1–B6, Track A graphic-novel approach chosen,
phases I1–I5, revert = tag `v1-classic` / main untouched). Code lives in `src/intro/`. Check PROGRESS.md
for the current I-phase before touching anything. Exception to the "no Spider-Man imagery" rule: the intro
uses OUR original silhouette web-slinger art — still NO logos, movie stills, or the name "Spider-Man" in UI.

## Stack (locked — do not substitute)

- Vite + React 19 + TypeScript + Tailwind CSS v4
- ReactBits components (https://reactbits.dev) — install via `npx shadcn@latest add @react-bits/<Name>-TS-TW`
- GSAP + ScrollTrigger for scroll choreography; Lenis for smooth scroll
- react-three-fiber + @react-three/drei for the 3D MacBook and guitar (nothing else in 3D)
- Deploy target: Vercel

## Commands

- `npm run dev` — dev server
- `npm run build && npm run preview` — production check (run before calling any phase done)

## Design tokens (single source: `src/index.css` `@theme`)

- Background `#060A14`, surface `#0C1322`, border `#1C2536`
- Text `#F2F4F8`, muted `#8A94A8`
- Accent red `#E63946` (interactive: hovers, cursor spark, links)
- Accent blue `#4F7CFF` (informational: glows, tags, secondary)
- Ratio ≈ 90% neutral / 7% red / 3% blue. Never a 50/50 red-blue split.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code/terminal). No others.

## Hard DO's

- DO gate every animation behind `prefers-reduced-motion` (kill Lenis, GSAP scrubs, WebGL motion).
- DO lazy-mount 3D canvases on intersection and pause/unmount them off-screen.
- DO keep at most **one** WebGL background alive at a time (hero only).
- DO give every scroll-triggered element a sensible no-JS/initial state (content visible without animation).
- DO use real metrics from PLAN.md (e.g. "$297 MRR/client", "3 clients", "300+ hackathon participants").
- DO verify each phase visually in the browser at desktop AND 375px mobile before moving on.
- DO keep the Spider-Man theme *subtle*: web-thread lines, red click-spark, halftone dots at ≤4% opacity, one easter egg. If a reviewer can't name the theme in 5 seconds, that's correct.

## Hard DON'Ts

- DON'T use Spider-Man logos, masks, movie stills, or the name "Spider-Man" anywhere in the UI (copyright + subtlety).
- DON'T copy Ojas Patil's site (ojas-patil.vercel.app): no french-press loader, no full-body cutout photo over giant two-word title, no "/ 01 — ABOUT" numbered labels, no scroll-rotating card deck, no light-first theme. Structure may rhyme; nothing may look cloned.
- DON'T add npm dependencies beyond: gsap, @gsap/react, lenis, three, @react-three/fiber, @react-three/drei, and what ReactBits components themselves require. Ask before anything else.
- DON'T stack multiple ReactBits background components or use more than ONE glitch-style effect on the page.
- DON'T animate `top/left/width/height` — transforms and opacity only.
- DON'T use custom cursors, hover trails, or Magnet effects on touch devices — feature-detect and disable.
- DON'T let total JS exceed ~600 KB gzipped or LCP exceed 2.5s (throttled 4G). Check with `npm run build`.
- DON'T use more than 2 typefaces + 1 mono. DON'T use pure black `#000` or pure white `#FFF` surfaces.
- DON'T write placeholder lorem-ipsum — all copy comes from PLAN.md §Content.
- DON'T skip the mobile pass. Every section must work at 375px with 3D/cursor effects gracefully degraded.

## Assets

Live in `public/`. Missing assets (user photo, hiking photo, GLB models) are listed in PLAN.md §Assets —
if one is missing, use the documented placeholder and add a `TODO(asset)` comment; never block a phase on it.

## Working style

- One section = one component file in `src/sections/`. Shared bits in `src/components/`. All copy/data in `src/data/content.ts`.
- Follow the phase order in PLAN.md §Build-Phases; finish and verify a phase before starting the next.
- After each phase, update `PROGRESS.md` (checklist) so a fresh session knows where things stand.
