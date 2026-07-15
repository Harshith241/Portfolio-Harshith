import { useRef, useState } from 'react'
import SplitText from '../components/reactbits/SplitText'
import Magnet from '../components/reactbits/Magnet'
import { contact, identity } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

function Spider() {
  return (
    <div className="spider-thread">
      <svg className="spider-body" width="16" height="14" viewBox="0 0 16 14" aria-hidden>
        <g stroke="#8A94A8" strokeWidth="1" fill="none">
          <path d="M3 4 L0 1 M3 7 L0 7 M3 10 L1 13 M13 4 L16 1 M13 7 L16 7 M13 10 L15 13" />
        </g>
        <ellipse cx="8" cy="7" rx="4" ry="4.6" fill="#1C2536" stroke="#8A94A8" strokeWidth="1" />
        <circle cx="6.6" cy="5.8" r="0.9" fill="#E63946" />
        <circle cx="9.4" cy="5.8" r="0.9" fill="#E63946" />
      </svg>
    </div>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [spider, setSpider] = useState(false)
  const clicks = useRef<number[]>([])
  const reduced = prefersReducedMotion()

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${identity.email}`
    }
  }

  const onLogoClick = () => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < 1200), now]
    if (clicks.current.length >= 3 && !spider && !reduced) {
      clicks.current = []
      setSpider(true)
      setTimeout(() => setSpider(false), 4200)
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <h2 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
        {reduced ? (
          <>
            {contact.heading[0]} <span className="text-red">{contact.heading[1]}</span>
          </>
        ) : (
          <>
            <SplitText tag="span" text={contact.heading[0]} splitType="chars" delay={30} duration={0.7} ease="power3.out" textAlign="left" />{' '}
            <SplitText tag="span" text={contact.heading[1]} className="text-red" splitType="chars" delay={30} duration={0.7} ease="power3.out" textAlign="left" />
          </>
        )}
      </h2>
      <p className="mt-6 max-w-xl text-muted">{contact.blurb}</p>

      <Magnet padding={60} magnetStrength={14} disabled={reduced}>
        <button
          type="button"
          onClick={copyEmail}
          className="mt-10 inline-block cursor-pointer font-mono text-2xl text-text underline decoration-red underline-offset-8 transition hover:text-red sm:text-4xl"
        >
          {identity.email}
        </button>
      </Magnet>
      <p
        className={`mt-3 font-mono text-xs text-red transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
      >
        copied to clipboard ✓
      </p>

      <div className="mt-10 flex flex-wrap gap-8 font-mono text-sm text-muted">
        <a href={`mailto:${identity.email}`} className="hover:text-red">Email ↗</a>
        <a href={identity.github} target="_blank" rel="noreferrer" className="hover:text-red">GitHub ↗</a>
        <a href={identity.linkedin} target="_blank" rel="noreferrer" className="hover:text-red">LinkedIn ↗</a>
        <a href={identity.resume} download className="hover:text-red">Resume ↓</a>
      </div>

      <footer className="mt-24 flex flex-col gap-3 border-t border-border pt-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          id="footer-logo"
          onClick={onLogoClick}
          className="glitch-hover w-max cursor-pointer font-display text-lg font-bold text-text select-none"
          aria-label="hv logo"
        >
          {identity.monogram}
        </button>
        <span>© 2026 {identity.name}</span>
        <span>{contact.footer}</span>
      </footer>

      {spider && <Spider />}
    </section>
  )
}
