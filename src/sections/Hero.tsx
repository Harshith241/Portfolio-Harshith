import { lazy, Suspense } from 'react'
import SplitText from '../components/reactbits/SplitText'
import RotatingText from '../components/reactbits/RotatingText'
import ShinyText from '../components/reactbits/ShinyText'
import StarBorder from '../components/reactbits/StarBorder'
import Magnet from '../components/reactbits/Magnet'
import { identity } from '../data/content'
import { prefersReducedMotion } from '../lib/lenis'

const Threads = lazy(() => import('../components/reactbits/Threads'))

export default function Hero() {
  const reduced = prefersReducedMotion()

  return (
    <section id="home" className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 sm:px-12">
      {/* web-thread background — the one WebGL background on the page */}
      {!reduced && (
        <div className="absolute inset-0 opacity-55">
          <Suspense fallback={null}>
            <Threads color={[0.88, 0.35, 0.4]} amplitude={1.4} distance={0.5} enableMouseInteraction />
          </Suspense>
        </div>
      )}
      <div className="halftone" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#060a14_100%)]" />

      <div className="absolute bottom-8 left-6 hidden font-mono text-xs text-muted sm:block sm:left-12">
        {identity.location}
      </div>
      <div className="absolute right-6 bottom-8 hidden items-center gap-2 font-mono text-xs text-muted sm:flex sm:right-12">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red" />
        {identity.status}
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {reduced ? (
          <h1 className="font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.95] font-bold tracking-tight">
            HARSHITH
            <br />
            VIJAYAN
          </h1>
        ) : (
          <h1 className="font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.95] font-bold tracking-tight">
            <div>
              <SplitText tag="span" text="HARSHITH" splitType="chars" delay={35} duration={0.9} ease="expo.out" from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} textAlign="left" />
            </div>
            <div>
              <SplitText tag="span" text="VIJAYAN" splitType="chars" delay={35} duration={0.9} ease="expo.out" from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} textAlign="left" />
            </div>
          </h1>
        )}

        <div className="mt-6 flex items-center gap-2 font-mono text-lg">
          <span className="text-muted">{'>'}</span>
          <RotatingText
            texts={identity.roles}
            mainClassName="text-red"
            rotationInterval={2600}
            staggerDuration={0.02}
            splitBy="characters"
          />
        </div>

        <ShinyText
          text={identity.tagline}
          className="mt-4 block max-w-xl text-lg"
          color="#8A94A8"
          shineColor="#F2F4F8"
          speed={3}
        />

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Magnet padding={40} magnetStrength={12} disabled={reduced}>
            <a
              href="#projects"
              className="inline-block rounded-full bg-red px-7 py-3.5 font-medium text-text transition hover:brightness-110"
            >
              View Work
            </a>
          </Magnet>
          <StarBorder as="a" href="#contact" color="#E63946" speed="5s" className="font-medium">
            Get in Touch
          </StarBorder>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-mono text-xs tracking-widest text-muted">SCROLL</span>
        <span className="h-6 w-px animate-pulse bg-red" />
      </div>
    </section>
  )
}
