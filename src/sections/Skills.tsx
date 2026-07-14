import SectionHeading from '../components/SectionHeading'
import Chip from '../components/Chip'
import { skills, honors } from '../data/content'

export default function Skills() {
  const rows: [string, string[]][] = [
    ['Languages', skills.languages],
    ['Frameworks', skills.frameworks],
    ['Tools & Platforms', skills.tools],
  ]
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <SectionHeading>Toolbox.</SectionHeading>
      <div className="mt-12 space-y-8">
        {rows.map(([label, items]) => (
          <div key={label}>
            <p className="font-mono text-xs tracking-widest text-muted uppercase">{label}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {honors.map((h) => (
          <div key={h.title} className="rounded-2xl border border-border bg-surface p-6">
            <p className="font-mono text-xs text-muted">{h.when}</p>
            <h3 className="mt-2 font-display text-lg font-bold">{h.title}</h3>
            <p className="mt-1 text-sm text-muted">
              {h.detail}
              {h.prize ? <span className="text-red"> · ${h.prize}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
