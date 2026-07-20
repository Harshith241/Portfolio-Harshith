import { forwardRef, useImperativeHandle, useRef } from 'react'
import { BEATS } from './beats'

export interface UnmaskMorphHandle {
  /** eye = projected 3D mask-eye point (px) — the iris origin */
  update(p: number, eye?: { x: number; y: number } | null): void
  /** the fullscreen headshot wrapper — Flip source for the About-card landing */
  photoEl(): HTMLElement | null
  /** the white iris backdrop — faded out while the photo flips into the card */
  whiteEl(): HTMLElement | null
}

const [ZOOM_A, ZOOM_B] = BEATS.zoom
const UNMASK_A = BEATS.unmask[0]

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * B5/B6 dressing over the 3D head-dolly: a vignette closes in while the camera
 * dives at the mask, then the eye blows out into a white iris and the real
 * headshot halftone-dissolves in. No 2D mask art — the model IS the mask.
 */
const UnmaskMorph = forwardRef<UnmaskMorphHandle>(function UnmaskMorph(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const vigRef = useRef<HTMLDivElement>(null)
  const irisRef = useRef<HTMLDivElement>(null)
  const whiteRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const eyeMemo = useRef<{ x: number; y: number } | null>(null)

  useImperativeHandle(ref, () => ({
    photoEl: () => photoRef.current,
    whiteEl: () => whiteRef.current,
    update(p: number, eye?: { x: number; y: number } | null) {
      const root = rootRef.current
      const vig = vigRef.current
      const iris = irisRef.current
      const photo = photoRef.current
      if (!root || !vig || !iris || !photo) return
      const w = root.clientWidth
      const h = root.clientHeight
      if (!w || !h) return

      if (p < ZOOM_A) {
        root.style.opacity = '0'
        eyeMemo.current = null
        return
      }
      root.style.opacity = '1'

      // ---- B5: vignette closes in as the dolly dives at the mask ----
      const zt = clamp01((p - ZOOM_A) / (ZOOM_B - ZOOM_A))
      vig.style.opacity = String(0.65 * Math.pow(zt, 1.5))

      // ---- B6: iris out from the eye + halftone photo reveal ----
      // freeze the origin at the moment the iris starts — the figure behind
      // keeps drifting, the bloom must not chase it
      const ut = clamp01((p - UNMASK_A) / (1 - UNMASK_A))
      if (ut > 0 && !eyeMemo.current) eyeMemo.current = eye ?? { x: 0.5 * w, y: 0.36 * h }
      const o = eyeMemo.current
      if (ut <= 0 || !o) {
        iris.style.opacity = '0'
        return
      }
      const r = lerp(0.04 * h, Math.hypot(w, h), Math.pow(ut, 1.55))
      iris.style.opacity = '1'
      iris.style.clipPath = `circle(${r}px at ${o.x}px ${o.y}px)`

      // photo dissolves in inside the white, settling from a slight over-zoom
      const ht = clamp01((ut - 0.22) / 0.78)
      photo.style.opacity = String(ht > 0 ? 1 : 0)
      photo.style.transform = `scale(${lerp(1.07, 1, Math.pow(ht, 0.8))})`
      const dot = 1 + ht * 12 // halftone dots grow until they merge (16px tile)
      const dotGrad = 'radial-gradient(circle, #000 var(--dot), transparent calc(var(--dot) + 1.5px))'
      photo.style.setProperty('-webkit-mask-image', dotGrad)
      photo.style.setProperty('mask-image', dotGrad)
      photo.style.setProperty('--dot', `${dot}px`)
      if (ht >= 1) {
        // fully revealed — drop the mask + transform so the Flip handoff is clean
        photo.style.removeProperty('-webkit-mask-image')
        photo.style.removeProperty('mask-image')
        photo.style.transform = ''
      }
    },
  }))

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-40 opacity-0">
      {/* B5 closing vignette */}
      <div
        ref={vigRef}
        className="absolute inset-0 opacity-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,4,10,0.9)_78%)]"
      />
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
