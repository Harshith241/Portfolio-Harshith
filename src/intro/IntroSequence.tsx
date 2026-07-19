import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis, prefersReducedMotion } from '../lib/lenis'
import SwingScene, { type SwingSceneHandle } from './SwingScene'

gsap.registerPlugin(ScrollTrigger)

/** master beat map — fractions of the pinned scrub (PLAN-INTRO.md §2) */
export const BEATS = {
  thwip: [0, 0.08],
  swing: [0.08, 0.34],
  flip: [0.34, 0.52],
  landing: [0.52, 0.66],
  zoom: [0.66, 0.88],
  unmask: [0.88, 1],
} as const

const PIN_DISTANCE = 3200 // px of scroll the sequence consumes (desktop)

export function introEnabled() {
  return !prefersReducedMotion() && !sessionStorage.getItem('hv-intro-seen')
}

/**
 * Pinned, scroll-scrubbed cinematic intro between Hero and About.
 * I1 scaffold: pin + master timeline + beat placeholder layers + skip/seen logic
 * + hero-Threads fade handle. Beats get real art in I2–I4.
 */
export default function IntroSequence() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const sceneRef = useRef<SwingSceneHandle>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } })

      // ---- beat placeholders (replaced by real art in I2-I4) ----
      const layers = stage.querySelectorAll<HTMLElement>('[data-beat]')
      layers.forEach((el) => {
        const key = el.dataset.beat as keyof typeof BEATS
        const [a, b] = BEATS[key]
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, a)
        tl.to(el, { autoAlpha: 0, duration: 0.02 }, Math.max(a, b - 0.02))
      })

      // ---- hero Threads fade during THWIP (kept in sync by scrub, reverses cleanly) ----
      const threads = document.getElementById('hero-threads')
      if (threads) tl.to(threads, { autoAlpha: 0, duration: BEATS.thwip[1] }, 0)

      // ---- B1 dressing: vignette darkens in, THWIP card pops at web impact ----
      const vignette = stage.querySelector('[data-fx="vignette"]')
      if (vignette) tl.fromTo(vignette, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0)
      const card = stage.querySelector('[data-fx="thwip"]')
      if (card) {
        tl.fromTo(card, { autoAlpha: 0, scale: 0.5, rotate: -10 }, { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.012 }, 0.045)
        tl.to(card, { autoAlpha: 0, scale: 1.15, duration: 0.015 }, 0.07)
      }

      stRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${PIN_DISTANCE}`,
        pin: stage,
        scrub: 0.4,
        animation: tl,
        onUpdate: (self) => {
          sceneRef.current?.update(self.progress)
          if (hudRef.current) {
            const beat =
              (Object.entries(BEATS).find(([, [a, b]]) => self.progress >= a && self.progress < b)?.[0] ??
                'unmask')
            hudRef.current.textContent = `INTRO ${(self.progress * 100).toFixed(0)}% · ${beat}`
          }
          if (self.progress > 0.995) {
            sessionStorage.setItem('hv-intro-seen', '1')
            setDone(true)
          }
        },
      })

      if (import.meta.env.DEV) {
        // headless verification: __introSeek(0..1) poses the whole sequence
        // (disables the ScrollTrigger so live scroll events can't stomp the pose)
        ;(window as unknown as Record<string, unknown>).__introSeek = (p: number) => {
          stRef.current?.disable(false)
          tl.progress(p)
          sceneRef.current?.update(p)
        }
      }
    }, section)

    return () => ctx.revert()
  }, [])

  // skip: jump scroll past the pin; Esc works too
  const skip = () => {
    const st = stRef.current
    if (!st) return
    sessionStorage.setItem('hv-intro-seen', '1')
    setDone(true)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(st.end + 2, { duration: 0.8 })
    else window.scrollTo({ top: st.end + 2, behavior: 'smooth' })
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stRef.current && !done) {
        const p = stRef.current.progress
        if (p > 0 && p < 1) skip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <section ref={sectionRef} aria-label="Cinematic intro: a web-slinger swings in, lands, and unmasks to reveal Harshith">
      <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
        {/* cinematic vignette (B1 onward) */}
        <div
          data-fx="vignette"
          className="invisible absolute inset-0 opacity-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,4,10,0.55)_100%)]"
        />

        {/* B1+B2: web rope + swinging figure */}
        <SwingScene ref={sceneRef} />

        {/* THWIP onomatopoeia card at the anchor */}
        <div
          data-fx="thwip"
          className="invisible absolute top-[11%] left-[13%] opacity-0 rounded-md bg-red px-3 py-1 font-display text-2xl font-bold tracking-wide text-bg select-none"
        >
          thwip!
        </div>

        {/* ---- placeholder layers for beats still to build (I3-I4) ---- */}
        {(['flip', 'landing', 'zoom', 'unmask'] as (keyof typeof BEATS)[]).map((k) => (
          <div
            key={k}
            data-beat={k}
            className="invisible absolute inset-0 flex items-center justify-center opacity-0"
          >
            <span className="rounded-xl border border-border bg-surface px-6 py-3 font-mono text-sm text-muted">
              [ beat: {k} ]
            </span>
          </div>
        ))}

        {/* debug HUD (dev only) */}
        {import.meta.env.DEV && (
          <div ref={hudRef} className="absolute top-4 left-4 font-mono text-xs text-red" />
        )}

        {/* skip control */}
        {!done && (
          <button
            type="button"
            onClick={skip}
            className="absolute right-6 bottom-6 cursor-pointer rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs text-muted transition hover:border-red hover:text-text"
          >
            SKIP INTRO →
          </button>
        )}
      </div>
    </section>
  )
}
