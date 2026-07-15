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
- [ ] Phase 6 — Agent Lab (TextType) + Skills (LogoLoop) + Honors
- [ ] Phase 7 — Beyond Code bento + guitar 3D + Contact polish + loader + easter eggs
- [ ] Phase 8 — Mobile/reduced-motion/perf/SEO audit + Vercel deploy

Notes for next session:
- ReactBits installs: `npx shadcn@latest add @react-bits/<Name>-TS-TW`
- User assets received: resume.pdf ✓, hiking.jpg ✓, headshot.jpg ✓ (white-bg pro shot — needs duotone/dark treatment if used in About; decide in phase 3).
- GLBs not yet sourced (phase 5/7); check license, credit CC-BY in footer if needed.
