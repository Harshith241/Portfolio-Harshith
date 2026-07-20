import { forwardRef, Suspense, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, invalidate, advance } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { swingState, SWING_FADED } from './SwingScene'
import { BEATS } from './beats'

export interface Swing3DHandle {
  update(p: number): void
  handScreen(): { x: number; y: number } | null
  /** projected mask-eye point — the B6 iris origin */
  headScreen(): { x: number; y: number } | null
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
  landClip: 'jump', // squat source clip…
  crouchT: 0.15, // …at this time (s): the deep landing squat
  standClip: 'idle', // rise target clip…
  standT: 0.1, // …at this time: the upright pose he settles into
  riseStart: 0.45, // fraction of the landing beat spent holding the squat
  squatSink: 0.15, // world-units the hips drop during the squat hold (blends out on rise)
  squatLean: 0.28, // forward body tilt during the squat hold
  zoomScale: 14, // B5: how far the dolly closes in on the head (eyes must stay in frame)
  zoomRotY: 0.05, // ...while he turns to face the camera
  headLift: -0.22, // group x-tilt so the face comes up out of the crouch
  headTilt: 0.7, // head-bone x added over the crouch pose: he raises his face to the camera
  // ponytail: mid-face bone point, not the exact lens — bone-local solves for
  // the lens proved seek-order-sensitive; the bloom reads the same from here
  eyeOff: [0, 0, 0] as [number, number, number],
}

/* beat windows derived from the shared BEATS map */
const FLIP_A = BEATS.flip[0]
const FLIP_B = BEATS.flip[1]
const LAND_B = BEATS.landing[1]
const ZOOM_B = BEATS.zoom[1]
const FIG_OUT = BEATS.unmask[0] + 0.05 // figure lingers behind the expanding iris, then gone

interface RigProps {
  shared: React.MutableRefObject<{ p: number }>
  handOut: React.MutableRefObject<{ x: number; y: number } | null>
  headOut: React.MutableRefObject<{ x: number; y: number } | null>
}

