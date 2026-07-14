import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/lenis'

/** 2px web-thread at the viewport top that draws with scroll progress. */
export default function ProgressThread() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const tween = gsap.to(ref.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 z-[1002] h-0.5 w-full origin-left scale-x-0 bg-red"
      aria-hidden
    />
  )
}
