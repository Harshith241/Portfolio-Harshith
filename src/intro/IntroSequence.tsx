import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { getLenis, prefersReducedMotion } from '../lib/lenis'
import SwingScene, { type SwingSceneHandle } from './SwingScene'
import SwingScene3D, { type Swing3DHandle } from './SwingScene3D'

/** Track A ('svg') vs Track B ('3d') figure for the swing beat */
const FIGURE: 'svg' | '3d' = '3d'

/** beat map — fractions of the (time-based) title sequence */
export const BEATS = {
  thwip: [0, 0.1],
  swing: [0.1, 0.42],
  flip: [0.42, 0.56],
  landing: [0.56, 0.7],
  zoom: [0.7, 0.88],
  unmask: [0.88, 1],
} as const

const DURATION = 6.5 // seconds — movie pacing, not scroll pacing

export function introEnabled() {
  return !prefersReducedMotion() && !sessionStorage.getItem('hv-intro-seen')
}

/**
 * v3 architecture: a TIME-BASED title sequence (per user feedback — scrubbing
 * felt rigid). First scroll intent locks scrolling and PLAYS the sequence once
 * (~6.5s); on completion scroll unlocks and lands at #about. Same pure
 * update(p) scene contract as before, now driven by a clock.
 */
export default function IntroSequence() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SwingSceneHandle>(null)
  const scene3dRef = useRef<Swing3DHandle>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const stateRef = useRef<'waiting' | 'playing' | 'done'>('waiting')
  const [gone, setGone] = useState(false)

  const finish = () => {
    if (stateRef.current === 'done') return
    stateRef.current = 'done'
    sessionStorage.setItem('hv-intro-seen', '1')
    tlRef.current?.kill()
    const lenis = getLenis()
    lenis?.start()
    if (lenis) lenis.scrollTo('#about', { duration: 1.1, offset: -40 })
    else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.5, onComplete: () => setGone(true) })
  }

  const buildTimeline = () => {
    const overlay = overlayRef.current!
    const tl = gsap.timeline({ paused: true, onComplete: finish })
    const proxy = { p: 0 }
    tl.to(proxy, {
      p: 1,
      duration: DURATION,
      ease: 'none',
      onUpdate: () => {
        const p = proxy.p
        sceneRef.current?.update(p, scene3dRef.current?.handScreen() ?? null)
        scene3dRef.current?.update(p)
        if (hudRef.current) hudRef.current.textContent = `INTRO ${(p * 100).toFixed(0)}%`
      },
    })
    // layer dressing, positioned in seconds
    const threads = document.getElementById('hero-threads')
    if (threads) tl.to(threads, { autoAlpha: 0, duration: BEATS.thwip[1] * DURATION }, 0)
    const vignette = overlay.querySelector('[data-fx="vignette"]')
    if (vignette) tl.fromTo(vignette, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    const card = overlay.querySelector('[data-fx="thwip"]')
    if (card) {
      tl.fromTo(card, { autoAlpha: 0, scale: 0.5, rotate: -10 }, { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.1 }, 0.32)
      tl.to(card, { autoAlpha: 0, scale: 1.15, duration: 0.12 }, 0.55)
    }
    overlay.querySelectorAll<HTMLElement>('[data-beat]').forEach((el) => {
      const [a, b] = BEATS[el.dataset.beat as keyof typeof BEATS]
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, a * DURATION)
      tl.to(el, { autoAlpha: 0, duration: 0.12 }, Math.max(a * DURATION, b * DURATION - 0.12))
    })
    return tl
  }

  const start = () => {
    if (stateRef.current !== 'waiting') return
    stateRef.current = 'playing'
    getLenis()?.stop()
    window.scrollTo(0, 0)
    tlRef.current = buildTimeline()
    tlRef.current.play()
  }

  useEffect(() => {
    const onIntent = (e: Event) => {
      if (stateRef.current === 'waiting') {
        e.preventDefault()
        start()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stateRef.current === 'playing') finish()
      if ((e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') && stateRef.current === 'waiting') start()
    }
    window.addEventListener('wheel', onIntent, { passive: false })
    window.addEventListener('touchmove', onIntent, { passive: false })
    window.addEventListener('keydown', onKey)

    if (import.meta.env.DEV) {
      // headless verification: __introSeek(0..1) builds a paused timeline and poses it
      ;(window as unknown as Record<string, unknown>).__introSeek = (p: number) => {
        getLenis()?.stop()
        if (!tlRef.current) tlRef.current = buildTimeline()
        stateRef.current = 'playing'
        tlRef.current.pause()
        tlRef.current.progress(p)
      }
    }
    return () => {
      window.removeEventListener('wheel', onIntent)
      window.removeEventListener('touchmove', onIntent)
      window.removeEventListener('keydown', onKey)
      tlRef.current?.kill()
      getLenis()?.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90]"
      style={{ pointerEvents: 'none' }}
      aria-label="Cinematic intro: a web-slinger swings in, lands, and unmasks to reveal Harshith"
      role="img"
    >
      <div data-fx="vignette" className="invisible absolute inset-0 opacity-0 bg-[radial-gradient(ellipse_at_center,rgba(2,4,10,0.25)_0%,rgba(2,4,10,0.8)_100%)]" />
      <SwingScene ref={sceneRef} showFigure={FIGURE === 'svg'} />
      {FIGURE === '3d' && <SwingScene3D ref={scene3dRef} />}
      <div data-fx="thwip" className="invisible absolute top-[11%] left-[13%] opacity-0 rounded-md bg-red px-3 py-1 font-display text-2xl font-bold tracking-wide text-bg select-none">
        thwip!
      </div>
      {(['flip', 'landing', 'zoom', 'unmask'] as (keyof typeof BEATS)[]).map((k) => (
        <div key={k} data-beat={k} className="invisible absolute inset-0 flex items-center justify-center opacity-0">
          <span className="rounded-xl border border-border bg-surface px-6 py-3 font-mono text-sm text-muted">
            [ beat: {k} ]
          </span>
        </div>
      ))}
      {import.meta.env.DEV && <div ref={hudRef} className="absolute top-4 left-4 font-mono text-xs text-red" />}
      <button
        type="button"
        onClick={finish}
        className="absolute right-6 bottom-6 cursor-pointer rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs text-muted transition hover:border-red hover:text-text"
        style={{ pointerEvents: 'auto' }}
      >
        SKIP INTRO →
      </button>
    </div>
  )
}
