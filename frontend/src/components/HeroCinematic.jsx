import { useRef, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const BOOK_IMAGE = 'https://i.pinimg.com/736x/f3/e5/8c/f3e58c770155cc14bd469a7c3f03546f.jpg'

const SCENE_IMAGES = [
  'https://i.ibb.co/svyRC0VP/89d3ae3c-a0c7-4911-98a0-ea950b5ab4fc.png',
  'https://i.ibb.co/GfY5j3Wn/7d0a82bb-98b1-48c9-91c5-f2db14470ad5.png',
  'https://i.ibb.co/v6BNbgsY/8946f5aa-16e8-4fb3-8b9e-55062e7e5e47.png',
  'https://i.ibb.co/7Nr0r1t1/0636f183-790d-4e5e-86bf-e071f266e52c.png',
  'https://i.ibb.co/CK1WH2vX/fcbde96a-5638-465d-a280-297b874e6670.png',
  'https://i.ibb.co/fdC7L7KQ/b8d83935-b643-4e4c-b0d0-2c81cdc53ff2.png',
]

const SCENES = [
  { id: 'entrance', start: 0.00, end: 0.14, idx: -1, bg: '#e8ddd0', label: 'The Book' },
  { id: 'stairs',    start: 0.14, end: 0.32, idx:  0, bg: '#d4c9b8', label: 'Forest Staircase' },
  { id: 'palace',    start: 0.32, end: 0.48, idx:  1, bg: '#d4c4b0', label: 'Palace Corridor' },
  { id: 'mystery',   start: 0.48, end: 0.62, idx:  2, bg: '#c4b8c8', label: 'Mysterious Passage' },
  { id: 'horror',    start: 0.62, end: 0.76, idx:  3, bg: '#a898a0', label: 'Dark Corridor' },
  { id: 'wedding',   start: 0.76, end: 0.88, idx:  4, bg: '#e0c8b8', label: 'Wedding Banquet' },
  { id: 'library',   start: 0.88, end: 1.00, idx:  5, bg: '#c8b8a8', label: 'Library' },
]

function sceneAt(progress) {
  for (const s of SCENES) {
    if (progress >= s.start && progress < s.end) return s
  }
  return SCENES[SCENES.length - 1]
}

function blendIn(progress, s) {
  if (!s) return 0
  const r = s.end - s.start
  return r === 0 ? 1 : (progress - s.start) / r
}

function FilmGrain() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let frame
    const draw = () => {
      c.width = window.innerWidth
      c.height = window.innerHeight
      const imageData = ctx.createImageData(c.width, c.height)
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 40
        imageData.data[i] = v
        imageData.data[i + 1] = v
        imageData.data[i + 2] = v
        imageData.data[i + 3] = 8
      }
      ctx.putImageData(imageData, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-40 mix-blend-overlay" />
}

function Particles({ progressRef }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      speed: 0.3 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.4,
      delay: Math.random() * 10,
    })), [])
  const elRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const dots = el.children
    let frame

    const tick = () => {
      const p = progressRef.current
      const scene = sceneAt(p)
      const visible = scene && scene.idx >= 0 && scene.idx <= 2
      setIsVisible(visible)

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const pt = particles[i]
        const t = (Date.now() / 1000 + pt.delay) * pt.speed
        const x = pt.x + Math.sin(t * 0.5) * pt.drift * 10
        const y = pt.y + Math.sin(t * 0.3) * 0.5
        dot.style.left = `${x}%`
        dot.style.top = `${y}%`
        dot.style.opacity = visible ? 0.15 + Math.sin(t) * 0.1 : 0
      }

      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [progressRef, particles])

  if (!isVisible) return null

  return (
    <div ref={elRef} className="absolute inset-0 pointer-events-none z-30">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full" style={{
          width: p.size,
          height: p.size,
          background: 'rgba(255,230,180,0.5)',
          boxShadow: '0 0 4px rgba(255,230,180,0.3)',
          left: `${p.x}%`,
          top: `${p.y}%`,
          opacity: 0,
          transition: 'opacity 0.5s',
        }} />
      ))}
    </div>
  )
}

