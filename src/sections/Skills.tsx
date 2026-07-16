import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import LogoLoop from '../components/reactbits/LogoLoop'
import CountUp from '../components/reactbits/CountUp'
import { skills, honors } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

function chipRow(items: string[]) {
  return items.map((s) => ({
    node: (
      <span className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-sm text-muted">
        {s}
      </span>
    ),
    title: s,
  }))
}

export default function Skills() {
  const rows: { label: string; items: string[]; direction: 'left' | 'right' }[] = [
    { label: 'Languages', items: skills.languages, direction: 'left' },
    { label: 'Frameworks', items: skills.frameworks, direction: 'right' },
    { label: 'Tools & Platforms', items: skills.tools, direction: 'left' },
  ]

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <Reveal>
        <SectionHeading>Toolbox.</SectionHeading>
      </Reveal>

      <div className="mt-12 space-y-8">
        {rows.map((row) => (
          <Reveal key={row.label}>
            <p className="mb-3 font-mono text-xs tracking-widest text-muted uppercase">
              {row.label}
            </p>
            {prefersReducedMotion() ? (
              <div className="flex flex-wrap gap-3">
                {chipRow(row.items).map((c) => (
                  <span key={c.title}>{c.node}</span>
                ))}
              </div>
            ) : (
              <LogoLoop
                logos={chipRow(row.items)}
                speed={55}
                direction={row.direction}
                logoHeight={34}
                gap={12}
                pauseOnHover
                fadeOut
                fadeOutColor="#060A14"
                ariaLabel={row.label}
              />
            )}
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {honors.map((h, i) => (
          <Reveal key={h.title} delay={i * 0.06} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
              <p className="font-mono text-xs text-muted">{h.when}</p>
              <h3 className="mt-2 flex-1 font-display text-lg font-bold">{h.title}</h3>
              <p className="mt-2 text-sm text-muted">
                {h.detail}
                {h.prize ? (
                  <span className="text-red">
                    {' '}
                    · $<CountUp to={h.prize} duration={1.4} className="tabular-nums" />
                  </span>
                ) : null}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
