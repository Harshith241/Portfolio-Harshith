import { lazy, Suspense } from 'react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import Lazy3D from '../components/Lazy3D'
import { beyondCode } from '../data/content'

const GuitarScene = lazy(() => import('../three/GuitarScene'))

export default function BeyondCode() {
  const { hiking, guitar, movies, gym } = beyondCode.cards
  return (
    <section id="beyond" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <Reveal>
        <SectionHeading>{beyondCode.title}</SectionHeading>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2 sm:row-span-2">
          <figure className="relative h-full overflow-hidden rounded-2xl border border-border">
            <img src={hiking.image} alt="Harshith hiking on the Mogollon Rim" className="h-full w-full object-cover" loading="lazy" />
            <figcaption className="absolute bottom-0 w-full bg-bg/70 p-4 font-mono text-xs">
              {hiking.caption}
            </figcaption>
          </figure>
        </Reveal>
        <Reveal className="sm:col-span-2 sm:row-span-2" delay={0.08}>
          <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-surface">
            <Lazy3D className="min-h-[260px] flex-1">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-xs text-muted">
                    tuning…
                  </div>
                }
              >
                <GuitarScene />
              </Suspense>
            </Lazy3D>
            <span className="pointer-events-none absolute top-3 right-4 font-mono text-[10px] tracking-widest text-muted">
              DRAG — IT SPINS
            </span>
            <p className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-4 font-mono text-xs">
              {guitar.caption}
              <span className="text-[10px] text-muted">3D: Poly by Google · CC-BY</span>
            </p>
          </div>
        </Reveal>
        <Reveal className="sm:col-span-2" delay={0.12}>
          <div className="h-full rounded-2xl border border-border bg-surface p-6">
            <p className="font-mono text-xs text-muted">MOVIES</p>
            <p className="mt-2 text-sm">{movies.caption}</p>
          </div>
        </Reveal>
        <Reveal className="sm:col-span-2" delay={0.16}>
          <div className="h-full rounded-2xl border border-border bg-surface p-6">
            <p className="font-mono text-xs text-muted">GYM</p>
            <p className="mt-2 text-sm">{gym.caption}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
