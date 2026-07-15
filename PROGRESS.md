# PROGRESS

Phase status (see PLAN.md §9 for definitions):

- [x] **Phase 1 — Scaffold**: Vite+React 19+TS+Tailwind v4, tokens in `src/index.css`, fonts in `index.html`,
  Lenis+ScrollTrigger wiring in `src/lib/lenis.ts`, all 8 section shells rendering real copy from
  `src/data/content.ts`, assets in `public/` (resume.pdf, images/headshot.jpg, images/hiking.jpg), favicon.
- [x] **Phase 2 — Hero + Nav + global effects**: Threads bg (lazy, red-tinted, hero only), SplitText name,
  RotatingText roles, ShinyText tagline, Magnet CTA + StarBorder CTA, PillNav (adapted: no react-router,
  text logo, fixed centered, custom `hoverColor` prop decoupled from frame `baseColor`), global ClickSpark
  (patched to fixed viewport overlay + window listener), scroll ProgressThread. All ReactBits sources vendored
  in `src/components/reactbits/` (fetched from repo, ts-tailwind variants; type-only import fixes applied).
  Deps added: ogl, motion. Bundle: 166 KB gz + 15 KB lazy Threads chunk.
  ⚠️ Browser-pane note for future sessions: the embedded pane reports `document.hidden: true` (WebGL loops
  that respect it won't render — override via JS to verify) and does NOT rasterize below-the-fold screenshots;
  verify scrolled sections with `document.querySelector('main').style.transform = 'translateY(-Npx)'` then reset.
- [x] **Phase 3 — About**: duotone headshot generated (`public/images/headshot-duotone.jpg` — Pillow script:
  grayscale → tone curve that maps the white studio bg down to dark navy while face stays bright → vignette;
  original kept at headshot.jpg). About layout: sticky left column (portrait card + macbook placeholder),
  right column = ScrollReveal lead statement (scrub word-reveal) + Reveal'd paragraphs + CountUp stats
  (from=0.1 trick gives "4.0" decimal formatting). New shared `src/components/Reveal.tsx` (fade-up once,
  reduced-motion gated). Vendored ScrollReveal/ScrollFloat/CountUp/TextType/GlareHover/SpotlightCard/
  MagicBento/LogoLoop/TiltedCard. ⚠️ ScrollReveal was patched to scope its GSAP cleanup (upstream kills ALL
  ScrollTriggers on unmount — re-apply if ever re-vendored).
  Git: repo initialized on `main`, remote = https://github.com/Harshith241/Portfolio-Harshith.git (user commits manually after each phase).
- [x] **Phase 4 — Experience + Projects**: Experience = ScrollFloat title, timeline with scroll-drawn red
  thread (scaleY scrub over gray track) + glowing red nodes, entries in GlareHover cards (red glare sweep).
  Projects = flagship Chairside in SpotlightCard (red spotlight, 2-col on lg: story/metrics/chips | stylized
  live call-log mock in `CallLogMock`) + 2×2 grid of SpotlightCards (blue spotlight, hover red border).
  Deviation from PLAN: used SpotlightCards instead of MagicBento for the grid (MagicBento hardcodes its own
  card data/particles — fights the theme; PLAN §4.4 explicitly allows this). Headshot re-treated (v4):
  monotonic duotone (natural face/teeth) + spotlight vignette — do NOT reintroduce the solarize curve.
  Bundle: 170 KB gz.
- [x] **Phase 5 — MacBook 3D**: model = `mac-draco.glb` from pmndrs/examples (MIT), 414KB→75KB after swapping
  the embedded 2880×1800 screen jpeg for a generated terminal PNG (scripts used @gltf-transform/core +
  draco3dgltf, now devDeps). Screen textures generated with Pillow (`public/images/screen-1/2.png` — boot
  log + agent trace, brand colors, Menlo). `src/three/MacbookScene.tsx`: hinge = `screenflip` group,
  rotation-x 1.575 (closed) → -0.425 (open) over first 38% of #about scroll progress, then yaw PI→+2.1rad;
  screen swaps to agent-trace texture at p>0.55 (runtime texture: flipY=false + needsUpdate=true — REQUIRED,
  else upside down). Body tinted #A7C7E7, metalness .35 (lights-only, no drei Environment = no runtime HDR
  fetch). frameloop="demand" + invalidate() from ScrollTrigger onUpdate; DPR [1,1.5]; ContactShadows;
  `Lazy3D` wrapper mounts canvas on approach (rootMargin 400px); reduced-motion = static open pose.
  DEV helper: `window.__macProgress(0..1)` poses the model for headless verification.
  User-requested fixes (iterated 3×, user wants it FAST — don't slow it back down): trigger `#mac-slot`
  (`top 80%`, `end: '+=520'`, scrub 0.3). Closed-hold p<0.05, lid opens 0.05→0.2, FULL 360° yaw 0.2→1
  (180° lands ~310px after the laptop appears ≈ one wheel gesture), screen swaps at p 0.6 while the back
  faces the camera. Copy: "3 piloting clients" (was "paying") in content.ts — user's wording, keep it.
  Note: R3F's JSX augmentation broke SplitText's dynamic tag → now uses React.createElement.
  Bundle: main 170 KB gz + lazy 257 KB three chunk.
- [x] **Phase 6 — Agent Lab + Skills + Honors**: Agent Lab = `TerminalStream` (custom, in AgentLab.tsx) —
  streams the trace line-by-line (320ms) on 40% visibility, colors by prefix ([agent]=red, [tool]=blue,
  //=muted), blinking cursor while streaming; deliberate deviation from PLAN's TextType (typewriter would
  lose the per-line colors that showcase tool-calling). LogoLoop marquee of agent stack below (text-chip
  nodes, fadeOut to #060A14, pauseOnHover). Skills = 3 LogoLoop rows (Languages left / Frameworks right /
  Tools left, speed 55) + honors grid with red CountUp prizes. Verified desktop + 375px.
- [x] **Phase 7 — Beyond Code + guitar + Contact + loader + easter eggs**:
  Guitar = "Electric guitar" by Poly by Google via poly.pizza, CC-BY 3.0 (attribution line in the card —
  do not remove), 804KB→101KB (gltf-transform optimize: draco + 512px texture). `src/three/GuitarScene.tsx`:
  Float + slow yaw + PresentationControls (drag enabled only on pointer:fine, snaps back), red/blue rim
  lights, `FramePauser` stops the frameloop off-screen/hidden tab; Lazy3D-mounted in the Beyond Code guitar
  card ("DRAG — IT SPINS"). Beyond Code cards all Reveal'd, hiking photo full color.
  Contact: SplitText heading, email button copies to clipboard ("copied ✓" aria-live toast, mailto fallback),
  Magnet on desktop, link row (+Email ↗), footer `hv.` logo = .glitch-hover (hand-rolled 150ms RGB-split CSS —
  GlitchText needs Tailwind-v3 keyframe config, skipped).
  Spider easter egg (user-revised — was triple-click, too hidden): `SpiderGreeter` in Contact.tsx auto-drops
  from the viewport top (left 72%) when the footer is ≥60% visible (IntersectionObserver toggles .spider-down;
  height transition 0.9s), speech bubble "back to the top?" fades in; the spider is a <button> — click =
  lenis.scrollTo(0) (window.scrollTo smooth fallback); retracts when the footer leaves view; reduced-motion
  = no sway/transition.
  Loader: session-once `hv.` monogram overlay (CSS keyframes, lifts at ~1.2s, reduced-motion skipped).
  ⚠️ Verification note: the spider is position:fixed — the `main` transform debug trick breaks its placement;
  test it with real scroll only. Bundle: 173 KB gz main; three.js is a shared lazy chunk (256 KB gz) reused
  by both scenes; scene chunks ~1.5/14 KB.
- [ ] Phase 8 — Mobile/reduced-motion/perf/SEO audit + Vercel deploy

Notes for next session:
- ⚠️ NO black-&-white/desaturated treatment on photos of Harshith (reads as a Tamil memorial portrait — user
  explicitly rejected it). Portrait is now `public/images/headshot-card.jpg`: FULL COLOR, cooled highlights
  (backdrop only), edge vignette into page navy. headshot-duotone.jpg deleted. Same rule applies to the
  hiking photo in Beyond Code (no grayscale hover).
- ReactBits installs: `npx shadcn@latest add @react-bits/<Name>-TS-TW`
- User assets received: resume.pdf ✓, hiking.jpg ✓, headshot.jpg ✓ (white-bg pro shot — needs duotone/dark treatment if used in About; decide in phase 3).
- GLBs not yet sourced (phase 5/7); check license, credit CC-BY in footer if needed.
