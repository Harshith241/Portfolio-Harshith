# harshith.dev — Portfolio

Personal portfolio of **Harshith Vijayan** — CS @ ASU, software engineer, AI-agent builder, founder of [Chairside](https://github.com/Harshith241/Chairside-API).

Dark, scroll-driven single page with a subtle web-slinger undertone: a cinematic title sequence on first scroll (web-swing → flip → landing → unmask), drifting thread background, a scroll-animated 3D MacBook that opens and does a full 360°, a floating 3D guitar you can spin, an agent-trace terminal, and a spider that offers you a ride back to the top.

## Stack

- Vite · React 19 · TypeScript · Tailwind CSS v4
- GSAP + ScrollTrigger · Lenis smooth scroll
- react-three-fiber + drei (MacBook & guitar scenes, draco-compressed GLBs)
- [ReactBits](https://reactbits.dev) components (vendored in `src/components/reactbits/`)

## Develop

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run preview    # serve the build
```

## Structure

- `src/data/content.ts` — every string on the site
- `src/sections/` — one component per page section
- `src/three/` — the two lazy-mounted 3D scenes
- `src/intro/` — the cinematic intro sequence (lazy-loaded, session-once, skippable, reduced-motion exempt)
- `PLAN.md` / `PROGRESS.md` — build spec and phase log

3D guitar model: "Electric guitar" by Poly by Google (CC-BY 3.0). MacBook model from [pmndrs/examples](https://github.com/pmndrs/examples) (MIT). Intro web-slinger model: rigged Spider-Verse-style fan art by [ayman-studio/diimensions](https://github.com/ayman-studio/diimensions) (fan asset, non-commercial use with thanks).
