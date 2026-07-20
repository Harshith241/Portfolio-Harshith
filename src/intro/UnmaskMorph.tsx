import { forwardRef, useImperativeHandle, useRef } from 'react'
import { BEATS } from './beats'

export interface UnmaskMorphHandle {
  update(p: number): void
  /** the fullscreen headshot wrapper — Flip source for the About-card landing */
  photoEl(): HTMLElement | null
  /** the white iris backdrop — faded out while the photo flips into the card */
  whiteEl(): HTMLElement | null
}

const [ZOOM_A, ZOOM_B] = BEATS.zoom
const UNMASK_A = BEATS.unmask[0]

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/* SVG-space center of the RIGHT eye — the zoom anchor and iris origin */
const EYE = { x: 140, y: 105 }

/**
 * B5 ZOOM + B6 UNMASK. Our stylized mask art (no logos) scales up anchored on
 * its right eye; the eye blows out into a full-screen white iris; the real
 * headshot halftone-dissolves in behind it. Pure f(p).
 */
const UnmaskMorph = forwardRef<UnmaskMorphHandle>(function UnmaskMorph(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const irisRef = useRef<HTMLDivElement>(null)
  const whiteRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    photoEl: () => photoRef.current,
    whiteEl: () => whiteRef.current,
    update(p: number) {
      const root = rootRef.current
      const mask = maskRef.current
      const iris = irisRef.current
      const photo = photoRef.current
      if (!root || !mask || !iris || !photo) return
      const w = root.clientWidth
      const h = root.clientHeight
      if (!w || !h) return

      if (p < ZOOM_A) {
        root.style.opacity = '0'
        return
      }
      root.style.opacity = '1'

      // ---- B5: mask zoom, right eye anchored ----
      const zt = clamp01((p - ZOOM_A) / (ZOOM_B - ZOOM_A))
      const ez = Math.pow(zt, 2.2) // dolly accelerates as it closes in
      mask.style.opacity = String(clamp01((p - ZOOM_A) / 0.03))
      // mask box is 200x220 units rendered at maskH px tall
      const maskH = 0.34 * h
      const u = maskH / 220 // svg-unit → px
      // eye position: starts where the landed figure's head was, ends dead-center
      const ex = lerp(0.465 * w, 0.5 * w, ez)
      const ey = lerp(0.26 * h, 0.5 * h, ez)
      const scale = lerp(1, 10.5, ez)
      mask.style.width = `${(200 / 220) * maskH}px`
      mask.style.transformOrigin = `${EYE.x * u}px ${EYE.y * u}px`
      mask.style.transform = `translate(${ex - EYE.x * u}px, ${ey - EYE.y * u}px) scale(${scale})`

      // ---- B6: iris out + halftone photo reveal ----
      const ut = clamp01((p - UNMASK_A) / (1 - UNMASK_A))
      // eye-white at final zoom is ~40u wide → start radius just inside it
      const r0 = 18 * u * 10.5
      const r = lerp(r0, Math.hypot(w, h), Math.pow(ut, 1.6))
      iris.style.opacity = ut > 0 ? '1' : '0'
      iris.style.clipPath = `circle(${r}px at 50% 50%)`

      const ht = clamp01((ut - 0.25) / 0.75) // photo dissolve inside the white
      photo.style.opacity = String(ht > 0 ? 1 : 0)
      const dot = 1 + ht * 12 // halftone dots grow until they merge (16px tile)
      const dotGrad = 'radial-gradient(circle, #000 var(--dot), transparent calc(var(--dot) + 1.5px))'
      photo.style.setProperty('-webkit-mask-image', dotGrad)
      photo.style.setProperty('mask-image', dotGrad)
      photo.style.setProperty('--dot', `${dot}px`)
      if (ht >= 1) {
        // fully revealed — drop the mask so the Flip handoff is clean
        photo.style.removeProperty('-webkit-mask-image')
        photo.style.removeProperty('mask-image')
      }
    },
  }))

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-40 opacity-0">
      {/* B5 mask art — original silhouette, generic eyes, no logos */}
      <div ref={maskRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
        <svg viewBox="0 0 200 220" className="h-auto w-full">
          {/* head silhouette */}
          <path
            d="M100 14 C144 14 172 48 174 94 C176 140 142 186 100 198 C58 186 24 140 26 94 C28 48 56 14 100 14 Z"
            fill="#0A101E"
            stroke="#E63946"
            strokeOpacity="0.28"
            strokeWidth="2"
          />
          {/* faint web threads */}
          <g stroke="#F2F4F8" strokeOpacity="0.05" fill="none" strokeWidth="1">
            <path d="M100 8 V212" />
            <path d="M30 70 C70 92 130 92 170 70" />
            <path d="M26 120 C70 146 130 146 174 120" />
            <path d="M40 170 C75 194 125 194 160 170" />
          </g>
          {/* eyes — angular teardrops slanted to the temples, white with red rim */}
          <g>
            <path d="M88 128 C92 100 76 78 52 82 C32 86 28 108 42 124 C56 138 80 142 88 128 Z" fill="#F2F4F8" stroke="#E63946" strokeWidth="2" strokeLinejoin="round" />
            <path d="M112 128 C108 100 124 78 148 82 C168 86 172 108 158 124 C144 138 120 142 112 128 Z" fill="#F2F4F8" stroke="#E63946" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
      {/* B6 white iris */}
      <div ref={irisRef} className="absolute inset-0 opacity-0" style={{ clipPath: 'circle(0px at 50% 50%)' }}>
        <div ref={whiteRef} className="absolute inset-0 bg-[#F2F4F8]" />
        <div ref={photoRef} className="absolute inset-0 opacity-0" style={{ maskRepeat: 'repeat', maskSize: '16px 16px', WebkitMaskRepeat: 'repeat', WebkitMaskSize: '16px 16px' }}>
          <img src="/images/headshot-card.jpg" alt="Harshith Vijayan" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
})

export default UnmaskMorph
