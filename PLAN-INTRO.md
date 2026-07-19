# PLAN-INTRO.md — "The Swing" cinematic scroll intro (v2)

Blueprint for the scroll-triggered Spider-Man intro. Read WITH PLAN.md (v1 site spec, still valid).
Status: PLANNED — awaiting user approval. On "execute": update CLAUDE.md pointer + work phase-by-phase, PROGRESS.md after each phase.

---

## 0. Safety net — how to revert (do this FIRST on execute)

```bash
git tag v1-classic && git push origin v1-classic     # permanent bookmark of today's site
git checkout -b feat/cinematic-intro                  # ALL v2 work lives here
git push -u origin feat/cinematic-intro
```
- Vercel builds every branch → `feat/cinematic-intro` gets its own preview URL; production (main) stays untouched until merge.
- Don't like it? `git checkout main` — site as-is. Merged and regret it? `git revert -m 1 <merge-sha>` or Vercel dashboard → previous deployment → "Promote to production" (instant).

## 1. Research findings (2026)

- Movie-grade scroll intros on award sites are done as **pinned ScrollTrigger sequences**: pin the viewport, scrub a master GSAP timeline over N px of scroll ([GSAP scroll-image-sequence pattern](https://gsapvault.com/effects/scroll-image-sequence), Apple-style canvas scrubbing).
- **Free rigged/animated Spider-Man assets exist** (fan-made): Sketchfab "SpiderMan Swing Animation" (66177b3a…), "Spiderman swinging animation" (b409d674…, 59ba60d7…), rigged NWH Spidey (9f0f2ab…) + "Spider Man 2 Advanced 2.0 Animations for Mixamo" (074be027…). Downloadable GLB w/ baked clips; scrub via THREE.AnimationMixer.setTime(progress). ⚠️ All are Marvel IP fan art — fine for a personal portfolio in practice, but keep it: silhouette-grade lighting, no logos in OUR art, no "Spider-Man" text anywhere (CLAUDE.md rule stands).
- **Spider-Verse title-sequence language** (Alma Mater; SXSW award): halftone/Kirby dots, screen-printed color blocks, CMYK offset, hard graphic CUTS between beats, onomatopoeia cards ("THWIP"). Cuts are cinematic — we don't need one continuous photoreal shot to feel like a movie.
- Mask→face morphs on the web = **clip-path/mask + crossfade + GSAP Flip** to land into a real DOM element.

## 2. Creative treatment — storyboard (scroll-scrubbed, ~3200px pinned after hero)

The page cold-opens on the existing hero. The FIRST scroll tick pins the screen and plays:

| Beat | Scroll | What happens |
|---|---|---|
| **B1 THWIP** | 0–8% | Screen darkens 20%, Threads bg fades out (keeps 1-WebGL rule). A web line SHOOTS from off-screen bottom-right to the TOP-LEFT corner — drawn canvas rope w/ elastic overshoot; frayed splat node at anchor (like the TASM Gwen-catch web, ref image); faint "thwip" onomatopoeia card flashes 120ms, halftone burst. |
| **B2 SWING** | 8–34% | Spidey silhouette enters bottom-right on the rope, pendulum-swings across the full viewport on a MotionPath arc (anchor = top-left corner). Motion streaks + slight camera (container) tilt follow. Speed-line overlay at arc bottom. |
| **B3 RELEASE + FLIP** | 34–52% | At arc apex (upper-right) he releases — HARD CUT (2 frames of white/halftone) to a closer "panel": tucked flip rotating 720° against parallax city-glow shapes, CMYK offset ghosting. |
| **B4 LANDING** | 52–66% | CUT to bottom-center: superhero three-point landing. Impact = camera shake (6px, 3 oscillations), halftone shockwave ring, radiating web-crack lines from the ground point, dust particles. Beat of stillness (dead scroll zone 4% — cinematic hold). |
| **B5 THE LOOK + ZOOM** | 66–88% | He raises his head. Scroll now dollies IN — figure scales ~14× centered on the head until the mask fills the viewport: OUR stylized mask (dark navy silhouette, two large white eyes w/ red rims — original art, no logo). Vignette closes in. |
| **B6 UNMASK MORPH** | 88–100% | The right mask eye expands into a full-screen white iris (clip-path circle) → inside it, `headshot-card.jpg` crossfades in with a halftone-dissolve (dot-mask shrinking) → GSAP **Flip** shrinks the photo INTO the About section's portrait card as the pin releases. Scroll continues seamlessly into About. The site's story: the mask comes off — it's Harshith. |

After B6 the rest of the site is v1 unchanged. Total pinned distance ≈ 3200px (~4 viewport-heights), scrub 0.4.

## 3. Technical approach — TWO renderers, pick at execute-time checkpoint

**Track A (recommended start): "Graphic Novel" — 2D, zero new deps.**
Character = 4 hand-authored SVG silhouette poses (swing / tuck / landing crouch / head-up look), navy-black fill + red accent edge, swapped at the CUTs (cuts hide pose changes). Rope = `<canvas>` quadratic curve with sag+recoil physics. Everything GSAP: MotionPath (free plugin) for the arc, Flip for the morph, CSS filters for streaks. Guaranteed 60fps, fully on-brand with the existing halftone/thread language. Spider-Verse-legit.

**Track B (upgrade if A's swing feels flat): 3D swing for B2 only.**
Download + draco-compress a Sketchfab swing GLB (candidates in §1; inspect clips with gltf-transform), scrub mixer time + root MotionPath in the existing R3F setup (reuse three chunk). Cuts still go to 2D panels for B3–B6 — the mask/morph stays OUR art. Budget: model ≤ 2MB, DPR ≤1.5, canvas unmounts after B2.
Decision checkpoint: build Track A's B2 first → user reviews the preview URL → only then invest in B.

## 4. Structure

```
src/intro/
  IntroSequence.tsx   # pin container + master timeline, orchestrates beats; owns skip/seen logic
  WebRope.tsx         # canvas rope: shoot, sag, recoil, frayed anchor splat
  Figure.tsx          # SVG poses + pose crossfades (or R3F swing if Track B)
  FxLayer.tsx         # halftone bursts, speed lines, shockwave, dust, THWIP card, vignette
  UnmaskMorph.tsx     # mask → iris clip-path → headshot → Flip into #about portrait card
```
Mounted in App between Hero and About. Hero's Threads gets a `fadeOut` handle (opacity → unmount) driven by B1.

## 5. Guardrails (all still law)

- **prefers-reduced-motion**: intro NOT mounted at all — straight hero→about (v1 behavior).
- **Skip control**: mono "SKIP INTRO →" bottom-right during pin (keyboard focusable, Esc works). After first full play, sessionStorage `hv-intro-seen` → subsequent page loads default to skipped w/ a small "▶ replay intro" affordance near the hero scroll cue.
- **Mobile (<768px)**: same storyboard, shorter (≈2200px), simplified FX (no streak filters), max DPR 1.5; if Track B, mobile uses Track A figure regardless.
- **Perf**: only ONE canvas alive during intro (rope/FX composited in one canvas); Threads unmounted by B1; intro assets lazy-loaded on first scroll intent (`wheel`/`touchstart` once); total new JS ≤ 60KB gz (Track A). LCP unaffected (hero unchanged, intro loads after paint).
- **IP**: our SVG art = silhouette + generic mask eyes, no logos/text "Spider-Man"; 3D fan asset (if Track B) credited in README like the guitar.
- **A11y**: pin container `role="img"` + aria-label narrative description; scroll never trapped (skip always visible); focus order unaffected.

## 6. Extra theme amplifiers (small, pick-list — user chooses at execute)

1. Section transitions: 1px web-thread divider grows a tiny anchor-splat node when crossed. (cheap)
2. Project cards: corner web-weave SVG (top-right, 8% opacity) on hover. (cheap)
3. Cursor: desktop cursor dot becomes tiny reticle that "webs" clicked links — ClickSpark already does sparks; upgrade spark to micro web-lines. (cheap)
4. 404/loader: loader dot swings in on a thread instead of popping. (cheap)
5. Konami-style: typing "thwip" anywhere replays the intro. (cheap, fun)
6. Hero title letters catch a web strand on hover (letter tugs). (medium)

## 7. Execution phases (each = verify at 1440px + 375px, update PROGRESS.md, user commits)

- **I1** Safety net (tag+branch) + scaffold: pin/scrub skeleton with debug progress HUD, Threads fadeout handle, skip/seen/reduced-motion logic wired. Placeholder blocks per beat.
- **I2** B1+B2: rope canvas + swing arc w/ Track-A figure + streaks/tilt. → USER CHECKPOINT (Track A vs B for the swing).
- **I3** B3+B4: flip panel + landing + impact FX (shake, shockwave, web-cracks, dust).
- **I4** B5+B6: zoom, mask art, iris, halftone dissolve, Flip into About card. Hardest beat — budget iteration.
- **I5** Mobile pass, skip/replay polish, perf audit (fps trace), amplifiers from §6 the user picked, README/PROGRESS, merge decision.

Estimated: I1–I2 one session; I3–I4 one session; I5 short. Keep sessions phase-aligned — context is tight.
