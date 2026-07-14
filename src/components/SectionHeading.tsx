export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
      {children}
    </h2>
  )
}
