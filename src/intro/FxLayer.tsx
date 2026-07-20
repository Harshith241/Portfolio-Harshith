import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { BEATS } from './beats'

export interface FxLayerHandle {
  /** pure f(progress); shakeTarget gets the landing camera-shake transform */
  update(p: number, shakeTarget: HTMLElement | null): void
}

const [FLIP_A, FLIP_B] = BEATS.flip
const LAND_A = BEATS.landing[0]

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

/* deterministic pseudo-random (seeded) so cracks/dust replay identically */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * B3/B4 dressing: panel backdrop + city-glow parallax blobs (flip), white flash
 * cuts, and the landing impact kit — camera shake, halftone shockwave rings,
 * radiating web-crack lines, dust motes. One 2D canvas + a few DOM layers,
 * everything a pure function of p.
 */
const FxLayer = forwardRef<FxLayerHandle>(function FxLayer(_, ref) {
  const bgRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const blobsRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // crack geometry: 8 jagged polylines radiating from the impact point (unit space)
  const cracks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const ang = Math.PI + (i / 7) * Math.PI + (rand(i) - 0.5) * 0.3 // fan upward-ish from ground
        const segs = 4
        const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }]
        let a = ang
        for (let sIdx = 1; sIdx <= segs; sIdx++) {
          a += (rand(i * 10 + sIdx) - 0.5) * 0.9
          const len = 0.028 + rand(i * 20 + sIdx) * 0.03
          pts.push({ x: pts[sIdx - 1].x + Math.cos(a) * len, y: pts[sIdx - 1].y + Math.sin(a) * len })
        }
        return pts
      }),
    [],
  )
  const dust = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        ang: Math.PI + rand(i + 50) * Math.PI, // upward hemisphere
        speed: 0.05 + rand(i + 80) * 0.09,
        size: 1.5 + rand(i + 110) * 2.5,
      })),
    [],
  )

  useImperativeHandle(ref, () => ({
    update(p: number, shakeTarget: HTMLElement | null) {
      const bg = bgRef.current
      const flash = flashRef.current
      const blobs = blobsRef.current
      const canvas = canvasRef.current
      if (!bg || !flash || !blobs || !canvas) return
      const w = canvas.parentElement!.clientWidth
      const h = canvas.parentElement!.clientHeight
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // ---- panel backdrop: near-opaque from the flip cut onward ----
      bg.style.opacity = String(clamp01((p - (FLIP_A - 0.01)) / 0.03) * 0.94)

      // ---- white flash cuts (flip cut + landing cut) ----
      const f1 = p >= FLIP_A && p < FLIP_A + 0.035 ? 1 - (p - FLIP_A) / 0.035 : 0
      const f2 = p >= LAND_A && p < LAND_A + 0.03 ? 1 - (p - LAND_A) / 0.03 : 0
      flash.style.opacity = String(Math.max(f1, f2) * 0.9)

      // ---- city-glow parallax blobs, flip beat only ----
      const inFlip = p >= FLIP_A && p < FLIP_B
      const ft = clamp01((p - FLIP_A) / (FLIP_B - FLIP_A))
      blobs.style.opacity = inFlip ? '1' : '0'
      if (inFlip) {
        ;(blobs.children as HTMLCollectionOf<HTMLElement>)[0].style.transform = `translateX(${-ft * 12}%)`
        ;(blobs.children as HTMLCollectionOf<HTMLElement>)[1].style.transform = `translateX(${-ft * 26}%)`
        ;(blobs.children as HTMLCollectionOf<HTMLElement>)[2].style.transform = `translateX(${-ft * 44}%)`
      }

      // ---- landing impact ----
      const G = { x: 0.5 * w, y: 0.8 * h } // impact point (matches the 3D landing pose)
      const lt = p - LAND_A

      // camera shake: 6px, 3 oscillations, decaying over 0.045p
      if (shakeTarget) {
        if (lt >= 0 && lt < 0.045) {
          const st = lt / 0.045
          const amp = 6 * (1 - st)
          shakeTarget.style.transform = `translate(${amp * Math.sin(st * Math.PI * 6)}px, ${amp * 0.6 * Math.sin(st * Math.PI * 6 + 1.3)}px)`
        } else {
          shakeTarget.style.transform = ''
        }
      }

      // shockwave rings (white + red offset — cheap CMYK vibe)
      if (lt >= 0 && lt < 0.05) {
        const rt = lt / 0.05
        const R = rt * 0.42 * w
        ctx.save()
        ctx.globalAlpha = (1 - rt) * 0.7
        ctx.beginPath()
        ctx.ellipse(G.x, G.y, R, R * 0.32, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#F2F4F8'
        ctx.lineWidth = 2.5 * (1 - rt) + 0.5
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(G.x + 4, G.y + 2, R * 0.92, R * 0.3, 0, 0, Math.PI * 2)
        ctx.strokeStyle = '#E63946'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      }

      // web-crack lines radiating from the impact point
      if (lt >= 0 && p < 0.78) {
        const grow = clamp01(lt / 0.05)
        const fade = p > 0.7 ? clamp01(1 - (p - 0.7) / 0.08) : 1
        ctx.save()
        ctx.globalAlpha = 0.8 * fade
        ctx.strokeStyle = '#C9D2E0'
        ctx.lineCap = 'round'
        for (const pts of cracks) {
          const upto = grow * (pts.length - 1)
          ctx.beginPath()
          ctx.moveTo(G.x, G.y)
          for (let i = 1; i <= upto; i++) {
            const pt = pts[Math.min(i, pts.length - 1)]
            ctx.lineTo(G.x + pt.x * w, G.y + pt.y * w * 0.35) // squash vertically: ground plane
          }
          ctx.lineWidth = 1.6 * (1 - grow * 0.4)
          ctx.stroke()
        }
        ctx.restore()
      }

      // dust motes drifting up
      if (lt >= 0 && lt < 0.12) {
        const dt = lt / 0.12
        ctx.save()
        for (let i = 0; i < dust.length; i++) {
          const d = dust[i]
          const dist = d.speed * dt * h
          const x = G.x + Math.cos(d.ang) * dist * 1.6
          const y = G.y + Math.sin(d.ang) * dist - dt * 14
          ctx.globalAlpha = 0.35 * (1 - dt)
          ctx.beginPath()
          ctx.arc(x, y, d.size, 0, Math.PI * 2)
          ctx.fillStyle = '#8A94A8'
          ctx.fill()
        }
        ctx.restore()
      }
    },
  }))

  return (
    <>
      {/* panel backdrop — behind the figure */}
      <div ref={bgRef} className="absolute inset-0 z-[5] opacity-0 bg-bg" />
      <div ref={blobsRef} className="absolute inset-0 z-[6] opacity-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[8%] left-[15%] h-[45%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(79,124,255,0.14)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute top-[40%] left-[45%] h-[50%] w-[60%] rounded-full bg-[radial-gradient(ellipse,rgba(230,57,70,0.10)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute top-[20%] left-[65%] h-[35%] w-[45%] rounded-full bg-[radial-gradient(ellipse,rgba(138,148,168,0.10)_0%,transparent_70%)] blur-xl" />
      </div>
      {/* FX canvas — in front of the figure */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20 h-full w-full" />
      <div ref={flashRef} className="absolute inset-0 z-30 opacity-0 bg-text" />
    </>
  )
})

export default FxLayer
