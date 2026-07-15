import { useEffect, useState } from 'react'
import { identity } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

/** Session-once monogram intro. Hard-capped ~1.2s, skipped for reduced motion. */
export default function Loader() {
  const [show, setShow] = useState(
    () => !prefersReducedMotion() && !sessionStorage.getItem('hv-loaded')
  )

  useEffect(() => {
    if (!show) return
    sessionStorage.setItem('hv-loaded', '1')
    const t = setTimeout(() => setShow(false), 1200)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null
  return (
    <div className="loader-overlay" aria-hidden>
      <span className="mark font-display text-6xl font-bold text-text">
        {identity.monogram.replace('.', '')}
        <span className="dot">.</span>
      </span>
    </div>
  )
}
