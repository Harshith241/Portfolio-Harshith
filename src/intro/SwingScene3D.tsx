import { forwardRef, Suspense, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, invalidate, advance } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { swingState, SWING_FADED } from './SwingScene'

export interface Swing3DHandle {
  update(p: number): void
  handScreen(): { x: number; y: number } | null
}

const MODEL = '/models/spidey.glb'
const CAM_Z = 8
const FOV = 40

/* dev-tunable knobs: tweak live via window.__spideyCfg = {...} */
const CFG = {
  scale: 1.6, // model is ~1.64 world-units tall once skinned
  rotY: -1.571, // face direction of travel (up-left toward the anchor)
  lean: 0.9, // how much of the rope angle the body takes
  offX: -0.75, // world-unit offset so the grip hand meets the rope end
  offY: -0.55,
  animFrom: 0.44, // jump-clip window: the hang/apex frames
  animTo: 0.54,
  flipScale: 2.0, // B3: closer "panel"
  landScale: 2.1, // B4: landing crouch
  landX: 0, // world offset of the landing pose from bottom-center
  landY: 0.1,
  landRotY: -0.9, // slight 3/4 angle so the crouch reads
  crouchT: 2.2, // 'jump' clip time (s) held as the landing crouch frame
}

/* beat windows (fractions — must match IntroSequence BEATS) */
const FLIP_A = 0.42
const FLIP_B = 0.56
const FIG_OUT = 0.74 // 3D figure fully handed off to the 2D mask zoom

