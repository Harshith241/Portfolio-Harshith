import { contact, identity } from '../data/content'

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <h2 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
        {contact.heading[0]} <span className="text-red">{contact.heading[1]}</span>
      </h2>
      <p className="mt-6 max-w-xl text-muted">{contact.blurb}</p>
      <a
        href={`mailto:${identity.email}`}
        className="mt-10 inline-block font-mono text-2xl text-text underline decoration-red underline-offset-8 hover:text-red sm:text-4xl"
      >
        {identity.email}
      </a>
      <div className="mt-12 flex gap-8 font-mono text-sm text-muted">
        <a href={identity.github} target="_blank" rel="noreferrer" className="hover:text-red">GitHub ↗</a>
        <a href={identity.linkedin} target="_blank" rel="noreferrer" className="hover:text-red">LinkedIn ↗</a>
        <a href={identity.resume} download className="hover:text-red">Resume ↓</a>
      </div>

      <footer className="mt-24 flex flex-col gap-3 border-t border-border pt-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span id="footer-logo" className="font-display text-lg font-bold text-text select-none">
          {identity.monogram}
        </span>
        <span>© 2026 {identity.name}</span>
        <span>{contact.footer}</span>
      </footer>
    </section>
  )
}
