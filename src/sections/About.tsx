import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import ScrollReveal from '../components/reactbits/ScrollReveal'
import CountUp from '../components/reactbits/CountUp'
import { about } from '../data/content'

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
                src="/images/headshot-duotone.jpg"
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
          {/* MacBook 3D scene mounts here in phase 5 */}
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-border bg-surface font-mono text-xs text-muted">
            [ macbook.glb — phase 5 ]
          </div>
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
