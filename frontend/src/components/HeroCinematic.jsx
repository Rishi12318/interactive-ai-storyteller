import { useRef, useEffect, useState } from 'react'
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
  { id: 'book', start: 0, end: 0.12, idx: -1, bg: '#e8ddd0' },
  { id: 'stairs', start: 0.12, end: 0.30, idx: 0, bg: '#d4c9b8' },
  { id: 'palace', start: 0.30, end: 0.47, idx: 1, bg: '#d4c4b0' },
  { id: 'mystery', start: 0.47, end: 0.62, idx: 2, bg: '#c4b8c8' },
  { id: 'horror', start: 0.62, end: 0.76, idx: 3, bg: '#a898a0' },
  { id: 'wedding', start: 0.76, end: 0.89, idx: 4, bg: '#e0c8b8' },
  { id: 'library', start: 0.89, end: 1.0, idx: 5, bg: '#c8b8a8' },
]

function currentScene(progress) {
  for (const s of SCENES) {
    if (progress >= s.start && progress < s.end) return s
  }
  return SCENES[SCENES.length - 1]
}

function sceneBlend(progress, scene) {
  if (!scene) return 0
  const r = scene.end - scene.start
  return r === 0 ? 1 : (progress - scene.start) / r
}

function Layer({ src, index, progressRef }) {
  const elRef = useRef(null)
  const isBook = index === -1
  const scene = isBook ? SCENES[0] : SCENES[index + 1]

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    let opacity = isBook ? 1 : 0
    let scale = 1
    let running = true

    const tick = () => {
      if (!running) return
      const p = progressRef.current
      const s = currentScene(p)

      if (isBook) {
        const target = Math.max(0, 1 - p * 10)
        opacity += (target - opacity) * 0.06
        el.style.opacity = opacity
        if (opacity > 0.001) requestAnimationFrame(tick)
        return
      }

      const isActive = s && s.idx === index

      if (isActive) {
        const b = sceneBlend(p, s)
        const fadeIn = Math.min(b * 2.5, 1)
        const fadeOut = 1 - Math.max(0, (p - s.end + 0.05) / 0.05)
        const targetOpacity = Math.max(0, Math.min(fadeIn, fadeOut))
        opacity += (targetOpacity - opacity) * 0.06
        el.style.opacity = Math.max(0, Math.min(opacity, 1))

        const targetScale = 1 + b * 0.08
        scale += (targetScale - scale) * 0.06
        el.style.transform = `scale(${scale})`
      } else {
        if (opacity > 0.001) {
          opacity *= 0.92
          el.style.opacity = opacity
        }
      }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    return () => { running = false }
  }, [index, isBook, progressRef])

  if (isBook) {
    return (
      <div ref={elRef} className="absolute inset-0 flex items-center justify-center" style={{ background: '#e8ddd0', pointerEvents: 'none' }}>
        <img src={src} alt="" className="max-w-full max-h-full" style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }} />
      </div>
    )
  }

  return (
    <div ref={elRef} className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform' }}>
      <img src={src} alt="" className="max-w-full max-h-full" style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.12))' }} />
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
      progressRef.current += (targetRef.current - progressRef.current) * 0.05
      if (Math.abs(progressRef.current - targetRef.current) < 0.0005) progressRef.current = targetRef.current

      const val = Math.min(Math.max(progressRef.current, 0), 1)
      const active = currentScene(val)
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
      targetRef.current = clamp(targetRef.current + (e.deltaY > 0 ? 0.015 : -0.015))
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
        transition: 'background 0.6s ease',
      }}>

      <Layer src={BOOK_IMAGE} index={-1} progressRef={progressRef} />

      {SCENE_IMAGES.map((src, i) => (
        <Layer key={i} src={src} index={i} progressRef={progressRef} />
      ))}

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.06) 100%)',
      }} />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        style={{ opacity: showHint ? 0 : 0.5, transition: 'opacity 0.8s ease' }}>
        <button onClick={() => { targetRef.current = Math.max(targetRef.current - 0.05, 0) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 hover:bg-white/20"
          style={{ background: 'rgba(200,180,160,0.2)', color: '#8a7a6a' }} aria-label="Zoom out">−</button>
        <div className="w-28 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(200,180,160,0.2)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(progressRef.current, 1) * 100}%`, background: 'linear-gradient(90deg, #c4a882, #d4b896)', transition: 'width 0.15s linear' }} />
        </div>
        <button onClick={() => { targetRef.current = Math.min(targetRef.current + 0.05, 1) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 hover:bg-white/20"
          style={{ background: 'rgba(200,180,160,0.2)', color: '#8a7a6a' }} aria-label="Zoom in">+</button>
      </div>

      {showHint && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-pulse">
          <p className="text-sm tracking-widest uppercase" style={{ color: '#9a8a7a' }}>Scroll to explore</p>
        </div>
      )}

      {showCTA && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ animation: 'ctaIn 2s ease forwards', background: 'rgba(232,221,208,0.8)' }}>
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
      `}</style>
    </section>
  )
}
