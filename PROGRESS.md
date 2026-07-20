# PROGRESS

## v2 — Cinematic intro (branch `feat/cinematic-intro`, spec PLAN-INTRO.md, Track A chosen)

- [x] **I1 — Safety net + scaffold**: tag `v1-classic` pushed; branch pushed. `src/intro/IntroSequence.tsx`:
  pinned h-screen stage after Hero, ScrollTrigger scrub 0.4 over +=3200px, master timeline with BEATS map
  (thwip/swing/flip/landing/zoom/unmask fractions), placeholder layer per beat, dev-only progress HUD,
  SKIP INTRO button + Esc (lenis jump past pin), `hv-intro-seen` sessionStorage set at completion/skip,
  `introEnabled()` gate in App (reduced-motion or seen → not mounted = v1 flow). Hero Threads wrapper has
  id `hero-threads`; timeline fades it out over B1 (scrub-reversible). ⚠️ Threads still mounted (GPU) while
  transparent — unmount is an I5 perf task.
- [x] **I2 — B1 THWIP + B2 SWING** (`src/intro/SwingScene.tsx`): one 2D canvas (web tip shoots br→top-left
  corner along a bezier, 7-strand frayed splat + red node with overshoot wobble, rope anchor→hand with sag,
  red fading motion trail) + DOM/SVG silhouette figure (stroked-tube limbs, head w/ white eye wedge, red
  spine accent, red drop-shadow rim; grip point local (64,4), rotated to rope angle θ). Pendulum: anchor
  (0.1w,0.07h), R=0.78h, θ 78°→-6°, ease t^1.65 (accelerates into the bottom); figure fades in at entry
  (mid-right, "leapt from off-frame" cheat — rope shorter than screen so off-screen entry is impossible).
  Everything pure f(progress) → reverse-scrub replays backwards. Vignette + "thwip!" card in the timeline.
  DEV: `window.__introSeek(0..1)` (disables ST first; NOTE: first call after load can hit a zero-size reflow
  — call twice; sweep a loop of seeks to build the trail). Rope/figure cut out over p 0.34→0.38.
  → User saw Track A, wanted Track B.
