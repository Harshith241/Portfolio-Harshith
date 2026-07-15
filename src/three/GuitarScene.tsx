import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, PresentationControls, Center, ContactShadows } from '@react-three/drei'
import type { Group } from 'three'
import { prefersReducedMotion } from '../lib/lenis'

const MODEL = '/models/guitar.glb'
const pointerFine = () => window.matchMedia('(pointer: fine)').matches

function Guitar() {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { scene } = useGLTF(MODEL) as any
  const spin = useRef<Group>(null)

  useFrame((_, delta) => {
    if (spin.current && !prefersReducedMotion()) spin.current.rotation.y += delta * 0.35
  })

  return (
    <group ref={spin}>
      <Center>
        <primitive object={scene} scale={0.2} rotation={[0.15, 0, 0.35]} />
      </Center>
    </group>
  )
}

/* run frames only while the canvas is on screen and the tab is visible */
function FramePauser() {
  const { gl, setFrameloop } = useThree()
  useEffect(() => {
    if (prefersReducedMotion()) return
    let inView = true
    const apply = () => setFrameloop(inView && !document.hidden ? 'always' : 'never')
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      apply()
    })
    io.observe(gl.domElement)
    document.addEventListener('visibilitychange', apply)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', apply)
    }
  }, [gl, setFrameloop])
  return null
}

export default function GuitarScene() {
  const reduced = prefersReducedMotion()
  return (
    <Canvas
      frameloop={reduced ? 'demand' : 'always'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 7], fov: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      className="!h-full !w-full"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.3} />
      <pointLight position={[-6, 2, -4]} intensity={30} color="#E63946" />
      <pointLight position={[6, -2, 4]} intensity={18} color="#4F7CFF" />
      <Suspense fallback={null}>
        <PresentationControls
          enabled={pointerFine()}
          global={false}
          snap
          polar={[-0.3, 0.3]}
          azimuth={[-1, 1]}
        >
          <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.5} floatIntensity={0.9}>
            <Guitar />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -2.6, 0]} opacity={0.4} scale={12} blur={2} far={4} />
      </Suspense>
      <FramePauser />
    </Canvas>
  )
}

useGLTF.preload(MODEL)