function LightShafts({ progressRef }) {
  const elRef = useRef(null)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    let frame
    const tick = () => {
      const p = progressRef.current
      const scene = sceneAt(p)
      const visible = scene && scene.idx >= 0 && scene.idx <= 4
      el.style.opacity = visible ? 0.08 : 0
      const angle = -12 + Math.sin(Date.now() / 8000) * 4
      el.style.transform = `skewX(${angle}deg)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [progressRef])

  return (
    <div ref={elRef} className="absolute inset-0 pointer-events-none z-20" style={{ opacity: 0, transition: 'opacity 0.5s' }}>
      <div className="absolute top-0 left-[20%] w-[15%] h-full" style={{
        background: 'linear-gradient(180deg, rgba(255,230,180,0.12) 0%, transparent 60%)',
      }} />
      <div className="absolute top-0 left-[55%] w-[12%] h-full" style={{
        background: 'linear-gradient(180deg, rgba(255,220,160,0.08) 0%, transparent 50%)',
      }} />
    </div>
  )
}

function Vignette() {
  return (
    <div className="absolute inset-0 pointer-events-none z-25" style={{
      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
    }} />
  )
}

function Letterbox() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-35" style={{
        height: '7vh',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
      }} />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-35" style={{
        height: '7vh',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
      }} />
    </>
  )
}

function SceneLabel({ progressRef }) {
  const [label, setLabel] = useState('')
  const [opacity, setOpacity] = useState(0)
  const lastScene = useRef('')

  useEffect(() => {
    let frame
    const tick = () => {
      const p = progressRef.current
      const s = sceneAt(p)
      const nextId = s ? s.id : ''
      if (nextId !== lastScene.current) {
        setOpacity(0)
        setTimeout(() => {
          setLabel(s.label)
          setOpacity(1)
          lastScene.current = nextId
        }, 200)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [progressRef])

  if (!label) return null

  return (
    <div className="absolute top-[9vh] left-1/2 -translate-x-1/2 pointer-events-none z-30" style={{
      opacity,
      transition: 'opacity 0.4s ease',
    }}>
      <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
    </div>
  )
}

function Layer({ src, index, progressRef }) {
  const elRef = useRef(null)
  const isBook = index === -1
  const sceneDef = isBook ? SCENES[0] : SCENES[index + 1]

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    let opacity = isBook ? 1 : 0
    let scale = 1
    let swayY = 0
    let swayX = 0
    let running = true

    const tick = () => {
      if (!running) return
      const p = progressRef.current
      const active = sceneAt(p)
      const t = Date.now() / 1000

      if (isBook) {
        const end = SCENES[0].end
        const target = Math.max(0, 1 - p / end)
        opacity += (target - opacity) * 0.04
        el.style.opacity = opacity
      } else {
        const isActive = active && active.idx === index
        if (isActive) {
          const b = blendIn(p, active)
          const fadeIn = Math.min(b * 2.5, 1)
          const fadeOut = 1 - Math.max(0, (p - active.end + 0.06) / 0.06)
          const targetOpacity = Math.max(0, Math.min(fadeIn, fadeOut))
          opacity += (targetOpacity - opacity) * 0.04
          el.style.opacity = Math.max(0, Math.min(opacity, 1))

          const targetScale = 1 + b * 0.06
          scale += (targetScale - scale) * 0.04

          swayY = Math.sin(t * 1.2 + index) * 2.5
          swayX = Math.sin(t * 0.6 + index * 1.5) * 1.5

          el.style.transform = `scale(${scale}) translate(${swayX}px, ${swayY}px)`
        } else {
          if (opacity > 0.001) {
            opacity *= 0.94
            el.style.opacity = opacity
            el.style.transform = `scale(${scale})`
          }
        }
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { running = false }
  }, [index, isBook, progressRef])

  if (isBook) {
    return (
      <div ref={elRef} className="absolute inset-0 z-1 flex items-center justify-center" style={{ background: '#e8ddd0', pointerEvents: 'none' }}>
        <img src={src} alt="" className="max-w-full max-h-full" style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }} />
      </div>
    )
  }

  return (
    <div ref={elRef} className="absolute inset-0 z-5 flex items-center justify-center" style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform' }}>
      <img src={src} alt="" className="max-w-full max-h-full" style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.1))' }} />
    </div>
  )
}

export default function HeroCinematic() {
  const navigate = useNavigate()
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const [bgColor, setBgColor] = useState('#e8ddd0')
  const [showCTA, setShowCTA] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const rafRef = useRef(null)
  const containerRef = useRef(null)
  const touchRef = useRef(null)
  const isLocked = useRef(true)

  useEffect(() => {
    const tick = () => {
      progressRef.current += (targetRef.current - progressRef.current) * 0.04
      if (Math.abs(progressRef.current - targetRef.current) < 0.0003) progressRef.current = targetRef.current
      const val = Math.min(Math.max(progressRef.current, 0), 1)
      const active = sceneAt(val)
      setBgColor(active ? active.bg : '#e8ddd0')
      if (val >= 1) setShowCTA(true)
      if (val > 0.02) setShowHint(false)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const clamp = (v) => Math.min(Math.max(v, 0), 1)
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      if (!isLocked.current) return
      e.preventDefault()
      targetRef.current = clamp(targetRef.current + (e.deltaY > 0 ? 0.012 : -0.012))
    }

    const onTouchStart = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        touchRef.current = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const onTouchMove = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2 && touchRef.current) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        targetRef.current = clamp(targetRef.current + (dist - touchRef.current) * 0.003)
        touchRef.current = dist
      }
    }

    const onKey = (e) => {
      if (e.key === '+' || e.key === '=') targetRef.current = clamp(targetRef.current + 0.05)
      if (e.key === '-') targetRef.current = clamp(targetRef.current - 0.05)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (showCTA) {
      const t = setTimeout(() => { isLocked.current = false }, 2000)
      return () => clearTimeout(t)
    }
  }, [showCTA])

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden"
      style={{
        height: '100vh', minHeight: '700px',
        background: bgColor,
        cursor: 'grab',
        transition: 'background 0.8s ease',
      }}>

      <Layer src={BOOK_IMAGE} index={-1} progressRef={progressRef} />
      {SCENE_IMAGES.map((src, i) => (
        <Layer key={i} src={src} index={i} progressRef={progressRef} />
      ))}

      <Vignette />
      <LightShafts progressRef={progressRef} />
      <Particles progressRef={progressRef} />
      <FilmGrain />
      <Letterbox />
      <SceneLabel progressRef={progressRef} />

      <div className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        style={{ opacity: showHint ? 0 : 0.4, transition: 'opacity 1s ease' }}>
        <button onClick={() => { targetRef.current = Math.max(targetRef.current - 0.05, 0) }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }} aria-label="Back">−</button>
        <div className="w-24 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(progressRef.current, 1) * 100}%`, background: 'rgba(255,255,255,0.3)', transition: 'width 0.15s linear' }} />
        </div>
        <button onClick={() => { targetRef.current = Math.min(targetRef.current + 0.05, 1) }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:bg-white/20"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }} aria-label="Forward">+</button>
      </div>

      {showHint && (
        <div className="absolute top-[9vh] left-1/2 -translate-x-1/2 z-50" style={{ animation: 'hintPulse 2.5s ease-in-out infinite' }}>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Scroll to explore</p>
        </div>
      )}

      {showCTA && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ animation: 'ctaIn 2s ease forwards', background: 'rgba(232,221,208,0.85)' }}>
          <div className="text-center px-6">
            <h2 className="text-5xl md:text-6xl font-serif mb-4" style={{ color: '#6a5a4a', opacity: 0, animation: 'fadeUp 1.2s ease 0.3s forwards' }}>
              Your Story Awaits
            </h2>
            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: '#8a7a6a', opacity: 0, animation: 'fadeUp 1.2s ease 0.6s forwards' }}>
              Step into a world of magic, mystery, and endless possibilities.
            </p>
            <button onClick={() => navigate('/signin')}
              className="px-12 py-4 rounded-xl text-lg font-medium tracking-wide transition-all duration-500 hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d4c0a8, #c4b098)', color: '#5a4a3a', opacity: 0, animation: 'fadeUp 1.2s ease 0.9s forwards' }}>
              Begin Your Journey
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ctaIn{0%{opacity:0}100%{opacity:1}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes hintPulse{0%,100%{opacity:0.3}50%{opacity:0.8}}
      `}</style>
    </section>
  )
}
