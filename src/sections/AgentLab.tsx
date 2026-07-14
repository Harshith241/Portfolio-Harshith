import SectionHeading from '../components/SectionHeading'
import { agentLab } from '../data/content'

export default function AgentLab() {
  return (
    <section id="agent-lab" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <SectionHeading>Agent Lab.</SectionHeading>
      <p className="mt-6 max-w-xl text-muted">{agentLab.positioning}</p>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6 font-mono text-sm leading-7">
        {agentLab.terminal.map((line) => (
          <p
            key={line}
            className={
              line.startsWith('[tool]')
                ? 'text-blue'
                : line.startsWith('[agent]')
                  ? 'text-muted'
                  : 'text-text'
            }
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 font-mono text-sm text-muted">
        {agentLab.stack.map((s) => (
          <span key={s} className="rounded-full border border-border px-3 py-1">
            {s}
          </span>
        ))}
      </div>
    </section>
  )
}
