import { prefersReducedMotion } from '../lib/lenis'

/** gate: intro only on first visit this session, never under reduced motion */
export function introEnabled() {
  return !prefersReducedMotion() && !sessionStorage.getItem('hv-intro-seen')
}

/** beat map — fractions of the time-based title sequence */
export const BEATS = {
  thwip: [0, 0.1],
  swing: [0.1, 0.42],
  flip: [0.42, 0.56],
  landing: [0.56, 0.7],
  zoom: [0.7, 0.88],
  unmask: [0.88, 1],
} as const

export const DURATION = 6.5 // seconds — movie pacing, not scroll pacing
