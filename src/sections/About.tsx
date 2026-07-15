import { lazy, Suspense } from 'react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import Lazy3D from '../components/Lazy3D'
import ScrollReveal from '../components/reactbits/ScrollReveal'
import CountUp from '../components/reactbits/CountUp'
import { about } from '../data/content'

const MacbookScene = lazy(() => import('../three/MacbookScene'))

// from=0.1 when decimals: CountUp derives its fraction digits from the inputs
const stats = about.stats.map((s) => ({ ...s, from: s.decimals ? 0.1 : 0, to: s.value }))

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <Reveal>
        <SectionHeading>Ship first, talk later.</SectionHeading>
      </Reveal>

      <div className="mt-14 grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: portrait + (phase 5) MacBook scene */}
        <div className="mx-auto w-full max-w-md space-y-6 lg:sticky lg:top-24 lg:max-w-none">
          <Reveal>
            <figure className="group relative overflow-hidden rounded-2xl border border-border bg-surface">
              <img
                src="/images/headshot-card.jpg"
                alt="Harshith Vijayan"
                className="w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="halftone" />
              <figcaption className="flex items-center justify-between border-t border-border px-4 py-3 font-mono text-xs text-muted">
                <span>HARSHITH — FOUNDER, CHAIRSIDE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-red" />
              </figcaption>
            </figure>
          </Reveal>
          <Lazy3D
            id="mac-slot"
            className="relative h-[340px] overflow-hidden rounded-2xl border border-border bg-surface lg:h-[400px]"
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted">
                  booting…
                </div>
              }
            >
              <MacbookScene />
            </Suspense>
            <span className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-widest text-muted">
              SCROLL — IT OPENS
            </span>
          </Lazy3D>
        </div>

        {/* Right: story + stats */}
        <div>
          <ScrollReveal
            baseOpacity={0.08}
            blurStrength={3}
            baseRotation={2}
            containerClassName="!my-0"
            textClassName="!text-[clamp(1.35rem,2.2vw,1.9rem)] !leading-snug !font-medium font-display text-text"
          >
            {about.paragraphs[0]}
          </ScrollReveal>

          <div className="mt-8 space-y-6">
            {about.paragraphs.slice(1).map((p, i) => (
              <Reveal key={p.slice(0, 16)} delay={i * 0.08}>
                <p className="text-lg leading-relaxed text-muted">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
              {stats.map((s) => (
                <div key={s.label} className="border-l border-border pl-4">
                  <dt className="font-display text-4xl font-bold text-text">
                    {s.prefix}
                    <CountUp from={s.from} to={s.to} duration={1.6} className="tabular-nums" />
                    {s.suffix}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
