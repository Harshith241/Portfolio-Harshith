import { prefersReducedMotion } from '../lib/lenis'

/** gate: intro only on first visit this session, never under reduced motion */
export function introEnabled() {
  return !prefersReducedMotion() && !sessionStorage.getItem('hv-intro-seen')
}

/** beat map — fractions of the time-based title sequence.
 * v2 pacing (user: flip was vague, landing→zoom→transition too fast):
 * seconds at 9s — thwip .63 / swing 2.25 / flip 1.44 / landing 1.8 (squat
 * hold + rise) / zoom 1.98 / unmask .9 */
export const BEATS = {
  thwip: [0, 0.07],
  swing: [0.07, 0.32],
  flip: [0.32, 0.48],
  landing: [0.48, 0.68],
  zoom: [0.68, 0.9],
  unmask: [0.9, 1],
} as const

export const DURATION = 9 // seconds — movie pacing, not scroll pacing
