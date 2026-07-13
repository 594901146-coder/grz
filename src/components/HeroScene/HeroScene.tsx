import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './HeroScene.css'

export type HeroSceneHandle = {
  setScrollProgress: (progress: number) => void
}

type HeroSceneProps = {
  accentColor?: string
  quality?: 'auto' | 'high' | 'low'
  reducedMotion?: boolean
  className?: string
}

type OceanStatusMessage = {
  source: 'david-li-ocean'
  type: 'status'
  supported: boolean
}

function isOceanStatusMessage(value: unknown): value is OceanStatusMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Partial<OceanStatusMessage>
  return message.source === 'david-li-ocean'
    && message.type === 'status'
    && typeof message.supported === 'boolean'
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
  const [supported, setSupported] = useState<boolean | null>(null)
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
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      if (!isOceanStatusMessage(event.data)) return
      setSupported(event.data.supported)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!frameLoaded) return
    frameRef.current?.contentWindow?.postMessage({
      source: 'zd-ocean-host',
      type: 'set-paused',
      paused,
    }, window.location.origin)
  }, [frameLoaded, paused])

  const ready = frameLoaded && supported !== false
  const classes = [
    'hero-scene',
    ready ? 'hero-scene--ready' : 'hero-scene--fallback',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      className={classes}
      data-accent-color={accentColor}
      data-quality={quality}
      aria-hidden="true"
    >
      <div className="hero-scene__fallback" />
      <iframe
        ref={frameRef}
        className="hero-scene__frame"
        src="/ocean/index.html"
        title="Ocean wave simulation"
        tabIndex={-1}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setFrameLoaded(true)}
      />
    </div>
  )
})

export default HeroScene