function Rig({ shared, handOut }: { shared: React.MutableRefObject<{ p: number }>; handOut: React.MutableRefObject<{ x: number; y: number } | null> }) {
  const handBone = useRef<THREE.Object3D | null>(null)
  const v3 = useRef(new THREE.Vector3())
  const group = useRef<THREE.Group>(null)
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  // local draco decoder (public/draco/) — drei's default is a gstatic CDN URL
  const { scene, animations } = useGLTF(MODEL, '/draco/') as any
  const { actions, mixer } = useAnimations(animations, group)

  const actionRef = useRef<THREE.AnimationAction | null>(null)
  useEffect(() => {
    const a = actions['jump']
    if (a) {
      a.setLoop(THREE.LoopPingPong, Infinity)
      a.timeScale = 0.55
      a.play() // runs live — fluid limbs, not a frozen frame
      actionRef.current = a
    }
    // find the grip hand bone for rope attachment
    let hand: THREE.Object3D | null = null
    scene.traverse((o: THREE.Object3D) => {
      if (!hand && (o as THREE.Bone).isBone && /hand/i.test(o.name) && /l(eft)?[_.]?|L$/.test(o.name)) hand = o
    })
    if (!hand) scene.traverse((o: THREE.Object3D) => { if (!hand && (o as THREE.Bone).isBone && /hand/i.test(o.name)) hand = o })
    handBone.current = hand
    if (import.meta.env.DEV) {
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      ;(window as unknown as Record<string, unknown>).__spideyInfo = {
        clips: Object.keys(actions),
        size: [size.x, size.y, size.z],
        children: scene.children.length,
      }
    }
  }, [actions, scene])

  useFrame(({ size, camera }, delta) => {
    const g = group.current
    if (!g) return
    const cfg = { ...CFG, ...(window as unknown as { __spideyCfg?: Partial<typeof CFG> }).__spideyCfg }
    const p = shared.current.p

    // landing holds a crouch frame; everywhere else the clip runs live
    const frozen = p >= FLIP_B && p < FIG_OUT
    const a = actionRef.current
    if (frozen && a) {
      a.time = cfg.crouchT
      mixer.update(0)
    } else {
      mixer.update(Math.min(delta, 0.05))
    }

    const s = swingState(p, size.width, size.height)
    const inSwing = s.figIn > 0.05 && s.ropeAlpha > 0.05 && p < SWING_FADED
    const inFlip = p >= FLIP_A && p < FLIP_B
    const inLand = p >= FLIP_B && p < FIG_OUT
    g.visible = inSwing || inFlip || inLand
    if (!g.visible) return

    // px → world at z=0 plane
    const worldH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360)
    const worldW = worldH * (size.width / size.height)
    const k = worldH / size.height

    if (inSwing) {
      const x = (s.H.x - size.width / 2) * k
      const y = -(s.H.y - size.height / 2) * k
      // hang the body below the grip point (H = hand on the rope)
      scene.position.y = 0
      // figure tracks the rope length (R shrinks on narrow screens)
      const fit = s.R / (0.78 * size.height)
      g.position.set(x + cfg.offX * fit, y + cfg.offY * fit, 0)
      g.rotation.z = -s.theta * cfg.lean
      g.scale.setScalar(cfg.scale * fit)
      scene.rotation.y = cfg.rotY
    } else if (inFlip) {
      // B3: released — tucked flip arcing across the closer panel, 720°
      // model root is at the FEET: recenter so the tumble pivots on the body
      const t = (p - FLIP_A) / (FLIP_B - FLIP_A)
      const x = (-0.32 + 0.62 * t) * worldW
      const y = (-0.15 + 0.3 * (1 - (2 * t - 1) * (2 * t - 1))) * worldH
      scene.position.y = -0.82
      g.position.set(x, y, 0)
      g.rotation.z = -t * Math.PI * 4
      g.scale.setScalar(cfg.flipScale)
      scene.rotation.y = cfg.rotY
    } else {
      // B4: three-point landing, bottom-center, held still (the dead-zone beat)
      const gx = 0
      const gy = -(0.8 * size.height - size.height / 2) * k
      scene.position.y = 0
      g.position.set(gx + cfg.landX, gy + cfg.landY, 0)
      g.rotation.z = 0
      g.scale.setScalar(cfg.landScale)
      scene.rotation.y = cfg.landRotY
    }

    if (import.meta.env.DEV) {
      let meshes = 0
      scene.traverse((o: THREE.Object3D) => { if ((o as THREE.Mesh).isMesh) meshes++ })
      ;(window as unknown as Record<string, unknown>).__spideyDbg = {
        p, visible: g.visible, pos: g.position.toArray(), scale: g.scale.x, meshes,
        camZ: camera.position.z, size: [size.width, size.height],
      }
    }
    // project the grip hand bone to screen px for the rope
    if (handBone.current) {
      handBone.current.getWorldPosition(v3.current)
      v3.current.project(camera)
      handOut.current = {
        x: (v3.current.x * 0.5 + 0.5) * size.width,
        y: (1 - (v3.current.y * 0.5 + 0.5)) * size.height,
      }
    }
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

/** Track B figure: rigged Spider-Verse Miles scrubbed along the same pendulum. */
const SwingScene3D = forwardRef<Swing3DHandle>(function SwingScene3D(_, ref) {
  const shared = useRef({ p: 0 })
  const handOut = useRef<{ x: number; y: number } | null>(null)

  useImperativeHandle(ref, () => ({
    update(p: number) {
      shared.current.p = p
      invalidate()
      // ponytail: embedded browser panes pause rAF — force a synchronous frame in dev
      if (import.meta.env.DEV) advance(performance.now(), true)
    },
    handScreen() {
      return handOut.current
    },
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="!h-full !w-full"
      >
        <ambientLight intensity={1.25} />
        <hemisphereLight intensity={0.6} color="#8A94A8" groundColor="#1C2536" />
        <directionalLight position={[4, 6, 8]} intensity={1.6} />
        <pointLight position={[-6, 2, 4]} intensity={30} color="#E63946" />
        <Suspense fallback={null}>
          <Rig shared={shared} handOut={handOut} />
        </Suspense>
      </Canvas>
    </div>
  )
})

export default SwingScene3D
useGLTF.preload(MODEL, '/draco/')