function Rig({ shared, handOut, headOut }: RigProps) {
  const handBone = useRef<THREE.Object3D | null>(null)
  const headBone = useRef<THREE.Object3D | null>(null)
  const eyeAnchor = useRef<THREE.Object3D | null>(null)
  const crouchHeadX = useRef<number | null>(null)
  const wasFrozen = useRef(false)
  const v3 = useRef(new THREE.Vector3())
  const v3b = useRef(new THREE.Vector3())
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
    let head: THREE.Object3D | null = null
    scene.traverse((o: THREE.Object3D) => { if (!head && (o as THREE.Bone).isBone && /head/i.test(o.name)) head = o })
    headBone.current = head
    // helper riding the head bone at the eye lens — the B6 iris origin
    if (head && !eyeAnchor.current) {
      const e = new THREE.Object3D()
      ;(head as THREE.Object3D).add(e)
      eyeAnchor.current = e
    }

    // silhouette treatment — OUR art language, not the source asset's:
    // textured body → near-black navy, red accent meshes → brand red,
    // white eye lenses → unlit glow (they read through the dark).
    // keyed on mesh names (material names vanish after the first pass / HMR)
    const EYES = ['Object_9', 'Object_13']
    const RED = ['Object_7', 'Object_11', 'Object_16']
    scene.traverse((o: THREE.Object3D) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || m.userData.hvTreated) return
      m.userData.hvTreated = true
      if (EYES.includes(m.name)) {
        m.material = new THREE.MeshBasicMaterial({ color: '#F2F4F8' })
      } else if (RED.includes(m.name)) {
        m.material = new THREE.MeshStandardMaterial({ color: '#E63946', roughness: 0.5, metalness: 0.1 })
      } else {
        // classic suit blue (deep, so the red rim + eyes still carry the frame)
        m.material = new THREE.MeshStandardMaterial({ color: '#24418F', roughness: 0.6, metalness: 0.15 })
      }
    })
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__spideyScene = scene
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

    // landing/zoom scrub a posed clip time; everywhere else the clip runs live.
    // re-set time + epsilon update EVERY frame: update(0) on a paused action
    // doesn't re-evaluate, which made the held pose depend on seek history
    const frozen = p >= FLIP_B && p < FIG_OUT
    const live = actionRef.current
    if (frozen) {
      // landing: hold the squat, then RISE — a weight cross-fade between two
      // posed frames (the jump clip never actually lands, so no single clip
      // has squat→stand). zoom holds the risen pose.
      let w = 1 // stand weight
      if (p < LAND_B) {
        const lt = (p - FLIP_B) / (LAND_B - FLIP_B)
        const rt = Math.min(Math.max((lt - cfg.riseStart) / (1 - cfg.riseStart), 0), 1)
        w = rt * rt * (3 - 2 * rt) // smoothstep up
      }
      const aC = actions[cfg.landClip] ?? live
      const aS = actions[cfg.standClip] ?? aC
      if (live && live !== aC && live !== aS) live.stop()
      if (aC) {
        // reset clears LoopPingPong's loop-parity — without it the held frame
        // plays mirrored depending on how long the live phase ran
        aC.reset().play()
        aC.time = cfg.crouchT
        aC.setEffectiveWeight(aS && aS !== aC ? 1 - w : 1)
      }
      if (aS && aS !== aC) {
        aS.reset().play()
        aS.time = cfg.standT
        aS.setEffectiveWeight(w)
      }
      mixer.update(1 / 240)
      wasFrozen.current = true
    } else {
      if (wasFrozen.current) {
        mixer.stopAllAction()
        live?.reset().play()
        live?.setEffectiveWeight(1)
        wasFrozen.current = false
      }
      if (live && !live.isRunning()) live.reset().play()
      mixer.update(Math.min(delta, 0.05))
    }

    const s = swingState(p, size.width, size.height)
    const inSwing = s.figIn > 0.05 && s.ropeAlpha > 0.05 && p < SWING_FADED
    const inFlip = p >= FLIP_A && p < FLIP_B
    const inLand = p >= FLIP_B && p < LAND_B
    const inZoom = p >= LAND_B && p < FIG_OUT
    g.visible = inSwing || inFlip || inLand || inZoom
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
      // B3: released — one clean readable backflip arcing across the panel
      // (was 720°/0.9s — too fast to parse). model root is at the FEET:
      // recenter so the tumble pivots on the body
      const t = (p - FLIP_A) / (FLIP_B - FLIP_A)
      const x = (-0.32 + 0.62 * t) * worldW
      const y = (-0.15 + 0.3 * (1 - (2 * t - 1) * (2 * t - 1))) * worldH
      scene.position.y = -0.82
      g.position.set(x, y, 0)
      // ease the spin: slow in, finishes upright before the landing cut
      const spin = t * t * (3 - 2 * t)
      g.rotation.z = -spin * Math.PI * 2
      g.scale.setScalar(cfg.flipScale)
      scene.rotation.y = cfg.rotY
    } else if (inLand) {
      // B4: lands INTO a deep squat (hips sunk + forward lean over the crouch
      // frame), holds, then rises as the clip blend stands him up
      // remember the crouch head pose ONCE — the euler is never synced back
      // from the mixer's quaternion writes, so re-capturing reads our own
      // tilt from the last zoom frame and accumulates
      if (headBone.current && crouchHeadX.current == null) crouchHeadX.current = headBone.current.rotation.x
      const lt = (p - FLIP_B) / (LAND_B - FLIP_B)
      const rt = Math.min(Math.max((lt - cfg.riseStart) / (1 - cfg.riseStart), 0), 1)
      const w = rt * rt * (3 - 2 * rt) // 0 = deep squat, 1 = standing
      const gx = 0
      const gy = -(0.8 * size.height - size.height / 2) * k
      scene.position.y = 0
      g.position.set(gx + cfg.landX, gy + cfg.landY - cfg.squatSink * (1 - w), 0)
      g.rotation.z = 0
      g.rotation.x = cfg.squatLean * (1 - w)
      g.scale.setScalar(cfg.landScale)
      scene.rotation.y = cfg.landRotY
    } else {
      // B5: THE LOOK — he raises his head to the camera and we dolly straight
      // into the mask until an eye fills the frame (no 2D-art cut)
      const zt = Math.min((p - LAND_B) / (ZOOM_B - LAND_B), 1)
      const look = Math.min(zt * 3, 1) // the head-turn finishes early…
      const ez = Math.pow(zt, 2.4) // …then the dolly accelerates in
      // "THE LOOK": tilt the head bone up — absolute, from the crouch base pose
      if (headBone.current) {
        if (crouchHeadX.current == null) crouchHeadX.current = headBone.current.rotation.x
        headBone.current.rotation.x = crouchHeadX.current + cfg.headTilt * look
      }
      const gy = -(0.8 * size.height - size.height / 2) * k
      scene.position.y = 0
      g.rotation.z = 0
      g.rotation.x = cfg.headLift * look
      g.scale.setScalar(cfg.landScale * (1 + (cfg.zoomScale - 1) * ez))
      scene.rotation.y = cfg.landRotY + (cfg.zoomRotY - cfg.landRotY) * look
      // anchor the HEAD: measure where it lands, then shift the group so the
      // head tracks from its landing spot to just-above-center
      g.position.set(cfg.landX, gy + cfg.landY, 0)
      g.updateMatrixWorld(true)
      if (headBone.current) {
        headBone.current.getWorldPosition(v3b.current)
        // bone sits at the neck: as scale grows the face rises above it, so the
        // anchor drifts DOWN to keep the eyes in frame
        const targetPx = { x: 0.5 * size.width, y: (0.42 + 0.22 * ez) * size.height }
        const tx = (targetPx.x - size.width / 2) * k
        const ty = -(targetPx.y - size.height / 2) * k
        const blend = Math.min(zt * 4, 1) // ease into the anchored framing
        g.position.x += (tx - v3b.current.x) * blend
        g.position.y += (ty - v3b.current.y) * blend
      }
    }

    if (import.meta.env.DEV) {
      let meshes = 0
      scene.traverse((o: THREE.Object3D) => { if ((o as THREE.Mesh).isMesh) meshes++ })
      ;(window as unknown as Record<string, unknown>).__spideyDbg = {
        p, visible: g.visible, pos: g.position.toArray(), scale: g.scale.x, meshes,
        camZ: camera.position.z, size: [size.width, size.height], eye: headOut.current,
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
    // project the eye anchor — the B6 iris blooms from the mask lens
    if (eyeAnchor.current) {
      eyeAnchor.current.position.set(...cfg.eyeOff)
      eyeAnchor.current.getWorldPosition(v3.current)
      v3.current.project(camera)
      headOut.current = {
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
  const headOut = useRef<{ x: number; y: number } | null>(null)

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
    headScreen() {
      return headOut.current
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
        {/* silhouette lighting: dim cool base, hot red rim, faint blue kick */}
        <ambientLight intensity={0.5} />
        <hemisphereLight intensity={0.35} color="#8A94A8" groundColor="#1C2536" />
        <directionalLight position={[4, 6, 8]} intensity={0.9} />
        <pointLight position={[-6, 2, 4]} intensity={45} color="#E63946" />
        <pointLight position={[6, -2, 3]} intensity={14} color="#4F7CFF" />
        <Suspense fallback={null}>
          <Rig shared={shared} handOut={handOut} headOut={headOut} />
        </Suspense>
      </Canvas>
    </div>
  )
})

export default SwingScene3D
useGLTF.preload(MODEL, '/draco/')
