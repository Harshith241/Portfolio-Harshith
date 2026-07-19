import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis, prefersReducedMotion } from '../lib/lenis'

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

      stRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${PIN_DISTANCE}`,
        pin: stage,
        scrub: 0.4,
        animation: tl,
        onUpdate: (self) => {
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
        {/* ---- I1 placeholder layers, one per beat ---- */}
        {(Object.keys(BEATS) as (keyof typeof BEATS)[]).map((k) => (
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
