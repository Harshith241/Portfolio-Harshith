import { lazy, Suspense, useEffect, useState } from 'react'
import { getLenis, initSmoothScroll, prefersReducedMotion } from './lib/lenis'
import { introEnabled } from './intro/beats'
import Loader from './components/Loader'
import Nav from './components/Nav'
import ProgressThread from './components/ProgressThread'
import ClickSpark from './components/reactbits/ClickSpark'
import Hero from './sections/Hero'
import About from './sections/About'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import AgentLab from './sections/AgentLab'
import Skills from './sections/Skills'
import BeyondCode from './sections/BeyondCode'
import Contact from './sections/Contact'

// lazy: keeps three/drei + the intro out of the critical path — hero paints first
const IntroSequence = lazy(() => import('./intro/IntroSequence'))

export default function App() {
  const [introKey, setIntroKey] = useState(0)
  useEffect(() => {
    initSmoothScroll()
    const onReplay = () => {
      sessionStorage.removeItem('hv-intro-seen')
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
      setIntroKey((k) => k + 1) // remount IntroSequence in its 'waiting' state
    }
    window.addEventListener('hv-intro-replay', onReplay)
    return () => window.removeEventListener('hv-intro-replay', onReplay)
  }, [])

  return (
    <>
      <Loader />
      <Nav />
      <ProgressThread />
      <main>
        <Hero />
        {introEnabled() && (
          <Suspense fallback={null}>
            <IntroSequence key={introKey} />
          </Suspense>
        )}
        <About />
        <Experience />
        <Projects />
        <AgentLab />
        <Skills />
        <BeyondCode />
        <Contact />
      </main>
      {!prefersReducedMotion() && (
        <ClickSpark sparkColor="#E63946" sparkSize={9} sparkRadius={18} sparkCount={8} duration={420} />
      )}
    </>
  )
}
