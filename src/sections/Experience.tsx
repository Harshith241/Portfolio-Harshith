import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollFloat from '../components/reactbits/ScrollFloat'
import GlareHover from '../components/reactbits/GlareHover'
import Reveal from '../components/Reveal'
import Chip from '../components/Chip'
import { experience } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

export default function Experience() {
  const threadRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  // the web-thread draws itself down the timeline as you scroll
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        threadRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.4,
          },
        }
      )
    }, listRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      {prefersReducedMotion() ? (
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Where I’ve built.
        </h2>
      ) : (
        <ScrollFloat
          containerClassName="!m-0"
          textClassName="font-display !text-4xl sm:!text-5xl lg:!text-6xl font-bold tracking-tight text-text"
        >
          Where I’ve built.
        </ScrollFloat>
      )}

      <ol ref={listRef} className="relative mt-16 space-y-10 pl-8">
        {/* track + scroll-drawn thread */}
        <div aria-hidden className="absolute top-2 bottom-2 left-0 w-px bg-border" />
        <div
          ref={threadRef}
          aria-hidden
          className="absolute top-2 bottom-2 left-0 w-px origin-top bg-red"
        />

        {experience.map((job, i) => (
          <li key={job.company} className="relative">
            <span className="absolute top-7 -left-[35.5px] h-2 w-2 rounded-full bg-red shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
            <Reveal delay={i * 0.05}>
              <GlareHover
                width="100%"
                height="auto"
                background="var(--color-surface)"
                borderRadius="16px"
                borderColor="var(--color-border)"
                glareColor="#E63946"
                glareOpacity={0.12}
                glareSize={220}
                transitionDuration={700}
                className="!cursor-default"
              >
                <div className="w-full p-6 sm:p-8">
                  <p className="font-mono text-xs text-muted">
                    {job.when} · {job.where}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold">
                    {job.role} <span className="text-red">@ {job.company}</span>
                  </h3>
                  <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-muted">
                    {job.bullets.map((b) => (
                      <li key={b.slice(0, 20)}>{b}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.chips.map((c) => (
                      <Chip key={c}>{c}</Chip>
                    ))}
                  </div>
                </div>
              </GlareHover>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
