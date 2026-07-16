import { useEffect, useRef, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import LogoLoop from '../components/reactbits/LogoLoop'
import { agentLab } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

function lineColor(line: string) {
  if (line.startsWith('[tool]')) return 'text-blue'
  if (line.startsWith('[agent]')) return 'text-red'
  if (line.startsWith('//') || line.includes('// ')) return 'text-muted'
  return 'text-text'
}

/* streams the trace line-by-line once the panel is visible — like real agent output */
function TerminalStream({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(prefersReducedMotion() ? lines.length : 0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setInterval>
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        timer = setInterval(() => {
          setShown((n) => {
            if (n >= lines.length) {
              clearInterval(timer)
              return n
            }
            return n + 1
          })
        }, 320)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearInterval(timer)
    }
  }, [lines.length])

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-surface p-6 font-mono text-xs leading-7 sm:text-sm"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-blue/60" />
        <span className="ml-2 text-muted">hv — agents</span>
      </div>
      {lines.slice(0, shown).map((line) => (
        <p key={line} className={lineColor(line)}>
          {line}
        </p>
      ))}
      {shown < lines.length && <span className="inline-block h-4 w-2 animate-pulse bg-text" />}
    </div>
  )
}

export default function AgentLab() {
  const stack = agentLab.stack.map((s) => ({
    node: (
      <span className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-sm text-muted">
        {s}
      </span>
    ),
    title: s,
  }))

  return (
    <section id="agent-lab" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <Reveal>
        <SectionHeading>
          Agent <span className="text-red">Lab</span>.
        </SectionHeading>
        <p className="mt-6 max-w-xl text-muted">{agentLab.positioning}</p>
      </Reveal>

      <Reveal className="mt-10">
        <TerminalStream lines={agentLab.terminal} />
      </Reveal>

      <div className="mt-10">
        {prefersReducedMotion() ? (
          <div className="flex flex-wrap gap-3">
            {stack.map((c) => (
              <span key={c.title}>{c.node}</span>
            ))}
          </div>
        ) : (
          <LogoLoop
            logos={stack}
            speed={70}
            logoHeight={36}
            gap={14}
            pauseOnHover
            fadeOut
            fadeOutColor="#060A14"
            ariaLabel="Agent stack"
          />
        )}
      </div>
    </section>
  )
}
