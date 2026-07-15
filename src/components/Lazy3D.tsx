import { useEffect, useRef, useState } from 'react'

/** Mounts children (a 3D canvas) only when the slot nears the viewport. */
export default function Lazy3D({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {show ? children : null}
    </div>
  )
}
