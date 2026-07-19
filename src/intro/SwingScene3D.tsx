import { forwardRef, Suspense, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, invalidate } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { swingState } from './SwingScene'

export interface Swing3DHandle {
  update(p: number): void
}

const MODEL = '/models/spidey.glb'
const CAM_Z = 8
const FOV = 40

/* dev-tunable knobs: tweak live via window.__spideyCfg = {...} */
const CFG = {
  scale: 1.05, // model is ~1.64 world-units tall once skinned
  rotY: -1.571, // face direction of travel (up-left toward the anchor)
  lean: 0.9, // how much of the rope angle the body takes
  offX: -0.75, // world-unit offset so the grip hand meets the rope end
  offY: -0.55,
  animFrom: 0.44, // jump-clip window: the hang/apex frames
  animTo: 0.54,
}

function Rig({ shared }: { shared: React.MutableRefObject<{ p: number }> }) {
  const group = useRef<THREE.Group>(null)
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { scene, animations } = useGLTF(MODEL) as any
  const { actions, mixer } = useAnimations(animations, group)

  useEffect(() => {
    const a = actions['jump']
    if (a) {
      a.play()
      a.paused = true
    }
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

  useFrame(({ size }) => {
    const g = group.current
    if (!g) return
    const cfg = { ...CFG, ...(window as unknown as { __spideyCfg?: Partial<typeof CFG> }).__spideyCfg }
    const p = shared.current.p
    const s = swingState(p, size.width, size.height)
    const visible = s.figIn > 0.05 && s.ropeAlpha > 0.05 && p < 0.38
    g.visible = visible
    if (!visible) return

    // px → world at z=0 plane
    const worldH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360)
    const k = worldH / size.height
    const x = (s.H.x - size.width / 2) * k
    const y = -(s.H.y - size.height / 2) * k

    // hang the body below the grip point (H = hand on the rope)
    g.position.set(x + cfg.offX, y + cfg.offY, 0)
    g.rotation.z = -s.theta * cfg.lean
    g.scale.setScalar(cfg.scale)
    scene.rotation.y = cfg.rotY

    const jump = actions['jump']
    if (jump) {
      const dur = jump.getClip().duration
      const t = cfg.animFrom + (cfg.animTo - cfg.animFrom) * s.st
      mixer.setTime(t * dur)
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

  useImperativeHandle(ref, () => ({
    update(p: number) {
      shared.current.p = p
      invalidate()
    },
  }))

  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="!h-full !w-full"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 8]} intensity={1.6} />
        <pointLight position={[-6, 2, 4]} intensity={30} color="#E63946" />
        <Suspense fallback={null}>
          <Rig shared={shared} />
        </Suspense>
      </Canvas>
    </div>
  )
})

export default SwingScene3D
useGLTF.preload(MODEL)
