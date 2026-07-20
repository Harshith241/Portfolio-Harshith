import SectionHeading from '../components/SectionHeading'
import SpotlightCard from '../components/reactbits/SpotlightCard'
import Reveal from '../components/Reveal'
import Chip from '../components/Chip'
import { flagship, projects } from '../data/content'

/* stylized call-log mock standing in for a product screenshot */
function CallLogMock() {
  const rows = [
    ['02:14 PM', 'missed call → recovered', '+1 (480) •••-0198'],
    ['02:15 PM', 'appointment booked', 'tomorrow 10:30 AM'],
    ['02:15 PM', 'SMS confirmation sent', 'delivered ✓'],
    ['04:41 PM', 'missed call → recovered', '+1 (623) •••-7743'],
    ['04:43 PM', 'appointment booked', 'Fri 3:15 PM'],
  ]
  return (
    <div className="rounded-xl border border-border bg-bg p-4 font-mono text-xs leading-6">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <span className="h-2 w-2 rounded-full bg-red" />
        <span className="text-muted">chairside · live call log</span>
      </div>
      {rows.map(([t, event, detail]) => (
        <div key={t + detail} className="flex flex-wrap justify-between gap-x-4">
          <span className="text-muted">{t}</span>
          <span className="flex-1 px-2 text-text">{event}</span>
          <span className="text-blue">{detail}</span>
        </div>
      ))}
    </div>
  )
}

/* §6 amplifier 2: quarter web-weave in the card corner, visible on hover only */
function CornerWeb() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute top-0 right-0 h-28 w-28 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
      aria-hidden
    >
      <g stroke="#F2F4F8" strokeWidth="1" fill="none">
        {/* spokes from the corner */}
        <path d="M100 0 L0 4" />
        <path d="M100 0 L10 34" />
        <path d="M100 0 L38 66" />
        <path d="M100 0 L70 90" />
        <path d="M100 0 L97 100" />
        {/* sagging rings */}
        <path d="M67 1 Q70 16 78 24 Q88 32 99 33" />
        <path d="M34 3 Q42 34 58 50 Q76 64 99 66" />
        <path d="M2 4 Q16 52 40 74 Q66 94 98 97" />
      </g>
    </svg>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <Reveal>
        <SectionHeading>Things I’ve shipped.</SectionHeading>
      </Reveal>

      {/* Flagship: Chairside */}
      <Reveal className="mt-16">
        <SpotlightCard
          className="!border-border !bg-surface !p-8 sm:!p-12"
          spotlightColor="rgba(230, 57, 70, 0.14)"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="flex items-center gap-2 text-red">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red" />
                  {flagship.badge}
                </span>
                <span className="text-muted">{flagship.when}</span>
              </div>
              <h3 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{flagship.name}</h3>
              <p className="mt-1 font-mono text-sm text-blue">{flagship.subtitle}</p>
              <p className="mt-5 text-muted">{flagship.description}</p>
              <p className="mt-3 text-muted">{flagship.warStory}</p>
              <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
                {flagship.metrics.map((m) => (
                  <div key={m.label}>
                    <dt className="font-display text-3xl font-bold text-text">{m.value}</dt>
                    <dd className="mt-1 font-mono text-xs text-muted">{m.label}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                {flagship.chips.map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>
              <a
                href={flagship.link}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block font-mono text-sm text-red hover:underline"
              >
                View blueprint on GitHub ↗
              </a>
            </div>
            <CallLogMock />
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.name} delay={(i % 2) * 0.08}>
            <SpotlightCard
              className="group flex h-full !w-auto flex-col !border-border !bg-surface !p-8 transition-colors duration-300 hover:!border-red/40"
              spotlightColor="rgba(79, 124, 255, 0.10)"
            >
              <CornerWeb />
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.chips.map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block font-mono text-sm text-red group-hover:underline"
              >
                GitHub ↗
              </a>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
