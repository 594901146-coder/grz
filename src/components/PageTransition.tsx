import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function PageTransition({ routeKey }: { routeKey: string }) {
  const overlay = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      overlay.current,
      { scaleX: 1, transformOrigin: 'right center' },
      { scaleX: 0, duration: 0.72, ease: 'power4.inOut' },
    )
  }, { dependencies: [routeKey] })

  return <div ref={overlay} className="page-transition" aria-hidden="true" />
}
