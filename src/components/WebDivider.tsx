import { useEffect, useRef } from 'react'

/**
 * §6 amplifier 1: 1px web-thread section divider. When scrolled across, a tiny
 * anchor-splat node "catches" on the thread (scale-in with overshoot).
 * `at` = node position along the thread, varies per divider.
 */
export default function WebDivider({ at = '38%' }: { at?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('web-divider-hit')
          io.disconnect()
        }
      },
      { threshold: 1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="web-divider mx-auto max-w-6xl px-6 sm:px-12" aria-hidden>
      <div className="line" />
      <svg className="node" viewBox="0 0 24 24" style={{ left: at }}>
        <g stroke="#C9D2E0" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
          <path d="M12 12 L5 8" />
          <path d="M12 12 L7 15" />
          <path d="M12 12 L13 5" />
          <path d="M12 12 L18 9" />
          <path d="M12 12 L17 16" />
          <path d="M12 12 L10 19" />
        </g>
        <circle cx="12" cy="12" r="2.4" fill="#E63946" />
      </svg>
    </div>
  )
}
