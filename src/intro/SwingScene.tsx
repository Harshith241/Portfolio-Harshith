import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface SwingSceneHandle {
  update(p: number): void
}

/* beat fractions (must match IntroSequence BEATS) */
const TIP_END = 0.05 // web tip reaches the corner
const SPLAT_AT = 0.045
const FIGURE_IN = 0.055
const SWING_START = 0.08
const SWING_END = 0.34

const THETA0 = (78 * Math.PI) / 180 // entry: rope nearly horizontal (the reference shot)
const THETA1 = (-6 * Math.PI) / 180 // release just past the bottom of the arc

/**
 * B1 THWIP + B2 SWING. One 2D canvas (rope, splat, trail) + a DOM/SVG figure
 * transformed along the pendulum arc. Everything is a pure function of scrub
 * progress p, so reverse-scrubbing replays it backwards for free.
 */
const SwingScene = forwardRef<SwingSceneHandle>(function SwingScene(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const trail = useRef<{ x: number; y: number }[]>([])

  useImperativeHandle(ref, () => ({
    update(p: number) {
      const root = rootRef.current
      const canvas = canvasRef.current
      const figure = figureRef.current
      if (!root || !canvas || !figure) return

      const w = root.clientWidth
      const h = root.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // scene is over after the swing (B3+ are cuts)
      const ropeAlpha = p < SWING_END ? 1 : Math.max(0, 1 - (p - SWING_END) / 0.04)
      if (p >= SWING_END + 0.06 || ropeAlpha <= 0) {
        figure.style.opacity = '0'
        trail.current = []
        return
      }

      const A = { x: 0.1 * w, y: 0.07 * h } // web anchor: top-left corner
      const R = 0.78 * h

      // ---- pendulum state ----
      const st = Math.min(Math.max((p - SWING_START) / (SWING_END - SWING_START), 0), 1)
      const eased = Math.pow(st, 1.65) // accelerates into the bottom of the arc
      const theta = p < SWING_START ? THETA0 : THETA0 + (THETA1 - THETA0) * eased
      const H = { x: A.x + R * Math.sin(theta), y: A.y + R * Math.cos(theta) }

      // ---- B1: web tip shoots to the corner ----
      if (p < TIP_END) {
        const t = p / TIP_END
        const S = { x: 1.04 * w, y: 0.32 * h }
        const C = { x: 0.55 * w, y: 0.1 * h }
        ctx.beginPath()
        const steps = 24
        for (let i = 0; i <= steps * t; i++) {
          const u = i / steps
          const x = (1 - u) * (1 - u) * S.x + 2 * (1 - u) * u * C.x + u * u * A.x
          const y = (1 - u) * (1 - u) * S.y + 2 * (1 - u) * u * C.y + u * u * A.y
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = 'rgba(216,222,233,0.95)'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // ---- anchor splat (frayed web end, like the movie frame) ----
      if (p >= SPLAT_AT) {
        const s = Math.min((p - SPLAT_AT) / 0.02, 1)
        const wob = 1 + 0.18 * Math.sin(Math.min((p - SPLAT_AT) * 260, Math.PI * 2.5)) * (1 - s * 0.6)
        ctx.save()
        ctx.globalAlpha = ropeAlpha
        ctx.strokeStyle = '#C9D2E0'
        ctx.lineCap = 'round'
        for (let i = 0; i < 7; i++) {
          const ang = -0.55 + (i / 6) * 2.1 // fan toward down-right
          const len = (9 + (i % 3) * 6) * s * wob
          ctx.beginPath()
          ctx.moveTo(A.x, A.y)
          ctx.lineTo(A.x + Math.cos(ang) * len, A.y + Math.sin(ang) * len)
          ctx.lineWidth = i % 2 ? 1.2 : 2
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(A.x, A.y, 3.2 * s, 0, Math.PI * 2)
        ctx.fillStyle = '#E63946'
        ctx.fill()
        ctx.restore()
      }

      // ---- rope from anchor to hand ----
      if (p >= FIGURE_IN) {
        const sag = 12 + 14 * Math.sin(st * Math.PI)
        const mid = { x: (A.x + H.x) / 2, y: (A.y + H.y) / 2 + sag }
        ctx.save()
        ctx.globalAlpha = ropeAlpha
        // red under-glow pass, then the line
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.quadraticCurveTo(mid.x, mid.y, H.x, H.y)
        ctx.strokeStyle = 'rgba(230,57,70,0.18)'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.quadraticCurveTo(mid.x, mid.y, H.x, H.y)
        ctx.strokeStyle = '#D8DEE9'
        ctx.lineWidth = 1.8
        ctx.stroke()
        ctx.restore()
      }

      // ---- motion trail behind the figure ----
      if (p >= SWING_START) {
        const last = trail.current[trail.current.length - 1]
        if (!last || Math.hypot(H.x - last.x, H.y - last.y) > 6) {
          trail.current.push({ x: H.x, y: H.y })
          if (trail.current.length > 12) trail.current.shift()
        }
        ctx.save()
        for (let i = 1; i < trail.current.length; i++) {
          const a = (i / trail.current.length) * 0.28 * ropeAlpha
          ctx.beginPath()
          ctx.moveTo(trail.current[i - 1].x, trail.current[i - 1].y)
          ctx.lineTo(trail.current[i].x, trail.current[i].y)
          ctx.strokeStyle = `rgba(230,57,70,${a})`
          ctx.lineWidth = 3 + i * 0.6
          ctx.lineCap = 'round'
          ctx.stroke()
        }
        ctx.restore()
      } else {
        trail.current = []
      }

      // ---- figure on the rope ----
      const fig = Math.min(Math.max((p - FIGURE_IN) / 0.03, 0), 1)
      figure.style.opacity = String(fig * ropeAlpha)
      const scale = (0.22 * h) / 160
      const grip = { x: 64 * scale, y: 4 * scale }
      const deg = (theta * 180) / Math.PI
      figure.style.transformOrigin = `${grip.x}px ${grip.y}px`
      figure.style.transform = `translate(${H.x - grip.x}px, ${H.y - grip.y}px) rotate(${deg}deg)`
      figure.style.width = `${120 * scale}px`
    },
  }))

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div ref={figureRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
        {/* the web-slinger — original silhouette art */}
        <svg viewBox="0 0 120 160" className="h-auto w-full">
          <defs>
            <filter id="fig-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#E63946" floodOpacity="0.55" />
            </filter>
          </defs>
          <g filter="url(#fig-glow)">
            <g stroke="#16203A" strokeLinecap="round" fill="none">
              <path d="M64 4 C62 14 58 26 52 36" strokeWidth="9" />
              <path d="M52 34 C48 46 46 56 48 66" strokeWidth="13" />
              <path d="M50 40 C40 48 32 52 24 50" strokeWidth="8" />
              <path d="M48 66 C56 76 62 84 60 96 C58 106 52 112 46 116" strokeWidth="10" />
              <path d="M48 66 C54 80 64 92 78 102" strokeWidth="10" />
            </g>
            <circle cx="44" cy="24" r="10" fill="#16203A" />
            <path d="M41 22 l-8 -2.5 6.5 6 z" fill="#F2F4F8" opacity="0.92" />
            <path d="M53 34 C49 46 47 56 49 66" stroke="#E63946" strokeWidth="2" opacity="0.75" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  )
})

export default SwingScene
