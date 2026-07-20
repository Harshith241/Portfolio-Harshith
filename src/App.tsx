import { lazy, Suspense, useEffect, useState } from 'react'
import { getLenis, initSmoothScroll, prefersReducedMotion } from './lib/lenis'
import { introEnabled } from './intro/beats'
import Loader from './components/Loader'
import Nav from './components/Nav'
import ProgressThread from './components/ProgressThread'
import ClickSpark from './components/reactbits/ClickSpark'
import WebDivider from './components/WebDivider'
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
    // §6 amplifier 5: typing "thwip" anywhere replays the intro
    let buf = ''
    const onType = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || e.metaKey || e.ctrlKey) return
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      buf = (buf + e.key.toLowerCase()).slice(-5)
      if (buf === 'thwip' && !prefersReducedMotion()) window.dispatchEvent(new Event('hv-intro-replay'))
    }
    window.addEventListener('keydown', onType)
    return () => {
      window.removeEventListener('hv-intro-replay', onReplay)
      window.removeEventListener('keydown', onType)
    }
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
        <WebDivider at="30%" />
        <Experience />
        <WebDivider at="64%" />
        <Projects />
        <WebDivider at="22%" />
        <AgentLab />
        <WebDivider at="72%" />
        <Skills />
        <WebDivider at="40%" />
        <BeyondCode />
        <Contact />
      </main>
      {!prefersReducedMotion() && (
        <ClickSpark sparkColor="#E63946" sparkSize={9} sparkRadius={18} sparkCount={8} duration={420} />
      )}
    </>
  )
}