- [x] **I2b — Track B (3D swing figure)**: model = rigged Spider-Verse Miles Morales from
  github.com/ayman-studio/diimensions (fan asset, credit in README at I5), optimized 2.9MB→1.54MB draco →
  `public/models/spidey.glb`; clips: idle/jump/run/walk/emote1-3/tpose (~1.64 world-units tall skinned —
  bbox lies, it's tiny pre-skin). `src/intro/SwingScene3D.tsx`: R3F canvas overlay, `Rig` (MUST stay inside
  <Suspense> — without it the canvas mounts nothing, silently), useAnimations 'jump' played+paused,
  mixer.setTime scrubbed over animFrom→animTo as swing progresses; group positioned via shared `swingState`
  px→world mapping (cam z=8 fov40), rotation.z=-θ*lean, scene.rotation.y=rotY (applied per-frame so it's
  live-tunable). Tuned CFG: scale 1.05, rotY -1.571, offX -0.75, offY -0.55, anim window 0.44–0.54 —
  rope ends at his grip hand, he leans back facing the anchor. `IntroSequence` has `FIGURE: 'svg'|'3d'`
  toggle (= '3d'); SwingScene keeps rope/splat/trail always, `showFigure` hides the SVG figure.
  DEV: `window.__spideyCfg` overrides CFG per-frame; `__spideyInfo` reports clips/size after load.
  Pane-verify recipe: seek → fix stage via inline style {position:fixed,top:0,...,background:'#060A14'} →
  seek again → screenshot (HMR wipes inline styles; redo after any code change).
  → User verdict: scrub-driven swing felt RIGID (frozen limbs, hand not on rope, "doesn't look like
  Spider-Man"). User asked to embed the actual TASM movie clip — declined (copyrighted footage, DMCA risk);
  fix is real-time motion instead.
- [x] **I2c — v3 architecture: TIME-BASED title sequence** (regression FIXED — see I2d):
  `IntroSequence.tsx` REWRITTEN — no more ScrollTrigger/pin/scrub. Now: fixed inset-0 z-[90] overlay
  (transparent, vignette dims the hero beneath); first wheel/touchmove/ArrowDown at 'waiting' state calls
  start() → lenis.stop() + plays a 6.5s gsap timeline (proxy.p 0→1, onUpdate drives the same pure
  sceneRef.update(p, hand) + scene3dRef.update(p) contract); onComplete/skip/Esc → finish(): seen flag,
  lenis.start(), lenis.scrollTo('#about'), overlay fades+unmounts. NEW BEATS (fractions of 6.5s):
  thwip 0–.1, swing .1–.42, flip .42–.56, landing .56–.7, zoom .7–.88, unmask .88–1.
  SwingScene.update(p, hand?) — rope endpoint uses `hand` (screen px) when given.
  SwingScene3D: 'jump' action UNPAUSED (LoopPingPong, timeScale .55) + mixer.update(delta) in useFrame =
  live fluid limbs; hand-bone found via traverse (/hand/i + left-ish regex) and projected to screen px each
  frame → handScreen() feeds the rope. scale 1.35, +hemisphereLight.
  Old scrub notes (pin-spacer, stage-fixing recipe) are OBSOLETE for v3 — overlay is viewport-fixed;
  just __introSeek(p) then screenshot. Hero title stays visible under the overlay during B1/B2
  (vignette-dimmed) — intentional, keep.
- [x] **I2d — regression root cause + fix**: model never rendered because drei's useGLTF loads the DRACO
  decoder from a gstatic.com CDN — blocked in the embedded pane (and a 3rd-party dep in prod) → GLB decode
  promise never resolves → Suspense pends forever, silently. Fix: decoder copied to `public/draco/`
  (from three/examples/jsm/libs/draco/gltf/) + `useGLTF(MODEL, '/draco/')` + same for preload. The
  "rope follows hand" observation was a red herring (rope falls back to swingState math when handOut is
  null). Beat fractions in SwingScene.tsx synced to v3 BEATS (now in `src/intro/beats.ts` — was a TDZ
  import-cycle risk in IntroSequence). Figure scale → 1.6 (user wanted him bigger/clearer).
- [x] **I3 — B3 flip + B4 landing** (`FxLayer.tsx` + extended `SwingScene3D`): hard cut at .42 (white
  flash, panel bg → 94% opaque, city-glow parallax blobs), 3D figure does a 720° tucked flip on a parabola
  (scene.position.y=-0.82 recenters the feet-origin model so it tumbles around its body). Landing .56:
  second flash, crouch HELD via `a.time = crouchT (2.2s of 'jump'); mixer.update(0)` (NOTE: paused
  actions ignore mixer.setTime — set action.time directly), camera shake (decaying sine on shake wrapper),
  elliptical shockwave rings (white+red), 8 seeded jagged web-crack lines, 14 dust motes. All pure f(p).
- [x] **I4 — B5 zoom + B6 unmask** (SUPERSEDED by I4b below — the mask-SVG beat is GONE): our mask SVG (navy head, faint web threads,
  angular teardrop eyes w/ thin red rims — NO logos) fades in over the landed figure's head (3D exits at
  .74), scales 1→10.5 anchored on the RIGHT eye (transform-origin = eye, eye pos lerps head→viewport
  center, ease t^2.2). Unmask .88–1: white iris clip-path circle grows from inside the eye white to
  cover screen; headshot dissolves in via CSS mask halftone dots (--dot 1→13px on a 16px tile), full
  color per the no-B&W rule. onComplete → finish(true): lenis scrollTo #about (.9s) then **gsap Flip.fit**
  shrinks the fullscreen photo INTO `#about-portrait` (the About card img) while the white fades — then
  overlay unmounts. ⚠️ The flip is TIMED (gsap.delayedCall .95) not scroll-onComplete: an interrupted
  lenis scroll never fires onComplete and would strand the fullscreen photo.
- [x] **I5 — polish/perf/mobile**: IntroSequence now `React.lazy` in App (+`introEnabled` moved to
  beats.ts) → eager JS back to ~174 KB gz (index 123 + lenis 51); three/drei (254 KB gz, shared with
  Macbook/Guitar) + intro chunk (16 KB) stream in post-paint. Threads NOT unmounted during intro
  (hero is on-screen anyway = v1 GPU baseline) but finish() clearProps-restores its opacity — the B1
  fade used to stick forever (bug). Replay: `hv-intro-done`/`hv-intro-replay` window events; Hero shows
  "▶ replay intro" under the SCROLL cue once seen; App listens for replay → clears flag, scrolls top,
  remounts IntroSequence via key. Mobile 375px: pendulum R clamped `min(.78h, .88w)` + 3D swing
  scale/offsets × (R/.78h) — otherwise the arc swings off-screen right; flip/landing/zoom verified at
  375px as-is. Full real-time playthrough verified (wheel → 6.5s → About + Flip + unmount + replay btn).
  Build green. §6 amplifiers: built in the I4b pass below.
