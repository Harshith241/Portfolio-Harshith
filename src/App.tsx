import { useEffect } from 'react'
import { initSmoothScroll, prefersReducedMotion } from './lib/lenis'
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

export default function App() {
  useEffect(() => {
    initSmoothScroll()
  }, [])

  return (
    <>
      <Nav />
      <ProgressThread />
      <main>
        <Hero />
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
