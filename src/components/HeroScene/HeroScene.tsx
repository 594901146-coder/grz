import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './HeroScene.css'

const clampParallax = (value: number) => Math.max(-1, Math.min(1, value))

function getScreenOrientationAngle() {
  const legacyWindow = window as Window & { orientation?: number }
  return window.screen.orientation?.angle ?? legacyWindow.orientation ?? 0
}

export type HeroSceneHandle = {
  setScrollProgress: (progress: number) => void
}

type HeroSceneProps = {
  accentColor?: string
  quality?: 'auto' | 'high' | 'low'
  reducedMotion?: boolean
  className?: string
}

const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(function HeroScene({
  accentColor = '#c4b5fd',
  quality = 'auto',
  reducedMotion = false,
  className = '',
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameLoaded, setFrameLoaded] = useState(false)
  const [inViewport, setInViewport] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(!document.hidden)
  const paused = reducedMotion || !inViewport || !documentVisible

  useImperativeHandle(ref, () => ({
    setScrollProgress() {
      // The reference scene uses a fixed camera so its original composition stays intact.
    },
  }), [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setInViewport(entry.isIntersecting)
    }, { threshold: 0.02 })
    const handleVisibility = () => setDocumentVisible(!document.hidden)

    observer.observe(element)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    if (!frameLoaded) return
    frameRef.current?.contentWindow?.postMessage({
      source: 'zd-ocean-host',
      type: 'set-paused',
      paused,
    }, window.location.origin)
  }, [frameLoaded, paused])

  useEffect(() => {
    if (!frameLoaded) return

    const container = containerRef.current
    const frameWindow = frameRef.current?.contentWindow
    if (!container || !frameWindow) return
    const hero = container.closest<HTMLElement>('.hero')

    const postParallax = (x: number, y: number) => {
      const safeX = clampParallax(Number.isFinite(x) ? x : 0)
      const safeY = clampParallax(Number.isFinite(y) ? y : 0)
      hero?.style.setProperty('--hero-backdrop-x', `${safeX * -10}px`)
      hero?.style.setProperty('--hero-backdrop-y', `${safeY * -6}px`)
      hero?.style.setProperty('--hero-stars-x', `${safeX * -14}px`)
      hero?.style.setProperty('--hero-stars-y', `${safeY * -8}px`)
      frameWindow.postMessage({
        source: 'zd-ocean-host',
        type: 'set-parallax',
        x: safeX,
        y: safeY,
      }, window.location.origin)
    }

    if (paused) {
      postParallax(0, 0)
      return
    }

    let animationFrame: number | null = null
    let pendingX = 0
    let pendingY = 0
    let sensorActive = false
    let sensorBaseline: { beta: number; gamma: number } | null = null

    const scheduleParallax = (x: number, y: number) => {
      pendingX = clampParallax(x)
      pendingY = clampParallax(y)
      if (animationFrame !== null) return

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null
        postParallax(pendingX, pendingY)
      })
    }

    const parallaxFromPoint = (clientX: number, clientY: number) => {
      const bounds = container.getBoundingClientRect()
      const inside = clientX >= bounds.left
        && clientX <= bounds.right
        && clientY >= bounds.top
        && clientY <= bounds.bottom

      if (!inside || bounds.width === 0 || bounds.height === 0) {
        scheduleParallax(0, 0)
        return
      }

      scheduleParallax(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        ((clientY - bounds.top) / bounds.height) * 2 - 1,
      )
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      parallaxFromPoint(event.clientX, event.clientY)
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) scheduleParallax(0, 0)
    }

    const handleTouch = (event: TouchEvent) => {
      if (sensorActive || event.touches.length === 0) return
      const touch = event.touches[0]
      parallaxFromPoint(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = () => {
      if (!sensorActive) scheduleParallax(0, 0)
    }

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.beta !== 'number' || typeof event.gamma !== 'number') return

      sensorActive = true
      if (!sensorBaseline) {
        sensorBaseline = { beta: event.beta, gamma: event.gamma }
        scheduleParallax(0, 0)
        return
      }

      const betaDelta = event.beta - sensorBaseline.beta
      const gammaDelta = event.gamma - sensorBaseline.gamma
      const angle = ((getScreenOrientationAngle() % 360) + 360) % 360
      let horizontal = gammaDelta
      let vertical = betaDelta

      if (angle === 90) {
        horizontal = betaDelta
        vertical = -gammaDelta
      } else if (angle === 180) {
        horizontal = -gammaDelta
        vertical = -betaDelta
      } else if (angle === 270) {
        horizontal = -betaDelta
        vertical = gammaDelta
      }

      scheduleParallax(horizontal / 18, vertical / 12)
    }

    const resetSensorBaseline = () => {
      sensorActive = false
      sensorBaseline = null
      scheduleParallax(0, 0)
    }

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerOut, { passive: true })
    window.addEventListener('touchstart', handleTouch, { passive: true })
    window.addEventListener('touchmove', handleTouch, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    if (coarsePointer && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true })
      window.addEventListener('orientationchange', resetSensorBaseline)
      window.screen.orientation?.addEventListener('change', resetSensorBaseline)
    }

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
      window.removeEventListener('orientationchange', resetSensorBaseline)
      window.screen.orientation?.removeEventListener('change', resetSensorBaseline)
    }
  }, [frameLoaded, paused])

  const classes = [
    'hero-scene',
    frameLoaded && 'hero-scene--loaded',
    className,
  ].filter(Boolean).join(' ')
  const frameSrc = `/ocean/index.html?quality=${quality}`

  return (
    <div
      ref={containerRef}
      className={classes}
      data-accent-color={accentColor}
      data-quality={quality}
      aria-hidden="true"
    >
      <iframe
        ref={frameRef}
        className="hero-scene__frame"
        src={frameSrc}
        title="Ocean wave simulation"
        tabIndex={-1}
        onLoad={() => setFrameLoaded(true)}
      />
    </div>
  )
})

export default HeroScene