- [x] **I4b — user-feedback rework** ("mask→headshot transition bad; spiderman looks basic/ripped off"):
  (a) SILHOUETTE TREATMENT (`SwingScene3D`): materials replaced keyed on MESH names (material names die
  after the 1st pass/HMR — guard `userData.hvTreated`): Object_9/13 = eye lenses → unlit white
  MeshBasicMaterial (glow through dark), Object_7/11/16 → brand-red standard, body → #101828 navy.
  Lighting: ambient .5 / hemi .35 / key .9 / red rim 45 / blue kick 14. Scale 1.6. Reads as OUR
  silhouette art now, not the Miles asset.
  (b) B5 = REAL 3D DOLLY, no 2D mask art: crouch held through zoom, "the look" = scene.rotY turn to
  camera + head-bone tilt `crouchHeadX + headTilt(0.7) * look` — ABSOLUTE set, base captured ONCE
  (euler is never synced back from mixer quaternion writes; += or re-capture accumulates across
  frames/seeks). zoomScale 9 anchored on the head bone, anchor target drifts DOWN (+0.22h·ez) because
  the bone is at the neck and the face rises as scale grows. Eyes stay in frame at full zoom.
  ⚠️ Determinism bugs fixed: (1) frozen pose now `a.reset(); a.time = crouchT(0.15); mixer.update(1/240)`
  every frame — update(0) doesn't re-evaluate AND LoopPingPong loop-parity from the live phase mirrored
  the held frame wall-clock-dependently; (2) crouchT retuned 2.2→0.15 (real crouch, was a run pose).
  (c) `UnmaskMorph` rewritten: closing vignette over the dolly, then B6 iris = white circle clip-path
  bloom from the PROJECTED head point (`headScreen()`, eyeAnchor knob kept at [0,0,0] — bone-local
  lens solves proved seek-order-sensitive, mid-face reads fine; origin frozen at first unmask frame so
  the bloom doesn't chase the figure), halftone-dissolve headshot with 1.07→1 settle, Flip handoff
  unchanged. 3D figure lingers to p<.93 (FIG_OUT) behind the growing iris.
  (d) §6 AMPLIFIERS (all cheap; #6 letter-tug skipped): 1) `WebDivider.tsx` between all 6 section pairs
  (1px thread + 6-strand splat node, scale-in w/ overshoot on full intersection, `at` prop varies spot,
  reduced-motion = static); 2) `CornerWeb` in Projects grid cards (quarter web SVG top-right, 8% opacity
  on hover); 3) ClickSpark tips fork into micro web-Vs (branch = lineLength/2); 4) loader dot swings in
  on a red thread (CSS keyframes, thread fades at settle); 5) typing "thwip" → `hv-intro-replay`
  (App keydown buffer; ignores inputs/meta keys/reduced-motion). Build green (tsc + vite, 124 KB gz main).
- [ ] Merge decision (user's move) + Vercel preview check on the branch URL. Re-verify the full
  swing→flip→landing→zoom→iris flow in a REAL browser (pane rasterization can't show the scroll handoff).
  ⚠️ Browser-pane verification notes for future sessions: (1) after every reload the pane is 0×0 and
  rAF is DEAD until a screenshot forces rasterization — screenshot first, THEN seek (seeks before layout
  size the rope canvas at 0). (2) gsap seeks to the same progress are no-ops — seek to a nearby value
  first. (3) adding a new dep import (e.g. gsap/Flip) makes vite re-optimize deps → the ?v= hash changes
  → any console `import()` probe of an OLD hash URL gets a SECOND gsap instance with an empty
  globalTimeline (looks like "timeline not running" — it isn't; check
  `performance.getEntriesByType('resource')` for the current hash). (4) to run the timeline for real
  despite dead rAF: `setInterval(() => gsap.ticker.tick(), 16)` INSIDE one javascript_tool call
  (timers die between calls). (5) SwingScene3D has a DEV-only `advance()` per update for the same reason.

## v1 — Phase status (see PLAN.md §9 for definitions):

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
- [x] **Phase 8 — Final audit** (deploy = user's move): guitar recolored to black (texture-level: extracted
  PNG from GLB, hue-replaced greens+mustards → charcoal keeping shading, re-embedded; 80 KB). OG image
  generated (`public/og.png`, PIL, brand style) + `theme-color` meta. Global `:focus-visible` red outline.
  Reduced-motion gaps closed: ScrollFloat/ScrollReveal render static under reduce; LogoLoop rows render as
  static chip wraps; glitch-hover disabled. README rewritten. Fixed: retracted spider peeked at viewport top
  (body now opacity-0 + pointer-events-none until .spider-down). Production build (`npm run preview`)
  smoke-tested: renders, zero console errors. Bundle: 173.5 KB gz main + lazy chunks (Threads 15 KB,
  three 256 KB shared, scenes 1.5/14 KB) — within the 600 KB budget.
  Deploy: user connects github.com/Harshith241/Portfolio-Harshith to Vercel (framework: Vite, build
  `npm run build`, output `dist`). No rewrites needed (single page, hash anchors).

Notes for next session:
- ⚠️ NO black-&-white/desaturated treatment on photos of Harshith (reads as a Tamil memorial portrait — user
  explicitly rejected it). Portrait is now `public/images/headshot-card.jpg`: FULL COLOR, cooled highlights
  (backdrop only), edge vignette into page navy. headshot-duotone.jpg deleted. Same rule applies to the
  hiking photo in Beyond Code (no grayscale hover).
- ReactBits installs: `npx shadcn@latest add @react-bits/<Name>-TS-TW`
- User assets received: resume.pdf ✓, hiking.jpg ✓, headshot.jpg ✓ (white-bg pro shot — needs duotone/dark treatment if used in About; decide in phase 3).
- GLBs not yet sourced (phase 5/7); check license, credit CC-BY in footer if needed.
