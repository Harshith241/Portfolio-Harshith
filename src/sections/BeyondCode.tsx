import SectionHeading from '../components/SectionHeading'
import { beyondCode } from '../data/content'

export default function BeyondCode() {
  const { hiking, guitar, movies, gym } = beyondCode.cards
  return (
    <section id="beyond" className="mx-auto max-w-6xl px-6 py-32 sm:px-12">
      <SectionHeading>{beyondCode.title}</SectionHeading>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <figure className="relative overflow-hidden rounded-2xl border border-border sm:col-span-2 sm:row-span-2">
          <img src={hiking.image} alt="Harshith hiking in Sedona" className="h-full w-full object-cover" loading="lazy" />
          <figcaption className="absolute bottom-0 w-full bg-bg/70 p-4 font-mono text-xs">
            {hiking.caption}
          </figcaption>
        </figure>
        <div className="flex min-h-48 flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:col-span-2 sm:row-span-2">
          {/* Guitar 3D scene mounts here in phase 7 */}
          <div className="flex flex-1 items-center justify-center font-mono text-xs text-muted">
            [ guitar.glb — phase 7 ]
          </div>
          <p className="font-mono text-xs">{guitar.caption}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 sm:col-span-2">
          <p className="font-mono text-xs text-muted">MOVIES</p>
          <p className="mt-2 text-sm">{movies.caption}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 sm:col-span-2">
          <p className="font-mono text-xs text-muted">GYM</p>
          <p className="mt-2 text-sm">{gym.caption}</p>
        </div>
      </div>
    </section>
  )
}
