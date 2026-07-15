import * as THREE from 'three'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber'
import { useGLTF, useTexture, ContactShadows } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/lenis'

gsap.registerPlugin(ScrollTrigger)

const MODEL = '/models/macbook.glb'
const LID_CLOSED = 1.575
const LID_OPEN = -0.425
const BODY_BLUE = '#A7C7E7' // sky-blue MacBook Air

/* eslint-disable @typescript-eslint/no-explicit-any */
function Model({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { nodes, materials } = useGLTF(MODEL) as any
  const hinge = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const screen2 = useTexture('/images/screen-2.png')
  const screenDefault = useRef<THREE.Texture | null>(null)

  // one-time material prep: light-blue body, lights-only-friendly metalness
  useEffect(() => {
    screen2.flipY = false // match glTF UV convention (embedded textures are flipY=false)
    screen2.colorSpace = THREE.SRGBColorSpace
    screen2.needsUpdate = true // flipY changes require re-upload
    const alu = materials.aluminium as THREE.MeshStandardMaterial
    alu.color.set(BODY_BLUE)
    alu.metalness = 0.35
    alu.roughness = 0.45
    const screen = materials['screen.001'] as THREE.MeshStandardMaterial
    screenDefault.current = screen.map
    screen.emissive = new THREE.Color('#223')
    invalidate()
  }, [materials, screen2])

  useFrame(() => {
    const p = progressRef.current
    // 0 → 0.05: closed hold (so the user always sees it shut first)
    // 0.05 → 0.2: lid opens fast · 0.2 → 1: one full 360° turn
    // (whole sequence ≈ half a viewport of scroll — 180° lands within 1-2 wheel flicks)
    const lidT = Math.min(Math.max((p - 0.05) / 0.15, 0), 1)
    const eased = 1 - Math.pow(1 - lidT, 3)
    if (hinge.current) hinge.current.rotation.x = LID_CLOSED + (LID_OPEN - LID_CLOSED) * eased
    const yawT = Math.max(0, (p - 0.2) / 0.8)
    if (spin.current) spin.current.rotation.y = Math.PI + yawT * Math.PI * 2
    // swap the screen while its back faces the camera (~180°), so the agent
    // trace is a reveal as the laptop comes back around
    const screen = materials['screen.001'] as THREE.MeshStandardMaterial
    const want = p > 0.6 ? screen2 : screenDefault.current
    if (want && screen.map !== want) {
      screen.map = want
      screen.needsUpdate = true
    }
  })

  return (
    <group ref={spin} position={[0, -0.6, 0]}>
      <group position={[0, -0.04, 0.41]} ref={hinge} rotation={[LID_CLOSED, 0, 0]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.aluminium} geometry={nodes['Cube008'].geometry} />
          <mesh material={materials['matte.001']} geometry={nodes['Cube008_1'].geometry} />
          <mesh material={materials['screen.001']} geometry={nodes['Cube008_2'].geometry} />
        </group>
      </group>
      <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]} />
      <group position={[0, -0.1, 3.39]}>
        <mesh material={materials.aluminium} geometry={nodes['Cube002'].geometry} />
        <mesh material={materials.trackpad} geometry={nodes['Cube002_1'].geometry} />
      </group>
      <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]} />
    </group>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function ScrollDriver({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // manual pose control for headless verification: __macProgress(0..1)
      ;(window as unknown as Record<string, unknown>).__macProgress = (p: number) => {
        progressRef.current = p
        invalidate()
      }
    }
  }, [progressRef])
  useEffect(() => {
    if (prefersReducedMotion()) {
      progressRef.current = 0.55 // lid open, front-facing, static
      invalidate()
      return
    }
    // trigger = the MacBook's own slot: progress only starts once the (closed)
    // laptop is actually on screen, then plays out over ~1100px of scroll
    const st = ScrollTrigger.create({
      trigger: '#mac-slot',
      start: 'top 80%',
      end: '+=520',
      scrub: 0.3,
      onUpdate: (self) => {
        progressRef.current = self.progress
        invalidate()
      },
    })
    return () => st.kill()
  }, [progressRef, gl])
  return null
}

export default function MacbookScene() {
  const progressRef = useRef(0)
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.5, -26], fov: 35 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      className="!h-full !w-full"
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 10, -14]} intensity={1.6} />
      <pointLight position={[-10, 4, 6]} intensity={40} color="#4F7CFF" />
      <pointLight position={[10, 2, 8]} intensity={30} color="#E63946" />
      <Suspense fallback={null}>
        <Model progressRef={progressRef} />
      </Suspense>
      <ContactShadows position={[0, -4.6, 0]} opacity={0.5} scale={22} blur={1.8} far={5} />
      <ScrollDriver progressRef={progressRef} />
    </Canvas>
  )
}

useGLTF.preload(MODEL)
